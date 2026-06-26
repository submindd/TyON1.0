"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAllProducts } from "@/lib/api";
import ErrorCard from "@/components/error-card";
import ProductCard from "@/components/product-card";
import type { ProductWithCategory } from "@/types/report";
import { useTranslations } from "next-intl";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Wireless Earbuds", value: "wireless earbuds" },
  { label: "Portable Blender", value: "portable blender" },
  { label: "Phone Case", value: "phone case" },
  { label: "Yoga Mat", value: "yoga mat" },
];

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function ProductsSkeleton() {
  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "#EFECE6" }}>
      <Skeleton className="mb-1 h-3.5 w-20" />
      <Skeleton className="mb-4 h-6 w-48" />

      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="border-0" style={{ borderRadius: 16, border: "1px solid #D5D0C7" }}>
            <CardContent className="p-3">
              <Skeleton className="mb-2 h-16 w-full rounded-xl" />
              <Skeleton className="mb-1 h-3.5 w-full" />
              <Skeleton className="mb-1 h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
    staleTime: 5 * 60 * 1000,
  });

  const t = useTranslations("products");
  const tc = useTranslations("common");

  const allProducts: ProductWithCategory[] = data?.products ?? [];

  // Local filter: category + title search
  const filtered = useMemo(() => {
    let list = allProducts;
    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        (p.title ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [allProducts, category, search]);

  // ---- Render -----------------------------------------------------------

  if (isLoading) return <ProductsSkeleton />;

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
      <div className="mb-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
          {tc("appName")}
        </p>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-neutral-900">
          <Package size={20} className="text-neutral-500" />
          {t("title")}
        </h1>
      </div>

      {/* ---------- Filters ---------- */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-xl border-neutral-200 bg-white pl-9 text-[12px] placeholder:text-neutral-300"
          />
        </div>

        {/* Category filter */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-40 rounded-xl border-neutral-200 bg-white text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value} className="text-[12px]">
                {c.value === "all" ? `${t("allCategories")} (${allProducts.length})` : `${c.label} (${allProducts.filter((p) => p.category === c.value).length})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Result count */}
        <span className="text-[11px] text-neutral-400">
          {filtered.length} {t("resultCount")}
        </span>
      </div>

      {/* ---------- Product Grid ---------- */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package size={32} className="mb-3 text-neutral-300" />
          <p className="text-sm text-neutral-400">
            {search.trim() ? t("noSearchResults") : t("noProducts")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p, i) => (
            <ProductCard key={i} product={p} index={i} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
