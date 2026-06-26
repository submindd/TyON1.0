"use client";

import { CheckCircle, AlertTriangle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import MetricTooltip from "@/components/ui/metric-tooltip";
import type { StrategyResult } from "@/types/report";

interface RecommendationCardProps {
  strategy: StrategyResult;
}

export default function RecommendationCard({ strategy }: RecommendationCardProps) {
  const t = useTranslations("recommendationCard");
  const locale = useLocale();
  const isPositive = strategy.recommendation?.includes("推荐") ?? false;
  const isNeutral = strategy.recommendation?.includes("谨慎") ?? false;

  return (
    <Card
      className="border-0 shadow-sm"
      style={{
        borderRadius: 16,
        border: "1px solid #D5D0C7",
        borderLeft: `4px solid ${isPositive ? "#16a34a" : isNeutral ? "#eab308" : "#ef4444"}`,
      }}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          {isPositive ? (
            <CheckCircle size={14} className="text-green-600" />
          ) : (
            <AlertTriangle size={14} className={isNeutral ? "text-yellow-500" : "text-red-500"} />
          )}
          <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
            {t("title")}
            <MetricTooltip label="AI Recommendation" locale={locale} />
          </span>
        </div>
        <p className="mb-3 text-sm font-semibold text-neutral-900">
          {strategy.recommendation}
        </p>
        <div className="space-y-3">
          <div>
            <p className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase text-neutral-400">
              {t("targetAudience")}
              <MetricTooltip label="Target Audience" locale={locale} />
            </p>
            <p className="text-[12px] leading-relaxed text-neutral-600">
              {strategy.target_audience}
            </p>
          </div>
          <div>
            <p className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase text-neutral-400">
              {t("riskAnalysis")}
              <MetricTooltip label="Risk Analysis" locale={locale} />
            </p>
            <p className="text-[12px] leading-relaxed text-neutral-600">
              {strategy.risk_analysis}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
