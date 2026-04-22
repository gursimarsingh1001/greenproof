import Link from "next/link";
import { ArrowRight, Camera, ShieldCheck, Workflow } from "lucide-react";
import { PhoneShowcase } from "@/components/PhoneShowcase";
import { RecentScans } from "@/components/RecentScans";
import { fetchBackendData } from "@/lib/backend";
import type { StatsPayload } from "@/lib/types";

export const revalidate = 3600;

export default async function HomePage() {
  const stats = await fetchBackendData<StatsPayload>("/api/stats", {
    next: {
      revalidate: 3600
    }
  });

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-6 py-8 md:px-10 md:py-10">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <div className="space-y-5">
            <span className="eyebrow">GreenProof</span>
            <h1 className="section-title font-[var(--font-display)]">
              Scan any product to verify its eco-claims.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-moss/70">
              GreenProof acts like a fact-checker for sustainability language. We cross-check certifications, flag vague
              marketing, score brand credibility, and show consumers what looks genuinely trustworthy.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/scan?mode=camera"
              className="inline-flex items-center gap-2 rounded-full bg-moss px-7 py-4 text-base font-semibold text-white transition hover:bg-moss/92"
            >
              <Camera className="h-4 w-4" />
              Start Scanning
            </Link>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 rounded-full border border-moss/10 bg-white/80 px-7 py-4 text-base font-semibold text-moss transition hover:bg-white"
            >
              Try Manual Search
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Products analyzed", value: stats.productsAnalyzed },
              { label: "Recognized certifications", value: stats.certificationsRecognized },
              { label: "Average trust score", value: `${stats.averageTrustScore}%` }
            ].map((item, index) => (
              <div
                key={item.label}
                className="surface-card stagger-in p-5"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-moss/45">{item.label}</p>
                <p className="mt-3 text-3xl font-bold text-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <PhoneShowcase />
      </section>

      <RecentScans />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card mesh-card p-6 md:p-8">
          <span className="eyebrow">Why It Works</span>
          <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold text-ink">Explainable, not mysterious</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-moss/68">
            We do not pretend to be an oracle. GreenProof scores the credibility of sustainability claims using
            accessible evidence, then shows exactly why a score went up or down.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "1. Capture the claim",
              text: "Scan a barcode or search the product manually to pull packaging language and brand context.",
              icon: Camera,
              accent: "bg-leaf"
            },
            {
              title: "2. Verify the evidence",
              text: "GreenProof checks product certifications, brand certifications, impossible claims, and vague terms.",
              icon: ShieldCheck,
              accent: "bg-amber"
            },
            {
              title: "3. Decide with confidence",
              text: "You get a trust score, explanation, and stronger alternatives in the same category.",
              icon: Workflow,
              accent: "bg-moss"
            }
          ].map(({ title, text, icon: Icon, accent }, index) => (
            <article
              key={title}
              className="surface-card stagger-in p-5"
              style={{ animationDelay: `${180 + index * 100}ms` }}
            >
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white ${accent}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-moss/68">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
