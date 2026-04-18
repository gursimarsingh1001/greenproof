import { Router } from "express";
import { z } from "zod";
import { asyncHandler, sendError, sendSuccess } from "../http.js";
import { validateBody } from "../middleware/validation.js";
import { GreenProofApiService } from "../services/api-service.js";

const scanSchema = z
  .object({
    barcode: z.string().trim().min(8).max(32).optional(),
    query: z.string().trim().min(2).max(120).optional()
  })
  .refine((value) => (value.barcode ? 1 : 0) + (value.query ? 1 : 0) === 1, {
    message: "Provide exactly one of barcode or query."
  });

/**
 * Registers the scan endpoint.
 */
export function createScanRouter(service: GreenProofApiService): Router {
  const router = Router();

  router.post(
    "/",
    validateBody(scanSchema),
    asyncHandler(async (request, response) => {
      const result = await service.scan(request.body);

      if (!result) {
        sendError(response, 404, "No matching product was found for the provided barcode or query.");
        return;
      }

      sendSuccess(response, result);
    })
  );

  return router;
}
