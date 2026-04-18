import type { RequestHandler } from "express";
import { sendError } from "../http.js";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitBucket {
  requestCount: number;
  resetAt: number;
}

/**
 * Creates a simple in-memory rate limiter suitable for the hackathon API.
 */
export function createRateLimitMiddleware(options: RateLimitOptions): RequestHandler {
  const buckets = new Map<string, RateLimitBucket>();

  return (request, response, next) => {
    const now = Date.now();
    const clientKey = request.ip || request.headers["x-forwarded-for"]?.toString() || "anonymous";
    const existingBucket = buckets.get(clientKey);

    if (!existingBucket || existingBucket.resetAt <= now) {
      buckets.set(clientKey, {
        requestCount: 1,
        resetAt: now + options.windowMs
      });
      next();
      return;
    }

    if (existingBucket.requestCount >= options.maxRequests) {
      sendError(response, 429, "Too many requests. Please try again shortly.");
      return;
    }

    existingBucket.requestCount += 1;
    next();
  };
}
