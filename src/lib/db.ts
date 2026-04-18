import { PrismaClient } from "@prisma/client";

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
