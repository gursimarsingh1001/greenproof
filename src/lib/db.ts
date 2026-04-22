import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

type DatabaseProvider = "sqlite" | "postgresql";

function resolveDatabaseProvider(databaseUrl = process.env.DATABASE_URL): DatabaseProvider {
  const explicitProvider = process.env.GREENPROOF_DB_PROVIDER?.trim().toLowerCase();

  if (explicitProvider === "postgres" || explicitProvider === "postgresql") {
    return "postgresql";
  }

  if (explicitProvider === "sqlite") {
    return "sqlite";
  }

  const normalizedUrl = databaseUrl?.trim().toLowerCase();

  if (!normalizedUrl) {
    return "sqlite";
  }

  if (
    normalizedUrl.startsWith("postgres://") ||
    normalizedUrl.startsWith("postgresql://") ||
    normalizedUrl.startsWith("prisma+postgres://")
  ) {
    return "postgresql";
  }

  return "sqlite";
}

function resolveRuntimeDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (process.env.GREENPROOF_POSTGRES_DATABASE_URL) {
    return process.env.GREENPROOF_POSTGRES_DATABASE_URL;
  }

  if (process.env.GREENPROOF_SQLITE_DATABASE_URL) {
    return process.env.GREENPROOF_SQLITE_DATABASE_URL;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "GreenProof requires DATABASE_URL (or GREENPROOF_POSTGRES_DATABASE_URL) in production."
    );
  }

  return "file:./dev.db";
}

const runtimeDatabaseUrl = resolveRuntimeDatabaseUrl();
const runtimeDatabaseProvider = resolveDatabaseProvider(runtimeDatabaseUrl);

/**
 * Vercel and similar environments expose a writable temp directory, so we copy the
 * seeded SQLite database there before Prisma opens a connection.
 */
function ensureWritableSeedDatabase(databaseUrl: string) {
  if (runtimeDatabaseProvider !== "sqlite") {
    return;
  }

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
