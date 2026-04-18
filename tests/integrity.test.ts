import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { createApp } from "../src/api/app.js";
import { hashObject, sha256, verifyIntegrity } from "../src/lib/hash.js";
import { db } from "../src/lib/db.js";
import type {
  ApiResponse,
  ScanResponsePayload,
  VerificationReportPayload,
  VerifyIntegrityPayload
} from "../src/types/index.js";

/**
 * Narrows an API response to the success branch for integrity test assertions.
 */
function assertSuccess<T>(response: ApiResponse<T>): asserts response is { success: true; data: T } {
  if (response.success) {
    return;
  }

  throw new Error(response.error);
}

assert.equal(
  sha256("greenproof"),
  "aeb5c904f24eed2498b55c7cee8547beef93a029a755b3a10c2868c8c680193a"
);

const orderedHash = hashObject({
  report: {
    score: 23,
    penalties: [{ reason: "vague term" }, { reason: "flagged brand" }]
  },
  brand: "FastFashionX"
});
const reorderedHash = hashObject({
  brand: "FastFashionX",
  report: {
    penalties: [{ reason: "vague term" }, { reason: "flagged brand" }],
    score: 23
  }
});

assert.equal(orderedHash, reorderedHash);
assert(verifyIntegrity(orderedHash, reorderedHash));
assert(!verifyIntegrity(orderedHash, sha256("tampered")));

const app = createApp();
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((resolve) => {
  server.once("listening", () => resolve());
});
const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

try {
  const product = await db.product.findUnique({
    where: {
      barcode: "8901000000023"
    }
  });

  assert(product, "Expected seeded product data. Run db:seed before test:integrity.");

  const scanResponse = await fetch(`${baseUrl}/api/scan`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      barcode: product.barcode
    })
  });
  const scanBody = (await scanResponse.json()) as ApiResponse<ScanResponsePayload>;

  assert.equal(scanResponse.status, 200);
  assertSuccess(scanBody);
  assert.equal(scanBody.data.product.name, "FastFashionX Eco Collection Basic Tee");
  assert.equal(scanBody.data.integrity.displayId.length, 16);
  assert.equal(scanBody.data.integrity.resultHash.length, 64);

  const originalReport: VerificationReportPayload = {
    product: scanBody.data.product,
    brand: scanBody.data.brand,
    dataSource: scanBody.data.dataSource,
    ...(scanBody.data.sourceDetails ? { sourceDetails: scanBody.data.sourceDetails } : {}),
    claims: scanBody.data.claims,
    result: scanBody.data.result,
    explanation: scanBody.data.explanation,
    alternatives: scanBody.data.alternatives
  };
  const verifyResponse = await fetch(`${baseUrl}/api/verify-integrity`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      displayId: scanBody.data.integrity.displayId,
      report: originalReport
    })
  });
  const verifyBody = (await verifyResponse.json()) as ApiResponse<VerifyIntegrityPayload>;

  assert.equal(verifyResponse.status, 200);
  assertSuccess(verifyBody);
  assert.equal(verifyBody.data.verified, true);

  const inflatedReport: VerificationReportPayload = {
    ...originalReport,
    result: {
      ...originalReport.result,
      score: 90
    }
  };
  const tamperedResponse = await fetch(`${baseUrl}/api/verify-integrity`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      displayId: scanBody.data.integrity.displayId,
      report: inflatedReport
    })
  });
  const tamperedBody = (await tamperedResponse.json()) as ApiResponse<VerifyIntegrityPayload>;

  assert.equal(tamperedResponse.status, 200);
  assertSuccess(tamperedBody);
  assert.equal(tamperedBody.data.verified, false);
  assert.notEqual(tamperedBody.data.submittedHash, tamperedBody.data.storedHash);

  console.info("GreenProof integrity tests passed.");
} finally {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  await db.$disconnect();
}
