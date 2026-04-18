import { Router } from "express";
import { z } from "zod";
import { asyncHandler, sendError, sendSuccess } from "../http.js";
import { validateParams } from "../middleware/validation.js";
import { GreenProofApiService } from "../services/api-service.js";

const brandParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

/**
 * Registers the brand reputation endpoint.
 */
export function createBrandsRouter(service: GreenProofApiService): Router {
  const router = Router();

  router.get(
    "/:id/reputation",
    validateParams(brandParamsSchema),
    asyncHandler(async (request, response) => {
      const id = Number(request.params.id);
      const result = await service.getBrandReputation(id);

      if (!result) {
        sendError(response, 404, "Brand not found.");
        return;
      }

      sendSuccess(response, result);
    })
  );

  return router;
}
