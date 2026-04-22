import { Router } from "express";
import { asyncHandler, sendError, sendSuccess } from "../http.js";
import { GreenProofApiService } from "../services/api-service.js";

const allowedModes = new Set(["all", "source", "sector", "missing"]);

function parseBooleanFlag(value: unknown) {
  if (Array.isArray(value)) {
    return parseBooleanFlag(value[0]);
  }

  if (typeof value !== "string") {
    return false;
  }

  return value === "1" || value.toLowerCase() === "true";
}

function readSingleQueryValue(value: unknown) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return typeof value === "string" ? value : undefined;
}

/**
 * Registers the secure background evidence sync endpoint used by Vercel Cron.
 */
export function createSyncEvidenceRouter(service: GreenProofApiService): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (request, response) => {
      const cronSecret = process.env.CRON_SECRET;
      const authorizationHeader = request.header("authorization");

      if (cronSecret) {
        if (authorizationHeader !== `Bearer ${cronSecret}`) {
          sendError(response, 401, "Unauthorized sync request.");
          return;
        }
      } else if (process.env.NODE_ENV === "production") {
        sendError(response, 503, "CRON_SECRET is not configured.");
        return;
      }

      const mode = readSingleQueryValue(request.query.mode) ?? "all";
      const value = readSingleQueryValue(request.query.value);
      const skipFetch = parseBooleanFlag(request.query.skipFetch);

      if (!allowedModes.has(mode)) {
        sendError(response, 400, "Invalid sync mode.");
        return;
      }

      if (skipFetch && mode === "missing") {
        sendError(response, 400, "skipFetch is not supported for missing mode.");
        return;
      }

      if ((mode === "source" || mode === "sector") && !value) {
        sendError(response, 400, "This sync mode requires a value.");
        return;
      }

      sendSuccess(
        response,
        await service.syncOfficialEvidence(mode, value, {
          skipFetch
        })
      );
    })
  );

  return router;
}
