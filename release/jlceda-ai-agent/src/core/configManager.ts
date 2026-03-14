export interface AiAgentConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  language: "zh-CN" | "en-US";
}

const STORAGE_KEY = "jlceda-ai-agent/config";

const defaultConfig: AiAgentConfig = {
  apiUrl: "https://api.openai.com/v1/chat/completions",
  apiKey: "",
  model: "gpt-4.1-mini",
  temperature: 0.7,
  maxTokens: 4000,
  language: "zh-CN"
};

function normalizeConfig(input: Partial<AiAgentConfig> | null | undefined): AiAgentConfig {
  return {
    apiUrl: input?.apiUrl?.trim() || defaultConfig.apiUrl,
    apiKey: input?.apiKey?.trim() || "",
    model: input?.model?.trim() || defaultConfig.model,
    temperature:
      typeof input?.temperature === "number" && Number.isFinite(input.temperature)
        ? Math.max(0, Math.min(2, input.temperature))
        : defaultConfig.temperature,
    maxTokens:
      typeof input?.maxTokens === "number" && Number.isFinite(input.maxTokens)
        ? Math.max(128, Math.min(32000, Math.round(input.maxTokens)))
        : defaultConfig.maxTokens,
    language: input?.language === "en-US" ? "en-US" : "zh-CN"
  };
}

export class ConfigManager {
  async load(): Promise<AiAgentConfig> {
    const raw = await eda.storage?.get?.(STORAGE_KEY);
    if (!raw) {
      return { ...defaultConfig, language: this.detectLanguage() };
    }
    try {
      const parsed = JSON.parse(raw) as Partial<AiAgentConfig>;
      return normalizeConfig({ ...parsed, language: parsed.language ?? this.detectLanguage() });
    } catch {
      return { ...defaultConfig, language: this.detectLanguage() };
    }
  }

  async save(next: Partial<AiAgentConfig>): Promise<AiAgentConfig> {
    const merged = normalizeConfig({ ...(await this.load()), ...next });
    await eda.storage?.set?.(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }

  detectLanguage(): "zh-CN" | "en-US" {
    const language = eda.locale?.getLanguage?.() ?? eda.locale?.language ?? "zh-CN";
    return language.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US";
  }
}
