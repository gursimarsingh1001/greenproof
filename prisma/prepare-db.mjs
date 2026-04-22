import { mkdirSync, openSync, closeSync } from "node:fs";
import { dirname } from "node:path";
import { resolvePrismaProvider, resolveSqliteFilePath } from "./render-schema.mjs";

if (resolvePrismaProvider() === "sqlite") {
  const databaseFilePath = resolveSqliteFilePath(process.env.DATABASE_URL);

  mkdirSync(dirname(databaseFilePath), { recursive: true });
  closeSync(openSync(databaseFilePath, "a"));
}
