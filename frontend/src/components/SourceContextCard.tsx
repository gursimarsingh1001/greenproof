import { BadgeCheck, Database, ExternalLink, Leaf, Package, RefreshCcw, Search, Tags } from "lucide-react";
import type {
  EvidenceFreshness,
  EvidenceLookupMode,
  OfficialEvidenceItem,
  ProductDataSource,
  ProductSourceDetails
} from "@/lib/types";

interface SourceContextCardProps {
  dataSource: ProductDataSource;
  sourceDetails?: ProductSourceDetails;
  evidenceLookup: EvidenceLookupMode;
  evidenceSources: string[];
  evidenceFreshness: EvidenceFreshness;
  officialEvidence: {
    lastCheckedAt?: string | null;
    product: OfficialEvidenceItem[];
    brand: OfficialEvidenceItem[];
  };
}

/**
 * Displays where a product record came from and any structured source context that should stay informational.
 */
export function SourceContextCard({
  dataSource,
  sourceDetails,
  evidenceLookup,
  evidenceSources,
  evidenceFreshness,
  officialEvidence
}: SourceContextCardProps) {
  const displayLabel =
    sourceDetails?.label ??
    (dataSource === "open_food_facts"
      ? "Open Food Facts"
      : dataSource === "official_evidence_import"
        ? "Official Evidence Import"
        : "GreenProof Seed Catalog");
  const scoreChips = [
    sourceDetails?.ecoscoreGrade ? `Eco-Score ${sourceDetails.ecoscoreGrade}` : null,
    sourceDetails?.nutriscoreGrade ? `Nutri-Score ${sourceDetails.nutriscoreGrade}` : null,
    sourceDetails?.novaGroup ? `NOVA ${sourceDetails.novaGroup}` : null
  ].filter((value): value is string => Boolean(value));

  const evidenceTone =
    evidenceLookup === "cached"
      ? "border-leaf/20 bg-leaf/10 text-moss"
      : evidenceLookup === "live_refresh"
        ? "border-amber/25 bg-amber/12 text-[#7a5600]"
        : "border-moss/10 bg-sand/75 text-moss/70";
  const freshnessLabel =
    evidenceFreshness === "fresh"
      ? "Fresh evidence"
      : evidenceFreshness === "stale"
        ? "Stale evidence"
        : "No freshness data";
  const evidenceRows = [
    ...officialEvidence.product.map((item) => ({ ...item, bucket: "Product-level" })),
    ...officialEvidence.brand.map((item) => ({ ...item, bucket: "Brand-level" }))
  ];

  return (
    <section className="rounded-[28px] border border-moss/10 bg-white/82 p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-moss/10 bg-sand/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-moss/70">
            <Database className="h-4 w-4" />
            Data Source
          </div>
          <div>
            <h3 className="font-[var(--font-display)] text-2xl font-semibold text-ink">{displayLabel}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-moss/70">
              {dataSource === "open_food_facts"
                ? "This product was imported from an external food catalog. The context below is informational and does not automatically count as sustainability proof."
                : dataSource === "official_evidence_import"
                  ? "This product was created from official certification evidence that GreenProof discovered and linked into the local catalog."
                  : "This product comes from the curated GreenProof demo catalog with seeded certifications and brand context."}
            </p>
          </div>
        </div>

        {sourceDetails?.productUrl ? (
          <a
            href={sourceDetails.productUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-moss/10 bg-white px-4 py-3 text-sm font-semibold text-moss transition hover:bg-sand/70"
          >
            View Original Record
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>

      {scoreChips.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {scoreChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-leaf/15 bg-leaf/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-moss/70"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}

      {(sourceDetails?.labels?.length ?? 0) > 0 || (sourceDetails?.packaging?.length ?? 0) > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {sourceDetails?.labels?.length ? (
            <div className="rounded-[24px] bg-sand/75 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Tags className="h-4 w-4 text-moss" />
                Catalog Labels
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {sourceDetails.labels.map((label) => (
                  <span key={label} className="rounded-full bg-white/85 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-moss/70">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {sourceDetails?.packaging?.length ? (
            <div className="rounded-[24px] bg-sand/75 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Package className="h-4 w-4 text-moss" />
                Packaging Context
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {sourceDetails.packaging.map((entry) => (
                  <span key={entry} className="rounded-full bg-white/85 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-moss/70">
                    {entry}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 rounded-[24px] bg-sand/70 p-4 text-sm leading-6 text-moss/68">
          <div className="flex items-start gap-2">
            <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
            <p>No extra source-context fields were attached to this record beyond its catalog origin.</p>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-[24px] border border-moss/10 bg-[#f7f9f5] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">Official Evidence</span>
              <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${evidenceTone}`}>
                {evidenceLookup === "cached" ? "Cached" : evidenceLookup === "live_refresh" ? "Live refresh" : "None found"}
              </span>
              <span className="rounded-full border border-moss/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-moss/70">
                {freshnessLabel}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-moss/70">
              {evidenceRows.length > 0
                ? "GreenProof stores source-backed certification evidence separately from marketing claims and shows whether that evidence matches the current product or only the parent brand."
                : "GreenProof did not find a linked official certification record for this product yet. That means claims may still rely on seed data or broader brand context."}
            </p>
          </div>

          {officialEvidence.lastCheckedAt ? (
            <div className="rounded-full border border-moss/10 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-moss/60">
              Last checked {new Date(officialEvidence.lastCheckedAt).toLocaleDateString()}
            </div>
          ) : null}
        </div>

        {evidenceSources.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {evidenceSources.map((source) => (
              <span
                key={source}
                className="inline-flex items-center gap-2 rounded-full border border-moss/10 bg-white px-3 py-2 text-xs font-medium text-moss/70"
              >
                <Search className="h-3.5 w-3.5" />
                {source}
              </span>
            ))}
          </div>
        ) : null}

        {evidenceRows.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {evidenceRows.map((item) => (
              <div key={`${item.bucket}-${item.id}`} className="rounded-[22px] border border-moss/10 bg-white px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-moss px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
                        {item.bucket}
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {item.certificationAcronym} · {item.certificationName}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-moss/70">
                      {item.externalProductName ? `${item.externalProductName} · ` : ""}
                      {item.externalBrandName} · {item.sourceLabel}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-leaf/15 bg-leaf/8 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-moss/70">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {item.status.replace(/_/g, " ")}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-moss/10 bg-sand/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-moss/65">
                      <RefreshCcw className="h-3.5 w-3.5" />
                      {item.matchedVia}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-moss/60">
                  {item.certificateNumber ? <span>Certificate: {item.certificateNumber}</span> : null}
                  <span>Checked {new Date(item.checkedAt).toLocaleDateString()}</span>
                  <span>{Math.round(item.confidence * 100)}% confidence</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[22px] bg-white px-4 py-4 text-sm leading-6 text-moss/68">
            No official evidence rows are linked yet for this product or brand.
          </div>
        )}
      </div>
    </section>
  );
}
