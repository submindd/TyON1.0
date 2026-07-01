/**
 * Metric Glossary — unified multilingual dictionary of metric explanations.
 *
 * Every metric that appears on the Analysis / Report pages has an entry here.
 * ``MetricTooltip`` reads from this glossary and displays the explanation
 * in the active locale.
 *
 * Keys are the English labels used in the UI (case-sensitive).
 */

import type { LocalizedText } from "@/types/i18n";

// ---------------------------------------------------------------------------
// Metric key type — every key that has a glossary entry
// ---------------------------------------------------------------------------
export type MetricKey =
  // Radar dimensions
  | "Demand" | "Growth" | "Competition" | "Saturation" | "Profit"
  // Score & stats
  | "Opportunity Score" | "Avg Price" | "Avg Rating" | "Total Sold"
  // Competitor table
  | "Top Competitors" | "Score"
  // AI Insights
  | "AI Key Insights" | "Selling Points" | "Pain Points"
  | "Differentiation Opportunities"
  // AI Strategy
  | "AI Operation Suggestions" | "Target Audience" | "Content Ideas"
  | "Influencer Types" | "Suggested Pricing"
  // Recommendation
  | "AI Recommendation" | "Risk Analysis"
  // Market trends
  | "Market Trends" | "Market Size" | "vs last month"
  | "AI Estimated" | "Verified"
  // Listing Generator
  | "Listing Generator" | "SEO Title" | "5 Bullet Points"
  | "Product Description" | "Backend Keywords"
  // Charts
  | "Price Distribution" | "Top Sellers";

