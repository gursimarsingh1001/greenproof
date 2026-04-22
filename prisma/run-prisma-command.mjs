import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { renderSchema, resolvePrismaProvider } from "./render-schema.mjs";
import "./prepare-db.mjs";

function resolvePrismaArgs(command) {
  const provider = resolvePrismaProvider();

  switch (command) {
    case "generate":
      return ["generate"];
    case "push":
      return ["db", "push"];
    case "studio":
      return ["studio"];
    case "migrate":
    case "migrateDev":
      return provider === "postgresql" ? ["db", "push"] : ["migrate", command === "migrate" ? "deploy" : "dev"];
    default:
      throw new Error(`Unsupported Prisma command "${command}".`);
  }
}

export function runPrismaCommand(command) {
  const { generatedSchemaPath } = renderSchema();
  const args = [...resolvePrismaArgs(command), "--schema", generatedSchemaPath];
  const executable = resolve(
    "node_modules",
    ".bin",
    process.platform === "win32" ? "prisma.cmd" : "prisma"
  );
  const result = spawnSync(executable, args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32"
  });

  if (result.error) {
    throw result.error;
  }

  process.exit(result.status ?? 1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const command = process.argv[2] ?? "generate";
  runPrismaCommand(command);
}
