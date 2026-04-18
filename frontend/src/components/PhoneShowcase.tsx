export function PhoneShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-[360px] animate-floaty">
      <div className="absolute -left-10 top-8 h-24 w-24 rounded-full bg-leaf/20 blur-3xl" />
      <div className="absolute -right-6 bottom-8 h-28 w-28 rounded-full bg-amber/25 blur-3xl" />
      <div className="relative rounded-[42px] border border-white/65 bg-[#152018] p-3 shadow-[0_28px_80px_rgba(22,32,25,0.28)]">
        <div className="rounded-[34px] bg-[linear-gradient(180deg,#fdf8ee_0%,#eef4e8_100%)] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.24em] text-moss/45">Live Scan</p>
              <p className="font-[var(--font-display)] text-lg font-semibold text-ink">Eco Tee Check</p>
            </div>
            <div className="rounded-full bg-moss px-3 py-1 text-xs font-semibold text-white">58%</div>
          </div>
          <div className="surface-card mb-4 rounded-[28px] bg-white/75 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-moss">Trust Gauge</span>
              <span className="text-xs uppercase tracking-[0.22em] text-amber">Suspicious</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-moss/10">
              <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-amber to-ember" />
            </div>
            <div className="mt-4 grid gap-3">
              {[
                ['"Eco-friendly" is vague', "bg-berry"],
                ["No product certification found", "bg-ember"],
                ["Brand has mixed reputation", "bg-amber"]
              ].map(([label, color]) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl bg-sand/60 px-3 py-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  <span className="text-sm text-moss/75">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card rounded-[24px] bg-white/72 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-moss/45">Best Alternative</p>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink">Pact Organic Crew Tee</p>
                <p className="text-sm text-moss/60">+28 points stronger</p>
              </div>
              <div className="rounded-full bg-leaf/15 px-3 py-1 text-sm font-semibold text-[#16753d]">86%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
