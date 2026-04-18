import { Router } from "express";
import { z } from "zod";
import { asyncHandler, sendError, sendSuccess } from "../http.js";
import { validateBody } from "../middleware/validation.js";
import { GreenProofApiService } from "../services/api-service.js";

const feedbackSchema = z.object({
  productId: z.coerce.number().int().positive(),
  issueType: z.enum(["incorrect-score", "missing-certification", "incorrect-brand-data", "other"]),
  message: z.string().trim().min(10).max(1000),
  email: z.string().email().optional(),
  reportedScore: z.number().int().min(0).max(100).optional(),
  expectedScore: z.number().int().min(0).max(100).optional()
});

/**
 * Registers the feedback submission endpoint.
 */
export function createFeedbackRouter(service: GreenProofApiService): Router {
  const router = Router();

  router.post(
    "/",
    validateBody(feedbackSchema),
    asyncHandler(async (request, response) => {
      const feedback = await service.submitFeedback(request.body);

      if (!feedback) {
        sendError(response, 404, "Product not found for feedback submission.");
        return;
      }

      sendSuccess(response, feedback, 201);
    })
  );

  return router;
}
