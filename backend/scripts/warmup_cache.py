"""Pre-warm Redis cache for demo keywords.

Usage::

    cd backend
    python scripts/warmup_cache.py

Calls ``get_or_create_report`` once per keyword so that subsequent
``POST /api/research`` requests hit Redis instantly.
"""

from __future__ import annotations

import asyncio
import sys
import time
from pathlib import Path

# Ensure the project root (parent of scripts/) is on the import path
_src = Path(__file__).resolve().parent.parent
if str(_src) not in sys.path:
    sys.path.insert(0, str(_src))

from services.report_service import get_or_create_report  # noqa: E402

# ---------------------------------------------------------------------------
DEMO_KEYWORDS = [
    "wireless earbuds",
    "portable blender",
    "phone case",
    "yoga mat",
]


async def main() -> None:
    failed = 0
    for kw in DEMO_KEYWORDS:
        start = time.perf_counter()
        try:
            await get_or_create_report(keyword=kw, platform="tiktok", country="US")
            elapsed = time.perf_counter() - start
            print(f"[OK] {kw} ({elapsed:.2f}s)")
        except Exception as exc:
            elapsed = time.perf_counter() - start
            print(f"[FAIL] {kw} ({elapsed:.2f}s): {exc}")
            failed += 1

    print()
    if failed == 0:
        print("=" * 48)
        print("缓存预热完成，演示时这些关键词会直接命中缓存")
        print("=" * 48)
    else:
        print(f"预热部分失败: {failed}/{len(DEMO_KEYWORDS)} 个关键词未缓存")


if __name__ == "__main__":
    asyncio.run(main())
