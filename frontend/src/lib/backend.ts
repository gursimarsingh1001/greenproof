import type { ApiEnvelope } from "./types";

const backendBaseUrl = process.env.GREENPROOF_API_BASE_URL ?? "http://localhost:4000";

/**
 * Builds a full backend URL from a relative API path.
 */
export function buildBackendUrl(path: string): string {
  return new URL(path, backendBaseUrl).toString();
}

/**
 * Calls the backend API and unwraps the standard GreenProof response envelope.
 */
export async function fetchBackendData<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildBackendUrl(path), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? `Backend request failed: ${response.status}`);
  }

  return payload.data;
}
