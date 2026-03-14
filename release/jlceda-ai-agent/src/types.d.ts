declare const eda: EdaApi;

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface EdaStorageApi {
  get(key: string): Promise<string | null> | string | null;
  set(key: string, value: string): Promise<void> | void;
}

interface EdaUiMessageApi {
  info?(message: string): void;
  warn?(message: string): void;
  error?(message: string): void;
  messageBox?(message: string, options?: { level?: "info" | "warn" | "error"; title?: string }): void;
  confirm?(message: string, options?: { title?: string }): Promise<boolean> | boolean;
  createWebviewPanel?(
    viewType: string,
    title: string,
    options: { html: string; onMessage?: (message: JsonValue) => void }
  ): WebviewPanelLike;
}

interface WebviewPanelLike {
  postMessage(message: JsonValue): void;
  reveal?(): void;
}

interface EdaCommandApi {
  registerCommand(id: string, handler: () => Promise<void> | void): void;
}

interface EdaLocaleApi {
  language?: string;
  getLanguage?(): string;
}

interface EdaDocumentCommon {
  saveSnapshot?(label: string): Promise<void> | void;
}

interface SchematicComponent {
  id: string;
  designator: string;
  value?: string;
  footprint?: string;
  lcscPartNumber?: string;
  [key: string]: JsonValue | undefined;
}

interface PcbFootprint {
  id: string;
  ref: string;
  x: number;
  y: number;
  rotation?: number;
  locked?: boolean;
  [key: string]: JsonValue | undefined;
}

interface PcbTrack {
  id: string;
  layer: string;
  width: number;
  points: Array<{ x: number; y: number }>;
}

interface PcbVia {
  id: string;
  x: number;
  y: number;
  drill: number;
  diameter: number;
}

interface PcbZone {
  id: string;
  layer: string;
  net?: string;
}

interface BoardOutline {
  width: number;
  height: number;
  points?: Array<{ x: number; y: number }>;
}

interface EdaSchematicDocument extends EdaDocumentCommon {
  getComponents?(): Promise<SchematicComponent[]> | SchematicComponent[];
  getNetlist?(): Promise<JsonValue> | JsonValue;
}

interface EdaPcbDocument extends EdaDocumentCommon {
  getFootprints?(): Promise<PcbFootprint[]> | PcbFootprint[];
  getTracks?(): Promise<PcbTrack[]> | PcbTrack[];
  getVias?(): Promise<PcbVia[]> | PcbVia[];
  getZones?(): Promise<PcbZone[]> | PcbZone[];
  getBoardOutline?(): Promise<BoardOutline> | BoardOutline;
  getLayers?(): Promise<string[]> | string[];
  getSelectedFootprints?(): Promise<PcbFootprint[]> | PcbFootprint[];
  setFootprintPosition?(
    id: string,
    position: { x: number; y: number; rotation?: number }
  ): Promise<void> | void;
  setCompPosition?(
    id: string,
    position: { x: number; y: number; rotation?: number }
  ): Promise<void> | void;
}

interface EdaApi {
  storage?: EdaStorageApi;
  ui?: EdaUiMessageApi;
  commands?: EdaCommandApi;
  locale?: EdaLocaleApi;
  sch_Document?: EdaSchematicDocument;
  pcb_Document?: EdaPcbDocument;
}
