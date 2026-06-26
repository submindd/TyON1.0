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
    market_size: "大",
    competition: "中",
    growth_trend: "+28% vs last month",
    is_estimated: true,
    selling_points: [
      "USB rechargeable — convenient for office, travel, and outdoors",
      "Compact and lightweight design fits in most cup holders",
      "Strong motor handles frozen fruit and ice with ease",
      "71.1K units sold indicates strong market validation",
    ],
    pain_points: [
      "Battery life may degrade after 6 months of heavy use",
      "Cleaning hard-to-reach blade areas is time-consuming",
      "5000ml version cannibalizes the standard size market",
      "No temperature control — cannot make hot soups",
    ],
    differentiation_opportunities: [
      "Add a self-cleaning mode with a single-button rinse cycle",
      "Include a thermal sleeve for making both hot and cold blends",
      "Bundle with a travel lid and carry strap for gym-goers",
      "Launch a mini 300ml version for single-serve protein shakes",
    ],
  },

  strategy: {
    target_audience:
      "Health-conscious millennials and Gen Z, fitness enthusiasts, busy professionals seeking quick homemade smoothies, and parents preparing baby food on the go",
    content_ideas: [
      "Morning routine ASMR: blend a smoothie in 30 seconds flat",
      "Side-by-side durability test: drop test vs. premium blenders",
      "5 healthy smoothie recipes under $3 per serving",
      "Travel vlog: using the blender in a hotel room, car, and office",
    ],
    influencer_types: [
      "Fitness & nutrition creators (健身/减脂博主)",
      "Busy mom & parenting lifestyle (宝妈生活)",
      "Budget kitchen gadget reviewers (厨房好物推荐)",
    ],
    pricing_suggestion: "$16.99 – $22.99",
    risk_analysis:
      "Market has a clear leader at 71K sales creating a high entry barrier; USB-rechargeable segment is prone to battery-quality complaints which could hurt ratings. Recommend differentiating on durability and self-cleaning features to justify a premium price tier.",
    recommendation: "推荐 — 市场需求旺盛且增长趋势明显，USB充电差异化定位精准，建议强化电池寿命和清洁体验",
  },
};
