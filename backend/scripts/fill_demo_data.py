"""Fill demo-quality ratings, prices, and sold_counts in seed_data.json.

- Adds ratings (4.0–4.9, 1 decimal) to all products
- Converts phone-case range prices to single float values
- Fills empty sold_counts with plausible demo numbers
- Converts ALL prices from string to float for consistency

Usage::

    cd backend
    python scripts/fill_demo_data.py
"""

from __future__ import annotations

import json
from pathlib import Path

SEED_DATA_PATH = Path(__file__).resolve().parent.parent / "seed_data" / "seed_data.json"

# Per-category rating ranges (min, max) and price/sold_count defaults
CATEGORY_DEFAULTS = {
    "wireless earbuds": {
        "rating_range": (4.1, 4.8),
        "fallback_prices": [12.99, 14.99, 16.99, 19.99, 22.99],
        "fallback_sold": ["1.2K sold", "856 sold", "3.4K sold", "672 sold", "2.1K sold"],
    },
    "portable blender": {
        "rating_range": (4.0, 4.6),
        "fallback_prices": [11.99, 15.99, 13.99, 18.99, 21.99],
        "fallback_sold": ["890 sold", "1.5K sold", "432 sold", "2.3K sold", "567 sold"],
    },
    "phone case": {
        "rating_range": (4.2, 4.9),
        "fallback_prices": [6.99, 9.99, 7.49, 8.99, 5.99],
        "fallback_sold": ["4.2K sold", "3.1K sold", "2.8K sold", "5.6K sold", "1.9K sold"],
    },
    "yoga mat": {
        "rating_range": (4.0, 4.7),
        "fallback_prices": [9.99, 22.99, 19.99, 45.99, 30.99],
        "fallback_sold": ["380 sold", "156 sold", "92 sold", "1.1K sold", "520 sold"],
    },
}


def _parse_price_from_string(raw: str | None) -> float | None:
    """Quick inline parser for existing string prices (avoids import)."""
    import re
    if not raw:
        return None
    s = str(raw).strip().replace("US ", "").replace("USD", "")
    if "-" in s:
        return None
    m = re.search(r"\$(\d[\d,]*\.?\d*)", s)
    if m:
        try:
            return float(m.group(1).replace(",", ""))
        except ValueError:
            pass
    return None


def main() -> None:
    if not SEED_DATA_PATH.exists():
        print(f"Not found: {SEED_DATA_PATH}")
        return

    data = json.loads(SEED_DATA_PATH.read_text(encoding="utf-8"))
    updated_ratings = 0
    updated_prices = 0
    updated_sold = 0

    import random
    random.seed(42)  # deterministic demo data

    for category, products in data.items():
        defaults = CATEGORY_DEFAULTS.get(category, {})
        r_min, r_max = defaults.get("rating_range", (4.0, 4.5))
        fallback_prices = defaults.get("fallback_prices", [9.99] * 5)
        fallback_sold = defaults.get("fallback_sold", ["500 sold"] * 5)

        for i, product in enumerate(products):
            # ----- Rating ----------------------------------------------------
            if product.get("rating") is None:
                rating = round(random.uniform(r_min, r_max), 1)
                product["rating"] = rating
                updated_ratings += 1

            # ----- Price -----------------------------------------------------
            raw_price = product.get("price")
            current = _parse_price_from_string(raw_price)

            if current is None:
                # Use fallback price
                new_price = fallback_prices[i % len(fallback_prices)]
                product["price"] = new_price
                updated_prices += 1
            elif isinstance(raw_price, str):
                # Convert existing string price (like "$14.90") to float
                product["price"] = current
                updated_prices += 1

            # ----- Sold count ------------------------------------------------
            sold = product.get("sold_count", "")
            if not sold or not str(sold).strip():
                product["sold_count"] = fallback_sold[i % len(fallback_sold)]
                updated_sold += 1

    # ---- Write back --------------------------------------------------------
    SEED_DATA_PATH.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print(f"Updated {SEED_DATA_PATH}")
    print(f"  Ratings filled : {updated_ratings}")
    print(f"  Prices fixed   : {updated_prices}")
    print(f"  Sold counts    : {updated_sold}")

    # Quick verify
    print("\nSample check:")
    for cat in list(data.keys()):
        p = data[cat][0]
        print(f"  [{cat}] {p['title'][:40]}")
        print(f"    rating={p['rating']!r}  price={p['price']!r}  sold={p['sold_count']!r}")


if __name__ == "__main__":
    main()
