import { Database, ExternalLink, Leaf, Package, Tags } from "lucide-react";
import type { ProductDataSource, ProductSourceDetails } from "@/lib/types";

interface SourceContextCardProps {
  dataSource: ProductDataSource;
  sourceDetails?: ProductSourceDetails;
}

/**
 * Displays where a product record came from and any structured source context that should stay informational.
 */
export function SourceContextCard({ dataSource, sourceDetails }: SourceContextCardProps) {
  const displayLabel = sourceDetails?.label ?? (dataSource === "open_food_facts" ? "Open Food Facts" : "GreenProof Seed Catalog");
  const scoreChips = [
    sourceDetails?.ecoscoreGrade ? `Eco-Score ${sourceDetails.ecoscoreGrade}` : null,
    sourceDetails?.nutriscoreGrade ? `Nutri-Score ${sourceDetails.nutriscoreGrade}` : null,
    sourceDetails?.novaGroup ? `NOVA ${sourceDetails.novaGroup}` : null
  ].filter((value): value is string => Boolean(value));

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
    </section>
  );
}
