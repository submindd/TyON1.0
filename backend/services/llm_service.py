"""LLM service using DeepSeek API (OpenAI-compatible interface).

Provides:
- ``analyze_product``   — product cleaning + bilingual market analysis
- ``generate_strategy`` — bilingual operational strategy (structured recommendation)
- ``generate_listing``  — bilingual product listing content (SEO title, bullets, description)
"""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx
from pydantic import BaseModel, ValidationError

from core.config import settings
from schemas.report_schema import AnalyzeResponse, StrategyResponse, ListingResponse

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DEEPSEEK_BASE = "https://api.deepseek.com/v1"
DEEPSEEK_CHAT_URL = f"{DEEPSEEK_BASE}/chat/completions"
MODEL = "deepseek-chat"

MAX_RETRIES = 2  # 1 initial + 1 retry

# ---------------------------------------------------------------------------
# System prompts
# ---------------------------------------------------------------------------
ANALYSIS_SYSTEM_PROMPT = """\
You are a TikTok Shop e-commerce data analyst.
You will receive a JSON array of products scraped from TikTok Shop search results.

Your task:
1. Clean/correct the target product's fields (title, price, sold_count, rating, shop_name).
2. Compare it against competitor products and produce a bilingual market analysis.

CRITICAL RULES:
- Return ONLY a single valid JSON object. No markdown fences, no preamble, no epilogue.
- The JSON object must start with "{" and end with "}".
- Do NOT wrap your response in ```json ... ``` code blocks.
- Every string must be properly escaped (double quotes, not single quotes).
- ALL text analysis fields MUST be bilingual objects with "en" and "zh" keys.
- The response must conform to this exact structure:

{
  "product": {
    "title": "cleaned product title",
    "price": "$14.90",
    "sold_count": "33.8K sold",
    "rating": 4.5,
    "image_url": "",
    "shop_name": "Shop Name"
  },
  "opportunity_score": 75,
  "market_size": {"en": "Large", "zh": "Large market with high demand"},
  "competition": {"en": "Medium", "zh": "Moderate competition with room for new entrants"},
  "growth_trend": {"en": "+23% vs last month", "zh": "Steady upward trend in sales volume"},
  "is_estimated": true,
  "selling_points": [
    {"en": "High-quality sound with noise cancelling", "zh": "High-quality noise-cancelling audio"},
    {"en": "Long 40h battery life", "zh": "40-hour extended battery life"},
    {"en": "Affordable price under $20", "zh": "Great value under $20 price point"}
  ],
  "pain_points": [
    {"en": "Ear tips may not fit all users", "zh": "Ear tip sizing issues for some users"},
    {"en": "No wireless charging case", "zh": "Charging case lacks wireless charging"},
    {"en": "Limited color options", "zh": "Insufficient colour variety"}
  ],
  "differentiation_opportunities": [
    {"en": "Add wireless charging case as standard", "zh": "Bundle wireless charging case as standard"},
    {"en": "Offer 6+ colour variants", "zh": "Release 6+ colour options with matching cases"},
    {"en": "Include memory foam ear tips in box", "zh": "Include premium memory foam ear tips"}
  ]
}

FIELD GUIDELINES:
- product.title: fix typos, remove noise suffixes like " - TikTok Shop"
- product.price: normalise to "$XX.XX" format; if original is empty, estimate
  from similar products in the list
- product.sold_count: keep original format like "33.8K sold"; if empty, write ""
- product.rating: if null/None, estimate a reasonable value (3.5-4.8) based on
  sales volume and product type; set is_estimated=true when you estimate
- product.image_url / shop_name: keep original, empty string if missing
- opportunity_score (0-100): how good the market opportunity is for a new seller
  considering competition level, demand, price range, differentiation potential

BILINGUAL FIELD GUIDELINES (every analysis field below is {"en": "...", "zh": "..."}):
- market_size: describe the overall market volume tier in both languages;
  use descriptive phrases in zh (not single characters)
- competition: describe the competitive intensity in both languages;
  use descriptive phrases in zh (not single characters)
- growth_trend: describe the recent trend direction with a percentage estimate;
  if based on inference rather than real data, note that via is_estimated=true
- selling_points: 3-4 key selling points observed from top products — each bilingual
- pain_points: 3-4 common pain points inferred from product shortcomings or
  typical complaints in this category — each bilingual
- differentiation_opportunities: 3-4 actionable suggestions for a new product
  to stand out from the competition — each bilingual
"""

