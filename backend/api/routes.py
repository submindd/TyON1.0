"""API route definitions."""

import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException

from schemas.report_schema import ResearchRequest, ResearchResponse, ResearchProduct
from services.scrape_service import ScrapeError, _parse_seed_price
from services.llm_service import LLMParseError
from services.report_service import get_or_create_report

_SEED_DATA_PATH = Path(__file__).resolve().parent.parent / "seed_data" / "seed_data.json"

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
async def health():
    """Health-check endpoint."""
    return {"status": "ok"}


@router.get("/products")
async def list_products():
    """Return all products from seed data, keyed by category.

    Reads ``seed_data.json`` and flattens all category groups into a single
    array. Each product gets a ``category`` field with its parent key.
    """
    if not _SEED_DATA_PATH.exists():
        return {"products": [], "total": 0}

    try:
        raw = json.loads(_SEED_DATA_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {"products": [], "total": 0}

    products: list[dict] = []
    for category, items in raw.items():
        if not isinstance(items, list):
            continue
        for item in items:
            # Convert price string → float | None (same logic as /api/research)
            item["price"] = _parse_seed_price(item.get("price"))
            item["category"] = category
            products.append(item)

    return {"products": products, "total": len(products)}


@router.post("/research", response_model=ResearchResponse)
async def research(body: ResearchRequest):
    """Run a full product research pipeline with Redis caching.

    1. Try Redis cache → return immediately on hit
    2. Cache miss → scrape → analyse → strategise → cache → return
    """
    try:
        report = await get_or_create_report(
            keyword=body.keyword,
            platform=body.platform,
            country=body.country,
        )
    except ScrapeError as exc:
        logger.error("Scrape failed for '%s': %s", body.keyword, exc)
        raise HTTPException(status_code=502, detail={"error": str(exc), "stage": "scrape"})
    except LLMParseError as exc:
        logger.error("LLM failed for '%s': %s", body.keyword, exc)
        raise HTTPException(status_code=502, detail={"error": str(exc), "stage": "llm"})

    return ResearchResponse(
        products=[ResearchProduct(**p) for p in report["products"]],
        analysis=report["analysis"],
        strategy=report["strategy"],
        listing=report.get("listing"),
    )