// ---------------------------------------------------------------------------
// Glossary — every key maps to { en, zh }
// ---------------------------------------------------------------------------
const GLOSSARY: Record<MetricKey, LocalizedText> = {
  // ---- Radar dimensions ------------------------------------------------
  Demand: {
    en: "Reflects search volume and purchase intent for this category. Higher values mean stronger market demand. This dimension is positively correlated with the opportunity score.",
    zh: "反映该品类的搜索量和购买意愿，数值越高代表市场需求越旺盛。该维度与机会分数正相关。",
  },
  Growth: {
    en: "Reflects the recent sales/trend direction for this category. Higher values mean a clearer upward trend. Positively correlated with the opportunity score.",
    zh: "反映该品类近期销量/搜索趋势的变化方向，数值越高代表上升趋势越明显。该维度与机会分数正相关。",
  },
  Competition: {
    en: "Reflects how friendly the competitive landscape is — higher values mean milder competition and lower barriers to entry. Positively correlated with the opportunity score.",
    zh: "反映该品类的竞争环境——数值越高代表竞争越温和、新手介入难度越低。该维度与机会分数正相关（高机会分对应低竞争度）。",
  },
  Saturation: {
    en: "Reflects the differentiation potential in this niche — higher values mean less homogeneity and more room to stand out. Positively correlated with the opportunity score.",
    zh: "反映该细分品类的差异化空间——数值越高代表同质化程度越低、可操作空间越大。该维度与机会分数正相关。",
  },
  Profit: {
    en: "Estimated profit margin based on cost structure and pricing range in this category. Higher values mean greater profit potential. Positively correlated with the opportunity score.",
    zh: "综合该品类的成本结构和定价区间估算的潜在利润率，数值越高代表盈利空间越大。该维度与机会分数正相关。",
  },

  // ---- Opportunity Score ------------------------------------------------
  "Opportunity Score": {
    en: "A composite measure of market potential, weighted: sales (0–40), rating (0–30), price competitiveness (0–30). ≥70 = high opportunity (green), 50–69 = moderate (yellow), <50 = caution advised.",
    zh: "综合衡量该产品的市场潜力，由销量（0–40分）、评分（0–30分）、价格竞争力（0–30分）加权计算得出。70分以上为高机会（绿色），50–69分为中等机会（黄色），50分以下建议谨慎。",
  },

  // ---- Stats -----------------------------------------------------------
  "Avg Price": {
    en: "Average selling price (USD) of all similar products under this keyword. Use it to quickly gauge whether your pricing is competitive.",
    zh: "该关键词下所有同类产品的平均售价（USD），可用于快速判断你的定价是否有竞争力。",
  },
  "Avg Rating": {
    en: "Average rating (out of 5) of all similar products under this keyword. Use it to assess the overall reputation level in this category.",
    zh: "该关键词下所有同类产品的平均评分（5分制），可用于判断该品类的整体口碑水平。",
  },
  "Total Sold": {
    en: "Total combined sales of all similar products under this keyword. Reflects overall market size — larger numbers mean stronger demand but usually fiercer competition.",
    zh: "该关键词下所有同类产品的合计销量，反映该品类的整体市场规模。数值越大代表需求越旺盛，但通常竞争也更激烈。",
  },

  // ---- Competitor Table -------------------------------------------------
  "Top Competitors": {
    en: "A list of competing products sorted by sales/popularity. Each competitor's opportunity score uses the same weighted formula as the main product — compare them side-by-side.",
    zh: "按销量/热度排序的同类竞争产品列表。每个竞品的机会分数（Score）与主产品采用同一加权公式计算，可直接横向对比。",
  },
  Score: {
    en: "Uses the exact same weighted formula as the main product (sales × 40% + rating × 30% + price competitiveness × 30%). Compare opportunity sizes directly.",
    zh: "与该页主产品采用完全相同的加权公式（销量×40% + 评分×30% + 价格竞争力×30%）计算，可直接横向对比各产品的市场机会大小。",
  },

  // ---- AI Insights ------------------------------------------------------
  "AI Key Insights": {
    en: "Insights automatically extracted and analysed by AI from product reviews, titles, and attribute data.",
    zh: "基于商品评论、标题和属性数据，由 AI 自动提取和分析生成的洞察结果。",
  },
  "Selling Points": {
    en: "Core product strengths recognised by buyers, typically extracted from high-frequency keywords in positive reviews. Use these for product copy and marketing materials.",
    zh: "消费者认可的产品核心优势，通常来源于高分评价中的高频关键词提取。可作为产品文案和推广素材的参考。",
  },
  "Pain Points": {
    en: "Common complaints and dissatisfaction found in buyer feedback, typically extracted from negative reviews. Use these to guide product improvements.",
    zh: "消费者反馈中的不满和抱怨，通常来源于差评中的关键词提取。可作为产品改进方向的参考依据。",
  },
  "Differentiation Opportunities": {
    en: "Potential gaps or unique selling angles inferred by AI from competitor shortcomings. Use these as references for product differentiation strategy.",
    zh: "基于现有竞品的不足之处，AI 推测出的潜在改进空间或独特的卖点切入点。可用作选品差异化策略的参考。",
  },

  // ---- AI Strategy ------------------------------------------------------
  "AI Operation Suggestions": {
    en: "Specific promotion and operational strategy recommendations generated by AI based on the category's market characteristics and competitor data.",
    zh: "基于该品类的市场特征和竞品数据，AI 生成的具体推广和运营策略建议。",
  },
  "Target Audience": {
    en: "Core consumer profile inferred by AI from product characteristics and similar buyer demographics. Use for ad targeting and content positioning.",
    zh: "根据产品特性和同类购买人群画像，AI 推测出的核心消费群体描述。可用于指导广告投放和内容定位。",
  },
  "Content Ideas": {
    en: "Video/content direction suggestions suitable for TikTok marketing of this product. Ready-to-use inspiration for your content team's shooting scripts.",
    zh: "适合该产品在 TikTok 等平台进行内容营销的拍摄/选题方向建议，直接可用于内容团队的拍摄脚本参考。",
  },
  "Influencer Types": {
    en: "Creator/influencer profile recommendations for promoting this product. Use to guide influencer selection and outreach strategy.",
    zh: "适合推广该产品的网红/达人画像建议，用于指导达人合作筛选和投放策略。",
  },
  "Suggested Pricing": {
    en: "A reference price range suggested by AI based on actual competitor pricing and cost structure. Use as a starting point for your listing price.",
    zh: "根据同类竞品的实际定价区间和成本结构，AI 给出的参考定价范围。可作为上架定价的起点参考。",
  },

  // ---- Recommendation ---------------------------------------------------
  "AI Recommendation": {
    en: "The final product selection recommendation synthesised from all data dimensions (sales, growth trend, competition, rating, pricing, etc.). '推荐' = worth trying, '谨慎' = more research needed, '不推荐' = high risk at present.",
    zh: "综合以上所有数据维度（销量、增长趋势、竞争度、评分、定价区间等），AI 给出的最终选品建议。'推荐'代表值得尝试，'谨慎'代表需要更多调研，'不推荐'代表当前风险较高。",
  },
  "Risk Analysis": {
    en: "Summary of the main risk factors for this product, e.g. fierce competition, price wars, low brand trust, policy risk, seasonal fluctuations.",
    zh: "选择该产品可能面临的主要风险点总结，例如竞争激烈、价格战、品牌信任度低、政策风险、季节性波动等。",
  },

  // ---- Market Trends ----------------------------------------------------
  "Market Trends": {
    en: "Recent sales/trend chart for this category. Use to judge whether it's currently rising, stable, or declining. Positive values indicate month-over-month growth.",
    zh: "该品类近期的销量/热度走势图，用于判断当前处于上升期、平稳期还是下滑期。正值表示环比增长。",
  },
  "Market Size": {
    en: "Overall market volume tier for this category (Large / Medium / Small). Larger volume usually means higher demand but potentially fiercer competition.",
    zh: "该品类的整体市场体量等级（大/中/小）。体量越大通常意味着需求基数越高，但竞争也可能更激烈。",
  },
  "vs last month": {
    en: "Change compared to the same period last month. Positive = growth, negative = decline.",
    zh: "与上月同期对比的变化幅度。正值代表增长，负值代表下滑。",
  },
  "AI Estimated": {
    en: "This value was inferred by the AI model from available data and has not been directly verified against a live data source. For reference only.",
    zh: "该数值由 AI 模型基于已有数据推算得出，未经实际数据源直接核实，仅供参考。",
  },
  Verified: {
    en: "This value comes from a verified live data source and has been confirmed.",
    zh: "该数值来自实际数据源，经过核实确认。",
  },

  // ---- Listing Generator ------------------------------------------------
  "Listing Generator": {
    en: "Automatically generates titles, bullet points, and descriptions compliant with TikTok Shop standards. Each section can be copied independently.",
    zh: "根据产品信息自动生成符合 TikTok Shop 平台规范的标题、卖点和描述文案。每条内容均可独立复制使用。",
  },
  "SEO Title": {
    en: "A product title containing core keywords, optimised to improve ranking in platform search results. Recommended length: under 80 characters.",
    zh: "包含核心关键词的商品标题，优化后可提升在平台搜索结果中的曝光排名。建议控制在 80 字符以内。",
  },
  "5 Bullet Points": {
    en: "Five short selling-point descriptions highlighting the product's core strengths. Typically displayed above the fold on the product detail page — directly impacts conversion.",
    zh: "突出产品核心优势的五条简短卖点描述。通常用于商品详情页首屏，直接影响转化率。",
  },
  "Product Description": {
    en: "Body copy detailing the product's features, materials, and use cases. Include target audience and scenario descriptions to boost engagement.",
    zh: "详细介绍产品功能、材质、使用场景的正文文案。建议包含目标受众和使用场景描述以提升代入感。",
  },
  "Backend Keywords": {
    en: "Keywords not visible to shoppers but indexed by the platform's search algorithm. Properly filled backend keywords can significantly increase organic search exposure.",
    zh: "不面向消费者展示，但会被平台搜索算法收录的关键词。合理填写可显著提升商品的自然搜索曝光量。",
  },

  // ---- Charts -----------------------------------------------------------
  "Price Distribution": {
    en: "Distribution of similar products across different price ranges. Taller bars = more products in that price band. Use to identify mainstream pricing and price gaps.",
    zh: "该品类同类产品在不同价格区间的数量分布。柱形越高代表该价格段的产品越多，可用于判断主流定价带和价格空白区。",
  },
  "Top Sellers": {
    en: "Top-selling products in this category ranked by sales volume. Use to study benchmark pricing, ratings, and selling-point strategies.",
    zh: "该品类中按销量排序的头部产品排名。可用于参考标杆产品的定价、评分和卖点策略。",
  },
};

// ---------------------------------------------------------------------------
// Lookup helper
// ---------------------------------------------------------------------------

/** Fast lookup: MetricKey → LocalizedText. Returns undefined for unknown keys. */
export function getMetricExplanation(key: string): LocalizedText | undefined {
  return (GLOSSARY as Record<string, LocalizedText>)[key];
}

export default GLOSSARY;
