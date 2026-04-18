import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
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

  assert.equal(scanBody.data.product.name, "FastFashionX Eco Collection Basic Tee");
  assert.equal(scanBody.data.result.rating, "UNVERIFIED");
  assert.equal(scanBody.data.integrity.displayId.length, 16);
  assert.equal(scanBody.data.integrity.resultHash.length, 64);

  const queryResponse = await fetch(`${baseUrl}/api/scan`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: "organic hoodie"
    })
  });
  const queryBody = (await queryResponse.json()) as ApiResponse<ScanResponsePayload>;

  assert.equal(queryResponse.status, 200);
  assertSuccess(queryBody);

  assert.equal(queryBody.data.product.name, "Patagonia Organic Cotton Hoodie");
  assert.equal(queryBody.data.dataSource, "local_seed");
  assert.equal(queryBody.data.product.priceCents, 12900);
  assert(queryBody.data.product.imageUrl);

  const organicTeeResponse = await fetch(`${baseUrl}/api/scan`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: "organic t shirt"
    })
  });
  const organicTeeBody = (await organicTeeResponse.json()) as ApiResponse<ScanResponsePayload>;

  assert.equal(organicTeeResponse.status, 200);
  assertSuccess(organicTeeBody);
  assert.equal(organicTeeBody.data.product.name, "Pact Organic Crew Tee");
  assert.equal(organicTeeBody.data.product.priceCents, 3400);
  assert(organicTeeBody.data.product.imageUrl);

  const apparelQueryResponse = await fetch(`${baseUrl}/api/scan`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: "eco t shirt"
    })
  });
  const apparelQueryBody = (await apparelQueryResponse.json()) as ApiResponse<ScanResponsePayload>;

  assert.equal(apparelQueryResponse.status, 200);
  assertSuccess(apparelQueryBody);

  assert.equal(apparelQueryBody.data.product.name, "FastFashionX Eco Collection Basic Tee");
  assert.equal(apparelQueryBody.data.product.category, "Apparel");
  assert.equal(apparelQueryBody.data.dataSource, "local_seed");

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
  assert.equal(certificationSourcesBody.data.bySector.fashion, 6);
  assert(certificationSourcesBody.data.entries.some((entry) => entry.id === "cosmetics-leaping-bunny"));
  assert(certificationSourcesBody.data.entries.some((entry) => entry.id === "household-epa-safer-choice"));

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
