"use client";

import { Zap, AlertTriangle, TrendingUp } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import MetricTooltip from "@/components/ui/metric-tooltip";

interface InsightCardProps {
  sellingPoints: string[];
  painPoints: string[];
  differentiationOpportunities: string[];
}

function BulletList({
  items,
  color,
  icon: Icon,
  label,
  glossaryKey,
  locale,
}: {
  items: string[];
  color: string;
  icon: typeof Zap;
  label: string;
  glossaryKey: string;
  locale: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-neutral-700">
        <Icon size={14} style={{ color }} />
        {label}
        <MetricTooltip label={glossaryKey} locale={locale} />
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-neutral-600">
            <span
              className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function InsightCard({
  sellingPoints,
  painPoints,
  differentiationOpportunities,
}: InsightCardProps) {
  const t = useTranslations("insightCard");
  const locale = useLocale();

  const hasSelling = Array.isArray(sellingPoints) && sellingPoints.length > 0;
  const hasPain = Array.isArray(painPoints) && painPoints.length > 0;
  const hasDiff =
    Array.isArray(differentiationOpportunities) &&
    differentiationOpportunities.length > 0;

  if (!hasSelling && !hasPain && !hasDiff) return null;

  return (
    <Card
      className="border-0 shadow-sm"
      style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}
    >
      <CardContent className="p-4">
        <p className="mb-4 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
          {t("title")}
          <MetricTooltip label="AI Key Insights" locale={locale} />
        </p>

        {hasSelling && (
          <BulletList
            items={sellingPoints}
            color="#16a34a"
            icon={Zap}
            label={locale === "zh" ? "卖点" : "Selling Points"}
            glossaryKey="Selling Points"
            locale={locale}
          />
        )}
        {hasPain && (
          <BulletList
            items={painPoints}
            color="#ef4444"
            icon={AlertTriangle}
            label={locale === "zh" ? "痛点" : "Pain Points"}
            glossaryKey="Pain Points"
            locale={locale}
          />
        )}
        {hasDiff && (
          <BulletList
            items={differentiationOpportunities}
            color="#3b82f6"
            icon={TrendingUp}
            label={locale === "zh" ? "差异化机会" : "Differentiation Opportunities"}
            glossaryKey="Differentiation Opportunities"
            locale={locale}
          />
        )}
      </CardContent>
    </Card>
  );
}
