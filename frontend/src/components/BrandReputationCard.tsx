"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BadgeCheck, Radar } from "lucide-react";
import type { BrandReputationPayload, BrandSummary } from "@/lib/types";

interface BrandReputationCardProps {
  brand: BrandSummary;
  brandReputation: BrandReputationPayload;
}

function getReputationLabel(score: number) {
  if (score >= 80) {
    return "Strong Track Record";
  }

  if (score >= 60) {
    return "Mixed But Stable";
  }

  if (score >= 40) {
    return "Watch Closely";
  }

  return "High Scrutiny";
}

export function BrandReputationCard({ brand, brandReputation }: BrandReputationCardProps) {
  const finalScore = Math.round(brand.reputationScore * 100);
  const [displayScore, setDisplayScore] = useState(0);
  const reputationLabel = getReputationLabel(finalScore);
  const activeSignals = brandReputation.history.slice(0, 3);
  const productCertCount = brand.certifications.filter((certification) => certification.status === "brand").length;
  const orbitRotation = Math.max(18, Math.round((finalScore / 100) * 300));

  useEffect(() => {
    let frameId = 0;
    const startedAt = performance.now();
    const duration = 1400;

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(finalScore * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [finalScore]);

  return (
    <section className="reputation-stage relative self-start">
      <div className="pointer-events-none absolute inset-[7%] rounded-[34px] bg-[#10281f]/12 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-[8%] top-[10%] h-[82%] rounded-[34px] border border-moss/8 bg-[#214232]/75 opacity-45 reputation-panel-back" />
      <div className="pointer-events-none absolute inset-x-[5%] top-[6%] h-[88%] rounded-[34px] border border-white/8 bg-[#1b382b]/78 opacity-70 reputation-panel-mid" />

      <div className="reputation-panel-front relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(120,226,168,0.22),transparent_28%),linear-gradient(145deg,#173226_0%,#214233_58%,#294a39_100%)] p-6 text-white shadow-[0_30px_90px_rgba(17,42,31,0.28)] md:p-7">
        <div className="pointer-events-none absolute right-[-18%] top-[-16%] h-52 w-52 rounded-full bg-leaf/18 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-14%] left-[-8%] h-44 w-44 rounded-full bg-amber/10 blur-3xl" />

        <div className="relative flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/55">Brand Reputation</p>
              <h3 className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-white md:text-[2.1rem]">
                Trust signal around the brand
              </h3>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr] md:items-center">
            <div className="relative flex items-center justify-center py-2">
              <div className="reputation-float relative">
                <div
                  className="reputation-halo absolute inset-[-22px] rounded-full opacity-90"
                  style={{
                    background: `conic-gradient(from -90deg, rgba(255,255,255,0.08) 0deg, rgba(139,226,143,0.92) ${orbitRotation}deg, rgba(255,255,255,0.08) ${orbitRotation + 28}deg, transparent 360deg)`
                  }}
                />
                <div className="absolute inset-[-40px] rounded-full border border-white/10" />
                <div className="absolute inset-[-10px] rounded-full border border-white/12" />
                <div className="reputation-orb relative flex h-[190px] w-[190px] flex-col items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_20px_60px_rgba(8,20,15,0.32)] backdrop-blur-xl">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/48">Reputation</span>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="font-[var(--font-display)] text-6xl font-semibold leading-none">{displayScore}</span>
                    <span className="pb-1 text-sm font-semibold uppercase tracking-[0.24em] text-white/42">/100</span>
                  </div>
                  <span className="mt-3 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                    {reputationLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-full border border-white/10 bg-white/10 p-2.5">
                        <BadgeCheck className="h-4 w-4 text-white/74" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">Brand Certifications</p>
                        <p className="mt-1 text-sm text-white/62">Seeded trust proofs linked to the brand.</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-[var(--font-display)] text-4xl font-semibold leading-none">{productCertCount}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">certs</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-full border border-white/10 bg-white/10 p-2.5">
                        <Radar className="h-4 w-4 text-white/74" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">Signal Count</p>
                        <p className="mt-1 text-sm text-white/62">Recent reputation entries feeding the score.</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-[var(--font-display)] text-4xl font-semibold leading-none">{activeSignals.length}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">entries</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full border border-white/10 bg-white/10 p-2">
                    <AlertTriangle className="h-4 w-4 text-white/72" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">Current Context</p>
                    <p className="mt-2 text-sm leading-6 text-white/74">
                      {brand.isFlagged ? brand.flagReason : "No brand-level red flag in the current dataset."}
                    </p>
                  </div>
                </div>
              </div>

              {activeSignals.length > 0 ? (
                <div className="space-y-3">
                  {activeSignals.map((entry) => (
                    <div
                      key={`${entry.date}-${entry.title}`}
                      className="rounded-[22px] border border-white/8 bg-black/10 px-4 py-3 backdrop-blur-sm"
                    >
                      <p className="text-sm font-semibold text-white">{entry.title}</p>
                      <p className="mt-2 text-sm leading-6 text-white/60">{entry.detail}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
