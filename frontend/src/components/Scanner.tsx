"use client";

import { startTransition, useEffect, useEffectEvent, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Camera, Keyboard, LoaderCircle, ScanLine, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { readJsonResponse } from "@/lib/backend";
import { useScanStore } from "@/lib/scan-store";
import type { ApiEnvelope, ScanResultPayload } from "@/lib/types";

interface ScannerProps {
  defaultMode: "camera" | "manual";
}

export function Scanner({ defaultMode }: ScannerProps) {
  const [mode, setMode] = useState<"camera" | "manual">(defaultMode);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraState, setCameraState] = useState<"idle" | "requesting" | "ready" | "denied" | "unsupported" | "error">("idle");
  const [cameraHint, setCameraHint] = useState("Point the camera at a barcode and GreenProof will do the rest.");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const lookupInFlightRef = useRef(false);
  const detectedCodeRef = useRef(false);
  const router = useRouter();
  const addRecentScan = useScanStore((state) => state.addRecentScan);

  const runLookup = useEffectEvent(async (rawValue: string) => {
    if (!rawValue || lookupInFlightRef.current) {
      return;
    }

    lookupInFlightRef.current = true;
    setIsSubmitting(true);
    setError("");
    setCameraHint("Verifying certifications, vague terms, and brand reputation...");
    const cleanedValue = rawValue.trim();
    const payload = /^\d{8,}$/.test(cleanedValue) ? { barcode: cleanedValue } : { query: cleanedValue };
    let didNavigate = false;

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const result = await readJsonResponse<ApiEnvelope<ScanResultPayload>>(response);

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error ?? "No product match found.");
      }

      const payloadData = result.data;

      addRecentScan({
        productId: payloadData.product.id,
        productName: payloadData.product.name,
        brandName: payloadData.brand.name,
        score: payloadData.result.score,
        rating: payloadData.result.rating,
        scannedAt: new Date().toISOString()
      });
      startTransition(() => {
        didNavigate = true;
        router.push(`/results/${payloadData.product.id}`);
      });
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "We couldn't analyze that product.");
      setCameraHint("Try another barcode or use the manual search field below.");
    } finally {
      if (!didNavigate) {
        detectedCodeRef.current = false;
      }

      lookupInFlightRef.current = false;
      setIsSubmitting(false);
    }
  });

  const resetCameraSession = () => {
    readerRef.current?.reset();
    readerRef.current = null;

    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    const mediaStream = videoElement.srcObject;

    if (mediaStream instanceof MediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }

    videoElement.pause();
    videoElement.srcObject = null;
  };

  useEffect(() => {
    if (mode !== "camera") {
      detectedCodeRef.current = false;
      lookupInFlightRef.current = false;
      resetCameraSession();
      setCameraState("idle");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      return;
    }

    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    let cancelled = false;
    detectedCodeRef.current = false;
    const reader = new BrowserMultiFormatReader(undefined, 250);
    readerRef.current = reader;
    setCameraState("requesting");
    setCameraHint("Point the camera at a barcode and GreenProof will do the rest.");

    void (async () => {
      try {
        await reader.decodeFromConstraints(
          {
            video: {
              facingMode: {
                ideal: "environment"
              },
              width: {
                ideal: 1280
              },
              height: {
                ideal: 720
              }
            },
            audio: false
          },
          videoElement,
          (result) => {
            if (cancelled || !result || detectedCodeRef.current) {
              return;
            }

            const nextText = result.getText().trim();

            if (!nextText) {
              return;
            }

            detectedCodeRef.current = true;
            setCameraHint("Barcode detected. Running the GreenProof check...");
            void runLookup(nextText);
          }
        );

        if (!cancelled) {
          setCameraState("ready");
        }
      } catch (cameraError) {
        if (
          !cancelled &&
          cameraError instanceof DOMException &&
          (cameraError.name === "NotFoundError" || cameraError.name === "OverconstrainedError")
        ) {
          try {
            await reader.decodeFromConstraints(
              {
                video: true,
                audio: false
              },
              videoElement,
              (result) => {
                if (cancelled || !result || detectedCodeRef.current) {
                  return;
                }

                const nextText = result.getText().trim();

                if (!nextText) {
                  return;
                }

                detectedCodeRef.current = true;
                setCameraHint("Barcode detected. Running the GreenProof check...");
                void runLookup(nextText);
              }
            );

            if (!cancelled) {
              setCameraState("ready");
            }
            return;
          }
          catch {
            // Fall through to the standard camera error handling below.
          }
        }

        if (cancelled) {
          return;
        }

        if (cameraError instanceof DOMException && cameraError.name === "NotAllowedError") {
          setCameraState("denied");
          return;
        }

        setCameraState("error");
      }
    })();

    return () => {
      cancelled = true;
      resetCameraSession();
    };
  }, [mode, runLookup]);

  const handleManualSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runLookup(query);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="surface-card mesh-card relative overflow-hidden p-5 md:p-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Scanner</p>
            <h1 className="mt-3 font-[var(--font-display)] text-4xl font-semibold text-ink">Scan a product or search manually</h1>
          </div>
          <div className="flex rounded-full border border-moss/10 bg-white/75 p-1">
            {[
              { value: "camera", label: "Camera", icon: Camera },
              { value: "manual", label: "Manual", icon: Keyboard }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value as "camera" | "manual")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === value ? "bg-moss text-white" : "text-moss/65 hover:text-moss"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-moss/10 bg-[#102019]">
          <div className="aspect-[4/5] w-full">
            {mode === "camera" ? (
              <div className="relative h-full w-full">
                <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(16,32,25,0.2),rgba(16,32,25,0.58))]" />
                <div className="pointer-events-none absolute inset-7 rounded-[30px] border border-white/15" />
                <div className="pointer-events-none absolute inset-12 rounded-[24px] border border-white/20" />
                <div className="pointer-events-none absolute inset-12">
                  {[
                    "left-0 top-0 border-l-4 border-t-4",
                    "right-0 top-0 border-r-4 border-t-4",
                    "left-0 bottom-0 border-b-4 border-l-4",
                    "right-0 bottom-0 border-b-4 border-r-4"
                  ].map((className) => (
                    <span key={className} className={`absolute h-9 w-9 rounded-sm border-leaf ${className}`} />
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-6 py-5">
                  <p className="max-w-sm text-sm text-white/80">{cameraHint}</p>
                  <div className="rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/85">
                    {cameraState === "ready" ? "Live" : cameraState}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="rounded-full bg-white/10 p-4">
                  <Keyboard className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">Manual Mode</p>
                  <h2 className="font-[var(--font-display)] text-3xl font-semibold text-white">Type a barcode or product name</h2>
                  <p className="mx-auto max-w-md text-sm leading-6 text-white/65">
                    Useful for demos, browsers without camera access, or products already on your desk.
                  </p>
                </div>
              </div>
            )}

            {isSubmitting ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#102019]/78 backdrop-blur-sm">
                <LoaderCircle className="h-10 w-10 animate-spin text-white" />
                <p className="text-sm uppercase tracking-[0.26em] text-white/75">Analyzing Product</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="surface-card p-6">
          <div className="mb-5">
            <p className="eyebrow">Manual Input</p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-ink">Run a trust check in seconds</h2>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <label className="block space-y-2 text-sm font-semibold text-moss">
              Barcode or product name
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-moss/45" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. 8901000000023 or organic t-shirt"
                  className="w-full rounded-[24px] border border-moss/10 bg-white/80 py-4 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-moss/30"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={!query.trim() || isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-moss px-5 py-4 text-sm font-semibold text-white transition hover:bg-moss/92 disabled:cursor-not-allowed disabled:bg-moss/45"
            >
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
              Analyze Product
            </button>
          </form>

          {error ? <p className="mt-4 rounded-2xl bg-berry/10 px-4 py-3 text-sm text-[#b42323]">{error}</p> : null}
        </section>

        <section className="surface-card mesh-card p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-leaf p-3 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <p className="eyebrow">What Happens Next</p>
              <ul className="space-y-3 text-sm leading-6 text-moss/70">
                <li>1. We extract claims like "organic", "carbon neutral", and "eco-friendly".</li>
                <li>2. We check the claims against product certifications, brand certifications, and reputation signals.</li>
                <li>3. You get an explainable trust score with better alternatives if the claims look weak.</li>
              </ul>
            </div>
          </div>

          {cameraState === "denied" ? (
            <p className="mt-5 rounded-2xl bg-amber/10 px-4 py-3 text-sm text-[#9a6b00]">
              Camera access is blocked. You can still use manual search right away.
            </p>
          ) : null}
          {cameraState === "unsupported" ? (
            <p className="mt-5 rounded-2xl bg-amber/10 px-4 py-3 text-sm text-[#9a6b00]">
              This browser doesn&apos;t expose camera scanning here. Manual input is still available.
            </p>
          ) : null}
        </section>
      </aside>
    </div>
  );
}
