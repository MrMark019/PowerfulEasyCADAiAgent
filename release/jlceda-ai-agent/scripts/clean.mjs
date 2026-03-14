import { existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
for (const name of ["dist", "artifacts"]) {
  const target = join(root, name);
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }
}
