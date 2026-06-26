"""Web scraping service using Firecrawl API.

MVP: TikTok Shop (US) product search.

.. note::

    Firecrawl does **not** support scraping ``tiktok.com`` (returns 403 for all
    proxy tiers).  For TikTok we therefore rely exclusively on the
    ``/v1/search`` endpoint, which searches Google's index and returns
    title + description + URL snippets.  Rich fields (price, image, sales,
    rating, shop) are parsed from the snippet text on a best-effort basis.

    When richer data is required, replace this with the official TikTok Shop
    API or a dedicated TikTok scraper (e.g. Apify).
"""

from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from typing import Any
from urllib.parse import quote

import httpx

from core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
FIRECRAWL_BASE = "https://api.firecrawl.dev/v1"
TIKTOK_SHOP_SEARCH_URL = "https://www.tiktok.com/shop/s/{}"

# Platforms that Firecrawl can actually scrape (TikTok is NOT one of them).
# For unsupported platforms we skip the /v1/scrape step and go straight to
# /v1/search (Google-indexed results).
FIRECRAWL_SCRAPEABLE_PLATFORMS: set[str] = set()

# ---------------------------------------------------------------------------
# Seed-data fallback (pre-collected demo data)
# ---------------------------------------------------------------------------
_SEED_DATA_PATH = Path(__file__).resolve().parent.parent / "seed_data" / "seed_data.json"
_SEED_DATA: dict[str, list[dict[str, Any]]] | None = None  # lazy cache
_DATA_COMPLETENESS_CHECK_N = 3  # inspect first N live products for completeness


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------
class ScrapeError(Exception):
    """Raised when *both* scrape and search approaches fail irrecoverably."""


# ---------------------------------------------------------------------------
# Regex patterns for field extraction from text
# ---------------------------------------------------------------------------

# Price: "$12.99", "US $1,234.56", "$19.99 USD"
_PRICE_RE = re.compile(r"(?:US\s*)?\$(\d[\d,]*\.?\d*)")

# Sales: "10K sold", "1,234 sold", "已售 1.2万", "10K+ sold"
_SALES_RE = re.compile(
    r"((?:\d[\d,]*[KkMm]?\+?)\s*(?:sold|sales|已售))|"
    r"((?:已售|sold)\s*\d[\d.]*[万wW]?)",
    re.IGNORECASE,
)

# Rating — only matches a float 0.0–5.0 that is *not* preceded by a
# digit/dot (avoids matching "Bluetooth 5.4" or "NE51" as ratings).
_RATING_RE = re.compile(
    r"(?<!\d)(?:★|⭐|star[s]?\s*)?(\d\.\d{1,2})(?:\s*/\s*5)?(?=\s|$|,|\.|\))"
)

# Shop — stricter patterns, requires clear prefix
_SHOP_RE = re.compile(
    r"(?:@(\w[\w.]{1,30}))|"
    r"(?:by\s+([A-Z][A-Za-z0-9\s&'.\-]{1,40}))|"
    r"(?:Shop[:\s]+([A-Z][A-Za-z0-9\s&'.\-]{1,40}))|"
    r"(?:Sold\s+by[:\s]+([A-Z][A-Za-z0-9\s&'.\-]{1,40}))|"
    r"(?:Store[:\s]+([A-Z][A-Za-z0-9\s&'.\-]{1,40}))",
)

# Markdown image: ![alt](url)
_IMAGE_MD_RE = re.compile(r"!\[.*?\]\((https?://\S+)\)")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _first(pattern: re.Pattern[str], text: str, group: int = 1) -> str | None:
    m = pattern.search(text)
    return m.group(group).strip() if m else None


def _valid_rating(value: str) -> float | None:
    """Convert a rating string to float, returning None when out of 0.5–5.0."""
    try:
        v = float(value)
    except ValueError:
        return None
    return v if 0.5 <= v <= 5.0 else None


