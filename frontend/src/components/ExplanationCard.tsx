"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface ExplanationItem {
  text: string;
  impact?: number;
}

interface ExplanationCardProps {
  title: string;
  accentClassName: string;
  icon: React.ReactNode;
  items: ExplanationItem[];
  defaultOpen?: boolean;
}

export function ExplanationCard({
  title,
  accentClassName,
  icon,
  items,
  defaultOpen = false
}: ExplanationCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="surface-card overflow-hidden bg-white/70">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white", accentClassName)}>{icon}</span>
          <div>
            <p className="text-lg font-semibold text-ink">{title}</p>
            <p className="text-sm text-moss/60">{items.length} highlights</p>
          </div>
        </div>
        <ChevronDown className={cn("h-5 w-5 text-moss/60 transition-transform", isOpen && "rotate-180")} />
      </button>

      <div className={cn("grid transition-[grid-template-rows] duration-300", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-moss/10 px-5 py-4">
            {items.map((item, index) => (
              <div key={`${item.text}-${index}`} className="rounded-2xl bg-sand/60 px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm leading-6 text-moss/80">{item.text}</p>
                  {item.impact !== undefined ? (
                    <span className="shrink-0 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-moss/70">
                      {item.impact > 0 ? "+" : ""}
                      {item.impact}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
