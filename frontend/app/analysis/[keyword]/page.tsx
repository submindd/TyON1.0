"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Star,
  ShoppingCart,
  ArrowRight,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchReport } from "@/lib/api";
import {
  filterProducts,
  sortProducts,
  computeStats,
  type ProductFilters,
  type SortKey,
} from "@/lib/analysis-filters";
import { computeAllScores } from "@/lib/scoring";
import { scoreColor, scoreBgColor } from "@/lib/chart-utils";
import ErrorCard from "@/components/error-card";
import OpportunityRadar from "@/components/charts/radar-chart";
import PriceDistribution from "@/components/charts/price-distribution";
import TopSellers from "@/components/charts/top-sellers";
import OpportunityRing from "@/components/ui/opportunity-ring";
import InsightCard from "@/components/cards/insight-card";
import StrategyCard from "@/components/cards/strategy-card";
import RecommendationCard from "@/components/cards/recommendation-card";
import ProductCard from "@/components/product-card";
import type { ResearchProduct } from "@/types/report";
import { useTranslations, useLocale } from "next-intl";
import MetricTooltip from "@/components/ui/metric-tooltip";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SOLD_OPTIONS = [
  { label: "Any sales", value: "0" },
  { label: "100+", value: "100" },
  { label: "1K+", value: "1000" },
  { label: "10K+", value: "10000" },
  { label: "50K+", value: "50000" },
];

const RATING_OPTIONS = [
  { label: "Any rating", value: "0" },
  { label: "3.0+", value: "3" },
  { label: "3.5+", value: "3.5" },
  { label: "4.0+", value: "4" },
  { label: "4.5+", value: "4.5" },
];

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Best sellers", value: "sold" },
  { label: "Price: High to Low", value: "price" },
  { label: "Top rated", value: "rating" },
];

