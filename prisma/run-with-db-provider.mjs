import "dotenv/config";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { applyDbProviderEnv } from "./db-provider-env.mjs";

function normalizeProvider(rawProvider) {
  const provider = rawProvider?.trim().toLowerCase();

  if (provider === "postgres" || provider === "postgresql") {
    return "postgresql";
  }

  if (provider === "sqlite") {
    return "sqlite";
  }

  throw new Error(`Unsupported database provider "${rawProvider}". Use "postgresql" or "sqlite".`);
}

export function runWithDbProvider(rawProvider, commandParts) {
  if (!commandParts.length) {
    throw new Error("A command is required after the database provider.");
  }

  const provider = normalizeProvider(rawProvider);
  const command = commandParts.join(" ");
  const result = spawnSync(command, {
    cwd: process.cwd(),
    env: applyDbProviderEnv(provider),
    stdio: "inherit",
    shell: true
  });

  if (result.error) {
    throw result.error;
  }

  process.exit(result.status ?? 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , rawProvider, ...commandParts] = process.argv;
  runWithDbProvider(rawProvider, commandParts);
}
