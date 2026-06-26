"""API route definitions."""

import logging

from fastapi import APIRouter, HTTPException

from schemas.report_schema import ResearchRequest, ResearchResponse, ResearchProduct
from services.scrape_service import ScrapeError
from services.llm_service import LLMParseError
from services.report_service import get_or_create_report

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
async def health():
    """Health-check endpoint."""
    return {"status": "ok"}


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
    )
