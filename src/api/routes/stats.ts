import { Router } from "express";
import { asyncHandler, sendSuccess } from "../http.js";
import { GreenProofApiService } from "../services/api-service.js";

/**
 * Registers the API stats endpoint.
 */
export function createStatsRouter(service: GreenProofApiService): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      const stats = await service.getStats();
      sendSuccess(response, stats);
    })
  );

  return router;
}
