export interface SchematicSnapshot {
  components: SchematicComponent[];
  netlist: JsonValue;
}

export interface PcbSnapshot {
  footprints: PcbFootprint[];
  tracks: PcbTrack[];
  vias: PcbVia[];
  zones: PcbZone[];
  outline: BoardOutline | null;
  layers: string[];
}

export interface DocumentSummary {
  mode: "schematic" | "pcb" | "unknown";
  schematic: SchematicSnapshot | null;
  pcb: PcbSnapshot | null;
}

async function safeCall<T>(factory: (() => Promise<T> | T) | undefined, fallback: T): Promise<T> {
  if (!factory) {
    return fallback;
  }
  try {
    return await factory();
  } catch {
    return fallback;
  }
}

async function safeArrayCall<T>(
  factory: (() => Promise<T[] | undefined> | T[] | undefined) | undefined
): Promise<T[]> {
  const result = await safeCall(factory, [] as T[]);
  return result ?? [];
}

export class DocumentManager {
  async getSchematicSnapshot(): Promise<SchematicSnapshot | null> {
    if (!eda.sch_Document) {
      return null;
    }
    return {
      components: await safeArrayCall(() => eda.sch_Document?.getComponents?.()),
      netlist: await safeCall<JsonValue>(() => eda.sch_Document?.getNetlist?.() ?? {}, {})
    };
  }

  async getPcbSnapshot(): Promise<PcbSnapshot | null> {
    if (!eda.pcb_Document) {
      return null;
    }
    return {
      footprints: await safeArrayCall(() => eda.pcb_Document?.getFootprints?.()),
      tracks: await safeArrayCall(() => eda.pcb_Document?.getTracks?.()),
      vias: await safeArrayCall(() => eda.pcb_Document?.getVias?.()),
      zones: await safeArrayCall(() => eda.pcb_Document?.getZones?.()),
      outline: await safeCall<BoardOutline | null>(() => eda.pcb_Document?.getBoardOutline?.() ?? null, null),
      layers: await safeArrayCall(() => eda.pcb_Document?.getLayers?.())
    };
  }

  async getSelectedFootprints(): Promise<PcbFootprint[]> {
    return safeArrayCall(() => eda.pcb_Document?.getSelectedFootprints?.());
  }

  async setFootprintPosition(id: string, x: number, y: number, rotation?: number): Promise<void> {
    if (eda.pcb_Document?.setFootprintPosition) {
      await eda.pcb_Document.setFootprintPosition(id, { x, y, rotation });
      return;
    }
    await eda.pcb_Document?.setCompPosition?.(id, { x, y, rotation });
  }

  async summarize(): Promise<DocumentSummary> {
    const schematic = await this.getSchematicSnapshot();
    const pcb = await this.getPcbSnapshot();
    const mode: DocumentSummary["mode"] = pcb ? "pcb" : schematic ? "schematic" : "unknown";
    return { mode, schematic, pcb };
  }
}
