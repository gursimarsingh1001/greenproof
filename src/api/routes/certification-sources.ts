import { Router } from "express";
import { asyncHandler, sendSuccess } from "../http.js";
import { GreenProofApiService } from "../services/api-service.js";

/**
 * Registers the official source-registry endpoint for certification databases.
 */
export function createCertificationSourcesRouter(service: GreenProofApiService): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      sendSuccess(response, await service.listCertificationSources());
    })
  );

  return router;
}
