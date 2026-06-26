"""Pydantic schemas for request/response validation.

Also holds the schema used by ``llm_service.analyze_product`` for validating
DeepSeek's structured JSON output.
"""

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# LLM analysis response (used by llm_service.analyze_product)
# ---------------------------------------------------------------------------
class CleanedProduct(BaseModel):
    """A single product with cleaned/corrected fields from the LLM."""

    title: str
    price: str = ""  # e.g. "$14.90" or "14.90"
    sold_count: str = ""  # e.g. "33.8K sold"
    rating: float | None = None
    image_url: str = ""
    shop_name: str = ""


class AnalyzeResponse(BaseModel):
    """Structured output that ``analyze_product`` expects from the LLM."""

    product: CleanedProduct
    opportunity_score: int = Field(ge=0, le=100)
    market_size: str  # "大" / "中" / "小" or short English description
    competition: str  # "高" / "中" / "低"
    growth_trend: str  # e.g. "+23% vs last month"
    is_estimated: bool = True
    selling_points: list[str] = Field(min_length=1, max_length=6)
    pain_points: list[str] = Field(min_length=1, max_length=6)
    differentiation_opportunities: list[str] = Field(min_length=1, max_length=6)


# ---------------------------------------------------------------------------
# LLM strategy response (used by llm_service.generate_strategy)
# ---------------------------------------------------------------------------
class StrategyResponse(BaseModel):
    """Structured output that ``generate_strategy`` expects from the LLM."""

    target_audience: str
    content_ideas: list[str] = Field(min_length=1, max_length=6)
    influencer_types: list[str] = Field(min_length=1, max_length=5)
    pricing_suggestion: str
    risk_analysis: str
    recommendation: str  # "推荐" / "谨慎" / "不推荐"


# ---------------------------------------------------------------------------
# API response schemas
# ---------------------------------------------------------------------------
class ResearchProduct(BaseModel):
    """A product item returned by the scrape layer (used in /api/research)."""

    title: str | None = None
    price: float | None = None
    sold_count: str | None = None
    rating: float | None = None
    image_url: str | None = None
    product_url: str | None = None
    shop_name: str | None = None
    data_source: str = "live"


class ResearchResponse(BaseModel):
    """POST /api/research response body."""

    products: list[ResearchProduct]
    analysis: AnalyzeResponse
    strategy: StrategyResponse


# ---------------------------------------------------------------------------
# API request schemas
# ---------------------------------------------------------------------------
class ResearchRequest(BaseModel):
    """POST /api/research request body."""

    keyword: str
    platform: str = "tiktok"
    country: str = "US"


# ---------------------------------------------------------------------------
# TODO: API request/response schemas (future use)
# ---------------------------------------------------------------------------
# TODO: Define ReportCreate schema (source_url: str)
# TODO: Define ReportResponse schema (id, title, content, source_url, created_at)
# TODO: Define ScrapeRequest schema (url: str)
