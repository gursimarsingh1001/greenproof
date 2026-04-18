import { ArrowUpRight, Leaf } from "lucide-react";
import type { VerificationAlternative } from "@/lib/types";

interface AlternativeCardProps {
  alternative: VerificationAlternative;
}

export function AlternativeCard({ alternative }: AlternativeCardProps) {
  return (
    <article className="surface-card group mesh-card flex flex-col gap-4 p-5 transition duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow mb-3 w-fit">Better Pick</div>
          <h3 className="font-[var(--font-display)] text-2xl font-semibold text-ink">{alternative.product.name}</h3>
          <p className="mt-1 text-sm text-moss/65">{alternative.brand.name}</p>
        </div>
        <div className="rounded-2xl bg-white/75 px-3 py-2 text-right">
          <p className="text-2xl font-bold text-moss">{alternative.trustScore}%</p>
          <p className="text-xs uppercase tracking-[0.22em] text-moss/50">Trust</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white/75 p-4 text-sm leading-6 text-moss/75">
        <p>{alternative.whyBetter}</p>
      </div>

      <div className="flex items-center justify-between text-sm font-semibold text-moss">
        <span className="inline-flex items-center gap-2">
          <Leaf className="h-4 w-4" />
          +{alternative.scoreDifference} points stronger
        </span>
        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </article>
  );
}
