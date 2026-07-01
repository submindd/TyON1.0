/** TypeScript types matching the backend ResearchResponse schema. */

import type { LocalizedText } from "@/types/i18n";

export interface ResearchProduct {
  title: string | null;
  price: number | null;
  sold_count: string | null;
  rating: number | null;
  image_url: string | null;
  product_url: string | null;
  shop_name: string | null;
  data_source: "live" | "seed";
}

export interface CleanedProduct {
  title: string;
  price: string;
  sold_count: string;
  rating: number | null;
  image_url: string;
  shop_name: string;
}

/** All AI text fields are bilingual LocalizedText. */
export interface AnalysisResult {
  product: CleanedProduct;
  opportunity_score: number;
  market_size: LocalizedText;
  competition: LocalizedText;
  growth_trend: LocalizedText;
  is_estimated: boolean;
  selling_points: LocalizedText[];
  pain_points: LocalizedText[];
  differentiation_opportunities: LocalizedText[];
}

/** Machine-readable recommendation — frontend never parses Chinese. */
export type RecommendationStatus = "recommended" | "cautious" | "not_recommended";

export interface RecommendationResult {
  status: RecommendationStatus;
  reason: LocalizedText;
}

/** All AI text fields are bilingual LocalizedText. */
export interface StrategyResult {
  target_audience: LocalizedText;
  content_ideas: LocalizedText[];
  influencer_types: LocalizedText[];
  pricing_suggestion: LocalizedText;
  risk_analysis: LocalizedText;
  recommendation: RecommendationResult;
}

/** AI-generated bilingual listing content. */
export interface ListingResponse {
  seo_title: LocalizedText;
  bullets: LocalizedText[];
  description: LocalizedText;
  /** English-only keyword array — platform requirement. */
  backend_keywords: string[];
}

export interface ResearchResponse {
  products: ResearchProduct[];
  analysis: AnalysisResult;
  strategy: StrategyResult;
  listing: ListingResponse | null;
}

/** Product with category, as returned by GET /api/products. */
export interface ProductWithCategory extends ResearchProduct {
  category: string;
}

export interface ProductsResponse {
  products: ProductWithCategory[];
  total: number;
}
