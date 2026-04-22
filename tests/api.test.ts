import assert from "node:assert/strict";
import { rm, mkdtemp, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { createApp } from "../src/api/app.js";
import { db } from "../src/lib/db.js";
import type {
  ApiResponse,
  BrandReputationPayload,
  FeedbackReceiptPayload,
  ProductVerificationPayload,
  ScanResponsePayload,
  StatsPayload
} from "../src/types/index.js";

/**
 * Narrows an API response to the success branch for test assertions.
 */
function assertSuccess<T>(response: ApiResponse<T>): asserts response is { success: true; data: T } {
  if (response.success) {
    return;
  }

  throw new Error(response.error);
}

const originalFetch = globalThis.fetch;
const mockedOpenFoodFactsBarcode = "5449000000996";
const mockedOpenFoodFactsSearchBarcode = "002800034006";

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const requestUrl =
    typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  if (requestUrl.startsWith(`https://world.openfoodfacts.org/api/v2/product/${mockedOpenFoodFactsBarcode}.json`)) {
    return new Response(
      JSON.stringify({
        status: 1,
        code: mockedOpenFoodFactsBarcode,
        product: {
          product_name: "Coca-Cola Original Taste",
          brands: "Coca-Cola",
          categories: "Beverages, Soft drinks, Sodas",
          labels: "Soft drink",
          labels_tags: ["en:soft-drink"],
          packaging: "Plastic bottle",
          packaging_tags: ["en:plastic-bottle"],
          ingredients_text: "Carbonated water, sugar, colour, phosphoric acid, natural flavourings, caffeine",
          ecoscore_grade: "d",
          ecoscore_score: 34,
          nutriscore_grade: "e",
          nova_group: 4,
          url: "https://world.openfoodfacts.org/product/5449000000996/coca-cola-original-taste",
          image_front_url: "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.3.400.jpg"
        }
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      }
    );
  }

  if (requestUrl.startsWith("https://world.openfoodfacts.org/cgi/search.pl?")) {
    const searchUrl = new URL(requestUrl);
    const searchTerms = searchUrl.searchParams.get("search_terms");

    if (searchTerms === "lays classic") {
      return new Response(
        JSON.stringify({
          products: [
            {
              code: mockedOpenFoodFactsSearchBarcode,
              product_name: "Lay's Classic Potato Chips",
              brands: "Frito-Lay",
              categories: "Snacks, Potato chips",
              labels: "No artificial colors",
              labels_tags: ["en:no-artificial-colors"],
              packaging: "Bag",
              packaging_tags: ["en:bag"],
              ingredients_text: "Potatoes, vegetable oil, salt",
              ecoscore_grade: "d",
              ecoscore_score: 31,
              nutriscore_grade: "d",
              nova_group: 3,
              url: "https://world.openfoodfacts.org/product/002800034006/lays-classic-potato-chips",
              image_front_url: "https://images.openfoodfacts.org/images/products/002/800/034/006/front_en.10.400.jpg"
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }
  }

  return originalFetch(input, init);
};

const app = createApp();
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((resolve) => {
  server.once("listening", () => resolve());
});
const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

try {
  const rootResponse = await fetch(baseUrl);
  const rootBody = (await rootResponse.json()) as ApiResponse<{
    service: string;
    status: string;
    docs: Record<string, string>;
  }>;

  assert.equal(rootResponse.status, 200);
  assertSuccess(rootBody);
  assert.equal(rootBody.data.service, "GreenProof API");
  assert.equal(rootBody.data.status, "ok");
  assert.equal(rootBody.data.docs.health, "/api/health");

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const healthBody = (await healthResponse.json()) as ApiResponse<{
    service: string;
    status: string;
  }>;

  assert.equal(healthResponse.status, 200);
  assertSuccess(healthBody);
  assert.equal(healthBody.data.service, "GreenProof API");
  assert.equal(healthBody.data.status, "ok");

  const seededProduct = await db.product.findUnique({
    where: {
      barcode: "8901000000023"
    }
  });

  assert(seededProduct, "Expected seeded product data. Run db:seed before test:api.");

  const scanResponse = await fetch(`${baseUrl}/api/scan`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      barcode: seededProduct.barcode
    })
  });
  const scanBody = (await scanResponse.json()) as ApiResponse<ScanResponsePayload>;

  assert.equal(scanResponse.status, 200);
  assertSuccess(scanBody);

  assert.equal(scanBody.data.product.name, "Biotique Fresh Neem Pimple Control Face Wash");
  assert.equal(scanBody.data.result.rating, "UNVERIFIED");
  assert.equal(scanBody.data.integrity.displayId.length, 16);
  assert.equal(scanBody.data.integrity.resultHash.length, 64);
  assert.equal(scanBody.data.evidenceLookup, "none_found");
  assert.equal(scanBody.data.officialEvidence.product.length, 0);
  assert.equal(scanBody.data.officialEvidence.brand.length, 0);

  const queryResponse = await fetch(`${baseUrl}/api/scan`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: "no nasties tee"
    })
  });
  const queryBody = (await queryResponse.json()) as ApiResponse<ScanResponsePayload>;

  assert.equal(queryResponse.status, 200);
  assertSuccess(queryBody);

  assert.equal(queryBody.data.product.name, "No Nasties Blanc Classic Tee");
  assert.equal(queryBody.data.dataSource, "local_seed");
  assert(queryBody.data.product.imageUrl);
  assert.equal(queryBody.data.evidenceLookup, "cached");
  assert(queryBody.data.evidenceSources.includes("GOTS (Global Organic Textile Standard)"));
  assert(queryBody.data.officialEvidence.product.some((evidence) => evidence.certificationAcronym === "GOTS"));

  const organicTeeResponse = await fetch(`${baseUrl}/api/scan`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: "H&M Organic Cotton T-Shirt"
    })
  });
  const organicTeeBody = (await organicTeeResponse.json()) as ApiResponse<ScanResponsePayload>;

  assert.equal(organicTeeResponse.status, 200);
  assertSuccess(organicTeeBody);
  assert.equal(organicTeeBody.data.product.name, "H&M Organic Cotton T-Shirt");
  assert(organicTeeBody.data.product.imageUrl);

  const apparelQueryResponse = await fetch(`${baseUrl}/api/scan`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: "mamaearth onion shampoo"
    })
  });
  const apparelQueryBody = (await apparelQueryResponse.json()) as ApiResponse<ScanResponsePayload>;

  assert.equal(apparelQueryResponse.status, 200);
  assertSuccess(apparelQueryBody);

  assert.equal(apparelQueryBody.data.product.name, "Mamaearth Onion Shampoo");
  assert.equal(apparelQueryBody.data.product.category, "Beauty");
  assert.equal(apparelQueryBody.data.dataSource, "local_seed");
  assert.equal(apparelQueryBody.data.evidenceLookup, "cached");
  assert(apparelQueryBody.data.evidenceSources.includes("MADE SAFE"));
  assert(apparelQueryBody.data.officialEvidence.product.some((evidence) => evidence.certificationAcronym === "MSAFE"));

  const attitudeBrand = await db.brand.findUnique({
    where: {
      name: "ATTITUDE"
    }
  });
  const ewgCertification = await db.certification.findUnique({
    where: {
      acronym: "EWG"
    }
  });

  assert(attitudeBrand, "Expected ATTITUDE brand to exist for official evidence discovery coverage.");
  assert(ewgCertification, "Expected EWG certification to exist for official evidence discovery coverage.");

  let discoveredOfficialProductId: number | null = null;
  const officialDiscoveryEvidence = await db.certificationEvidence.create({
    data: {
      sourceId: "cosmetics-ewg-verified",
      certificationId: ewgCertification.id,
      scope: "product",
      status: "verified",
      matchedVia: "unmatched",
      confidence: 0,
      externalBrandName: "ATTITUDE",
      externalProductName: "Oceanly Phyto-Cleanse Solid Cleanser",
      sourceUrl: "https://attitudeliving.com/products/oceanly-phyto-cleanse-solid-cleanser",
      checkedAt: new Date("2026-04-22T02:06:52.989Z"),
      rawPayload: {
        source: "api discovery test"
      },
      brandId: attitudeBrand.id
    }
  });

  try {
    const officialImportResponse = await fetch(`${baseUrl}/api/scan`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        query: "attitude oceanly phyto cleanse solid cleanser"
      })
    });
    const officialImportBody = (await officialImportResponse.json()) as ApiResponse<ScanResponsePayload>;

    assert.equal(officialImportResponse.status, 200);
    assertSuccess(officialImportBody);

    discoveredOfficialProductId = officialImportBody.data.product.id;
    assert.equal(officialImportBody.data.product.name, "Oceanly Phyto-Cleanse Solid Cleanser");
    assert.equal(officialImportBody.data.brand.name, "ATTITUDE");
    assert.equal(officialImportBody.data.dataSource, "official_evidence_import");
    assert.equal(officialImportBody.data.sourceDetails?.label, "Official Evidence Import");
    assert(officialImportBody.data.evidenceSources.includes("EWG Verified"));
    assert(officialImportBody.data.officialEvidence.product.some((evidence) => evidence.certificationAcronym === "EWG"));
    assert(officialImportBody.data.claims.some((claim) => /ewg verified/i.test(claim.text)));

    const importedOfficialProduct = await db.product.findUnique({
      where: {
        id: discoveredOfficialProductId
      }
    });

    assert(importedOfficialProduct, "Expected official discovery import to create a local product row.");
    assert.equal(importedOfficialProduct.dataSource, "official_evidence_import");
    assert(importedOfficialProduct.barcode.startsWith("OFF-"));
  } finally {
    if (discoveredOfficialProductId) {
      await db.product.delete({
        where: {
          id: discoveredOfficialProductId
        }
      });
    }

    await db.certificationEvidence.deleteMany({
      where: {
        id: officialDiscoveryEvidence.id
      }
    });
  }

  const offQueryResponse = await fetch(`${baseUrl}/api/scan`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: "lays classic"
    })
  });
  const offQueryBody = (await offQueryResponse.json()) as ApiResponse<ScanResponsePayload>;

  assert.equal(offQueryResponse.status, 200);
  assertSuccess(offQueryBody);

  assert.equal(offQueryBody.data.product.barcode, mockedOpenFoodFactsSearchBarcode);
  assert.equal(offQueryBody.data.brand.name, "Frito-Lay");
  assert.equal(offQueryBody.data.dataSource, "open_food_facts");
  assert.equal(offQueryBody.data.sourceDetails?.label, "Open Food Facts");
  assert.equal(offQueryBody.data.sourceDetails?.nutriscoreGrade, "D");
  assert.equal(offQueryBody.data.evidenceLookup, "none_found");

  const importedBarcodeResponse = await fetch(`${baseUrl}/api/scan`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      barcode: mockedOpenFoodFactsBarcode
    })
  });
  const importedBarcodeBody = (await importedBarcodeResponse.json()) as ApiResponse<ScanResponsePayload>;

  assert.equal(importedBarcodeResponse.status, 200);
  assertSuccess(importedBarcodeBody);

  assert.equal(importedBarcodeBody.data.product.barcode, mockedOpenFoodFactsBarcode);
  assert.equal(importedBarcodeBody.data.brand.name, "Coca-Cola");
  assert(importedBarcodeBody.data.product.name.includes("Coca-Cola"));
  assert.equal(importedBarcodeBody.data.dataSource, "open_food_facts");
  assert.equal(importedBarcodeBody.data.sourceDetails?.label, "Open Food Facts");
  assert.equal(importedBarcodeBody.data.sourceDetails?.ecoscoreGrade, "D");
  assert.equal(importedBarcodeBody.data.sourceDetails?.nutriscoreGrade, "E");
  assert.equal(importedBarcodeBody.data.evidenceLookup, "none_found");
  assert(importedBarcodeBody.data.result.score < 100);
  assert(
    importedBarcodeBody.data.result.penalties.some(
      (penalty) => penalty.type === "NO_SUSTAINABILITY_EVIDENCE" || penalty.type === "NO_VERIFIABLE_ECO_SIGNALS"
    )
  );

  const importedProduct = await db.product.findUnique({
    where: {
      barcode: mockedOpenFoodFactsBarcode
    }
  });

  assert(importedProduct);
  assert.equal(importedProduct.dataSource, "open_food_facts");
  assert.equal(importedProduct.sourceUrl, "https://world.openfoodfacts.org/product/5449000000996/coca-cola-original-taste");
  assert(importedProduct.sourceMetadata);

  const productResponse = await fetch(`${baseUrl}/api/product/${queryBody.data.product.id}`);
  const productBody = (await productResponse.json()) as ApiResponse<ProductVerificationPayload>;

  assert.equal(productResponse.status, 200);
  assertSuccess(productBody);

  assert.equal(productBody.data.product.id, queryBody.data.product.id);
  assert.equal(productBody.data.integrity.displayId.length, 16);

  const verifyIntegrityResponse = await fetch(`${baseUrl}/api/verify-integrity`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      displayId: productBody.data.integrity.displayId,
      report: {
        product: productBody.data.product,
        brand: productBody.data.brand,
        dataSource: productBody.data.dataSource,
        ...(productBody.data.sourceDetails ? { sourceDetails: productBody.data.sourceDetails } : {}),
        evidenceLookup: productBody.data.evidenceLookup,
        evidenceSources: productBody.data.evidenceSources,
        evidenceFreshness: productBody.data.evidenceFreshness,
        officialEvidence: productBody.data.officialEvidence,
        claims: productBody.data.claims,
        result: productBody.data.result,
        explanation: productBody.data.explanation,
        alternatives: productBody.data.alternatives
      }
    })
  });
  const verifyIntegrityBody = (await verifyIntegrityResponse.json()) as ApiResponse<{ verified: boolean }>;

  assert.equal(verifyIntegrityResponse.status, 200);
  assertSuccess(verifyIntegrityBody);
  assert.equal(verifyIntegrityBody.data.verified, true);

  const brandResponse = await fetch(`${baseUrl}/api/brand/${productBody.data.brand.id}/reputation`);
  const brandBody = (await brandResponse.json()) as ApiResponse<BrandReputationPayload>;

  assert.equal(brandResponse.status, 200);
  assertSuccess(brandBody);

  assert.equal(brandBody.data.brand.name, productBody.data.brand.name);
  assert(brandBody.data.pastScores.length > 0);

  const certificationsResponse = await fetch(`${baseUrl}/api/certifications`);
  const certificationsBody = (await certificationsResponse.json()) as ApiResponse<Array<{ id: number; acronym: string }>>;

  assert.equal(certificationsResponse.status, 200);
  assertSuccess(certificationsBody);

  assert(certificationsBody.data.some((certification) => certification.acronym === "GOTS"));

  const certificationSourcesResponse = await fetch(`${baseUrl}/api/certification-sources`);
  const certificationSourcesBody = (await certificationSourcesResponse.json()) as ApiResponse<{
    totalSources: number;
    bySector: Record<string, number>;
    entries: Array<{ id: string; sector: string; certificationName: string }>;
  }>;

  assert.equal(certificationSourcesResponse.status, 200);
  assertSuccess(certificationSourcesBody);
  assert(certificationSourcesBody.data.totalSources >= 10);
  assert.equal(certificationSourcesBody.data.bySector.fashion, 8);
  assert.equal(certificationSourcesBody.data.bySector.cosmetics, 8);
  assert.equal(certificationSourcesBody.data.bySector.household, 7);
  assert(certificationSourcesBody.data.entries.some((entry) => entry.id === "cosmetics-leaping-bunny"));
  assert(certificationSourcesBody.data.entries.some((entry) => entry.id === "household-epa-safer-choice"));
  assert(certificationSourcesBody.data.entries.some((entry) => entry.id === "cosmetics-made-safe"));

  const syncSnapshotDirectory = await mkdtemp(path.join(os.tmpdir(), "greenproof-sync-route-"));
  const previousCronSecret = process.env.CRON_SECRET;
  const previousSyncDirectory = process.env.OFFICIAL_EVIDENCE_SYNC_DIR;

  try {
    process.env.CRON_SECRET = "test-cron-secret";
    process.env.OFFICIAL_EVIDENCE_SYNC_DIR = syncSnapshotDirectory;

    await writeFile(
      path.join(syncSnapshotDirectory, "cosmetics-leaping-bunny.json"),
      JSON.stringify(
        [
          {
            sourceId: "cosmetics-leaping-bunny",
            certificationAcronym: "LB",
            scope: "brand",
            externalBrandName: "Cron Test Beauty",
            sourceUrl: "https://files.example.test/cosmetics-leaping-bunny/cron-test-beauty.json",
            checkedAt: "2026-04-22T05:00:00.000Z",
            status: "verified",
            confidence: 0.91,
            rawPayload: {
              source: "api cron test"
            }
          }
        ],
        null,
        2
      ),
      "utf8"
    );

    const unauthorizedSyncResponse = await fetch(
      `${baseUrl}/api/sync-evidence?mode=source&value=cosmetics-leaping-bunny&skipFetch=1`
    );
    const unauthorizedSyncBody = (await unauthorizedSyncResponse.json()) as ApiResponse<{
      mode: string;
    }>;

    assert.equal(unauthorizedSyncResponse.status, 401);
    assert.equal(unauthorizedSyncBody.success, false);

    const authorizedSyncResponse = await fetch(
      `${baseUrl}/api/sync-evidence?mode=source&value=cosmetics-leaping-bunny&skipFetch=1`,
      {
        headers: {
          authorization: "Bearer test-cron-secret"
        }
      }
    );
    const authorizedSyncBody = (await authorizedSyncResponse.json()) as ApiResponse<{
      mode: string;
      skipFetch: boolean;
      ingestionRuns: Array<{
        sourceId: string;
      }>;
    }>;

    assert.equal(authorizedSyncResponse.status, 200);
    assertSuccess(authorizedSyncBody);
    assert.equal(authorizedSyncBody.data.mode, "source");
    assert.equal(authorizedSyncBody.data.skipFetch, true);
    assert.equal(authorizedSyncBody.data.ingestionRuns.length, 1);
    assert.equal(authorizedSyncBody.data.ingestionRuns[0]?.sourceId, "cosmetics-leaping-bunny");

    const syncedEvidence = await db.certificationEvidence.findFirst({
      where: {
        sourceId: "cosmetics-leaping-bunny",
        externalBrandName: "Cron Test Beauty"
      }
    });

    assert(syncedEvidence);
  } finally {
    await db.certificationEvidence.deleteMany({
      where: {
        sourceId: "cosmetics-leaping-bunny",
        externalBrandName: "Cron Test Beauty"
      }
    });

    if (previousCronSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = previousCronSecret;
    }

    if (previousSyncDirectory === undefined) {
      delete process.env.OFFICIAL_EVIDENCE_SYNC_DIR;
    } else {
      process.env.OFFICIAL_EVIDENCE_SYNC_DIR = previousSyncDirectory;
    }

    await rm(syncSnapshotDirectory, {
      recursive: true,
      force: true
    });
  }

  const statsResponse = await fetch(`${baseUrl}/api/stats`);
  const statsBody = (await statsResponse.json()) as ApiResponse<StatsPayload>;

  assert.equal(statsResponse.status, 200);
  assertSuccess(statsBody);

  assert(statsBody.data.productsAnalyzed >= 30);

  const feedbackResponse = await fetch(`${baseUrl}/api/feedback`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      productId: queryBody.data.product.id,
      issueType: "incorrect-score",
      message: "Test feedback for the GreenProof API route verification.",
      reportedScore: queryBody.data.result.score,
      expectedScore: 95
    })
  });
  const feedbackBody = (await feedbackResponse.json()) as ApiResponse<FeedbackReceiptPayload>;

  assert.equal(feedbackResponse.status, 201);
  assertSuccess(feedbackBody);

  assert.equal(feedbackBody.data.productId, queryBody.data.product.id);
  await db.feedback.delete({
    where: {
      id: feedbackBody.data.id
    }
  });
  await db.product.deleteMany({
    where: {
      barcode: {
        in: [mockedOpenFoodFactsBarcode, mockedOpenFoodFactsSearchBarcode]
      }
    }
  });
  await db.brand.deleteMany({
    where: {
      name: {
        in: ["Coca-Cola", "Frito-Lay"]
      },
      products: {
        none: {}
      }
    }
  });

  console.info("GreenProof API tests passed.");
} finally {
  globalThis.fetch = originalFetch;

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
