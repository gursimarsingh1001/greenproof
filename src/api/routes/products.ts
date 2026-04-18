import { Router } from "express";
import { z } from "zod";
import { asyncHandler, sendError, sendSuccess } from "../http.js";
import { validateParams } from "../middleware/validation.js";
import { GreenProofApiService } from "../services/api-service.js";

const productParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

/**
 * Registers the product verification endpoint.
 */
export function createProductsRouter(service: GreenProofApiService): Router {
  const router = Router();

  router.get(
    "/:id",
    validateParams(productParamsSchema),
    asyncHandler(async (request, response) => {
      const id = Number(request.params.id);
      const result = await service.getProductVerification(id);

      if (!result) {
        sendError(response, 404, "Product not found.");
        return;
      }

      sendSuccess(response, result);
    })
  );

  return router;
}
