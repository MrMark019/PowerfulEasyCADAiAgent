import { ApiClient, type ChatMessage } from "../core/apiClient.js";
import type { AiAgentConfig } from "../core/configManager.js";
import { DocumentManager } from "../eda/documentManager.js";
import { SelectionManager } from "../eda/selectionManager.js";
import { buildSystemPrompt } from "../utils/promptBuilder.js";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export class ChatAgent {
  private readonly history: ChatTurn[] = [];

  constructor(
    private readonly documentManager: DocumentManager,
    private readonly selectionManager: SelectionManager
  ) {}

  async streamReply(
    config: AiAgentConfig,
    userMessage: string,
    onDelta: (chunk: string) => void
  ): Promise<string> {
    const summary = await this.documentManager.summarize();
    const selection = await this.selectionManager.getSelectionSummary();
    const apiClient = new ApiClient(config);
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: buildSystemPrompt(summary, selection)
      },
      ...this.history.map((item) => ({ role: item.role, content: item.content })),
      {
        role: "user",
        content: userMessage
      }
    ];

    let output = "";
    for await (const chunk of apiClient.streamChat(messages)) {
      if (chunk.type === "delta" && chunk.content) {
        output += chunk.content;
        onDelta(chunk.content);
      }
    }

    this.history.push({ role: "user", content: userMessage });
    this.history.push({ role: "assistant", content: output });
    return output;
  }
}
