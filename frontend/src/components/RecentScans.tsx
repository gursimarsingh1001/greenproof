"use client";

import Link from "next/link";
import { Clock3, ScanSearch } from "lucide-react";
import { useScanStore } from "@/lib/scan-store";

export function RecentScans() {
  const recentScans = useScanStore((state) => state.recentScans);

  return (
    <section className="surface-card mesh-card p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Recent Scans</p>
          <h2 className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-ink">Your latest trust checks</h2>
        </div>
        <Link href="/scan?mode=camera" className="rounded-full border border-moss/10 bg-white/70 px-4 py-2 text-sm font-semibold text-moss">
          Scan More
        </Link>
      </div>

      {recentScans.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-moss/15 bg-white/55 px-6 py-10 text-center">
          <ScanSearch className="mx-auto h-9 w-9 text-moss/55" />
          <p className="mt-4 font-semibold text-ink">No scans yet</p>
          <p className="mt-2 text-sm leading-6 text-moss/65">
            Your latest product checks will appear here as soon as you run the scanner.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {recentScans.map((scan) => (
            <Link
              key={scan.productId}
              href={`/results/${scan.productId}`}
              className="group rounded-[26px] border border-moss/10 bg-white/75 p-5 transition hover:-translate-y-1 hover:bg-white"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-moss/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-moss/55">
                  {scan.rating}
                </span>
                <span className="text-xl font-bold text-moss">{scan.score}%</span>
              </div>
              <h3 className="font-semibold text-ink">{scan.productName}</h3>
              <p className="mt-1 text-sm text-moss/65">{scan.brandName}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-moss/45">
                <Clock3 className="h-3.5 w-3.5" />
                {new Date(scan.scannedAt).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