// ---------------------------------------------------------------------------
// Mini stat card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  icon: Icon,
  glossaryKey,
  locale,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  glossaryKey?: string;
  locale: string;
}) {
  return (
    <Card
      className="border-0 shadow-sm"
      style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}
    >
      <CardContent className="flex items-center gap-3 p-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: "#DCD7CF" }}
        >
          <Icon size={17} className="text-neutral-700" />
        </div>
        <div>
          <p className="flex items-center gap-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
            {label}
            {glossaryKey && <MetricTooltip label={glossaryKey} locale={locale} />}
          </p>
          <p className="text-sm font-semibold text-neutral-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Competitor table
// ---------------------------------------------------------------------------
function CompetitorTable({
  products,
  labels,
  locale,
}: {
  products: ResearchProduct[];
  labels: { title: string; product: string; price: string; sold: string; rating: string; score: string };
  locale: string;
}) {
  const scores = useMemo(() => computeAllScores(products), [products]);

  // Keep target first, then sort rest by score desc
  const rows = useMemo(() => {
    const target = products[0];
    const rest = products.slice(1).map((p, i) => ({ product: p, score: scores[i + 1] ?? 0 }));
    rest.sort((a, b) => b.score - a.score);
    return [
      { product: target, score: scores[0] ?? 0, isTarget: true },
      ...rest.map((r) => ({ ...r, isTarget: false })),
    ];
  }, [products, scores]);

  if (products.length === 0) return null;

  return (
    <Card
      className="border-0 shadow-sm"
      style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}
    >
      <CardContent className="p-4">
        <p className="mb-4 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
          {labels.title}
          <MetricTooltip label="Top Competitors" locale={locale} />
        </p>

        {/* Table header */}
        <div
          className="mb-2 grid items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-neutral-400"
          style={{
            gridTemplateColumns: "minmax(0,2fr) 70px 65px 55px 46px",
            backgroundColor: "#EFECE6",
          }}
        >
          <span>{labels.product}</span>
          <span>{labels.price}</span>
          <span>{labels.sold}</span>
          <span>{labels.rating}</span>
          <span className="flex items-center justify-center gap-0.5">
            {labels.score}
            <MetricTooltip label="Score" locale={locale} />
          </span>
        </div>

        {/* Table body */}
        <div className="max-h-[320px] overflow-y-auto space-y-1">
          {rows.map(({ product, score, isTarget }, i) => (
            <div
              key={i}
              className="grid items-center gap-2 rounded-xl px-3 py-2.5"
              style={{
                gridTemplateColumns: "minmax(0,2fr) 70px 65px 55px 46px",
                backgroundColor: isTarget ? "#F0EDE7" : "transparent",
              }}
            >
              {/* Product name */}
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-neutral-800">
                  {product.title ?? "Untitled"}
                </p>
              </div>
              {/* Price */}
              <span className="text-[12px] font-medium text-neutral-700">
                {product.price != null ? `$${product.price.toFixed(2)}` : "—"}
              </span>
              {/* Sold */}
              <span className="text-[11px] text-neutral-500">
                {product.sold_count ?? "—"}
              </span>
              {/* Rating */}
              <span className="text-[12px] text-neutral-600">
                {product.rating != null ? `★ ${product.rating.toFixed(1)}` : "—"}
              </span>
              {/* Opportunity Score Ring */}
              <div className="flex justify-center">
                <OpportunityRing score={score} size={32} strokeWidth={2.5} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function AnalysisSkeleton() {
  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "#EFECE6" }}>
      <Skeleton className="mb-1 h-3.5 w-20" />
      <Skeleton className="mb-4 h-6 w-80" />

      <div className="mb-4 grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
            <CardContent className="p-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-5 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "3fr 2fr" }}>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
              <CardContent className="p-4">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <Card key={i} className="border-0" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
              <CardContent className="p-4">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AnalysisPage() {
  const params = useParams<{ keyword: string }>();
  const keyword = decodeURIComponent(params.keyword);
  const router = useRouter();

  const [filters, setFilters] = useState<ProductFilters>({
    priceMin: null,
    priceMax: null,
    minSold: null,
    minRating: null,
  });
  const [sort, setSort] = useState<SortKey>("sold");
  const [filterOpen, setFilterOpen] = useState(false);
  const [moreDataOpen, setMoreDataOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["research", keyword],
    queryFn: () => fetchReport(keyword),
    enabled: !!keyword,
    staleTime: 5 * 60 * 1000,
  });

  // Derived data
  const products: ResearchProduct[] = data?.products ?? [];
  const analysis = data?.analysis;
  const strategy = data?.strategy;

  const stats = useMemo(() => computeStats(products), [products]);

  const filtered = useMemo(() => {
    const f = filterProducts(products, filters);
    return sortProducts(f, sort);
  }, [products, filters, sort]);

  const hasActiveFilters =
    filters.priceMin !== null ||
    filters.priceMax !== null ||
    filters.minSold !== null ||
    filters.minRating !== null;

  const clearFilters = () =>
    setFilters({ priceMin: null, priceMax: null, minSold: null, minRating: null });

  const t = useTranslations("analysis");
  const tc = useTranslations("common");
  const locale = useLocale();

  // ---- Render -----------------------------------------------------------

  if (isLoading) return <AnalysisSkeleton />;

  if (isError) {
    return (
      <ErrorCard
        title={tc("errorFailedProducts")}
        message={(error as Error)?.message ?? tc("errorUnknown")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "#EFECE6" }}>
      {/* ---------- Header ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center justify-between"
      >
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
            {t("pageTitle")}
          </p>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {keyword}
          </h1>
        </div>
        <Button
          onClick={() => router.push(`/report/${encodeURIComponent(keyword)}`)}
          disabled={products.length === 0}
          className="h-10 rounded-xl bg-neutral-900 text-sm hover:bg-neutral-800"
        >
          {t("generateReport")}
          <ArrowRight size={14} className="ml-1.5" />
        </Button>
      </motion.div>

      {/* ---------- Stats Row ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-3 grid grid-cols-4 gap-3"
      >
        <StatCard
          label={t("stats.products")}
          value={String(stats.totalProducts)}
          icon={ShoppingCart}
          locale={locale}
        />
        <StatCard
          label={t("stats.avgPrice")}
          value={stats.avgPrice != null ? `$${stats.avgPrice.toFixed(2)}` : "—"}
          icon={DollarSign}
          glossaryKey="Avg Price"
          locale={locale}
        />
        <StatCard
          label={t("stats.avgRating")}
          value={stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}
          icon={Star}
          glossaryKey="Avg Rating"
          locale={locale}
        />
        <StatCard
          label={t("stats.totalSold")}
          value={
            stats.totalSold >= 1000
              ? `${(stats.totalSold / 1000).toFixed(1)}K`
              : String(stats.totalSold)
          }
          icon={TrendingUp}
          glossaryKey="Total Sold"
          locale={locale}
        />
      </motion.div>

      {/* ---------- 2-Column Body ---------- */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "3fr 2fr" }}>
        {/* ========== LEFT COLUMN ========== */}
        <div className="flex flex-col gap-3">
          {/* ① Opportunity Score + Radar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card
              className="border-0 shadow-sm"
              style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}
            >
              <CardContent className="p-4">
                <p className="mb-4 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                  {t("opportunityScore")}
                  <MetricTooltip label="Opportunity Score" locale={locale} />
                </p>
                <div className="flex items-start gap-4">
                  {/* Big score number + label */}
                  <div className="flex-shrink-0 text-center" style={{ width: 72 }}>
                    <div
                      className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full text-3xl font-bold text-white"
                      style={{
                        backgroundColor:
                          (analysis?.opportunity_score ?? 0) >= 70
                            ? "#16a34a"
                            : (analysis?.opportunity_score ?? 0) >= 50
                              ? "#eab308"
                              : "#737373",
                      }}
                    >
                      {analysis?.opportunity_score ?? "—"}
                    </div>
                    <p className="mt-1 text-[10px] text-neutral-400">/ 100</p>
                  </div>
                  {/* Radar */}
                  <div className="min-w-0 flex-1">
                    <OpportunityRadar
                      score={analysis?.opportunity_score ?? 50}
                      height={180}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ② AI Key Insights */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <InsightCard
                sellingPoints={analysis.selling_points}
                painPoints={analysis.pain_points}
                differentiationOpportunities={analysis.differentiation_opportunities}
              />
            </motion.div>
          )}

          {/* ③ AI Operation Suggestions */}
          {strategy && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <StrategyCard strategy={strategy} />
            </motion.div>
          )}
        </div>

        {/* ========== RIGHT COLUMN ========== */}
        <div className="flex flex-col gap-3">
          {/* ④ Competitor Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CompetitorTable
            products={products}
            labels={{
              title: t("competitorTable.title"),
              product: t("competitorTable.product"),
              price: t("competitorTable.price"),
              sold: t("competitorTable.sold"),
              rating: t("competitorTable.rating"),
              score: t("competitorTable.score"),
            }}
            locale={locale}
          />
          </motion.div>

          {/* ⑤ Recommendation */}
          {strategy && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RecommendationCard strategy={strategy} />
            </motion.div>
          )}
        </div>
      </div>

      {/* ========== 📊 More Data (collapsible) ========== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3"
      >
        <button
          onClick={() => setMoreDataOpen(!moreDataOpen)}
          className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-700"
          style={{ backgroundColor: "#DCD7CF", border: "1px solid #C5BFB5" }}
        >
          <span className="flex items-center gap-2">
            <TrendingUp size={13} />
            {t("moreData")}
          </span>
          {moreDataOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {moreDataOpen && (
          <div className="mt-3 space-y-3">
            {/* Charts + Product Grid */}
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {/* LEFT: Price Distribution + Top Sellers */}
              <div className="flex flex-col gap-3">
                <Card
                  className="border-0 shadow-sm"
                  style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}
                >
                  <CardContent className="p-4">
                    <p className="mb-3 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                      {t("charts.priceDistribution")}
                      <MetricTooltip label="Price Distribution" locale={locale} />
                    </p>
                    <PriceDistribution products={products} />
                  </CardContent>
                </Card>
                <Card
                  className="border-0 shadow-sm"
                  style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}
                >
                  <CardContent className="p-4">
                    <p className="mb-3 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                      {t("charts.topSellers")}
                      <MetricTooltip label="Top Sellers" locale={locale} />
                    </p>
                    <TopSellers products={products} />
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT: Filter Bar + Product List */}
              <div className="flex flex-col gap-3">
                {/* Filter + Sort Bar */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="h-8 rounded-lg text-[11px]"
                    style={{
                      backgroundColor: filterOpen || hasActiveFilters ? "#DCD7CF" : "transparent",
                    }}
                  >
                    <SlidersHorizontal size={12} className="mr-1" />
                    {t("filterBar.filters")}
                    {hasActiveFilters && (
                      <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-700 text-[9px] text-white">
                        !
                      </span>
                    )}
                  </Button>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-0.5 text-[11px] text-neutral-400 hover:text-neutral-600"
                    >
                      <X size={11} /> {tc("clear")}
                    </button>
                  )}
                  <div className="ml-auto">
                    <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                      <SelectTrigger className="h-8 w-36 rounded-lg border-neutral-200 text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-[11px]">
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter panel */}
                {filterOpen && (
                  <div
                    className="flex flex-wrap items-end gap-3 rounded-2xl p-3"
                    style={{ backgroundColor: "#DCD7CF" }}
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500">{t("filterBar.minPrice")}</label>
                      <Input
                        type="number"
                        placeholder="$0"
                        value={filters.priceMin ?? ""}
                        onChange={(e) =>
                          setFilters((f) => ({
                            ...f,
                            priceMin: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                        className="h-8 w-20 rounded-lg border-neutral-200 bg-white text-[11px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500">{t("filterBar.maxPrice")}</label>
                      <Input
                        type="number"
                        placeholder="$999"
                        value={filters.priceMax ?? ""}
                        onChange={(e) =>
                          setFilters((f) => ({
                            ...f,
                            priceMax: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                        className="h-8 w-20 rounded-lg border-neutral-200 bg-white text-[11px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500">{t("filterBar.minSold")}</label>
                      <Select
                        value={String(filters.minSold ?? 0)}
                        onValueChange={(v) =>
                          setFilters((f) => ({
                            ...f,
                            minSold: Number(v) || null,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 w-24 rounded-lg border-neutral-200 bg-white text-[11px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SOLD_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value} className="text-[11px]">
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500">{t("filterBar.minRating")}</label>
                      <Select
                        value={String(filters.minRating ?? 0)}
                        onValueChange={(v) =>
                          setFilters((f) => ({
                            ...f,
                            minRating: Number(v) || null,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 w-24 rounded-lg border-neutral-200 bg-white text-[11px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RATING_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value} className="text-[11px]">
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Product List */}
                <Card
                  className="flex-1 border-0 shadow-sm"
                  style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}
                >
                  <CardContent className="p-4">
                    <p className="mb-3 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                      {t("stats.products")} ({filtered.length})
                    </p>
                    {filtered.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-sm text-neutral-400">
                          {products.length === 0
                            ? tc("noProductsFound").replace("{keyword}", keyword)
                            : tc("noProductsMatchFilters")}
                        </p>
                        {products.length > 0 && (
                          <button
                            onClick={clearFilters}
                            className="mt-2 text-[11px] text-neutral-500 underline hover:text-neutral-700"
                          >
                            {tc("clearAllFilters")}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="-mx-1 space-y-0.5">
                        {filtered.map((p, i) => (
                          <ProductCard key={i} product={p} index={i} variant="row" />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
