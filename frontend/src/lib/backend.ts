import type { ApiEnvelope } from "./types";

type BackendRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

const DEFAULT_LOCAL_BACKEND_URL = "http://localhost:4000";
const DEFAULT_PRODUCTION_BACKEND_URL = "https://greenproof-api.vercel.app";
const backendBaseUrl =
  process.env.GREENPROOF_API_BASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_GREENPROOF_API_BASE_URL?.trim() ||
  (process.env.NODE_ENV === "production" ? DEFAULT_PRODUCTION_BACKEND_URL : DEFAULT_LOCAL_BACKEND_URL);

/**
 * Builds a full backend URL from a relative API path.
 */
export function buildBackendUrl(path: string): string {
  return new URL(path, backendBaseUrl).toString();
}

/**
 * Parses a JSON response safely so blank or HTML responses surface as readable errors.
 */
export async function readJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.text();

  if (!payload.trim()) {
    throw new Error(`GreenProof returned an empty response (${response.status}).`);
  }

  try {
    return JSON.parse(payload) as T;
  } catch {
    throw new Error(`GreenProof returned an invalid JSON response (${response.status}).`);
  }
}

/**
 * Calls the backend API and unwraps the standard GreenProof response envelope.
 */
export async function fetchBackendData<T>(path: string, init?: BackendRequestInit): Promise<T> {
  const requestInit: BackendRequestInit = {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    },
    ...(init?.cache ? { cache: init.cache } : !init?.next ? { cache: "no-store" as const } : {})
  };
  const response = await fetch(buildBackendUrl(path), requestInit);
  const payload = await readJsonResponse<ApiEnvelope<T>>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? `Backend request failed: ${response.status}`);
  }

  return payload.data;
}