STRATEGY_SYSTEM_PROMPT = """\
You are a TikTok Shop operational strategist.
You will receive a product market analysis in JSON format.

Your task:
Generate actionable bilingual operational strategy recommendations for a seller
considering this product on TikTok Shop.

CRITICAL RULES:
- Return ONLY a single valid JSON object. No markdown fences, no preamble, no epilogue.
- The JSON object must start with "{" and end with "}".
- Do NOT wrap your response in ```json ... ``` code blocks.
- Every string must be properly escaped (double quotes, not single quotes).
- ALL text fields MUST be bilingual objects with "en" and "zh" keys.
- The recommendation MUST use the structured {status, reason} format.
- The response must conform to this exact structure:

{
  "target_audience": {
    "en": "Young professionals aged 22-35 who value convenience and audio quality for commuting and workouts",
    "zh": "Young professionals aged 22-35 who value portable audio for commuting and exercise"
  },
  "content_ideas": [
    {"en": "Unboxing video — first impressions of the compact design", "zh": "Unboxing video showcasing the compact build quality"},
    {"en": "Side-by-side sound quality comparison with premium brands", "zh": "Side-by-side audio quality test vs. premium competitors"},
    {"en": "Day-in-the-life: from gym to office with the earbuds", "zh": "Daily vlog: using the earbuds from workout to workday"}
  ],
  "influencer_types": [
    {"en": "Budget tech reviewers who focus on value-for-money gadgets", "zh": "Value-focused tech reviewers who cover budget-friendly gadgets"},
    {"en": "Lifestyle creators who share daily routines and productivity tips", "zh": "Lifestyle content creators who share daily routines and tips"},
    {"en": "Fitness creators who test audio gear during workouts", "zh": "Fitness influencers who test audio equipment during exercise"}
  ],
  "pricing_suggestion": {
    "en": "$14.90 - $24.90 — undercut premium brands while maintaining perceived quality through design",
    "zh": "$14.90 - $24.90 — price below premium brands while design conveys quality"
  },
  "risk_analysis": {
    "en": "The wireless earbuds market is highly saturated with strong brand loyalty. Price wars may erode margins below 15%. Platform policy changes on electronics certification could delay listing approval.",
    "zh": "The wireless earbuds category is saturated with high brand loyalty; price competition could push margins below 15%. Electronics certification policy changes may cause listing delays."
  },
  "recommendation": {
    "status": "recommended",
    "reason": {
      "en": "Strong market demand with clear differentiation opportunities through design and battery life",
      "zh": "Strong market demand with room to differentiate on design and battery performance"
    }
  }
}

FIELD GUIDELINES:
- target_audience: 1-2 sentences in each language describing who would buy this
  product (demographics, interests, use cases)
- content_ideas: 3-4 TikTok content/video ideas that would drive engagement
  for this product — each as {"en": ..., "zh": ...}
- influencer_types: 2-3 types of TikTok creators who would be a good fit
  — each as {"en": ..., "zh": ...}
- pricing_suggestion: price range with brief rationale in each language.
  Format the en/zh values to include the price range and a short reason.
  Consider the opportunity_score and competition level when suggesting.
- risk_analysis: 1-2 sentences in each language covering the biggest risk
  factors (e.g. market saturation, brand trust issues, price wars,
  platform policy changes)

RECOMMENDATION GUIDELINES (structured format):
- recommendation.status: MUST be exactly one of these three machine-readable values:
  "recommended" — the opportunity is strong; the seller should proceed
  "cautious"   — there are notable risks; the seller should research further
  "not_recommended" — the risks outweigh the opportunity
- recommendation.reason: a bilingual {"en": "...", "zh": "..."} object with
  1-2 sentences explaining why this status was chosen
"""

