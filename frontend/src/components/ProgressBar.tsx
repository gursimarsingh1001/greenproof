"use client";

import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value: number;
  color: string;
  className?: string;
}

export function ProgressBar({ value, color, className }: ProgressBarProps) {
  return (
    <div className={cn("h-3 overflow-hidden rounded-full bg-moss/10", className)}>
      <div
        className="h-full rounded-full transition-[width] duration-[1400ms] ease-out"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 60%, white))`
        }}
      />
    </div>
  );
}
