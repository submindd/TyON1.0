"""Fill empty ``image_url`` fields in ``seed_data.json`` with picsum.photos placeholders.

Each product gets a deterministic placeholder image via
``https://picsum.photos/seed/{slug}/300/300`` where *slug* is derived from
the product title.

Usage::

    cd backend
    python scripts/fill_placeholder_images.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

SEED_DATA_PATH = Path(__file__).resolve().parent.parent / "seed_data" / "seed_data.json"


def slugify(title: str) -> str:
    """Convert a product title to a URL-safe slug.

    Examples::

        "Nothing Ear (a) Wireless Earbuds" -> "nothing-ear-a-wireless-earbuds"
        "JLab GO Sport+ True Wireless Earbuds" -> "jlab-go-sport-true-wireless-earbuds"
    """
    # Lowercase
    s = title.strip().lower()
    # Replace any non-alphanumeric character (except spaces/hyphens) with a space
    s = re.sub(r"[^a-z0-9\s-]", " ", s)
    # Collapse multiple spaces/hyphens into a single hyphen
    s = re.sub(r"[\s-]+", "-", s)
    # Strip leading/trailing hyphens
    s = s.strip("-")
    return s


def main() -> None:
    if not SEED_DATA_PATH.exists():
        print(f"Seed data file not found: {SEED_DATA_PATH}")
        return

    data = json.loads(SEED_DATA_PATH.read_text(encoding="utf-8"))

    total_updated = 0
    for keyword, products in data.items():
        for product in products:
            if product.get("image_url") == "":
                title = product.get("title", "")
                if not title:
                    continue
                slug = slugify(title)
                product["image_url"] = f"https://picsum.photos/seed/{slug}/300/300"
                print(f"  [{keyword}] {title[:50]:<50s} → seed={slug}")
                total_updated += 1

    # Write back
    SEED_DATA_PATH.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"\nDone — updated {total_updated} product(s) in {SEED_DATA_PATH}")


if __name__ == "__main__":
    main()
