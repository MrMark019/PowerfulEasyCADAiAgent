import type { AiAgentConfig } from "./configManager.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatChunk {
  type: "delta" | "done";
  content?: string;
}

export class ApiClient {
  constructor(private readonly config: AiAgentConfig) {}

  async *streamChat(messages: ChatMessage[]): AsyncGenerator<ChatChunk> {
    const { apiKey, apiUrl, model, temperature, maxTokens } = this.config;
    if (!apiUrl || !apiKey || !model) {
      throw new Error("API configuration is incomplete.");
    }

    const response = await this.fetchWithRetry(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        stream: true,
        messages
      })
    });

    if (!response.ok || !response.body) {
      const text = await response.text();
      throw new Error(`API request failed: ${response.status} ${text}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) {
          continue;
        }
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") {
          yield { type: "done" };
          return;
        }
        const parsed = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          yield { type: "delta", content };
        }
      }
    }

    yield { type: "done" };
  }

  private async fetchWithRetry(input: string, init: RequestInit): Promise<Response> {
    let attempt = 0;
    let delayMs = 500;
    let lastError: unknown;

    while (attempt < 3) {
      try {
        return await fetch(input, init);
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2;
        attempt += 1;
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Unknown API error");
  }
}
