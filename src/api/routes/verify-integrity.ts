import { Router } from "express";
import { z } from "zod";
import { asyncHandler, sendError, sendSuccess } from "../http.js";
import { validateBody } from "../middleware/validation.js";
import { GreenProofApiService } from "../services/api-service.js";

const verifyIntegritySchema = z.object({
  displayId: z
    .string()
    .trim()
    .regex(/^[A-F0-9]{16}$/i, "displayId must be a 16-character integrity record id."),
  report: z.object({
    product: z.record(z.string(), z.unknown()),
    brand: z.record(z.string(), z.unknown()),
    dataSource: z.enum(["local_seed", "open_food_facts"]),
    sourceDetails: z.record(z.string(), z.unknown()).optional(),
    evidenceLookup: z.enum(["cached", "live_refresh", "none_found"]),
    evidenceSources: z.array(z.string()),
    evidenceFreshness: z.enum(["fresh", "stale", "unavailable"]),
    officialEvidence: z.object({
      lastCheckedAt: z.string().optional(),
      product: z.array(z.record(z.string(), z.unknown())),
      brand: z.array(z.record(z.string(), z.unknown()))
    }),
    claims: z.array(z.record(z.string(), z.unknown())),
    result: z.record(z.string(), z.unknown()),
    explanation: z.record(z.string(), z.unknown()),
    alternatives: z.array(z.record(z.string(), z.unknown()))
  })
});

/**
 * Registers the integrity verification endpoint.
 * This checks whether a submitted report still matches the stored GreenProof record hash.
 * It does not digitally sign the report and it does not make the database immutable.
 */
export function createVerifyIntegrityRouter(service: GreenProofApiService): Router {
  const router = Router();

  router.post(
    "/",
    validateBody(verifyIntegritySchema),
    asyncHandler(async (request, response) => {
      const result = await service.verifyIntegrity(request.body);

      if (!result) {
        sendError(response, 404, "No integrity record was found for that displayId.");
        return;
      }

      sendSuccess(response, result);
    })
  );

  return router;
}
