"use client";

import { ResponsiveContainer, BarChart, Bar, Cell, Tooltip, XAxis, YAxis } from "recharts";
import type { VerificationResult } from "@/lib/types";

interface TrustBreakdownChartProps {
  result: VerificationResult;
}

const breakdownColors = ["#22c55e", "#eab308", "#f97316", "#94a3b8", "#ef4444"];

export function TrustBreakdownChart({ result }: TrustBreakdownChartProps) {
  const data = [
    { label: "Certification", value: result.breakdown.certificationScore },
    { label: "Vagueness", value: result.breakdown.vaguenessScore },
    { label: "Impossibility", value: result.breakdown.impossibilityScore },
    { label: "Brand", value: result.breakdown.brandScore },
    { label: "Consistency", value: result.breakdown.consistencyScore }
  ];

  return (
    <div className="surface-card p-5">
      <div className="mb-4">
        <p className="eyebrow">Score Breakdown</p>
        <h3 className="mt-3 font-[var(--font-display)] text-2xl font-semibold text-ink">Why the score moved</h3>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 12, right: 8 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={88} />
            <Tooltip
              cursor={false}
              formatter={(value) => {
                const numericValue = Number(value ?? 0);
                return [`${numericValue > 0 ? "+" : ""}${numericValue} pts`, "Impact"];
              }}
              contentStyle={{
                borderRadius: 16,
                border: "1px solid rgba(22,32,25,0.08)",
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 20px 50px rgba(22,32,25,0.14)"
              }}
            />
            <Bar dataKey="value" radius={999} barSize={18}>
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={breakdownColors[index] ?? "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
