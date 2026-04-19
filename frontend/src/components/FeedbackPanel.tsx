"use client";

import { useState, useTransition } from "react";
import { MessageSquarePlus, Send } from "lucide-react";
import { readJsonResponse } from "@/lib/backend";
import type { FeedbackPayload } from "@/lib/types";

interface FeedbackPanelProps {
  productId: number;
  reportedScore: number;
}

export function FeedbackPanel({ productId, reportedScore }: FeedbackPanelProps) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [expectedScore, setExpectedScore] = useState("");
  const [issueType, setIssueType] = useState<FeedbackPayload["issueType"]>("incorrect-score");
  const [responseMessage, setResponseMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponseMessage("");

    startTransition(async () => {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          productId,
          issueType,
          message,
          email: email || undefined,
          reportedScore,
          expectedScore: expectedScore ? Number(expectedScore) : undefined
        })
      });
      const payload = await readJsonResponse<{ success: boolean; error?: string }>(response);

      if (!response.ok || !payload.success) {
        setResponseMessage(payload.error ?? "We couldn't send your feedback just now.");
        return;
      }

      setMessage("");
      setEmail("");
      setExpectedScore("");
      setResponseMessage("Thanks. Your feedback has been logged for review.");
    });
  };

  return (
    <div className="surface-card p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-moss text-white">
          <MessageSquarePlus className="h-5 w-5" />
        </span>
        <div>
          <p className="eyebrow">Give Feedback</p>
          <h3 className="mt-3 font-[var(--font-display)] text-2xl font-semibold text-ink">Help improve this score</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-moss">
            Issue type
            <select
              value={issueType}
              onChange={(event) => setIssueType(event.target.value as FeedbackPayload["issueType"])}
              className="w-full rounded-2xl border border-moss/10 bg-white/80 px-4 py-3 text-sm text-ink outline-none ring-0 transition focus:border-moss/30"
            >
              <option value="incorrect-score">Incorrect score</option>
              <option value="missing-certification">Missing certification</option>
              <option value="incorrect-brand-data">Incorrect brand data</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-moss">
            Expected score
            <input
              type="number"
              min={0}
              max={100}
              value={expectedScore}
              onChange={(event) => setExpectedScore(event.target.value)}
              className="w-full rounded-2xl border border-moss/10 bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/30"
              placeholder="Optional"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-moss">
          What looks off?
          <textarea
            required
            minLength={10}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-[130px] w-full rounded-[24px] border border-moss/10 bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/30"
            placeholder="Tell GreenProof what seems inaccurate or incomplete about this report."
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-moss">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-moss/10 bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/30"
            placeholder="Optional follow-up"
          />
        </label>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-moss/60">{responseMessage || "Thoughtful feedback makes the scoring system stronger."}</p>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-moss px-5 py-3 text-sm font-semibold text-white transition hover:bg-moss/92 disabled:cursor-not-allowed disabled:bg-moss/45"
          >
            {isPending ? "Sending..." : "Submit Feedback"}
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
