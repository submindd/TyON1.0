/**
 * Metric Glossary — unified dictionary of metric explanations.
 *
 * Every metric that appears on the Analysis / Report pages has an entry here.
 * In Chinese mode, a small (?) tooltip next to the label shows the explanation.
 *
 * Keys use English labels as identifiers (case-sensitive match to the UI text).
 * The explanations are in Chinese because English-speaking users don't need them;
 * the tooltip only renders when ``locale === "zh"``.
 */

export interface MetricEntry {
  /** The exact English label as it appears in the UI. */
  key: string;
  /** Short label for the tooltip trigger (shown when collapsed). */
  shortLabel: string;
  /** Full Chinese explanation — 1–2 sentences with reference ranges. */
  zhExplanation: string;
}

const GLOSSARY: MetricEntry[] = [
  // ---- Radar dimensions ------------------------------------------------
  {
    key: "Demand",
    shortLabel: "需求度",
    zhExplanation:
      "反映该品类的搜索量和购买意愿，数值越高代表市场需求越旺盛。该维度与机会分数正相关。",
  },
  {
    key: "Growth",
    shortLabel: "增长率",
    zhExplanation:
      "反映该品类近期销量/搜索趋势的变化方向，数值越高代表上升趋势越明显。该维度与机会分数正相关。",
  },
  {
    key: "Competition",
    shortLabel: "竞争友好度",
    zhExplanation:
      "反映该品类的竞争环境——数值越高代表竞争越温和、新手介入难度越低。该维度与机会分数正相关（高机会分对应低竞争度）。",
  },
  {
    key: "Saturation",
    shortLabel: "市场空间",
    zhExplanation:
      "反映该细分品类的差异化空间——数值越高代表同质化程度越低、可操作空间越大。该维度与机会分数正相关。",
  },
  {
    key: "Profit",
    shortLabel: "利润空间",
    zhExplanation:
      "综合该品类的成本结构和定价区间估算的潜在利润率，数值越高代表盈利空间越大。该维度与机会分数正相关。",
  },

  // ---- Opportunity Score ------------------------------------------------
  {
    key: "Opportunity Score",
    shortLabel: "机会分数",
    zhExplanation:
      "综合衡量该产品的市场潜力，由销量（0–40分）、评分（0–30分）、价格竞争力（0–30分）加权计算得出。70分以上为高机会（绿色），50–69分为中等机会（黄色），50分以下建议谨慎。",
  },

  // ---- Stats -----------------------------------------------------------
  {
    key: "Avg Price",
    shortLabel: "均价",
    zhExplanation:
      "该关键词下所有同类产品的平均售价（USD），可用于快速判断你的定价是否有竞争力。",
  },
  {
    key: "Avg Rating",
    shortLabel: "均分",
    zhExplanation:
      "该关键词下所有同类产品的平均评分（5分制），可用于判断该品类的整体口碑水平。",
  },
  {
    key: "Total Sold",
    shortLabel: "总销量",
    zhExplanation:
      "该关键词下所有同类产品的合计销量，反映该品类的整体市场规模。数值越大代表需求越旺盛，但通常竞争也更激烈。",
  },

  // ---- Competitor Table -------------------------------------------------
  {
    key: "Top Competitors",
    shortLabel: "主要竞品",
    zhExplanation:
      "按销量/热度排序的同类竞争产品列表。每个竞品的机会分数（Score）与主产品采用同一加权公式计算，可直接横向对比。",
  },
  {
    key: "Score",
    shortLabel: "机会分数",
    zhExplanation:
      "与该页主产品采用完全相同的加权公式（销量×40% + 评分×30% + 价格竞争力×30%）计算，可直接横向对比各产品的市场机会大小。",
  },

  // ---- AI Insights ------------------------------------------------------
  {
    key: "AI Key Insights",
    shortLabel: "AI 关键洞察",
    zhExplanation:
      "基于商品评论、标题和属性数据，由 AI 自动提取和分析生成的洞察结果。",
  },
  {
    key: "Selling Points",
    shortLabel: "卖点",
    zhExplanation:
      "消费者认可的产品核心优势，通常来源于高分评价中的高频关键词提取。可作为产品文案和推广素材的参考。",
  },
  {
    key: "Pain Points",
    shortLabel: "痛点",
    zhExplanation:
      "消费者反馈中的不满和抱怨，通常来源于差评中的关键词提取。可作为产品改进方向的参考依据。",
  },
  {
    key: "Differentiation Opportunities",
    shortLabel: "差异化机会",
    zhExplanation:
      "基于现有竞品的不足之处，AI 推测出的潜在改进空间或独特的卖点切入点。可用作选品差异化策略的参考。",
  },

  // ---- AI Strategy ------------------------------------------------------
  {
    key: "AI Operation Suggestions",
    shortLabel: "AI 运营建议",
    zhExplanation:
      "基于该品类的市场特征和竞品数据，AI 生成的具体推广和运营策略建议。",
  },
  {
    key: "Target Audience",
    shortLabel: "目标受众",
    zhExplanation:
      "根据产品特性和同类购买人群画像，AI 推测出的核心消费群体描述。可用于指导广告投放和内容定位。",
  },
  {
    key: "Content Ideas",
    shortLabel: "内容创意",
    zhExplanation:
      "适合该产品在 TikTok 等平台进行内容营销的拍摄/选题方向建议，直接可用于内容团队的拍摄脚本参考。",
  },
  {
    key: "Influencer Types",
    shortLabel: "达人类型",
    zhExplanation:
      "适合推广该产品的网红/达人画像建议，用于指导达人合作筛选和投放策略。",
  },
  {
    key: "Suggested Pricing",
    shortLabel: "建议定价",
    zhExplanation:
      "根据同类竞品的实际定价区间和成本结构，AI 给出的参考定价范围。可作为上架定价的起点参考。",
  },

  // ---- Recommendation ---------------------------------------------------
  {
    key: "AI Recommendation",
    shortLabel: "AI 推荐结论",
    zhExplanation:
      "综合以上所有数据维度（销量、增长趋势、竞争度、评分、定价区间等），AI 给出的最终选品建议。'推荐'代表值得尝试，'谨慎'代表需要更多调研，'不推荐'代表当前风险较高。",
  },
  {
    key: "Risk Analysis",
    shortLabel: "风险分析",
    zhExplanation:
      "选择该产品可能面临的主要风险点总结，例如竞争激烈、价格战、品牌信任度低、政策风险、季节性波动等。",
  },

  // ---- Market Trends ----------------------------------------------------
  {
    key: "Market Trends",
    shortLabel: "市场趋势",
    zhExplanation:
      "该品类近期的销量/热度走势图，用于判断当前处于上升期、平稳期还是下滑期。正值表示环比增长。",
  },
  {
    key: "Market Size",
    shortLabel: "市场规模",
    zhExplanation:
      "该品类的整体市场体量等级（大/中/小）。体量越大通常意味着需求基数越高，但竞争也可能更激烈。",
  },
  {
    key: "vs last month",
    shortLabel: "环比",
    zhExplanation:
      "与上月同期对比的变化幅度。正值代表增长，负值代表下滑。",
  },
  {
    key: "AI Estimated",
    shortLabel: "AI 估算",
    zhExplanation:
      "该数值由 AI 模型基于已有数据推算得出，未经实际数据源直接核实，仅供参考。",
  },
  {
    key: "Verified",
    shortLabel: "已验证",
    zhExplanation:
      "该数值来自实际数据源，经过核实确认。",
  },

  // ---- Listing Generator ------------------------------------------------
  {
    key: "Listing Generator",
    shortLabel: "商品文案生成器",
    zhExplanation:
      "根据产品信息自动生成符合 TikTok Shop 平台规范的标题、卖点和描述文案。每条内容均可独立复制使用。",
  },
  {
    key: "SEO Title",
    shortLabel: "SEO 标题",
    zhExplanation:
      "包含核心关键词的商品标题，优化后可提升在平台搜索结果中的曝光排名。建议控制在 80 字符以内。",
  },
  {
    key: "5 Bullet Points",
    shortLabel: "五点卖点",
    zhExplanation:
      "突出产品核心优势的五条简短卖点描述。通常用于商品详情页首屏，直接影响转化率。",
  },
  {
    key: "Product Description",
    shortLabel: "商品描述",
    zhExplanation:
      "详细介绍产品功能、材质、使用场景的正文文案。建议包含目标受众和使用场景描述以提升代入感。",
  },
  {
    key: "Backend Keywords",
    shortLabel: "后台关键词",
    zhExplanation:
      "不面向消费者展示，但会被平台搜索算法收录的关键词。合理填写可显著提升商品的自然搜索曝光量。",
  },

  // ---- Charts -----------------------------------------------------------
  {
    key: "Price Distribution",
    shortLabel: "价格分布",
    zhExplanation:
      "该品类同类产品在不同价格区间的数量分布。柱形越高代表该价格段的产品越多，可用于判断主流定价带和价格空白区。",
  },
  {
    key: "Top Sellers",
    shortLabel: "热销榜",
    zhExplanation:
      "该品类中按销量排序的头部产品排名。可用于参考标杆产品的定价、评分和卖点策略。",
  },
];

/** Fast lookup: key → MetricEntry */
const GLOSSARY_MAP = new Map<string, MetricEntry>(
  GLOSSARY.map((e) => [e.key, e]),
);

export function getMetricExplanation(key: string): MetricEntry | undefined {
  return GLOSSARY_MAP.get(key);
}

export default GLOSSARY;
