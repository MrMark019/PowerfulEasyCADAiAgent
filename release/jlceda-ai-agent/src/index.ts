import { ConfigManager } from "./core/configManager.js";
import { UndoManager } from "./core/undoManager.js";
import { DocumentManager } from "./eda/documentManager.js";
import { SelectionManager } from "./eda/selectionManager.js";
import { UiHelper } from "./eda/uiHelper.js";
import { AutoPlaceFeature } from "./features/autoPlace.js";
import { ChatAgent } from "./features/chatAgent.js";
import { SchematicAnalyzer } from "./features/schematicAnalyzer.js";

function configToJsonValue(config: {
  apiUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  language: "zh-CN" | "en-US";
}): JsonValue {
  return {
    apiUrl: config.apiUrl,
    apiKey: config.apiKey,
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    language: config.language
  };
}

const configManager = new ConfigManager();
const documentManager = new DocumentManager();
const selectionManager = new SelectionManager(documentManager);
const uiHelper = new UiHelper();
const undoManager = new UndoManager();
const autoPlace = new AutoPlaceFeature(documentManager, undoManager);
const chatAgent = new ChatAgent(documentManager, selectionManager);
const analyzer = new SchematicAnalyzer();

async function openChat(): Promise<void> {
  const panel = uiHelper.createChatPanel(async (message) => {
    if (!message || typeof message !== "object" || Array.isArray(message)) {
      return;
    }
    const record = message as { type?: JsonValue; content?: JsonValue };
    if (record.type !== "chat:submit" || typeof record.content !== "string") {
      return;
    }
    try {
      const config = await configManager.load();
      await chatAgent.streamReply(config, record.content, (chunk) => {
        panel?.postMessage({ type: "chat:delta", content: chunk });
      });
      panel?.postMessage({ type: "chat:done" });
    } catch (error) {
      uiHelper.showMessage(error instanceof Error ? error.message : "Chat request failed.", "error");
    }
  });

  if (!panel) {
    uiHelper.showMessage("Current EDA runtime does not support webview panels.", "warn");
  }
}

async function openSettings(): Promise<void> {
  const panel = uiHelper.createConfigPanel(async (message) => {
    if (!message || typeof message !== "object" || Array.isArray(message)) {
      return;
    }
    const record = message as { type?: JsonValue; payload?: JsonValue };
    if (record.type !== "config:save" || !record.payload || Array.isArray(record.payload)) {
      return;
    }
    try {
      const payload = record.payload as Record<string, JsonValue>;
      await configManager.save({
        apiUrl: typeof payload.apiUrl === "string" ? payload.apiUrl : undefined,
        apiKey: typeof payload.apiKey === "string" ? payload.apiKey : undefined,
        model: typeof payload.model === "string" ? payload.model : undefined,
        temperature: typeof payload.temperature === "number" ? payload.temperature : undefined,
        maxTokens: typeof payload.maxTokens === "number" ? payload.maxTokens : undefined,
        language: payload.language === "en-US" ? "en-US" : "zh-CN"
      });
      uiHelper.showMessage("Settings saved.");
    } catch (error) {
      uiHelper.showMessage(error instanceof Error ? error.message : "Save failed.", "error");
    }
  });

  const config = await configManager.load();
  panel?.postMessage({ type: "config:load", payload: configToJsonValue(config) });
}

async function analyzeCurrentDocument(): Promise<void> {
  try {
    const summary = await documentManager.summarize();
    uiHelper.showMessage(analyzer.toMarkdown(summary));
  } catch (error) {
    uiHelper.showMessage(error instanceof Error ? error.message : "Analyze failed.", "error");
  }
}

async function autoPlaceSelection(): Promise<void> {
  try {
    const selected = await documentManager.getSelectedFootprints();
    if (selected.length === 0) {
      uiHelper.showMessage("No selected footprints.", "warn");
      return;
    }
    const confirmed = await uiHelper.confirm("Apply AI placement to selected footprints?");
    if (!confirmed) {
      return;
    }
    const actions = selected.map((item, index) => ({
      id: item.id,
      x: item.x + 5 * index,
      y: item.y,
      rotation: item.rotation
    }));
    const count = await autoPlace.apply(actions);
    uiHelper.showMessage(`Applied ${count} placement actions.`);
  } catch (error) {
    uiHelper.showMessage(error instanceof Error ? error.message : "Auto place failed.", "error");
  }
}

function activate(): void {
  eda.commands?.registerCommand("jlceda-ai-agent.openChat", openChat);
  eda.commands?.registerCommand("jlceda-ai-agent.openSettings", openSettings);
  eda.commands?.registerCommand("jlceda-ai-agent.analyzeDocument", analyzeCurrentDocument);
  eda.commands?.registerCommand("jlceda-ai-agent.autoPlaceSelection", autoPlaceSelection);
}

activate();
