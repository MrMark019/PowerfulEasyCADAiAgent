export function extractNetNames(netlist: JsonValue): string[] {
  if (!netlist || typeof netlist !== "object") {
    return [];
  }

  const names = new Set<string>();
  const walk = (value: JsonValue): void => {
    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }
      return;
    }
    if (!value || typeof value !== "object") {
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      if (key.toLowerCase().includes("net") && typeof child === "string") {
        names.add(child);
      } else {
        walk(child);
      }
    }
  };

  walk(netlist);
  return [...names];
}
