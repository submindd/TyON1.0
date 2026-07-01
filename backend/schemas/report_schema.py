"""Pydantic schemas for request/response validation.

Also holds the schemas used by ``llm_service`` for validating DeepSeek's
structured JSON output (analysis / strategy / listing).
"""

from enum import Enum

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# LocalizedText — unified bilingual type (TyON v1.1)
# ---------------------------------------------------------------------------
class LocalizedText(BaseModel):
    """A text value with English and Chinese variants."""
    en: str = ""
    zh: str = ""


# ---------------------------------------------------------------------------
# Recommendation — structured verdict (TyON v1.1 Phase 3)
# ---------------------------------------------------------------------------
class RecommendationStatus(str, Enum):
    RECOMMENDED = "recommended"
    CAUTIOUS = "cautious"
    NOT_RECOMMENDED = "not_recommended"


class RecommendationResult(BaseModel):
    """Machine-readable recommendation so the frontend never parses Chinese."""
    status: RecommendationStatus
    reason: LocalizedText


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
    """Structured output that ``analyze_product`` expects from the LLM.

    All text fields are bilingual ``LocalizedText`` so the frontend can
    render either language without re-fetching.
    """

    product: CleanedProduct
    opportunity_score: int = Field(ge=0, le=100)
    market_size: LocalizedText
    competition: LocalizedText
    growth_trend: LocalizedText
    is_estimated: bool = True
    selling_points: list[LocalizedText] = Field(min_length=1, max_length=6)
    pain_points: list[LocalizedText] = Field(min_length=1, max_length=6)
    differentiation_opportunities: list[LocalizedText] = Field(min_length=1, max_length=6)


# ---------------------------------------------------------------------------
# LLM strategy response (used by llm_service.generate_strategy)
# ---------------------------------------------------------------------------
class StrategyResponse(BaseModel):
    """Structured output that ``generate_strategy`` expects from the LLM.

    All text fields are bilingual ``LocalizedText``.
    ``recommendation`` uses a machine-readable enum so the frontend
    never parses Chinese to determine card colour.
    """

    target_audience: LocalizedText
    content_ideas: list[LocalizedText] = Field(min_length=1, max_length=6)
    influencer_types: list[LocalizedText] = Field(min_length=1, max_length=5)
    pricing_suggestion: LocalizedText
    risk_analysis: LocalizedText
    recommendation: RecommendationResult


# ---------------------------------------------------------------------------
# LLM listing response (used by llm_service.generate_listing)
# ---------------------------------------------------------------------------
class ListingResponse(BaseModel):
    """AI-generated bilingual product listing content.

    ``backend_keywords`` stays English-only because TikTok Shop's backend
    keyword field requires English.
    """

    seo_title: LocalizedText
    bullets: list[LocalizedText] = Field(min_length=5, max_length=5)
    description: LocalizedText
    backend_keywords: list[str] = Field(min_length=5, max_length=30)  # English only


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
    listing: ListingResponse | None = None  # None when listing generation is skipped


# ---------------------------------------------------------------------------
# API request schemas
# ---------------------------------------------------------------------------
class ResearchRequest(BaseModel):
    """POST /api/research request body."""

    keyword: str
    platform: str = "tiktok"
    country: str = "US"