LISTING_SYSTEM_PROMPT = """\
You are a TikTok Shop product listing copywriter.
You will receive a product market analysis and strategy in JSON format.

Your task:
Write a bilingual product listing (SEO title, 5 bullet points, description,
backend keywords) for this product on TikTok Shop.

CRITICAL RULES:
- Return ONLY a single valid JSON object. No markdown fences, no preamble, no epilogue.
- The JSON object must start with "{" and end with "}".
- Do NOT wrap your response in ```json ... ``` code blocks.
- Every string must be properly escaped (double quotes, not single quotes).
- The SEO title, bullets, and description MUST be bilingual {"en": "...", "zh": "..."}.
- backend_keywords is English-only (platform requirement).
- The response must conform to this exact structure:

{
  "seo_title": {
    "en": "Best Wireless Bluetooth Earbuds — Active Noise Cancelling, 40H Battery — TikTok Shop",
    "zh": "Best Wireless Bluetooth Earbuds — Active Noise Cancelling, 40-Hour Battery"
  },
  "bullets": [
    {"en": "Active noise cancelling blocks 95% of ambient sound for immersive listening", "zh": "Active noise cancellation technology blocks 95% of ambient noise"},
    {"en": "40-hour total battery life with USB-C quick charge (10min = 2hrs)", "zh": "40-hour total battery life; 10-minute quick charge gives 2 hours of playback"},
    {"en": "IPX6 waterproof — sweat and rain resistant for workouts and outdoors", "zh": "IPX6 waterproof rating — sweat-proof and rain-resistant for sports and outdoor use"},
    {"en": "Bluetooth 6.0 with dual-device connection — seamless switching", "zh": "Bluetooth 6.0 with dual-device pairing — switch between phone and laptop instantly"},
    {"en": "Ergonomic in-ear design with 3 sizes of silicone tips for all-day comfort", "zh": "Ergonomic in-ear fit with 3 silicone tip sizes for all-day wearing comfort"}
  ],
  "description": {
    "en": "Experience premium sound without the premium price tag. These wireless earbuds combine active noise cancelling, IPX6 waterproofing, and an ultra-light ergonomic design into a compact package that goes everywhere you do. Whether you are commuting, working out, or taking calls, enjoy crystal-clear audio and all-day comfort. Backed by thousands of 5-star reviews on TikTok Shop — join the community of happy listeners today.",
    "zh": "Experience premium-level sound at an accessible price. These wireless earbuds feature active noise cancellation, IPX6 waterproofing, and an ultra-light ergonomic design — perfect for commuting, workouts, and calls. Crystal-clear audio paired with all-day wearing comfort. Trusted by thousands of TikTok Shop buyers — join the community today."
  },
  "backend_keywords": [
    "wireless earbuds",
    "noise cancelling",
    "bluetooth earphones",
    "ipx6 waterproof",
    "long battery life",
    "tiktok shop",
    "best seller",
    "trending",
    "affordable",
    "premium audio"
  ]
}

FIELD GUIDELINES:
- seo_title: a bilingual SEO-optimised title under 160 characters in each language.
  Include the core product type and 2-3 key features. End with "— TikTok Shop"
  in English.
- bullets: exactly 5 bilingual bullet points. Each bullet highlights one key
  feature or benefit. No emoji — the frontend handles visual formatting.
  The zh text should feel natural to a Chinese reader, not a literal translation.
- description: a bilingual 3-5 sentence product description that tells a story:
  what problem it solves, who it is for, what makes it special, social proof,
  and a call to action. The zh version should read naturally in Chinese.
- backend_keywords: English only — 10-20 string array. Each keyword is a
  single term or short phrase (e.g. "wireless earbuds", not a sentence).
  These are for platform search indexing, not consumer display. No commas —
  each entry is a standalone keyword string.
"""

RETRY_SUFFIX = """

---

Your previous response could not be parsed as valid JSON. This is a strict requirement.

Please respond with ONLY a single JSON object — no markdown fences, no extra text.
The response must start with "{" and end with "}".

Error details: {error}
"""


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------
class LLMParseError(Exception):
    """Raised when the LLM response cannot be parsed as valid JSON after retries."""


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
def _strip_markdown_fence(text: str) -> str:
    """Remove ```json ... ``` fence if the model ignored instructions."""
    t = text.strip()
    if t.startswith("```"):
        t = t.split("\n", 1)[-1] if "\n" in t else t[3:]
        if t.rstrip().endswith("```"):
            t = t.rstrip()[:-3]
    return t.strip()


