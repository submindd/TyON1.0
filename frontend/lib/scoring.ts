/**
 * Unified Opportunity Score calculation.
 *
 * Every product — target AND competitor — uses the same formula so scores
 * are comparable across the board.
 *
 * Dimensions (weighted):
 *  - Sales volume (0–40): relative sold-count within the product set
 *  - Rating (0–30):       based on the numeric rating, with a floor for missing data
 *  - Price competitiveness (0–30): lower-than-average price earns more points
 *
 * The LLM's ``analysis.opportunity_score`` for the **target** product may
 * differ from this because the LLM incorporates richer market-context signals
 * (growth trend, competition descriptors, etc.).  For the competitor table we
 * use this deterministic formula so every row is calculated the same way.
 */

import { parseSoldCount } from "./analysis-filters";

export interface ScoreInput {
  price: number | null;
  sold_count: string | null;
  rating: number | null;
}

export interface ScoreContext {
  /** Average price across all products in the result set (or null) */
  avgPrice: number | null;
  /** Maximum sold-count value across the set */
  maxSold: number;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function computeOpportunityScore(
  product: ScoreInput,
  context: ScoreContext,
): number {
  const sales = salesScore(product, context.maxSold);          // 0–40
  const rating = ratingScore(product.rating);                   // 0–30
  const price = priceCompetitivenessScore(product.price, context.avgPrice); // 0–30

  return Math.min(100, Math.max(0, Math.round(sales + rating + price)));
}

/** Convenience: compute scores for an array at once. */
export function computeAllScores(
  products: ScoreInput[],
): number[] {
  const prices = products
    .map((p) => p.price)
    .filter((v): v is number => v !== null);
  const avgPrice = prices.length > 0
    ? prices.reduce((s, v) => s + v, 0) / prices.length
    : null;
  const maxSold = Math.max(...products.map((p) => parseSoldCount(p.sold_count)), 1);

  return products.map((p) => computeOpportunityScore(p, { avgPrice, maxSold }));
}

// ---------------------------------------------------------------------------
// Dimension scorers
// ---------------------------------------------------------------------------

function salesScore(product: ScoreInput, maxSold: number): number {
  const sold = parseSoldCount(product.sold_count);
  if (maxSold <= 0) return 20; // neutral when no sales data at all
  const ratio = sold / maxSold; // 0…1
  return Math.round(ratio * 40);
}

function ratingScore(rating: number | null): number {
  if (rating === null) return 14; // no rating → cautious mid-low
  // Map 3.0–5.0 → 6–30 (linear)
  const clamped = Math.max(3.0, Math.min(5.0, rating));
  return Math.round(6 + ((clamped - 3.0) / 2.0) * 24);
}

function priceCompetitivenessScore(
  price: number | null,
  avgPrice: number | null,
): number {
  if (price === null || avgPrice === null || avgPrice <= 0) return 15;
  const ratio = price / avgPrice;
  if (ratio <= 0.6) return 30;       // way below average — very competitive
  if (ratio <= 0.8) return 26;
  if (ratio <= 1.0) return 22;       // at average
  if (ratio <= 1.2) return 16;
  if (ratio <= 1.5) return 10;
  return 4;                           // way above average — not competitive
}
