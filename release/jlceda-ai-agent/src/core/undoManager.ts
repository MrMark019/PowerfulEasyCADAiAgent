export class UndoManager {
  async snapshot(label: string): Promise<void> {
    await eda.sch_Document?.saveSnapshot?.(label);
    await eda.pcb_Document?.saveSnapshot?.(label);
  }
}
