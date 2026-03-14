import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const rootPath = fileURLToPath(new URL("../", import.meta.url));
const distDir = join(rootPath, "dist");
const artifactsDir = join(rootPath, "artifacts");

for (const dir of [distDir, artifactsDir]) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

const tsc = spawnSync("node", ["./node_modules/typescript/bin/tsc", "-p", "tsconfig.json"], {
  cwd: rootPath,
  stdio: "inherit",
  shell: false
});

if (tsc.status !== 0) {
  process.exit(tsc.status ?? 1);
}

cpSync(join(rootPath, "extension.json"), join(distDir, "extension.json"));
cpSync(join(rootPath, "src", "ui"), join(distDir, "ui"), { recursive: true });

const zipPath = join(artifactsDir, "jlceda-ai-agent.zip");
const archivePath = join(artifactsDir, "jlceda-ai-agent.eext");
const compress = spawnSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-Command",
    `Compress-Archive -Path "${join(distDir, "*")}" -DestinationPath "${zipPath}" -Force`
  ],
  { cwd: rootPath, stdio: "inherit", shell: false }
);

if (compress.status !== 0) {
  process.exit(compress.status ?? 1);
}

if (existsSync(archivePath)) {
  rmSync(archivePath, { force: true });
}
renameSync(zipPath, archivePath);
