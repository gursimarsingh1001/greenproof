import { Router } from "express";
import { asyncHandler, sendSuccess } from "../http.js";
import { buildCertificationSourceRegistry } from "../../lib/certification-sources.js";

/**
 * Registers the official source-registry endpoint for certification databases.
 */
export function createCertificationSourcesRouter(): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      sendSuccess(response, buildCertificationSourceRegistry());
    })
  );

  return router;
}
