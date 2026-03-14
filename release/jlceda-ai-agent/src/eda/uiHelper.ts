import { getChatPanelHtml, getConfigPanelHtml } from "../ui/templates.js";

export class UiHelper {
  showMessage(message: string, level: "info" | "warn" | "error" = "info"): void {
    if (eda.ui?.messageBox) {
      eda.ui.messageBox(message, { level, title: "JLCEDA AI Agent" });
      return;
    }
    const fallback =
      level === "error" ? eda.ui?.error : level === "warn" ? eda.ui?.warn : eda.ui?.info;
    fallback?.(message);
  }

  async confirm(message: string): Promise<boolean> {
    const result = await eda.ui?.confirm?.(message, { title: "JLCEDA AI Agent" });
    return result ?? true;
  }

  createChatPanel(onMessage: (message: JsonValue) => void): WebviewPanelLike | null {
    return (
      eda.ui?.createWebviewPanel?.("jlceda-ai-agent.chat", "AI Agent", {
        html: getChatPanelHtml(),
        onMessage
      }) ?? null
    );
  }

  createConfigPanel(onMessage: (message: JsonValue) => void): WebviewPanelLike | null {
    return (
      eda.ui?.createWebviewPanel?.("jlceda-ai-agent.config", "AI Agent Settings", {
        html: getConfigPanelHtml(),
        onMessage
      }) ?? null
    );
  }
}
