import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { db } from "../src/lib/db.js";
import { OfficialEvidenceService } from "../src/api/services/official-evidence.js";
import { loadVerificationData } from "../src/api/services/verification-data.js";
import { officialEvidenceSeeds } from "../src/lib/official-evidence-seeds.js";

const service = new OfficialEvidenceService();

try {
  const mamaearthOnionShampoo = await db.product.findFirst({
    where: {
      name: "Mamaearth Onion Shampoo"
    }
  });

  assert(mamaearthOnionShampoo, "Expected Mamaearth Onion Shampoo to exist in seeded data.");

  const mSafeCertification = await db.certification.findUnique({
    where: {
      acronym: "MSAFE"
    }
  });

  assert(mSafeCertification, "Expected MADE SAFE certification to exist in seeded data.");

  await db.certificationEvidence.deleteMany({
    where: {
      sourceId: "cosmetics-made-safe"
    }
  });

  await db.productCertification.deleteMany({
    where: {
      certificationId: mSafeCertification.id,
      product: {
        brand: {
          name: "Mamaearth"
        }
      }
    }
  });

  const expectedMadeSafeSeedCount = officialEvidenceSeeds.filter(
    (evidence) => evidence.sourceId === "cosmetics-made-safe"
  ).length;
  const run = await service.ingestSource("cosmetics-made-safe");

  assert.equal(run.status, "completed");
  assert.equal(run.recordsFetched, expectedMadeSafeSeedCount);
  assert.equal(run.recordsMatched, expectedMadeSafeSeedCount);
  assert(run.recordsProjected >= 1);

  const evidenceRows = await db.certificationEvidence.findMany({
    where: {
      sourceId: "cosmetics-made-safe"
    }
  });

  assert.equal(evidenceRows.length, expectedMadeSafeSeedCount);
  assert(
    evidenceRows.every((row) => row.status === "verified"),
    "MADE SAFE bootstrap evidence should import as verified."
  );

  const projectedCertification = await db.productCertification.findUnique({
    where: {
      productId_certificationId: {
        productId: mamaearthOnionShampoo.id,
        certificationId: mSafeCertification.id
      }
    }
  });

  assert(projectedCertification, "Projected product certification should be recreated from official evidence.");
  assert.equal(projectedCertification.isVerified, true);
  assert.equal(projectedCertification.certificateNumber, "MSAFE-ME-ONION-001");

  const registry = await service.listCertificationSources();
  assert(registry.entries.some((entry) => entry.id === "cosmetics-made-safe"));
  assert(registry.entries.some((entry) => entry.id === "cosmetics-leaping-bunny"));
  assert((registry.bySector.cosmetics ?? 0) >= 5);

  const verificationData = await loadVerificationData();
  const biotiqueProduct = verificationData.products.find(
    (product) => product.name === "Biotique Fresh Neem Pimple Control Face Wash"
  );

  assert(biotiqueProduct, "Expected Biotique demo product to exist for miss-cache coverage.");

  await db.certificationIngestionRun.deleteMany({
    where: {
      mode: "lookup",
      query: "biotique biotique fresh neem pimple control face wash"
    }
  });

  const beforeLookupRuns = await db.certificationIngestionRun.count({
    where: {
      mode: "lookup",
      query: "biotique biotique fresh neem pimple control face wash"
    }
  });
  const firstMissSummary = await service.resolveEvidenceForProduct(biotiqueProduct);
  const secondMissSummary = await service.resolveEvidenceForProduct(biotiqueProduct);
  const afterSecondLookupRuns = await db.certificationIngestionRun.count({
    where: {
      mode: "lookup",
      query: "biotique biotique fresh neem pimple control face wash"
    }
  });

  assert.equal(firstMissSummary.lookup, "none_found");
  assert.equal(secondMissSummary.lookup, "none_found");
  assert(firstMissSummary.consultedSources.length > 0, "Miss summary should still show which category sources were consulted.");
  assert(firstMissSummary.consultedSources.length <= 5, "Request-time hybrid lookup should stay capped to a small category source set.");
  assert.equal(secondMissSummary.freshness, "fresh");
  assert(secondMissSummary.consultedSources.length > 0, "Repeated miss summary should preserve category-source context.");
  assert(afterSecondLookupRuns > beforeLookupRuns, "Runtime request-time miss lookups should record category-source work when evidence rows are consulted.");

  const leapingBunnyCertification = await db.certification.findUnique({
    where: {
      acronym: "LB"
    }
  });

  assert(leapingBunnyCertification, "Expected Leaping Bunny certification to exist.");

  await db.certificationEvidence.deleteMany({
    where: {
      sourceId: "cosmetics-leaping-bunny"
    }
  });

  await db.brandCertification.deleteMany({
    where: {
      certificationId: leapingBunnyCertification.id
    }
  });

  const snapshotDirectory = await mkdtemp(path.join(os.tmpdir(), "greenproof-snapshots-"));

  try {
    await writeFile(
      path.join(snapshotDirectory, "cosmetics-leaping-bunny.json"),
      JSON.stringify(
        [
          {
            sourceId: "cosmetics-leaping-bunny",
            certificationAcronym: "LB",
            scope: "brand",
            externalBrandName: "Aveda (Estee Lauder)",
            matchedBrandName: "Aveda",
            certificateNumber: "LB-AVEDA-2026",
            sourceUrl: "https://files.example.test/cosmetics-leaping-bunny/aveda.json",
            checkedAt: "2026-04-19T18:15:00.000Z",
            status: "verified",
            confidence: 0.94,
            rawPayload: {
              source: "test snapshot"
            }
          }
        ],
        null,
        2
      ),
      "utf8"
    );

    await writeFile(
      path.join(snapshotDirectory, "cosmetics-ewg-verified.json"),
      JSON.stringify(
        [
          {
            sourceId: "cosmetics-ewg-verified",
            certificationAcronym: "EWG",
            scope: "product",
            externalBrandName: "ATTITUDE",
            matchedBrandName: "ATTITUDE",
            externalProductName: "ATTITUDE Test Oceanly Discovery Cleanser",
            sourceUrl: "https://files.example.test/cosmetics-ewg-verified/attitude-test-oceanly-discovery-cleanser.json",
            checkedAt: "2026-04-19T18:18:00.000Z",
            status: "verified",
            confidence: 0.95,
            rawPayload: {
              source: "test snapshot discovery"
            }
          }
        ],
        null,
        2
      ),
      "utf8"
    );

    const snapshotService = new OfficialEvidenceService({
      snapshotDirectory
    });
    const expectedLeapingBunnyCount =
      officialEvidenceSeeds.filter((evidence) => evidence.sourceId === "cosmetics-leaping-bunny").length + 1;
    const snapshotRun = await snapshotService.ingestSource("cosmetics-leaping-bunny");

    assert.equal(snapshotRun.status, "completed");
    assert.equal(snapshotRun.recordsFetched, expectedLeapingBunnyCount);
    assert.equal(snapshotRun.recordsMatched, expectedLeapingBunnyCount);

    const avedaEvidence = await db.certificationEvidence.findFirst({
      where: {
        sourceId: "cosmetics-leaping-bunny",
        externalBrandName: "Aveda (Estee Lauder)"
      }
    });

    assert(avedaEvidence, "Snapshot-backed Aveda evidence should be imported.");
    assert.equal(avedaEvidence.brandId !== null, true);

    const avedaBrand = await db.brand.findUnique({
      where: {
        name: "Aveda"
      }
    });

    assert(avedaBrand, "Aveda brand should exist in seeded data.");

    const projectedLeapingBunnyBrandCert = await db.brandCertification.findUnique({
      where: {
        brandId_certificationId: {
          brandId: avedaBrand.id,
          certificationId: leapingBunnyCertification.id
        }
      }
    });

    assert(projectedLeapingBunnyBrandCert, "Snapshot-backed brand evidence should project into brand certifications.");
    assert.equal(projectedLeapingBunnyBrandCert.certificateNumber, "LB-AVEDA-2026");

    const discoveredCandidate = await snapshotService.discoverProductByQuery("attitude test oceanly discovery cleanser");

    assert(discoveredCandidate, "Snapshot-backed discovery should consult source snapshots on query miss.");
    assert.equal(discoveredCandidate.brandName, "ATTITUDE");
    assert.equal(discoveredCandidate.productName, "ATTITUDE Test Oceanly Discovery Cleanser");

    const discoveredEvidence = await db.certificationEvidence.findFirst({
      where: {
        sourceId: "cosmetics-ewg-verified",
        externalProductName: "ATTITUDE Test Oceanly Discovery Cleanser"
      }
    });

    assert(discoveredEvidence, "Discovery lookup should persist newly found official evidence rows.");
  } finally {
    await db.certificationEvidence.deleteMany({
      where: {
        sourceId: "cosmetics-leaping-bunny"
      }
    });

    await db.certificationEvidence.deleteMany({
      where: {
        sourceId: "cosmetics-ewg-verified",
        externalProductName: "ATTITUDE Test Oceanly Discovery Cleanser"
      }
    });

    await db.brandCertification.deleteMany({
      where: {
        certificationId: leapingBunnyCertification.id
      }
    });

    await service.ingestSource("cosmetics-leaping-bunny");
    await service.ingestSource("cosmetics-ewg-verified");

    await rm(snapshotDirectory, {
      recursive: true,
      force: true
    });
  }

  const ecologoCertification = await db.certification.findUnique({
    where: {
      acronym: "ECO"
    }
  });

  assert(ecologoCertification, "Expected ECOLOGO certification to exist.");

  await db.certificationEvidence.deleteMany({
    where: {
      sourceId: "household-ecologo"
    }
  });

  await db.productCertification.deleteMany({
    where: {
      certificationId: ecologoCertification.id
    }
  });

  await db.brandCertification.deleteMany({
    where: {
      certificationId: ecologoCertification.id
    }
  });

  const requestedUrls: string[] = [];
  const remoteService = new OfficialEvidenceService({
    remoteBaseUrl: "https://official-data.example.test",
    fetchImpl: async (input) => {
      requestedUrls.push(String(input));

      if (String(input) === "https://official-data.example.test/household-ecologo.json") {
        return new Response(
          JSON.stringify({
            records: [
              {
                sourceId: "household-ecologo",
                certificationAcronym: "ECO",
                scope: "brand",
                externalBrandName: "Attitude",
                matchedBrandName: "ATTITUDE",
                certificateNumber: "ECO-ATTITUDE-BRAND-2026",
                sourceUrl: "https://official-data.example.test/household-ecologo/attitude-brand.json",
                checkedAt: "2026-04-19T18:20:00.000Z",
                status: "verified",
                confidence: 0.91,
                rawPayload: {
                  source: "mock remote feed"
                }
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

      return new Response("Not found", {
        status: 404
      });
    }
  });
  const expectedEcologoCount =
    officialEvidenceSeeds.filter((evidence) => evidence.sourceId === "household-ecologo").length + 1;
  try {
    const remoteRun = await remoteService.ingestSource("household-ecologo");

    assert.equal(remoteRun.status, "completed");
    assert.equal(remoteRun.recordsFetched, expectedEcologoCount);
    assert(requestedUrls.includes("https://official-data.example.test/household-ecologo.json"));

    const attitudeBrand = await db.brand.findUnique({
      where: {
        name: "ATTITUDE"
      }
    });

    assert(attitudeBrand, "ATTITUDE brand should exist in seeded data.");

    const projectedEcologoBrandCert = await db.brandCertification.findUnique({
      where: {
        brandId_certificationId: {
          brandId: attitudeBrand.id,
          certificationId: ecologoCertification.id
        }
      }
    });

    assert(projectedEcologoBrandCert, "Remote-backed ECOLOGO evidence should project into brand certifications.");
    assert.equal(projectedEcologoBrandCert.certificateNumber, "ECO-ATTITUDE-BRAND-2026");
  } finally {
    await db.certificationEvidence.deleteMany({
      where: {
        sourceId: "household-ecologo"
      }
    });

    await db.productCertification.deleteMany({
      where: {
        certificationId: ecologoCertification.id
      }
    });

    await db.brandCertification.deleteMany({
      where: {
        certificationId: ecologoCertification.id
      }
    });

    await service.ingestSource("household-ecologo");
  }

  console.info("GreenProof ingestion tests passed.");
} finally {
  await db.$disconnect();
}
