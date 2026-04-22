import { db } from "../lib/db.js";

function printSection(title: string) {
  console.info(`\n${title}`);
}

try {
  const [
    productCount,
    sourceCount,
    supportedSourceCount,
    evidenceCount,
    projectedProductEvidenceCount,
    projectedBrandEvidenceCount,
    verifiedEvidenceCount,
    sourceBreakdown,
    sectorBreakdown
  ] = await Promise.all([
    db.product.count(),
    db.certificationSource.count(),
    db.certificationSource.count({
      where: {
        isSupported: true
      }
    }),
    db.certificationEvidence.count(),
    db.product.count({
      where: {
        certificationEvidence: {
          some: {
            status: "verified",
            productId: {
              not: null
            }
          }
        }
      }
    }),
    db.brand.count({
      where: {
        certificationEvidence: {
          some: {
            status: "verified",
            brandId: {
              not: null
            }
          }
        }
      }
    }),
    db.certificationEvidence.count({
      where: {
        status: "verified"
      }
    }),
    db.certificationSource.findMany({
      orderBy: [{ sector: "asc" }, { priority: "asc" }],
      include: {
        _count: {
          select: {
            certificationEvidence: true
          }
        }
      }
    }),
    db.certificationSource.groupBy({
      by: ["sector"],
      _count: {
        _all: true
      },
      where: {
        isSupported: true
      }
    })
  ]);

  const supportedCoveragePercent =
    supportedSourceCount === 0
      ? 0
      : Math.round(
          (sourceBreakdown.filter((entry) => entry.isSupported && entry._count.certificationEvidence > 0).length /
            supportedSourceCount) *
            100
        );
  const productCoveragePercent =
    productCount === 0 ? 0 : Math.round((projectedProductEvidenceCount / productCount) * 100);

  printSection("GreenProof Certification Coverage");
  console.info(`Products in catalog: ${productCount}`);
  console.info(`Certification sources: ${sourceCount} total (${supportedSourceCount} supported)`);
  console.info(`Official evidence rows: ${evidenceCount} total (${verifiedEvidenceCount} verified)`);
  console.info(`Products with verified official evidence: ${projectedProductEvidenceCount} (${productCoveragePercent}%)`);
  console.info(`Brands with verified official evidence: ${projectedBrandEvidenceCount}`);
  console.info(`Supported source coverage: ${supportedCoveragePercent}%`);

  printSection("Supported Sources by Sector");
  for (const sector of sectorBreakdown) {
    console.info(`${sector.sector}: ${sector._count._all}`);
  }

  printSection("Evidence by Source");
  for (const source of sourceBreakdown) {
    const supportLabel = source.isSupported ? "supported" : "planned";
    console.info(
      `${source.id} | ${source.sector} | ${supportLabel} | evidence rows: ${source._count.certificationEvidence}`
    );
  }
} finally {
  await db.$disconnect();
}
