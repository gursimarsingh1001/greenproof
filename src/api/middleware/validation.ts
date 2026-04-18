import type { RequestHandler } from "express";
import { z } from "zod";
import { sendError } from "../http.js";

type RequestSource = "body" | "params" | "query";

/**
 * Validates request input from the chosen request source using a Zod schema.
 */
export function validateRequest<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  source: RequestSource
): RequestHandler {
  return (request, response, next) => {
    const parsedResult = schema.safeParse(request[source]);

    if (!parsedResult.success) {
      const message = parsedResult.error.issues.map((issue) => issue.message).join("; ");
      sendError(response, 400, message);
      return;
    }

    (request as Record<RequestSource, unknown>)[source] = parsedResult.data;
    next();
  };
}

/**
 * Validates JSON request bodies.
 */
export function validateBody<TSchema extends z.ZodTypeAny>(schema: TSchema): RequestHandler {
  return validateRequest(schema, "body");
}

/**
 * Validates route params.
 */
export function validateParams<TSchema extends z.ZodTypeAny>(schema: TSchema): RequestHandler {
  return validateRequest(schema, "params");
}
