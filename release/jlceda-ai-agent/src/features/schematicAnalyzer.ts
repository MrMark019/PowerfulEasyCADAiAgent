import type { DocumentSummary } from "../eda/documentManager.js";

export class SchematicAnalyzer {
  toMarkdown(summary: DocumentSummary): string {
    const componentCount = summary.schematic?.components.length ?? 0;
    const netlist = summary.schematic?.netlist ?? {};
    const footprintCount = summary.pcb?.footprints.length ?? 0;
    const outline = summary.pcb?.outline;
    const boardText = outline ? `${outline.width}mm x ${outline.height}mm` : "unknown";

    return [
      `Mode: ${summary.mode}`,
      `Schematic components: ${componentCount}`,
      `PCB footprints: ${footprintCount}`,
      `Board outline: ${boardText}`,
      "Netlist:",
      "```json",
      JSON.stringify(netlist, null, 2),
      "```"
    ].join("\n");
  }
}
