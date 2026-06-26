import type { AnalysisResult, ResearchProduct } from "@/types/report";

export interface ListingData {
  seoTitle: string;
  bullets: string[];
  description: string;
  backendKeywords: string;
}

/**
 * Pseudo-random number generator so "Regenerate" produces deterministic
 * variations for a given seed without actually re-calling an LLM.
 */
function mulberry32(seed: number) {
  return () => {
    let s = seed | 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function generateListing(
  analysis: AnalysisResult,
  products: ResearchProduct[],
  seed = 42,
): ListingData {
  const rng = mulberry32(seed);
  const product = analysis.product;

  return {
    seoTitle: buildSeoTitle(product.title, analysis.selling_points, rng),
    bullets: buildBullets(analysis, products, rng),
    description: buildDescription(product.title, analysis, rng),
    backendKeywords: buildKeywords(product.title, analysis, products, rng),
  };
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

const SEO_PREFIXES = [
  "Best",
  "Top-Rated",
  "Premium",
  "Affordable",
  "Trending",
  "High-Performance",
];

function buildSeoTitle(
  title: string,
  sellingPoints: string[],
  rng: () => number,
): string {
  const shortTitle = title.length > 50 ? title.slice(0, 47) + "..." : title;
  const prefix = pick(SEO_PREFIXES, rng);
  const hook =
    sellingPoints.length > 0
      ? sellingPoints[0].slice(0, 40)
      : "Must-Have Gadget";
  const seo = `${prefix} ${shortTitle} — ${hook} — TikTok Shop`;
  return seo.length > 160 ? seo.slice(0, 157) + "..." : seo;
}

function buildBullets(
  analysis: AnalysisResult,
  products: ResearchProduct[],
  rng: () => number,
): string[] {
  const bullets: string[] = [];

  // 1. Strongest selling point
  if (analysis.selling_points[0])
    bullets.push(`✅ ${analysis.selling_points[0]}`);

  // 2. Second selling point or differentiation
  if (analysis.selling_points[1])
    bullets.push(`🔥 ${analysis.selling_points[1]}`);
  else if (analysis.differentiation_opportunities[0])
    bullets.push(`🔥 ${analysis.differentiation_opportunities[0]}`);

  // 3. Invert a pain point into a feature
  if (analysis.pain_points[0]) {
    const inverted = analysis.pain_points[0]
      .replace(/low brand/i, "Premium-brand alternative")
      .replace(/no rating/i, "Community-verified quality")
      .replace(/average battery/i, "All-day battery life")
      .replace(/limited color/i, "Multiple color options")
      .replace(/crowded/i, "Curated for discerning buyers");
    bullets.push(`💡 ${inverted}`);
  }

  // 4. Differentiation angle
  if (analysis.differentiation_opportunities[1] ?? analysis.differentiation_opportunities[0]) {
    const d = analysis.differentiation_opportunities[1] ?? analysis.differentiation_opportunities[0];
    bullets.push(`🚀 ${d}`);
  }

  // 5. Specs / social proof
  const topCompetitor = products
    .filter((p) => p.sold_count != null)
    .sort(
      (a, b) =>
        parseInt(b.sold_count ?? "0", 10) - parseInt(a.sold_count ?? "0", 10),
    )[0];
  if (topCompetitor) {
    bullets.push(`📊 Join ${topCompetitor.sold_count ?? "thousands of"} happy customers`);
  } else if (analysis.product.rating) {
    bullets.push(`⭐ ${analysis.product.rating.toFixed(1)} / 5.0 rating`);
  } else {
    bullets.push("📦 Fast & free shipping available");
  }

  // Fill to exactly 5
  while (bullets.length < 5) {
    const fallbacks = [
      "🛡️ 30-day money-back guarantee",
      "📱 Perfect for daily use & gifting",
      "🌍 Ships worldwide in 3-5 business days",
      "🎁 Includes premium packaging",
    ];
    bullets.push(pick(fallbacks, rng));
  }

  return bullets.slice(0, 5);
}

function buildDescription(
  title: string,
  analysis: AnalysisResult,
  rng: () => number,
): string {
  const hook = analysis.selling_points[0] ?? "exceptional quality";
  const aud =
    analysis.differentiation_opportunities[0] ?? "an unbeatable value";
  const diff = analysis.differentiation_opportunities[1] ?? aud;

  const templates = [
    `Looking for ${hook.toLowerCase()}? Introducing ${title}, designed for those who demand both quality and value. ${hook}. Unlike competitors, ${diff.toLowerCase()}. Backed by thousands of satisfied customers on TikTok Shop.`,
    `Discover why ${title} is taking TikTok Shop by storm. Featuring ${hook.toLowerCase()}, this product stands out with ${diff.toLowerCase()}. Perfect for everyday use — order now and experience the difference.`,
  ];

  return pick(templates, rng);
}

function buildKeywords(
  title: string,
  analysis: AnalysisResult,
  products: ResearchProduct[],
  rng: () => number,
): string {
  const words = new Set<string>();

  // From product title
  title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .forEach((w) => words.add(w));

  // From selling points — extract key nouns
  analysis.selling_points.forEach((s) =>
    s
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .forEach((w) => words.add(w)),
  );

  // From competitor names
  products.forEach((p) => {
    if (p.shop_name) words.add(p.shop_name.toLowerCase());
  });

  // Generic TikTok Shop terms
  [
    "tiktok shop",
    "trending",
    "best seller",
    "viral",
    "must have",
    "affordable",
    "premium",
    "new arrival",
  ].forEach((t) => words.add(t));

  return Array.from(words).slice(0, 30).join(", ");
}
