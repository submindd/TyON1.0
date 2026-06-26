"""Match local product images to seed_data.json entries and update image_url.

Scans ``frontend/public/product-images/`` for image files, matches them against
product titles in ``seed_data.json`` using normalised string comparison, and
replaces ``image_url`` with ``/product-images/{filename}`` for matched products.

Usage::

    cd backend
    python scripts/match_local_images.py
"""

from __future__ import annotations

import json
import re
from difflib import SequenceMatcher
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
IMAGE_DIR = PROJECT_ROOT / "frontend" / "public" / "product-images"
SEED_DATA_PATH = Path(__file__).resolve().parent.parent / "seed_data" / "seed_data.json"


def normalise(s: str) -> str:
    """Reduce a string to a comparable token set.

    - lowercase
    - replace non-alphanumeric with spaces
    - collapse whitespace
    """
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def similarity(a: str, b: str) -> float:
    """Return a 0–1 similarity score between two normalised strings."""
    return SequenceMatcher(None, normalise(a), normalise(b)).ratio()


def main() -> None:
    # --- List image files ----------------------------------------------------
    if not IMAGE_DIR.exists():
        print(f"Image directory not found: {IMAGE_DIR}")
        return

    image_files: list[str] = []
    for f in sorted(IMAGE_DIR.iterdir()):
        if f.is_file() and f.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp"):
            image_files.append(f.name)

    print(f"Found {len(image_files)} image file(s) in {IMAGE_DIR}\n")

    # --- Load seed data ------------------------------------------------------
    if not SEED_DATA_PATH.exists():
        print(f"Seed data not found: {SEED_DATA_PATH}")
        return

    data = json.loads(SEED_DATA_PATH.read_text(encoding="utf-8"))
    all_products: list[dict] = []
    for category, items in data.items():
        for item in items:
            item["_category"] = category
            all_products.append(item)

    # --- Match ---------------------------------------------------------------
    matched: set[str] = set()      # image filenames already assigned
    results: list[tuple[str, str, str, float]] = []  # (title, status, image_file, score)

    for product in all_products:
        title = product.get("title", "")
        if not title:
            continue

        best_file = None
        best_score = 0.0

        for img_name in image_files:
            if img_name in matched:
                continue
            stem = Path(img_name).stem  # filename without extension
            score = similarity(title, stem)
            if score > best_score:
                best_score = score
                best_file = img_name

        # Threshold: 0.85 is high — requires near-exact match after normalisation
        if best_file and best_score >= 0.85:
            product["image_url"] = f"/product-images/{best_file}"
            matched.add(best_file)
            results.append((title, "MATCHED", best_file, best_score))
        else:
            results.append((title, "UNMATCHED", product.get("image_url", ""), best_score))

    # --- Write back ----------------------------------------------------------
    SEED_DATA_PATH.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    # --- Report --------------------------------------------------------------
    print(f"{'STATUS':<10} {'SCORE':<8} PRODUCT")
    print("-" * 90)
    for title, status, img_file, score in results:
        display = img_file if status == "MATCHED" else "(picsum)"
        marker = "[OK]" if status == "MATCHED" else "[--]"
        print(f"{status:<10} {score:.3f}   {marker} {title[:60]}")
        if status == "MATCHED":
            print(f"                    -> /product-images/{img_file}")

    n_matched = sum(1 for r in results if r[1] == "MATCHED")
    n_unmatched = sum(1 for r in results if r[1] == "UNMATCHED")

    print(f"\nMatched: {n_matched}  |  Still using picsum: {n_unmatched}")
    print(f"Updated {SEED_DATA_PATH}")


if __name__ == "__main__":
    main()
