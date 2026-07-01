"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchReport } from "@/lib/api";
import { scoreColor } from "@/lib/chart-utils";
import ErrorCard from "@/components/error-card";
import OpportunityRadar from "@/components/charts/radar-chart";
import InsightCard from "@/components/cards/insight-card";
import StrategyCard from "@/components/cards/strategy-card";
import RecommendationCard from "@/components/cards/recommendation-card";
import ListingGenerator from "@/components/report/listing-generator";
import { ProductThumb } from "@/components/product-card";
import type { ResearchResponse } from "@/types/report";
import { useTranslations, useLocale } from "next-intl";
import MetricTooltip from "@/components/ui/metric-tooltip";

const TREND_DATA = [
  { month: "Jan", value: 12 },
  { month: "Feb", value: 14 },
  { month: "Mar", value: 13 },
  { month: "Apr", value: 18 },
  { month: "May", value: 17 },
  { month: "Jun", value: 20 },
  { month: "Jul", value: 23 },
];

// -------- skeleton --------

function ReportSkeleton() {
  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "#EFECE6" }}>
      <div className="mb-4">
        <Skeleton className="mb-1 h-3.5 w-20" />
        <Skeleton className="h-6 w-80" />
      </div>

      {/* Core 2-column */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "3fr 2fr" }}>
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <Card key={i} className="border-0 shadow-sm" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
              <CardContent className="space-y-2.5 p-4">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <Card key={i} className="border-0 shadow-sm" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
              <CardContent className="space-y-2.5 p-4">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI section placeholder */}
      <Skeleton className="mt-6 mb-3 h-4 w-40" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-sm" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
            <CardContent className="space-y-2.5 p-4">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// -------- success --------

function ReportSuccess({ data }: { data: ResearchResponse }) {
  const { analysis, strategy, products, listing } = data;
  const target = products[0];
  const competitors = products.slice(1);
  const t = useTranslations("report");
  const tc = useTranslations("common");
  const tx = useTranslations("chart.radar");
  const lang = useLocale() as "en" | "zh";

  const radarDimensions = [
    tx("demand"),
    tx("growth"),
    tx("competition"),
    tx("saturation"),
    tx("profit"),
  ] as const;

  return (
    <>
      {/* ---------- Header ---------- */}
      <div className="mb-4">
        <p className="text-[10px] text-neutral-400">{t("pageTitle")}</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-neutral-900">
          {analysis.product.title}
        </h1>
      </div>

      {/* ========== Core 2-Column Layout ========== */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "3fr 2fr" }}>
        {/* ========== LEFT: Product Details + Opportunity Score ========== */}
        <div className="flex flex-col gap-3">
          {/* 1. Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 }}
          >
            <Card className="border-0 shadow-sm" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
              <CardContent className="p-4">
                <p className="mb-4 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                  {t("productDetails")}
                </p>
                <div className="flex items-start gap-3">
                  <ProductThumb src={target.image_url} size={96} />
                  <div className="min-w-0 flex-1 space-y-2">
                    <h2 className="text-base font-semibold leading-snug text-neutral-900">
                      {target.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                      <span className="font-semibold text-neutral-900">
                        {target.price != null ? `$${target.price.toFixed(2)}` : "—"}
                      </span>
                      <span className="text-neutral-500">{target.sold_count ?? "—"}</span>
                      <span className="flex items-center gap-1 text-neutral-500">
                        ★ {target.rating?.toFixed(1) ?? "—"}
                      </span>
                      <span className="text-neutral-400">{target.shop_name ?? "—"}</span>
                    </div>
                    <span className="inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] text-neutral-400">
                      {tc("tiktokShopBadge")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2. Opportunity Score + Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
              <CardContent className="flex flex-col items-center justify-center p-4" style={{ minHeight: 420 }}>
                <p className="mb-6 flex items-center gap-1 self-start text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                  {t("opportunityScore")}
                  <MetricTooltip label="Opportunity Score" lang={lang} />
                </p>
                <div className="flex w-full items-center justify-center gap-6">
                  <div className="flex-shrink-0 text-center" style={{ width: 130 }}>
                    <div
                      className="mx-auto flex h-[130px] w-[130px] items-center justify-center rounded-full text-5xl font-bold text-white"
                      style={{ backgroundColor: scoreColor(analysis.opportunity_score) }}
                    >
                      {analysis.opportunity_score}
                    </div>
                    <p className="mt-2 text-[11px] text-neutral-400">{t("outOf")}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <OpportunityRadar
                      score={analysis.opportunity_score}
                      height={300}
                      dimensions={radarDimensions}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ========== RIGHT: Top Competitors + Market Trends ========== */}
        <div className="flex flex-col gap-3">
          {/* 3. Top Competitors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 }}
          >
            <Card className="border-0 shadow-sm" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
              <CardContent className="p-4">
                <p className="mb-4 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                  {t("topCompetitors")}
                </p>
                <div className="space-y-3">
                  {competitors.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl p-3"
                      style={{ backgroundColor: "#EFECE6" }}
                    >
                      <div className="relative flex-shrink-0" style={{ width: 40, height: 40 }}>
                        <ProductThumb src={c.image_url} size={40} />
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-700 text-[8px] font-bold leading-none text-white shadow-sm">
                          {i + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-800">{c.title}</p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-neutral-400">
                          <span>{c.price != null ? `$${c.price.toFixed(2)}` : "—"}</span>
                          <span>{c.sold_count}</span>
                          <span>{c.shop_name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 4. Market Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
              <CardContent className="p-4">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                  {t("marketTrends")}
                </p>
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-900">23</span>
                  <span className="flex items-center gap-0.5 text-sm font-medium text-green-700">
                    <ArrowUp size={14} /> +23%
                  </span>
                  <span className="text-xs text-neutral-400">vs last month</span>
                </div>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TREND_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #efefef", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", fontSize: 12 }} />
                      <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: "#16a34a", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#16a34a", strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
                  <span>{t("marketSize")}: {analysis.market_size[lang]}</span>
                  <span>{t("competition")}: {analysis.competition[lang]}</span>
                  <span>{analysis.is_estimated ? tc("aiEstimated") : tc("verified")}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ========== AI Analysis & Strategy (full-width) ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-6"
      >
        <p className="mb-3 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
          {t("aiSectionTitle")}
        </p>

        <div className="grid grid-cols-3 gap-3">
          <InsightCard
            sellingPoints={analysis.selling_points}
            painPoints={analysis.pain_points}
            differentiationOpportunities={analysis.differentiation_opportunities}
          />
          <StrategyCard strategy={strategy} />
          <RecommendationCard strategy={strategy} />
        </div>

        <div className="mt-3">
          {listing && <ListingGenerator listing={listing} />}
        </div>
      </motion.div>
    </>
  );
}

// -------- page --------

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const keyword = decodeURIComponent(params.id);
  const tc = useTranslations("common");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["report", keyword],
    queryFn: () => fetchReport(keyword),
    enabled: !!keyword,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "#EFECE6" }}>
      {isLoading ? (
        <ReportSkeleton />
      ) : isError ? (
        <ErrorCard
          title={tc("errorFailedReport")}
          message={(error as Error)?.message ?? tc("errorUnknown")}
          onRetry={() => refetch()}
        />
      ) : data ? (
        <ReportSuccess data={data} />
      ) : null}
    </div>
  );
}
