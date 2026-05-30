import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = resolve(rootDir, "app/api");
const tempDir = resolve(rootDir, ".tauri-build/app-api");

let movedApiDir = false;

try {
  if (existsSync(tempDir)) {
    rmSync(tempDir, { force: true, recursive: true });
  }

  if (existsSync(apiDir)) {
    mkdirSync(dirname(tempDir), { recursive: true });
    renameSync(apiDir, tempDir);
    movedApiDir = true;
  }

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["run", "build"], {
    cwd: rootDir,
    env: {
      ...process.env,
      NEXT_OUTPUT: "export",
    },
    stdio: "inherit",
  });

  process.exitCode = result.status ?? 1;
} finally {
  if (movedApiDir && existsSync(tempDir) && !existsSync(apiDir)) {
    renameSync(tempDir, apiDir);
  }
}
