import type { ResearchResponse } from "@/types/report";

export const MOCK_REPORT: ResearchResponse & { platform: string; country: string } = {
  platform: "tiktok",
  country: "US",

  products: [
    {
      title: "Ultimate Portable Blender! USB Rechargeable & Compact for Smoothies On-The-Go",
      price: 18.06,
      sold_count: "71.1K sold",
      rating: 4.4,
      image_url: "",
      product_url: "https://shop.tiktok.com/us/k/ultimate-portable-blender",
      shop_name: "UltimateBlend",
      data_source: "seed",
    },
    {
      title: "TikTok Top Seller Digital Multimode Juicer Blender",
      price: 7.01,
      sold_count: "5.0K sold",
      rating: 4.1,
      image_url: "",
      product_url: "https://shop.tiktok.com/us/k/ultimate-portable-blender",
      shop_name: "DigitalJuice",
      data_source: "seed",
    },
    {
      title: "Ultimate Portable Blender 5000ml Version",
      price: 18.72,
      sold_count: "224 sold",
      rating: 4.0,
      image_url: "",
      product_url: "https://shop.tiktok.com/us/k/ultimate-portable-blender",
      shop_name: "UltimateBlend",
      data_source: "seed",
    },
    {
      title: "Easy-Clean Mini Blender Juicer 2-in-1",
      price: null,
      sold_count: null,
      rating: 3.8,
      image_url: "",
      product_url: "https://shop.tiktok.com/us/k/personal-blender-portable",
      shop_name: "EasyKitchen",
      data_source: "seed",
    },
    {
      title: "Compact Portable Blender for Smoothies & Baby Food",
      price: null,
      sold_count: null,
      rating: 4.2,
      image_url: "",
      product_url: "https://shop.tiktok.com/us/k/personal-blender-portable",
      shop_name: "BabyBlend",
      data_source: "seed",
    },
  ],

  analysis: {
    product: {
      title: "Ultimate Portable Blender USB Rechargeable Compact for Smoothies On-The-Go",
      price: "$18.06",
      sold_count: "71.1K sold",
      rating: 4.4,
      image_url: "",
      shop_name: "UltimateBlend",
    },
    opportunity_score: 82,
    market_size: { en: "Large", zh: "大" },
    competition: { en: "Medium", zh: "中" },
    growth_trend: { en: "+28% vs last month", zh: "+28% 环比增长" },
    is_estimated: true,
    selling_points: [
      { en: "USB rechargeable — convenient for office, travel, and outdoors", zh: "USB充电 — 适合办公室、旅行和户外使用" },
      { en: "Compact and lightweight design fits in most cup holders", zh: "小巧轻便，可放入大多数杯架" },
      { en: "Strong motor handles frozen fruit and ice with ease", zh: "强劲电机轻松处理冷冻水果和冰块" },
      { en: "71.1K units sold indicates strong market validation", zh: "71.1K销量证明市场认可度高" },
    ],
    pain_points: [
      { en: "Battery life may degrade after 6 months of heavy use", zh: "重度使用6个月后电池续航可能下降" },
      { en: "Cleaning hard-to-reach blade areas is time-consuming", zh: "刀片区域难以彻底清洁" },
      { en: "5000ml version cannibalizes the standard size market", zh: "5000ml版本蚕食标准尺寸市场" },
      { en: "No temperature control — cannot make hot soups", zh: "无温控功能 — 无法制作热汤" },
    ],
    differentiation_opportunities: [
      { en: "Add a self-cleaning mode with a single-button rinse cycle", zh: "增加一键自清洁模式" },
      { en: "Include a thermal sleeve for making both hot and cold blends", zh: "附带保温套，支持冷热双模式" },
      { en: "Bundle with a travel lid and carry strap for gym-goers", zh: "附赠旅行盖和便携带，瞄准健身人群" },
      { en: "Launch a mini 300ml version for single-serve protein shakes", zh: "推出300ml迷你版，主打单人蛋白奶昔场景" },
    ],
  },

  strategy: {
    target_audience: {
      en: "Health-conscious millennials and Gen Z, fitness enthusiasts, busy professionals seeking quick homemade smoothies, and parents preparing baby food on the go",
      zh: "注重健康的千禧一代和Z世代、健身爱好者、追求快速自制奶昔的忙碌职场人，以及需要便携制作婴儿辅食的父母",
    },
    content_ideas: [
      { en: "Morning routine ASMR: blend a smoothie in 30 seconds flat", zh: "晨间ASMR：30秒快速制作奶昔" },
      { en: "Side-by-side durability test: drop test vs. premium blenders", zh: "耐用性横评：跌落测试对比高端搅拌机" },
      { en: "5 healthy smoothie recipes under $3 per serving", zh: "5款健康奶昔食谱，每份不到$3" },
      { en: "Travel vlog: using the blender in a hotel room, car, and office", zh: "旅行vlog：在酒店、车内、办公室使用搅拌机" },
    ],
    influencer_types: [
      { en: "Fitness & nutrition creators", zh: "健身/减脂博主" },
      { en: "Busy mom & parenting lifestyle", zh: "宝妈生活博主" },
      { en: "Budget kitchen gadget reviewers", zh: "厨房好物推荐博主" },
    ],
    pricing_suggestion: {
      en: "$16.99 – $22.99",
      zh: "$16.99 – $22.99",
    },
    risk_analysis: {
      en: "Market has a clear leader at 71K sales creating a high entry barrier; USB-rechargeable segment is prone to battery-quality complaints which could hurt ratings. Recommend differentiating on durability and self-cleaning features to justify a premium price tier.",
      zh: "市场存在71K销量的明显领导者，进入壁垒较高；USB充电品类易引发电池质量投诉，可能影响评分。建议以耐用性和自清洁功能为差异化卖点，支撑中高端定价。",
    },
    recommendation: {
      status: "recommended" as const,
      reason: {
        en: "Strong demand with clear growth trend; USB-rechargeable positioning is precise; suggest strengthening battery life and cleaning experience",
        zh: "Strong market demand with clear upward trend; USB-charging differentiation is well-positioned; recommend enhancing battery durability and self-cleaning features",
      },
    },
  },
  listing: {
    seo_title: { en: "Portable USB Blender — Rechargeable Smoothie Maker", zh: "Portable USB Blender — Rechargeable Smoothie Maker" },
    bullets: [
      { en: "USB rechargeable — blend anywhere, no outlet needed", zh: "USB rechargeable — blend anytime, anywhere without a power outlet" },
      { en: "Compact design fits in cup holders and bags", zh: "Compact and portable, fits in most cup holders and bags" },
      { en: "Powerful motor handles ice and frozen fruit", zh: "Powerful motor easily crushes ice and frozen fruit" },
      { en: "Easy one-button operation with self-cleaning mode", zh: "Simple one-touch operation with self-cleaning function" },
      { en: "BPA-free Tritan material — safe and durable", zh: "BPA-free Tritan material — food-grade safety and durability" },
    ],
    description: {
      en: "Make fresh smoothies anywhere with this USB-rechargeable portable blender. Powerful enough for ice and frozen fruit, compact enough to take to the office, gym, or on the road. One-button simplicity and easy cleaning make it a daily essential.",
      zh: "Make fresh smoothies anytime, anywhere with this USB-rechargeable portable blender. Powerful enough for ice and frozen fruit, yet compact for the office, gym, or travel. Simple one-touch operation and easy cleaning make it a daily essential.",
    },
    backend_keywords: ["portable blender", "usb rechargeable", "smoothie maker", "mini blender", "tiktok shop", "best seller", "travel", "fitness"],
  },
};
