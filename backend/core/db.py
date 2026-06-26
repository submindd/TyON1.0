"""Async database session and engine setup using SQLAlchemy 2.0."""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from core.config import settings

# async MySQL requires aiomysql driver; the .env may specify pymysql (sync).
_db_url = settings.MYSQL_URL.replace("mysql+pymysql://", "mysql+aiomysql://")

engine = create_async_engine(_db_url, echo=False, pool_size=5, max_overflow=10)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


async def get_db() -> AsyncSession:  # type: ignore[misc]
    async with AsyncSessionLocal() as session:
        yield session
