import { Router } from "express";
import { asyncHandler, sendSuccess } from "../http.js";
import { GreenProofApiService } from "../services/api-service.js";

/**
 * Registers the certification catalog endpoint.
 */
export function createCertificationsRouter(service: GreenProofApiService): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      const certifications = await service.listCertifications();
      sendSuccess(response, certifications);
    })
  );

  return router;
}