def _load_seed_data() -> dict[str, list[dict[str, Any]]]:
    """Load (and cache) ``seed_data.json`` keyed by lowercased keyword."""
    global _SEED_DATA
    if _SEED_DATA is not None:
        return _SEED_DATA

    if not _SEED_DATA_PATH.exists():
        logger.warning("Seed data file not found: %s", _SEED_DATA_PATH)
        _SEED_DATA = {}
        return _SEED_DATA

    try:
        raw = json.loads(_SEED_DATA_PATH.read_text(encoding="utf-8"))
        # Normalise keys to lowercase-stripped strings
        _SEED_DATA = {
            k.strip().lower(): v for k, v in raw.items() if isinstance(v, list)
        }
        logger.info("Loaded seed data for %d keyword(s)", len(_SEED_DATA))
    except (json.JSONDecodeError, OSError) as exc:
        logger.warning("Failed to parse seed_data.json: %s", exc)
        _SEED_DATA = {}
    return _SEED_DATA


def _normalise_seed_products(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Convert seed-data entries to the same schema as live products.

    - ``price``: ``"$14.90"`` → ``float`` / ``"$5-$8"`` → ``None`` / ``""`` → ``None``
    - ``sold_count``: empty string → ``None``
    - ``image_url``: empty string → ``None``
    - Adds ``"data_source": "seed"``
    """
    out: list[dict[str, Any]] = []
    for item in items:
        product: dict[str, Any] = {
            "title": item.get("title") or None,
            "price": _parse_seed_price(item.get("price", "")),
            "sold_count": item.get("sold_count") or None,
            "rating": item.get("rating"),  # already float | None
            "image_url": item.get("image_url") or None,
            "product_url": item.get("product_url") or None,
            "shop_name": item.get("shop_name") or None,
            "data_source": "seed",
        }
        out.append(product)
    return out


def _parse_seed_price(raw: str | float | int | None) -> float | None:
    """Convert a seed price value to float.

    Handles:
    - ``float`` / ``int`` → returned as float directly
    - ``"$14.90"`` → 14.90
    - ``"$5-$8"`` → None (range)
    - ``""`` → None
    """
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return float(raw)
    if not raw:
        return None
    cleaned = str(raw).strip().replace("US ", "").replace("USD", "")
    # Range price like "$5-$8" → None
    if "-" in cleaned:
        return None
    m = _PRICE_RE.search(cleaned)
    if m:
        try:
            return float(m.group(1).replace(",", ""))
        except ValueError:
            pass
    return None


def _is_live_data_incomplete(products: list[dict[str, Any]]) -> bool:
    """Return True when live results are empty or lack price+sales in the top N."""
    if not products:
        return True

    sample = products[:_DATA_COMPLETENESS_CHECK_N]

    # All sampled products have *both* price and sold_count as None → incomplete
    all_barren = all(
        p.get("price") is None and p.get("sold_count") is None
        for p in sample
    )
    return all_barren


# ---------------------------------------------------------------------------
# Firecrawl API calls (private)
# ---------------------------------------------------------------------------
async def _firecrawl_scrape(
    url: str,
    wait_ms: int = 5000,
    country: str = "US",
    **overrides: Any,
) -> dict[str, Any]:
    """Call Firecrawl POST /v1/scrape and return the parsed JSON body.

    Raises :class:`ScrapeError` on any failure.
    """
    payload: dict[str, Any] = {
        "url": url,
        "formats": ["markdown", "links"],
        "onlyMainContent": False,
        "waitFor": wait_ms,
        "timeout": 30_000,
        "mobile": True,
        "location": {"country": country},
        "blockAds": True,
        **overrides,
    }
    headers = {
        "Authorization": f"Bearer {settings.FIRECRAWL_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                f"{FIRECRAWL_BASE}/scrape", json=payload, headers=headers
            )
    except httpx.TimeoutException as exc:
        raise ScrapeError(f"Firecrawl scrape timed out for {url}") from exc
    except httpx.RequestError as exc:
        raise ScrapeError(f"HTTP error calling Firecrawl scrape: {exc}") from exc

    if resp.status_code != 200:
        raise ScrapeError(
            f"Firecrawl scrape HTTP {resp.status_code}: {resp.text[:500]}"
        )
    body = resp.json()
    if not body.get("success"):
        raise ScrapeError(
            f"Firecrawl scrape unsuccessful: {body.get('error', 'unknown error')}"
        )
    return body


async def _firecrawl_search(
    query: str,
    limit: int = 8,
    country: str = "US",
) -> list[dict[str, Any]]:
    """Call Firecrawl POST /v1/search and return ``data[]`` items.

    Raises :class:`ScrapeError` on any failure.
    """
    payload: dict[str, Any] = {
        "query": query,
        "limit": limit,
        "country": country.lower(),
        "lang": "en",
        # No scrapeOptions — TikTok pages are blocked anyway, so scraping
        # individual results would waste credits with no gain.
    }
    headers = {
        "Authorization": f"Bearer {settings.FIRECRAWL_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{FIRECRAWL_BASE}/search", json=payload, headers=headers
            )
    except httpx.TimeoutException as exc:
        raise ScrapeError(f"Firecrawl search timed out for '{query}'") from exc
    except httpx.RequestError as exc:
        raise ScrapeError(f"HTTP error calling Firecrawl search: {exc}") from exc

    if resp.status_code != 200:
        raise ScrapeError(
            f"Firecrawl search HTTP {resp.status_code}: {resp.text[:500]}"
        )
    body = resp.json()
    if not body.get("success"):
        raise ScrapeError(
            f"Firecrawl search unsuccessful: {body.get('error', 'unknown error')}"
        )
    return body.get("data", [])


# ---------------------------------------------------------------------------
# Parsers
# ---------------------------------------------------------------------------
def _parse_one_search_item(item: dict[str, Any]) -> dict[str, Any] | None:
    """Build a product dict from a single ``/v1/search`` result item.

    Each item has keys: ``url``, ``title``, ``description``, ``position``.
    We parse whatever we can from the text fields.
    """
    url = item.get("url", "")
    if "tiktok.com" not in url:
        return None

    title = (item.get("title") or "").strip()
    # Strip trailing " - TikTok" / " | TikTok Shop" suffix from title
    title = re.sub(r"\s*[-|]\s*TikTok(\s*Shop)?\s*$", "", title, flags=re.IGNORECASE).strip()

    description = (item.get("description") or "").strip()
    combined = f"{title}\n{description}"

    product: dict[str, Any] = {
        "title": title or None,
        "price": None,
        "sold_count": None,
        "rating": None,
        "image_url": None,
        "product_url": url or None,
        "shop_name": None,
        "data_source": "live",
    }

    # --- Price ---------------------------------------------------------------
    price_m = _PRICE_RE.search(combined)
    if price_m:
        try:
            product["price"] = float(price_m.group(1).replace(",", ""))
        except ValueError:
            pass

    # --- Sold count ----------------------------------------------------------
    sales_m = _SALES_RE.search(combined)
    if sales_m:
        product["sold_count"] = sales_m.group(0).strip()

    # --- Rating (validated 0.5–5.0 range) -----------------------------------
    rating_m = _RATING_RE.search(combined)
    if rating_m:
        product["rating"] = _valid_rating(rating_m.group(1))

    # --- Shop name -----------------------------------------------------------
    shop_m = _SHOP_RE.search(combined)
    if shop_m:
        for g in shop_m.groups():
            if g:
                product["shop_name"] = g.strip()
                break

    # --- Image — unlikely in search snippets, but try common CDN patterns ----
    img_m = re.search(
        r"https?://(?:p\d{1,3}[.-])?(?:tiktokcdn|ibyteimg|tiktok)\.\S+\.(?:jpg|jpeg|png|webp)",
        combined,
        re.IGNORECASE,
    )
    if img_m:
        product["image_url"] = img_m.group(0).rstrip(".,;:)\"'")

    # Only keep if there's at least a title or URL
    if product["title"] or product["product_url"]:
        return product
    return None


def _parse_tiktok_search_results(
    items: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Parse a list of ``/v1/search`` items into product dicts."""
    products: list[dict[str, Any]] = []
    for item in items:
        try:
            result = _parse_one_search_item(item)
            if result is not None:
                products.append(result)
        except Exception:
            logger.warning("Error parsing search item, skipping", exc_info=True)
    return products


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
async def search_products(
    keyword: str,
    platform: str = "tiktok",
    country: str = "US",
) -> list[dict[str, Any]]:
    """Search for products on a marketplace.

    Parameters
    ----------
    keyword:
        Search query, e.g. ``"wireless earbuds"``.
    platform:
        Marketplace to search. Only ``"tiktok"`` is supported in MVP.
    country:
        Target country code (default ``"US"``).

    Returns
    -------
    list[dict]
        Up to 8 products.  Each dict has keys:

        * ``title``       — product name (``str`` | ``None``)
        * ``price``       — numeric price in USD (``float`` | ``None``)
        * ``sold_count``  — raw sales text, e.g. ``"10K sold"`` (``str`` | ``None``)
        * ``rating``      — numeric rating 0.5–5.0 (``float`` | ``None``)
        * ``image_url``   — product image URL (``str`` | ``None``)
        * ``product_url`` — link to product detail page (``str`` | ``None``)
        * ``shop_name``   — seller / shop name (``str`` | ``None``)
        * ``data_source`` — ``"live"`` or ``"seed"`` (internal, for debugging)

        Returns an empty list when zero products can be parsed.

    Raises
    ------
    ScrapeError
        When all approaches fail (network error, invalid API key, etc.).
    """
    if platform != "tiktok":
        logger.warning(
            "Platform '%s' not yet supported; only 'tiktok' available. "
            "Proceeding with tiktok anyway.",
            platform,
        )

    encoded = quote(keyword, safe="")
    live_products: list[dict[str, Any]] = []

    # ---- Primary: scrape the search-results page (only if platform is -------
    #      known to be scrapeable by Firecrawl).
    if platform in FIRECRAWL_SCRAPEABLE_PLATFORMS:
        search_url = TIKTOK_SHOP_SEARCH_URL.format(encoded)
        try:
            logger.info("Scraping search page: %s", search_url)
            scrape_data = await _firecrawl_scrape(search_url, country=country)
            markdown = (scrape_data.get("data") or {}).get("markdown", "")
            links = (scrape_data.get("data") or {}).get("links", [])
            if markdown:
                # NOTE: _parse_tiktok_markdown was removed — re-add when a
                #       scrapeable platform with known markdown structure is
                #       added to FIRECRAWL_SCRAPEABLE_PLATFORMS.
                pass
        except ScrapeError:
            logger.warning("Primary scrape failed, falling back to search", exc_info=True)

    # ---- Search (always runs for TikTok; fallback for others) ---------------
    try:
        search_query = f'site:tiktok.com/shop "{keyword}"'
        logger.info("Search: %s", search_query)
        search_data = await _firecrawl_search(search_query, limit=8, country=country)
        live_products = _parse_tiktok_search_results(search_data)
        logger.info("Live search returned %d products for '%s'", len(live_products), keyword)
    except ScrapeError:
        logger.error("Search failed for '%s'", keyword, exc_info=True)

    # ---- Completeness check → seed-data fallback ---------------------------
    if _is_live_data_incomplete(live_products):
        logger.info(
            "Live data incomplete for '%s' (empty=%s), trying seed data...",
            keyword,
            len(live_products) == 0,
        )
        seed_products = _lookup_seed_data(keyword)
        if seed_products:
            logger.info(
                "Seed-data fallback hit for '%s': %d products (source=seed)",
                keyword,
                len(seed_products),
            )
            return seed_products[:8]

        logger.info(
            "Seed-data miss for '%s', returning live results as-is (%d products)",
            keyword,
            len(live_products),
        )

    return live_products[:8]


def _lookup_seed_data(keyword: str) -> list[dict[str, Any]] | None:
    """Look up *keyword* in ``seed_data.json`` (exact, case-insensitive match).

    Returns the normalised product list, or ``None`` on miss.
    """
    seed = _load_seed_data()
    norm_key = keyword.strip().lower()
    items = seed.get(norm_key)
    if items:
        return _normalise_seed_products(items)
    return None
