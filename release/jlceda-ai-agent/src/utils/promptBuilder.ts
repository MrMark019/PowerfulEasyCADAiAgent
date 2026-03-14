import type { DocumentSummary } from "../eda/documentManager.js";
import { extractNetNames } from "./netlistParser.js";

export function buildSystemPrompt(summary: DocumentSummary, selectionSummary: string): string {
  const nets = extractNetNames(summary.schematic?.netlist ?? {});
  const outline = summary.pcb?.outline;
  const boardSize = outline ? `${outline.width}x${outline.height}mm` : "unknown";

  return [
    "You are a professional PCB design assistant for JLCEDA Pro.",
    `Current mode: ${summary.mode}`,
    `Board size: ${boardSize}`,
    `Component count: ${summary.schematic?.components.length ?? 0}`,
    `PCB footprint count: ${summary.pcb?.footprints.length ?? 0}`,
    `Layer count: ${summary.pcb?.layers.length ?? 0}`,
    `Selected items:\n${selectionSummary}`,
    `Known nets: ${nets.slice(0, 32).join(", ") || "none"}`,
    "Available actions:",
    "1. MOVE_COMPONENT(id, x, y, rotation)",
    "2. ADD_TRACK(startX, startY, endX, endY, layer, width)",
    "3. CREATE_ZONE(points, net, layer)",
    "Coordinate unit: mm.",
    "Return concise reasoning and valid JSON actions when proposing layout changes."
  ].join("\n");
}
