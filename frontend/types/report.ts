/** TypeScript types matching the backend ResearchResponse schema. */

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

export interface AnalysisResult {
  product: CleanedProduct;
  opportunity_score: number;
  market_size: string;
  competition: string;
  growth_trend: string;
  is_estimated: boolean;
  selling_points: string[];
  pain_points: string[];
  differentiation_opportunities: string[];
}

export interface StrategyResult {
  target_audience: string;
  content_ideas: string[];
  influencer_types: string[];
  pricing_suggestion: string;
  risk_analysis: string;
  recommendation: string;
}

export interface ResearchResponse {
  products: ResearchProduct[];
  analysis: AnalysisResult;
  strategy: StrategyResult;
}

/** Product with category, as returned by GET /api/products. */
export interface ProductWithCategory extends ResearchProduct {
  category: string;
}

export interface ProductsResponse {
  products: ProductWithCategory[];
  total: number;
}

/** Client-side generated listing content (not from backend). */
export interface ListingData {
  seoTitle: string;
  bullets: string[];
  description: string;
  backendKeywords: string;
}
