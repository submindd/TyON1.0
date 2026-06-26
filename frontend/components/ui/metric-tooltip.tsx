"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { getMetricExplanation } from "@/lib/metricGlossary";

interface MetricTooltipProps {
  /** The exact English label used as the glossary lookup key. */
  label: string;
  /** Only renders when locale is "zh". */
  locale?: string;
}

export default function MetricTooltip({ label, locale }: MetricTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const entry = getMetricExplanation(label);
  if (!entry || locale !== "zh") return null;

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-neutral-300 transition-colors hover:text-neutral-500 hover:bg-neutral-100"
        aria-label={`${label} 说明`}
      >
        <HelpCircle size={11} />
      </button>
      {open && (
        <span
          className="absolute bottom-full left-1/2 z-50 mb-1.5 w-56 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] leading-relaxed text-neutral-600 shadow-lg"
          style={{ borderColor: "#D5D0C7" }}
        >
          <span className="block text-[10px] font-medium text-neutral-800 mb-0.5">
            {entry.shortLabel}
          </span>
          {entry.zhExplanation}
        </span>
      )}
    </span>
  );
}