async def _call_deepseek(
    messages: list[dict[str, str]],
    temperature: float = 0.3,
    max_tokens: int = 4096,
) -> str:
    """Send a chat-completion request to DeepSeek and return ``content``."""
    headers = {
        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(DEEPSEEK_CHAT_URL, json=payload, headers=headers)

    if resp.status_code != 200:
        raise LLMParseError(
            f"DeepSeek API returned HTTP {resp.status_code}: {resp.text[:500]}"
        )

    body = resp.json()
    choices = body.get("choices", [])
    if not choices:
        raise LLMParseError(
            f"DeepSeek returned no choices: {json.dumps(body, ensure_ascii=False)[:500]}"
        )

    content: str = choices[0].get("message", {}).get("content", "")
    if not content:
        raise LLMParseError("DeepSeek returned an empty message content")
    return content


async def _call_llm_with_schema(
    messages: list[dict[str, str]],
    schema_cls: type[BaseModel],
    label: str = "LLM",
) -> dict[str, Any]:
    """Call DeepSeek with retry, parse JSON, validate against *schema_cls*.

    Parameters
    ----------
    messages:
        Initial ``[system, user]`` messages.  Retry turns will be appended.
    schema_cls:
        A Pydantic ``BaseModel`` subclass used for ``model_validate()``.
    label:
        Human-readable label for log messages.

    Returns
    -------
    dict — ``schema_cls.model_dump()`` on success.

    Raises
    ------
    LLMParseError
        When JSON parsing or Pydantic validation fails after all retries.
    """
    last_content = ""

    for attempt in range(1, MAX_RETRIES + 1):
        logger.info("%s — DeepSeek attempt %d/%d", label, attempt, MAX_RETRIES)

        try:
            content = await _call_deepseek(messages)
            last_content = content

            # Parse & validate
            cleaned = _strip_markdown_fence(content)
            data = json.loads(cleaned)
            result = schema_cls.model_validate(data)

            logger.info("%s — success on attempt %d", label, attempt)
            return result.model_dump()

        except json.JSONDecodeError as exc:
            logger.warning(
                "%s — JSON parse error on attempt %d: %s",
                label, attempt, str(exc)[:200],
            )
            if attempt < MAX_RETRIES:
                messages.append({"role": "assistant", "content": content})
                messages.append({
                    "role": "user",
                    "content": RETRY_SUFFIX.format(error=str(exc)),
                })

        except ValidationError as exc:
            logger.warning(
                "%s — Pydantic validation error on attempt %d: %s",
                label, attempt, str(exc)[:300],
            )
            if attempt < MAX_RETRIES:
                messages.append({"role": "assistant", "content": content})
                messages.append({
                    "role": "user",
                    "content": RETRY_SUFFIX.format(
                        error=f"Schema validation errors: {exc.errors()}"
                    ),
                })

    raise LLMParseError(
        f"[{label}] Failed to parse LLM response after {MAX_RETRIES} attempts. "
        f"Last raw content (first 500 chars): {last_content[:500]}"
    )


def _build_analysis_user_prompt(
    raw_products: list[dict[str, Any]],
    target_idx: int = 0,
) -> str:
    """Assemble the user prompt with product data for ``analyze_product``."""
    slim: list[dict[str, Any]] = []
    for i, p in enumerate(raw_products):
        tag = "TARGET" if i == target_idx else f"competitor_{i}"
        slim.append({
            "_index": i,
            "_role": tag,
            "title": p.get("title"),
            "price": p.get("price"),
            "sold_count": p.get("sold_count"),
            "rating": p.get("rating"),
            "image_url": p.get("image_url", ""),
            "shop_name": p.get("shop_name"),
        })

    payload = json.dumps(slim, ensure_ascii=False, indent=2)

    return f"""Analyze the following TikTok Shop search results.

The product at index {target_idx} is the TARGET product you need to clean and analyse.
All other products are competitors for comparison.

PRODUCT DATA:
{payload}

Return the analysis as a single JSON object (no markdown wrapping)."""


def _build_strategy_user_prompt(analysis_result: dict[str, Any]) -> str:
    """Assemble the user prompt with analysis data for ``generate_strategy``."""
    # Keep only the strategy-relevant fields to save tokens
    slim = {
        "product": analysis_result.get("product", {}),
        "opportunity_score": analysis_result.get("opportunity_score"),
        "market_size": analysis_result.get("market_size"),
        "competition": analysis_result.get("competition"),
        "growth_trend": analysis_result.get("growth_trend"),
        "is_estimated": analysis_result.get("is_estimated"),
        "selling_points": analysis_result.get("selling_points", []),
        "pain_points": analysis_result.get("pain_points", []),
        "differentiation_opportunities": analysis_result.get(
            "differentiation_opportunities", []
        ),
    }

    payload = json.dumps(slim, ensure_ascii=False, indent=2)

    return f"""Based on the following product market analysis, generate an operational
strategy for selling this product on TikTok Shop.

ANALYSIS:
{payload}

Return the strategy as a single JSON object (no markdown wrapping)."""


def _build_listing_user_prompt(
    analysis_result: dict[str, Any],
    strategy_result: dict[str, Any],
) -> str:
    """Assemble the user prompt with analysis + strategy for ``generate_listing``."""
    slim = {
        "product": analysis_result.get("product", {}),
        "opportunity_score": analysis_result.get("opportunity_score"),
        "selling_points": analysis_result.get("selling_points", []),
        "differentiation_opportunities": analysis_result.get(
            "differentiation_opportunities", []
        ),
        "target_audience": strategy_result.get("target_audience", {}),
        "pricing_suggestion": strategy_result.get("pricing_suggestion", {}),
    }

    payload = json.dumps(slim, ensure_ascii=False, indent=2)

    return f"""Write a bilingual TikTok Shop product listing based on the following
product analysis and strategy.

PRODUCT & STRATEGY DATA:
{payload}

Return the listing as a single JSON object (no markdown wrapping)."""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
async def analyze_product(
    raw_products: list[dict[str, Any]],
    target_product_index: int = 0,
) -> dict[str, Any]:
    """Analyze a TikTok Shop product against its competitors via DeepSeek.

    Parameters
    ----------
    raw_products:
        List of product dicts as returned by :func:`scrape_service.search_products`.
        Index 0 is treated as the target; the rest are competitors.
    target_product_index:
        Which entry in *raw_products* is the target (default 0).

    Returns
    -------
    dict
        Validated analysis matching :class:`schemas.report_schema.AnalyzeResponse`.

    Raises
    ------
    LLMParseError
        If the LLM fails to produce valid JSON after all retries.
    """
    if not raw_products:
        raise ValueError("raw_products must not be empty")

    user_prompt = _build_analysis_user_prompt(raw_products, target_product_index)

    messages: list[dict[str, str]] = [
        {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    return await _call_llm_with_schema(
        messages, AnalyzeResponse, label="analyze_product"
    )


async def generate_strategy(analysis_result: dict[str, Any]) -> dict[str, Any]:
    """Generate operational strategy from a product market analysis.

    Parameters
    ----------
    analysis_result:
        The dict returned by :func:`analyze_product`.

    Returns
    -------
    dict
        Validated strategy matching :class:`schemas.report_schema.StrategyResponse`.
        Keys: ``target_audience``, ``content_ideas``, ``influencer_types``,
        ``pricing_suggestion``, ``risk_analysis``, ``recommendation``.

    Raises
    ------
    LLMParseError
        If the LLM fails to produce valid JSON after all retries.
    """
    user_prompt = _build_strategy_user_prompt(analysis_result)

    messages: list[dict[str, str]] = [
        {"role": "system", "content": STRATEGY_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    return await _call_llm_with_schema(
        messages, StrategyResponse, label="generate_strategy"
    )


async def generate_listing(
    analysis_result: dict[str, Any],
    strategy_result: dict[str, Any],
) -> dict[str, Any]:
    """Generate a bilingual product listing from analysis + strategy.

    Parameters
    ----------
    analysis_result:
        The dict returned by :func:`analyze_product`.
    strategy_result:
        The dict returned by :func:`generate_strategy`.

    Returns
    -------
    dict
        Validated listing matching :class:`schemas.report_schema.ListingResponse`.
        Keys: ``seo_title``, ``bullets``, ``description``, ``backend_keywords``.

    Raises
    ------
    LLMParseError
        If the LLM fails to produce valid JSON after all retries.
    """
    user_prompt = _build_listing_user_prompt(analysis_result, strategy_result)

    messages: list[dict[str, str]] = [
        {"role": "system", "content": LISTING_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    return await _call_llm_with_schema(
        messages, ListingResponse, label="generate_listing"
    )
