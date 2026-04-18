import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
      <div className="surface-card mesh-card max-w-2xl space-y-6 px-10 py-12 text-center">
        <span className="eyebrow justify-center">Report Missing</span>
        <h1 className="font-[var(--font-display)] text-4xl font-semibold text-ink">We couldn&apos;t find that product analysis</h1>
        <p className="text-base text-moss/70">
          Try scanning again or run a fresh manual search from the scanner page.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/scan?mode=camera"
            className="rounded-full bg-moss px-6 py-3 text-sm font-semibold text-white transition hover:bg-moss/90"
          >
            Start Scanning
          </Link>
          <Link
            href="/"
            className="rounded-full border border-moss/15 bg-white/80 px-6 py-3 text-sm font-semibold text-moss transition hover:bg-white"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}
