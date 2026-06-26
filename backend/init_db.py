"""One-click table creation script.

Usage::

    cd backend
    python init_db.py

Requires a running MySQL instance reachable via ``MYSQL_URL`` in ``.env``.
"""

import asyncio
import sys

from core.db import Base, engine
# Import all models so Base.metadata knows about them
import models.db_models  # noqa: F401


async def main() -> None:
    print(f"Creating tables via {engine.url.render_as_string(hide_password=True)} ...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("Done — all tables created.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
