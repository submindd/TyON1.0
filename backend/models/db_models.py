"""SQLAlchemy 2.0 ORM models — products, analysis, search_history."""

from datetime import datetime

from sqlalchemy import JSON, ForeignKey, Integer, String, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str | None] = mapped_column(String(500), default=None)
    image_url: Mapped[str | None] = mapped_column(String(1000), default=None)
    price: Mapped[float | None] = mapped_column(Float, default=None)
    sold_count: Mapped[str | None] = mapped_column(String(100), default=None)
    rating: Mapped[float | None] = mapped_column(Float, default=None)
    platform: Mapped[str] = mapped_column(String(50))
    shop_name: Mapped[str | None] = mapped_column(String(200), default=None)
    product_url: Mapped[str | None] = mapped_column(String(1000), default=None)
    category: Mapped[str | None] = mapped_column(String(200), default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    analysis: Mapped["Analysis"] = relationship(back_populates="product", uselist=False)


class Analysis(Base):
    __tablename__ = "analysis"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    market_size: Mapped[str | None] = mapped_column(String(100), default=None)
    competition: Mapped[str | None] = mapped_column(String(100), default=None)
    opportunity_score: Mapped[int | None] = mapped_column(Integer, default=None)
    ai_summary: Mapped[dict | None] = mapped_column(JSON, default=None)
    recommendation: Mapped[str | None] = mapped_column(String(500), default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    product: Mapped["Product"] = relationship(back_populates="analysis")


class SearchHistory(Base):
    __tablename__ = "search_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    keyword: Mapped[str] = mapped_column(String(500))
    platform: Mapped[str] = mapped_column(String(50))
    country: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
