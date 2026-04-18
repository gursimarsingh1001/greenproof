import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Lightweight HTTP error carrying an explicit response status.
 */
export class ApiError extends Error {
  public constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Sends a success payload using the standard GreenProof API envelope.
 */
export function sendSuccess<T>(response: Response, data: T, statusCode = 200): void {
  response.status(statusCode).json({
    success: true,
    data
  });
}

/**
 * Sends a failure payload using the standard GreenProof API envelope.
 */
export function sendError(response: Response, statusCode: number, error: string): void {
  response.status(statusCode).json({
    success: false,
    error
  });
}

/**
 * Wraps async route handlers so thrown errors reach Express error middleware.
 */
export function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (request, response, next) => {
    void handler(request, response, next).catch(next);
  };
}
