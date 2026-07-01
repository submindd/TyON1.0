# Changelog

All notable changes to TyON will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2025-06-26

### Added

- **Product Research:** Firecrawl API integration for TikTok Shop product search
- **Seed Data Fallback:** 20 pre-collected products across 4 categories (wireless earbuds, portable blenders, phone cases, yoga mats)
- **AI Market Analysis:** DeepSeek-powered product analysis with opportunity scoring (0-100)
- **AI Strategy Generation:** Operational strategy output including target audience, content ideas, pricing suggestions, and risk analysis
- **Redis Caching:** 24-hour TTL query cache with automatic in-memory dict fallback
- **Competitor Benchmarking:** Side-by-side comparison of top products with price, sales, rating analysis
- **Data Visualization:** Radar charts, top-seller bar charts, and price distribution histograms (Recharts)
- **Listing Generator:** AI-assisted SEO title, bullet points, and product description generator
- **Multi-language Support:** Full English (en) and Simplified Chinese (zh) i18n via next-intl
- **Product Library:** Grid view of all 20 seed products with category filtering
- **Modern UI:** Dark-themed dashboard with shadcn/ui components and Framer Motion animations
- **API Documentation:** Auto-generated Swagger UI at `/docs`

### Technical Stack

- **Frontend:** Next.js 16 · React 19 · TypeScript 5 · TailwindCSS v4 · shadcn/ui · Recharts · Framer Motion · TanStack Query · next-intl
- **Backend:** FastAPI 0.110+ · SQLAlchemy 2.0 (async) · Pydantic v2 · httpx · Uvicorn
- **Data:** MySQL 8 · Redis 7
- **AI:** DeepSeek Chat API · Firecrawl API

[1.0.0]: https://github.com/submindd/TyON1.0/releases/tag/v1.0.0
