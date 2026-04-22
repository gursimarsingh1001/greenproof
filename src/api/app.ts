import express, { type NextFunction, type Request, type Response } from "express";
import { sendError, sendSuccess } from "./http.js";
import { createRateLimitMiddleware } from "./middleware/rateLimit.js";
import { createBrandsRouter } from "./routes/brands.js";
import { createCertificationsRouter } from "./routes/certifications.js";
import { createCertificationSourcesRouter } from "./routes/certification-sources.js";
import { createFeedbackRouter } from "./routes/feedback.js";
import { createProductsRouter } from "./routes/products.js";
import { createScanRouter } from "./routes/scan.js";
import { createSyncEvidenceRouter } from "./routes/sync-evidence.js";
import { createStatsRouter } from "./routes/stats.js";
import { createVerifyIntegrityRouter } from "./routes/verify-integrity.js";
import { GreenProofApiService } from "./services/api-service.js";

/**
 * Builds the GreenProof Express application with all Phase 3 routes.
 */
export function createApp() {
  const app = express();
  const apiService = new GreenProofApiService();

  app.disable("x-powered-by");
  app.set("trust proxy", true);
  app.use(express.json({ limit: "1mb" }));
  app.use(createRateLimitMiddleware({ windowMs: 60_000, maxRequests: 90 }));

  app.get("/", (_request, response) => {
    sendSuccess(response, {
      service: "GreenProof API",
      status: "ok",
      docs: {
        health: "/api/health",
        stats: "/api/stats",
        scan: "/api/scan",
        syncEvidence: "/api/sync-evidence"
      }
    });
  });

  app.get("/api/health", (_request, response) => {
    sendSuccess(response, {
      service: "GreenProof API",
      status: "ok"
    });
  });

  app.use("/api/scan", createScanRouter(apiService));
  app.use("/api/product", createProductsRouter(apiService));
  app.use("/api/brand", createBrandsRouter(apiService));
  app.use("/api/certifications", createCertificationsRouter(apiService));
  app.use("/api/certification-sources", createCertificationSourcesRouter(apiService));
  app.use("/api/sync-evidence", createSyncEvidenceRouter(apiService));
  app.use("/api/stats", createStatsRouter(apiService));
  app.use("/api/feedback", createFeedbackRouter(apiService));
  app.use("/api/verify-integrity", createVerifyIntegrityRouter(apiService));

  app.use((_request, response) => {
    sendError(response, 404, "Route not found.");
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof SyntaxError) {
      sendError(response, 400, "Invalid JSON body.");
      return;
    }

    console.error(error);
    sendError(response, 500, "Something went wrong while processing the request.");
  });

  return app;
}
