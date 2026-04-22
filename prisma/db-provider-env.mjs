export const SQLITE_FALLBACK_DATABASE_URL = "file:./dev.db";
export const POSTGRES_FALLBACK_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:5432/greenproof?schema=public";

export function resolveProviderDatabaseUrl(provider, env = process.env) {
  const currentDatabaseUrl = env.DATABASE_URL?.trim();

  if (provider === "postgresql") {
    if (env.GREENPROOF_POSTGRES_DATABASE_URL?.trim()) {
      return env.GREENPROOF_POSTGRES_DATABASE_URL.trim();
    }

    if (
      currentDatabaseUrl &&
      (currentDatabaseUrl.startsWith("postgres://") ||
        currentDatabaseUrl.startsWith("postgresql://") ||
        currentDatabaseUrl.startsWith("prisma+postgres://"))
    ) {
      return currentDatabaseUrl;
    }

    return POSTGRES_FALLBACK_DATABASE_URL;
  }

  if (env.GREENPROOF_SQLITE_DATABASE_URL?.trim()) {
    return env.GREENPROOF_SQLITE_DATABASE_URL.trim();
  }

  if (currentDatabaseUrl?.startsWith("file:")) {
    return currentDatabaseUrl;
  }

  return SQLITE_FALLBACK_DATABASE_URL;
}

export function applyDbProviderEnv(provider, env = process.env) {
  return {
    ...env,
    GREENPROOF_DB_PROVIDER: provider,
    DATABASE_URL: resolveProviderDatabaseUrl(provider, env)
  };
}
