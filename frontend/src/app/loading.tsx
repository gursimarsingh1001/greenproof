export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
      <div className="surface-card mesh-card flex w-full max-w-xl flex-col items-center gap-6 px-10 py-14 text-center">
        <div className="h-16 w-16 rounded-full border-4 border-moss/10 border-t-leaf animate-spin" />
        <div className="space-y-2">
          <p className="eyebrow justify-center">Analyzing Claim Signals</p>
          <h1 className="font-[var(--font-display)] text-3xl font-semibold text-ink">Building your trust report</h1>
          <p className="text-sm text-moss/70">
            GreenProof is checking certifications, brand credibility, and vague claim language.
          </p>
        </div>
      </div>
    </main>
  );
}
