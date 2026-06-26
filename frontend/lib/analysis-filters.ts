import type { ResearchProduct } from "@/types/report";

// ---------------------------------------------------------------------------
// Sold-count parser
// ---------------------------------------------------------------------------
export function parseSoldCount(sold: string | null): number {
  if (!sold) return 0;
  const cleaned = sold.replace(/,/g, "").replace(/sold|已售/gi, "").trim();
  const num = parseFloat(cleaned);
  if (Number.isNaN(num)) return 0;
  if (/[kK]/.test(cleaned)) return Math.round(num * 1000);
  if (/[mM]/.test(cleaned)) return Math.round(num * 1_000_000);
  if (/[万wW]/.test(cleaned)) return Math.round(num * 10_000);
  return Math.round(num);
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------
export interface ProductFilters {
  priceMin: number | null;
  priceMax: number | null;
  minSold: number | null;
  minRating: number | null;
}

export function filterProducts(
  products: ResearchProduct[],
  filters: ProductFilters,
): ResearchProduct[] {
  return products.filter((p) => {
    if (filters.priceMin !== null && (p.price ?? Infinity) < filters.priceMin)
      return false;
    if (filters.priceMax !== null && (p.price ?? -Infinity) > filters.priceMax)
      return false;
    if (filters.minSold !== null && parseSoldCount(p.sold_count) < filters.minSold)
      return false;
    if (filters.minRating !== null && (p.rating ?? 0) < filters.minRating)
      return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------
export type SortKey = "price" | "sold" | "rating";

export function sortProducts(
  products: ResearchProduct[],
  key: SortKey,
  direction: "asc" | "desc" = "desc",
): ResearchProduct[] {
  const sorted = [...products];
  sorted.sort((a, b) => {
    let va: number;
    let vb: number;
    switch (key) {
      case "price":
        va = a.price ?? -1;
        vb = b.price ?? -1;
        break;
      case "sold":
        va = parseSoldCount(a.sold_count);
        vb = parseSoldCount(b.sold_count);
        break;
      case "rating":
        va = a.rating ?? 0;
        vb = b.rating ?? 0;
        break;
    }
    return direction === "desc" ? vb - va : va - vb;
  });
  return sorted;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
export interface ProductStats {
  totalProducts: number;
  avgPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  avgRating: number | null;
  totalSold: number;
}

export function computeStats(products: ResearchProduct[]): ProductStats {
  const withPrice = products.filter((p) => p.price != null);
  const withRating = products.filter((p) => p.rating != null);

  return {
    totalProducts: products.length,
    avgPrice:
      withPrice.length > 0
        ? withPrice.reduce((s, p) => s + p.price!, 0) / withPrice.length
        : null,
    minPrice:
      withPrice.length > 0 ? Math.min(...withPrice.map((p) => p.price!)) : null,
    maxPrice:
      withPrice.length > 0 ? Math.max(...withPrice.map((p) => p.price!)) : null,
    avgRating:
      withRating.length > 0
        ? withRating.reduce((s, p) => s + p.rating!, 0) / withRating.length
        : null,
    totalSold: products.reduce((s, p) => s + parseSoldCount(p.sold_count), 0),
  };
}

// ---------------------------------------------------------------------------
// Price buckets for histogram
// ---------------------------------------------------------------------------
export function buildPriceBuckets(
  products: ResearchProduct[],
  bucketCount = 6,
): { label: string; min: number; max: number; count: number }[] {
  const withPrice = products.filter((p) => p.price != null).map((p) => p.price!);
  if (withPrice.length === 0) return [];

  const min = Math.min(...withPrice);
  const max = Math.max(...withPrice);
  if (min === max) {
    return [{ label: `$${min.toFixed(0)}`, min, max: min + 1, count: withPrice.length }];
  }

  const range = max - min;
  const step = range / bucketCount;
  const buckets: { label: string; min: number; max: number; count: number }[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const bMin = min + i * step;
    const bMax = i === bucketCount - 1 ? max + 0.01 : min + (i + 1) * step;
    buckets.push({
      label: `$${bMin.toFixed(0)}-$${bMax.toFixed(0)}`,
      min: bMin,
      max: bMax,
      count: 0,
    });
  }

  for (const p of withPrice) {
    for (const b of buckets) {
      if (p >= b.min && p < b.max) {
        b.count++;
        break;
      }
    }
  }

  return buckets.filter((b) => b.count > 0);
}
