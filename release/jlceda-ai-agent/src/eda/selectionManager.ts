import { DocumentManager } from "./documentManager.js";

export class SelectionManager {
  constructor(private readonly documentManager: DocumentManager) {}

  async getSelectionSummary(): Promise<string> {
    const selected = await this.documentManager.getSelectedFootprints();
    if (selected.length === 0) {
      return "No PCB footprints selected.";
    }
    return selected
      .map((item) => `${item.ref}(${item.id}) @ ${item.x.toFixed(2)}, ${item.y.toFixed(2)}`)
      .join("\n");
  }
}
