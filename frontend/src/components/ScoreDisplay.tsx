"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { formatConfidence, ratingTheme } from "@/lib/presentation";
import type { VerificationResult } from "@/lib/types";

interface ScoreDisplayProps {
  result: VerificationResult;
}

export function ScoreDisplay({ result }: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const theme = ratingTheme[result.rating];

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();
    const duration = 1300;

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(result.score * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [result.score]);

  return (
    <section className={`surface-card mesh-card relative overflow-hidden bg-gradient-to-br ${theme.bg} px-6 py-7 md:px-8`}>
      <div
        className="pointer-events-none absolute inset-[12%] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${theme.glow}, transparent 70%)`
        }}
      />
      <div className="relative grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-4">
          <div className="eyebrow w-fit">Trust Score</div>
          <div className="space-y-2">
            <div className="flex items-end gap-3">
              <span className="font-[var(--font-display)] text-6xl font-semibold text-ink md:text-7xl">{displayScore}%</span>
              <span className={`mb-2 rounded-full px-3 py-1 text-sm font-semibold ${theme.text} bg-white/70`}>
                {result.emoji} {theme.label}
              </span>
            </div>
            <p className="max-w-xl text-sm leading-6 text-moss/70">
              Confidence: {formatConfidence(result.confidenceLevel, result.confidencePercentage)}
            </p>
          </div>
          <ProgressBar value={displayScore} color={theme.ring} />
        </div>

        <div className="relative mx-auto flex h-48 w-48 items-center justify-center md:h-52 md:w-52">
          <div
            className="absolute inset-0 animate-pulseRing rounded-full"
            style={{
              boxShadow: `0 0 0 18px ${theme.glow}`
            }}
          />
          <div
            className="absolute inset-3 rounded-full border-[14px] border-white/65"
            style={{
              borderTopColor: theme.ring,
              borderRightColor: theme.ring,
              transform: `rotate(${Math.round((displayScore / 100) * 270) - 135}deg)`
            }}
          />
          <div className="surface-card flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white/85 text-center">
            {result.score >= 60 ? <ShieldCheck className="h-7 w-7 text-moss" /> : <ShieldAlert className="h-7 w-7 text-moss" />}
            <span className="mt-2 text-xs font-semibold uppercase tracking-[0.26em] text-moss/60">{theme.label}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
