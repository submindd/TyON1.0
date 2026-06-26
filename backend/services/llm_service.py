"""LLM service using DeepSeek API (OpenAI-compatible interface).

Provides:
- ``analyze_product``   — product cleaning + market analysis (Task 1.3)
- ``generate_strategy`` — operational strategy from analysis results (Task 2.1)
"""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx
from pydantic import BaseModel, ValidationError

from core.config import settings
from schemas.report_schema import AnalyzeResponse, StrategyResponse

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
2. Compare it against competitor products and produce a market analysis.

CRITICAL RULES:
- Return ONLY a single valid JSON object. No markdown fences, no preamble, no epilogue.
- The JSON object must start with "{" and end with "}".
- Do NOT wrap your response in ```json ... ``` code blocks.
- Every string must be properly escaped (double quotes, not single quotes).
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
  "market_size": "大",
  "competition": "中",
  "growth_trend": "+23% vs last month",
  "is_estimated": true,
  "selling_points": ["point 1", "point 2", "point 3"],
  "pain_points": ["pain 1", "pain 2", "pain 3"],
  "differentiation_opportunities": ["diff 1", "diff 2", "diff 3"]
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
- market_size: "大" / "中" / "小" or short English description
- competition: "高" / "中" / "低"
- growth_trend: short string like "+23% vs last month" or "steady demand";
  if based on inference rather than real data, note that via is_estimated=true
- selling_points: 3-4 key selling points observed from top products
- pain_points: 3-4 common pain points inferred from product shortcomings or
  typical complaints in this category
- differentiation_opportunities: 3-4 actionable suggestions for a new product
  to stand out from the competition
"""

STRATEGY_SYSTEM_PROMPT = """\
You are a TikTok Shop operational strategist.
You will receive a product market analysis in JSON format.

Your task:
Generate actionable operational strategy recommendations for a seller considering
this product on TikTok Shop.

CRITICAL RULES:
- Return ONLY a single valid JSON object. No markdown fences, no preamble, no epilogue.
- The JSON object must start with "{" and end with "}".
- Do NOT wrap your response in ```json ... ``` code blocks.
- Every string must be properly escaped (double quotes, not single quotes).
- The response must conform to this exact structure:

{
  "target_audience": "description of the ideal customer demographic and interests",
  "content_ideas": ["idea 1", "idea 2", "idea 3"],
  "influencer_types": ["type 1", "type 2", "type 3"],
  "pricing_suggestion": "$39.99 - $59.99",
  "risk_analysis": "1-2 sentences describing the main risks",
  "recommendation": "推荐"
}

FIELD GUIDELINES:
- target_audience: 1-2 sentences describing who would buy this product
  (demographics, interests, use cases)
- content_ideas: 3-4 TikTok content/video ideas that would drive engagement
  for this product (e.g. "开箱视频", "场景化使用展示", "before/after对比")
- influencer_types: 2-3 types of TikTok creators who would be a good fit
  (e.g. "科技测评博主", "生活方式达人", "性价比推荐")
- pricing_suggestion: a price range string based on the current product price
  and competitor prices. Format like "$39.99 - $59.99" or "$14.90 - $24.90".
  Consider the opportunity_score and competition level when suggesting.
- risk_analysis: 1-2 sentences covering the biggest risk factors
  (e.g. market saturation, brand trust issues, price wars, platform policy changes)
- recommendation: MUST be exactly one of: "推荐" / "谨慎" / "不推荐"
  Choose based on the overall analysis. Add a short reason after the label.
  e.g. "推荐 - 市场需求大且竞争适中" or "谨慎 - 价格战激烈且利润空间有限"
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
