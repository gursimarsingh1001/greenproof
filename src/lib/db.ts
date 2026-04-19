import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const defaultDatabaseUrl = "file:/tmp/greenproof.db";
const runtimeDatabaseUrl = process.env.DATABASE_URL ?? defaultDatabaseUrl;

/**
 * Vercel and similar environments expose a writable temp directory, so we copy the
 * seeded SQLite database there before Prisma opens a connection.
 */
function ensureWritableSeedDatabase(databaseUrl: string) {
  if (!databaseUrl.startsWith("file:/tmp/")) {
    return;
  }

  const targetPath = databaseUrl.replace(/^file:/, "");

  if (fs.existsSync(targetPath)) {
    return;
  }

  const bundledDatabasePath = path.join(process.cwd(), "prisma", "dev.db");
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  if (fs.existsSync(bundledDatabasePath)) {
    fs.copyFileSync(bundledDatabasePath, targetPath);
    return;
  }

  throw new Error(`Bundled SQLite database not found at ${bundledDatabasePath}.`);
}

process.env.DATABASE_URL = runtimeDatabaseUrl;
ensureWritableSeedDatabase(runtimeDatabaseUrl);

declare global {
  var greenproofPrisma: PrismaClient | undefined;
}

/**
 * Shared Prisma client singleton for local development and future API routes.
 */
export const db =
  globalThis.greenproofPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.greenproofPrisma = db;
}
