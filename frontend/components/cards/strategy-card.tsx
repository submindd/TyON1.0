"use client";

import { Users } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import MetricTooltip from "@/components/ui/metric-tooltip";
import type { StrategyResult } from "@/types/report";

interface StrategyCardProps {
  strategy: StrategyResult;
}

export default function StrategyCard({ strategy }: StrategyCardProps) {
  const t = useTranslations("strategyCard");
  const locale = useLocale();

  return (
    <Card
      className="border-0 shadow-sm"
      style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}
    >
      <CardContent className="p-4">
        <p className="mb-4 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
          {t("title")}
          <MetricTooltip label="AI Operation Suggestions" locale={locale} />
        </p>

        {/* Target Audience */}
        <div className="mb-4">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase text-neutral-400">
            <Users size={12} />
            {t("targetAudience")}
            <MetricTooltip label="Target Audience" locale={locale} />
          </p>
          <p className="text-[13px] leading-relaxed text-neutral-600">
            {strategy.target_audience}
          </p>
        </div>

        {/* Content Ideas */}
        <div className="mb-4">
          <p className="mb-2 flex items-center gap-1 text-[11px] font-medium uppercase text-neutral-400">
            {t("contentIdeas")}
            <MetricTooltip label="Content Ideas" locale={locale} />
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(strategy.content_ideas ?? []).map((c, i) => (
              <div
                key={i}
                className="rounded-xl px-3 py-2.5 text-[12px] text-neutral-600"
                style={{ backgroundColor: "#F0EDE7" }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* Influencer Types */}
        <div className="mb-4">
          <p className="mb-2 flex items-center gap-1 text-[11px] font-medium uppercase text-neutral-400">
            {t("influencerTypes")}
            <MetricTooltip label="Influencer Types" locale={locale} />
          </p>
          <div className="flex flex-wrap gap-2">
            {(strategy.influencer_types ?? []).map((tp, i) => (
              <span
                key={i}
                className="rounded-full px-3 py-1 text-[11px] text-neutral-600"
                style={{ backgroundColor: "#DCD7CF", border: "1px solid #C5BFB5" }}
              >
                {tp}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div>
          <p className="mb-2 flex items-center gap-1 text-[11px] font-medium uppercase text-neutral-400">
            {t("suggestedPricing")}
            <MetricTooltip label="Suggested Pricing" locale={locale} />
          </p>
          <p className="text-base font-semibold text-green-700">
            {strategy.pricing_suggestion}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
