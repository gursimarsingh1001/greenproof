"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, ScanLine, Share2, XCircle } from "lucide-react";
import { useScanStore } from "@/lib/scan-store";
import { AlternativeCard } from "./AlternativeCard";
import { ExplanationCard } from "./ExplanationCard";
import { FeedbackPanel } from "./FeedbackPanel";
import { IntegrityBadge } from "./IntegrityBadge";
import { ScoreDisplay } from "./ScoreDisplay";
import { SourceContextCard } from "./SourceContextCard";
import { TrustBreakdownChart } from "./TrustBreakdownChart";
import { formatPrice } from "@/lib/presentation";
import type { BrandReputationPayload, ScanResultPayload } from "@/lib/types";

interface ResultsClientProps {
  payload: ScanResultPayload;
  brandReputation: BrandReputationPayload;
}

export function ResultsClient({ payload, brandReputation }: ResultsClientProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const addRecentScan = useScanStore((state) => state.addRecentScan);
  const displayPrice = formatPrice(payload.product.priceCents);

  useEffect(() => {
    addRecentScan({
      productId: payload.product.id,
      productName: payload.product.name,
      brandName: payload.brand.name,
      score: payload.result.score,
      rating: payload.result.rating,
      scannedAt: new Date().toISOString()
    });
  }, [addRecentScan, payload.brand.name, payload.product.id, payload.product.name, payload.result.rating, payload.result.score]);

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: `${payload.product.name} on GreenProof`,
        text: `${payload.product.name} scored ${payload.result.score}% on GreenProof.`,
        url: shareUrl
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="space-y-8">
      <section className="surface-card mesh-card grid gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-8">
        <div className="space-y-5">
          <div className="eyebrow w-fit">Product Report</div>
          <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-start">
            <div className="overflow-hidden rounded-[30px] border border-moss/10 bg-sand/55 shadow-sm">
              {payload.product.imageUrl ? (
                <img
                  src={payload.product.imageUrl}
                  alt={payload.product.name}
                  className="h-[260px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[260px] items-center justify-center bg-[linear-gradient(135deg,#e8f4ec,#f8fbf6)] px-6 text-center text-sm font-semibold uppercase tracking-[0.22em] text-moss/45">
                  Product Photo Unavailable
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-moss/55">{payload.product.category}</p>
              <h1 className="font-[var(--font-display)] text-4xl font-semibold text-ink md:text-5xl">
                {payload.product.name}
              </h1>
              <p className="text-base text-moss/72">by {payload.brand.name}</p>
              {displayPrice ? (
                <div className="inline-flex items-center rounded-full border border-moss/10 bg-white/85 px-4 py-2 text-sm font-semibold text-moss">
                  {displayPrice}
                </div>
              ) : (
                <div className="inline-flex items-center rounded-full border border-moss/10 bg-white/75 px-4 py-2 text-sm font-semibold text-moss/58">
                  Price unavailable
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {payload.product.claims.map((claim) => (
              <span key={claim} className="rounded-full border border-moss/10 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-moss/65">
                {claim}
              </span>
            ))}
          </div>

          <SourceContextCard dataSource={payload.dataSource} sourceDetails={payload.sourceDetails} />
        </div>

        <div className="surface-card flex min-h-[220px] items-center justify-center rounded-[30px] bg-[linear-gradient(135deg,#1e3329,#2f5541)] p-6 text-white">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-white/55">Brand Reputation</p>
            <p className="mt-3 font-[var(--font-display)] text-6xl font-semibold">{Math.round(payload.brand.reputationScore * 100)}</p>
            <p className="mt-2 text-sm text-white/75">
              {payload.brand.isFlagged ? payload.brand.flagReason : "No brand-level red flag in the current dataset."}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <ScoreDisplay result={payload.result} />
          <div className="grid gap-4">
            <ExplanationCard
              title="What's Good"
              accentClassName="bg-leaf"
              icon={<CheckCircle2 className="h-5 w-5" />}
              items={payload.explanation.positiveIndicators.map((item) => ({ text: item.text }))}
              defaultOpen
            />
            <ExplanationCard
              title="Issues Found"
              accentClassName="bg-ember"
              icon={<XCircle className="h-5 w-5" />}
              items={payload.explanation.negativeIndicators.map((item) => ({ text: item.text, impact: item.impact }))}
              defaultOpen
            />
            <ExplanationCard
              title="Recommendations"
              accentClassName="bg-moss"
              icon={<AlertTriangle className="h-5 w-5" />}
              items={payload.explanation.recommendations.map((item) => ({ text: item }))}
            />
          </div>
        </div>

        <div className="space-y-8">
          <TrustBreakdownChart result={payload.result} />

          <section className="surface-card p-5">
            <div className="mb-4">
              <p className="eyebrow">Brand Context</p>
              <h3 className="mt-3 font-[var(--font-display)] text-2xl font-semibold text-ink">Recent brand signals</h3>
            </div>
            <div className="space-y-3">
              {brandReputation.history.slice(0, 4).map((entry) => (
                <div key={`${entry.date}-${entry.title}`} className="rounded-2xl bg-sand/65 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-ink">{entry.title}</p>
                    <span className="text-xs uppercase tracking-[0.22em] text-moss/45">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-moss/70">{entry.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Better Alternatives</p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-ink">Products with stronger evidence</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-moss/65">
            GreenProof only surfaces alternatives that score at least five points higher than the current product.
          </p>
        </div>

        {payload.alternatives.length === 0 ? (
          <div className="surface-card p-6 text-sm text-moss/65">No stronger alternatives were found in this category yet.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {payload.alternatives.map((alternative) => (
              <AlternativeCard key={`${alternative.product.id}-${alternative.product.name}`} alternative={alternative} />
            ))}
          </div>
        )}
      </section>

      <IntegrityBadge
        integrity={payload.integrity}
        report={{
          product: payload.product,
          brand: payload.brand,
          dataSource: payload.dataSource,
          sourceDetails: payload.sourceDetails,
          claims: payload.claims,
          result: payload.result,
          explanation: payload.explanation,
          alternatives: payload.alternatives
        }}
      />

      <section className="surface-card mesh-card space-y-5 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Actions</p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-ink">Share it, rerun it, or challenge it</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleShare()}
              className="inline-flex items-center gap-2 rounded-full border border-moss/10 bg-white/80 px-5 py-3 text-sm font-semibold text-moss transition hover:bg-white"
            >
              <Share2 className="h-4 w-4" />
              Share Report
            </button>
            <button
              type="button"
              onClick={() => void navigator.clipboard.writeText(window.location.href)}
              className="inline-flex items-center gap-2 rounded-full border border-moss/10 bg-white/80 px-5 py-3 text-sm font-semibold text-moss transition hover:bg-white"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </button>
            <Link
              href="/scan?mode=camera"
              className="inline-flex items-center gap-2 rounded-full bg-moss px-5 py-3 text-sm font-semibold text-white transition hover:bg-moss/92"
            >
              <ScanLine className="h-4 w-4" />
              Scan Another
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setFeedbackOpen((value) => !value)}
          className="rounded-full border border-moss/10 bg-white/75 px-5 py-3 text-sm font-semibold text-moss"
        >
          {feedbackOpen ? "Hide Feedback Form" : "Give Feedback"}
        </button>

        {feedbackOpen ? <FeedbackPanel productId={payload.product.id} reportedScore={payload.result.score} /> : null}
      </section>
    </div>
  );
}
