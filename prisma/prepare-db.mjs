import { mkdirSync, openSync, closeSync } from "node:fs";
import { dirname, resolve } from "node:path";

const databaseFilePath = resolve("prisma", "dev.db");

mkdirSync(dirname(databaseFilePath), { recursive: true });
closeSync(openSync(databaseFilePath, "a"));
