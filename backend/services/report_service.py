"""Report generation, caching, and persistence service.

Orchestrates: scrape → analyse → strategise → cache → persist.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any

from core.redis_client import get_redis
from services.scrape_service import ScrapeError, search_products
from services.llm_service import LLMParseError, analyze_product, generate_strategy

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CACHE_TTL_SECONDS = 86_400  # 24 hours

# In-process memory cache fallback for when Redis is unavailable.
# Keys: cache_key -> (timestamp, report_json_string)
_memory_cache: dict[str, tuple[float, str]] = {}

# ---------------------------------------------------------------------------
# DB persistence
# ---------------------------------------------------------------------------
async def save_report_to_db(
    keyword: str,
    platform: str,
    country: str,
    report: dict[str, Any],
) -> None:
    """Persist a completed report to MySQL.

    Inserts one row each into ``search_history``, ``products``, and ``analysis``.
    This function is called via ``asyncio.create_task`` so it never blocks the
    API response.
    """
    from core.db import AsyncSessionLocal
    from models.db_models import Analysis, Product, SearchHistory

    try:
        async with AsyncSessionLocal() as session:
            # 1. Search history
            hist = SearchHistory(keyword=keyword, platform=platform, country=country)
            session.add(hist)

            # 2. Product (target = first product in result list)
            target = report.get("products", [{}])[0] if report.get("products") else {}
            prod = Product(
                title=target.get("title"),
                image_url=target.get("image_url"),
                price=target.get("price"),
                sold_count=target.get("sold_count"),
                rating=target.get("rating"),
                platform=platform,
                shop_name=target.get("shop_name"),
                product_url=target.get("product_url"),
                category=None,
            )
            session.add(prod)
            await session.flush()  # populate prod.id

            # 3. Analysis
            ad = report.get("analysis", {})
            sd = report.get("strategy", {})
            analysis = Analysis(
                product_id=prod.id,
                market_size=ad.get("market_size"),
                competition=ad.get("competition"),
                opportunity_score=ad.get("opportunity_score"),
                ai_summary=report,
                recommendation=sd.get("recommendation"),
            )
            session.add(analysis)

            await session.commit()
            logger.info("DB persisted: keyword='%s', product_id=%d", keyword, prod.id)

    except Exception:
        logger.warning("DB save failed for '%s' (ignored)", keyword, exc_info=True)


async def _save_to_db(report: dict[str, Any]) -> None:
    """Thin wrapper — called from ``get_or_create_report`` via create_task."""
    await save_report_to_db(
        keyword=report.get("keyword", ""),
        platform=report.get("platform", "tiktok"),
        country=report.get("country", "US"),
        report=report,
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
async def get_or_create_report(
    keyword: str,
    platform: str = "tiktok",
    country: str = "US",
) -> dict[str, Any]:
    """Return a cached report for *keyword*, or run the full pipeline.

    Cache key: ``report:{platform}:{country}:{keyword.lower().strip()}``
    Redis TTL: 24 hours.

    Returns a dict with keys ``products``, ``analysis``, ``strategy``,
    plus an internal ``keyword`` field for DB persistence.

    Raises :class:`ScrapeError` or :class:`LLMParseError` on pipeline failure
    (after cache miss).
    """
    norm_key = keyword.lower().strip()
    cache_key = f"report:{platform}:{country}:{norm_key}"

    # ---- 1. Try Redis cache ------------------------------------------------
    redis_ok = False
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        redis_ok = True
        if cached:
            logger.info("Redis cache HIT for '%s'", norm_key)
            return json.loads(cached)
        logger.info("Redis cache MISS for '%s'", norm_key)
    except Exception:
        logger.warning("Redis read failed, falling back to memory cache", exc_info=True)

    # ---- 1b. Memory cache fallback (only when Redis missed/failed) ----------
    if not redis_ok or True:  # always check memory as safety net
        mem_entry = _memory_cache.get(cache_key)
        if mem_entry is not None:
            ts, report_json = mem_entry
            if time.time() - ts < CACHE_TTL_SECONDS:
                logger.info("Memory cache HIT for '%s'", norm_key)
                return json.loads(report_json)
            else:
                # Expired — clean up
                del _memory_cache[cache_key]

    logger.info("Cache MISS for '%s', running full pipeline", norm_key)

    # ---- 2. Run pipeline ---------------------------------------------------
    raw_products = await search_products(
        keyword=keyword, platform=platform, country=country,
    )
    if not raw_products:
        raise ScrapeError(f"No products found for '{keyword}'")

    analysis = await analyze_product(raw_products, target_product_index=0)
    strategy = await generate_strategy(analysis)

    report: dict[str, Any] = {
        "products": raw_products,
        "analysis": analysis,
        "strategy": strategy,
        "keyword": norm_key,
        "platform": platform,
        "country": country,
    }

    # ---- 3. Write caches (best-effort) -------------------------------------
    report_json = json.dumps(report, ensure_ascii=False)

    # Always write to in-process memory cache (fast, no network)
    _memory_cache[cache_key] = (time.time(), report_json)
    logger.info("Memory-cached report for '%s' (TTL %ds)", norm_key, CACHE_TTL_SECONDS)

    try:
        await redis.set(cache_key, report_json, ex=CACHE_TTL_SECONDS)
        logger.info("Redis-cached report for '%s' (TTL %ds)", norm_key, CACHE_TTL_SECONDS)
    except Exception:
        logger.warning("Redis write failed, report only in memory cache", exc_info=True)

    # ---- 4. Persist to DB (fire-and-forget) --------------------------------
    asyncio.create_task(_save_to_db(report))

    return report
