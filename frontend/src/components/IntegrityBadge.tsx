"use client";

import { useState } from "react";
import { AlertTriangle, Copy, Fingerprint, LoaderCircle, ShieldCheck, ShieldQuestion } from "lucide-react";
import type {
  ApiEnvelope,
  IntegrityMetadata,
  VerificationReportPayload,
  VerifyIntegrityPayload
} from "@/lib/types";

interface IntegrityBadgeProps {
  integrity: IntegrityMetadata;
  report: VerificationReportPayload;
}

export function IntegrityBadge({ integrity, report }: IntegrityBadgeProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verification, setVerification] = useState<VerifyIntegrityPayload | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/verify-integrity", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          displayId: integrity.displayId,
          report
        })
      });
      const payload = (await response.json()) as ApiEnvelope<VerifyIntegrityPayload>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "Integrity verification failed.");
      }

      setVerification(payload.data);
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : "Integrity verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const activeVerification = verification ?? {
    ...integrity,
    verified: false,
    message: "Verify this report to confirm the data still matches the stored GreenProof record.",
    checkedAt: "",
    storedHash: integrity.resultHash,
    submittedHash: integrity.resultHash
  };

  return (
    <section className="overflow-hidden rounded-[30px] border border-sky-200/70 bg-[linear-gradient(135deg,rgba(12,74,110,0.08),rgba(96,165,250,0.12))] shadow-glow">
      <div className="flex flex-col gap-6 p-6 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-800">
              <Fingerprint className="h-4 w-4" />
              Integrity Verification
            </div>
            <div>
              <h2 className="font-[var(--font-display)] text-3xl font-semibold text-sky-950">Tamper-evident report record</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-sky-900/72">
                GreenProof stores a SHA-256 hash of this report so we can later check whether the visible result still
                matches the original stored output.
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-sky-200/80 bg-white/88 px-5 py-4 text-sky-950 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700/75">Display ID</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono text-2xl font-semibold tracking-[0.22em]">{integrity.displayId}</span>
              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(integrity.displayId)}
                className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 transition hover:bg-white"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
            </div>
            <p className="mt-3 text-xs text-sky-900/60">Stored {new Date(integrity.storedAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[26px] border border-sky-200/70 bg-white/82 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700/75">What does this verify?</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-sky-950">What it can tell you</p>
                <ul className="space-y-3 text-sm leading-6 text-sky-900/72">
                  {activeVerification.capabilities.map((item) => (
                    <li key={item} className="rounded-2xl bg-sky-50/90 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-sky-950">What it does not prove</p>
                <ul className="space-y-3 text-sm leading-6 text-sky-900/72">
                  {activeVerification.limitations.map((item) => (
                    <li key={item} className="rounded-2xl bg-amber-50/90 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-sky-200/70 bg-[#0b2545] p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/75">Verification Status</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                <div className="flex items-start gap-3">
                  {verification?.verified ? (
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                  ) : (
                    <ShieldQuestion className="mt-0.5 h-5 w-5 text-sky-200" />
                  )}
                  <div>
                    <p className="text-base font-semibold">
                      {verification?.verified ? "Verified against stored record" : "Ready to verify"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-white/72">{activeVerification.message}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-200/68">Stored Hash</p>
                  <p className="mt-2 break-all font-mono text-xs text-white/85">{activeVerification.storedHash}</p>
                </div>
                {verification ? (
                  <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-sky-200/68">Submitted Hash</p>
                    <p className="mt-2 break-all font-mono text-xs text-white/85">{verification.submittedHash}</p>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleVerify()}
                  disabled={isVerifying}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-sky-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-sky-200"
                >
                  {isVerifying ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Verify Integrity
                </button>
                {verification?.checkedAt ? (
                  <p className="inline-flex items-center rounded-full border border-white/10 bg-white/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/72">
                    Checked {new Date(verification.checkedAt).toLocaleTimeString()}
                  </p>
                ) : null}
              </div>

              {error ? (
                <p className="flex items-start gap-2 rounded-2xl bg-[#4b1117] px-4 py-3 text-sm text-rose-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
