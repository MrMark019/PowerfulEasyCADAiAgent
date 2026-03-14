import { UndoManager } from "../core/undoManager.js";
import { DocumentManager } from "../eda/documentManager.js";

export interface PlacementAction {
  id: string;
  x: number;
  y: number;
  rotation?: number;
}

export class AutoPlaceFeature {
  constructor(
    private readonly documentManager: DocumentManager,
    private readonly undoManager: UndoManager
  ) {}

  async apply(actions: PlacementAction[]): Promise<number> {
    await this.undoManager.snapshot("AI auto place");
    let count = 0;
    for (const action of actions) {
      await this.documentManager.setFootprintPosition(action.id, action.x, action.y, action.rotation);
      count += 1;
    }
    return count;
  }
}
