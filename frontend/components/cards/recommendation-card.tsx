"use client";

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import MetricTooltip from "@/components/ui/metric-tooltip";
import type { StrategyResult } from "@/types/report";

interface RecommendationCardProps {
  strategy: StrategyResult;
}

const STATUS_ICON = {
  recommended: CheckCircle,
  cautious: AlertTriangle,
  not_recommended: XCircle,
} as const;

const STATUS_COLOR = {
  recommended: "#16a34a",
  cautious: "#eab308",
  not_recommended: "#ef4444",
} as const;

const STATUS_ICON_COLOR = {
  recommended: "text-green-600",
  cautious: "text-yellow-500",
  not_recommended: "text-red-500",
} as const;

export default function RecommendationCard({ strategy }: RecommendationCardProps) {
  const t = useTranslations("recommendationCard");
  const lang = useLocale() as "en" | "zh";
  const { status, reason } = strategy.recommendation;
  const recText = reason[lang];
  const Icon = STATUS_ICON[status] ?? AlertTriangle;
  const borderColor = STATUS_COLOR[status] ?? "#ef4444";
  const iconColor = STATUS_ICON_COLOR[status] ?? "text-red-500";

  return (
    <Card
      className="border-0 shadow-sm"
      style={{
        borderRadius: 16,
        border: "1px solid #D5D0C7",
        borderLeft: `4px solid ${borderColor}`,
      }}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Icon size={14} className={iconColor} />
          <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
            {t("title")}
            <MetricTooltip label="AI Recommendation" lang={lang} />
          </span>
        </div>
        <p className="mb-3 text-sm font-semibold text-neutral-900">
          {recText}
        </p>
        <div className="space-y-3">
          <div>
            <p className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase text-neutral-400">
              {t("targetAudience")}
              <MetricTooltip label="Target Audience" lang={lang} />
            </p>
            <p className="text-[12px] leading-relaxed text-neutral-600">
              {strategy.target_audience[lang]}
            </p>
          </div>
          <div>
            <p className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase text-neutral-400">
              {t("riskAnalysis")}
              <MetricTooltip label="Risk Analysis" lang={lang} />
            </p>
            <p className="text-[12px] leading-relaxed text-neutral-600">
              {strategy.risk_analysis[lang]}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
