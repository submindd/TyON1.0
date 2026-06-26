# TyON — AI-Powered TikTok Shop Product Research

TyON is an AI-driven product intelligence tool for TikTok Shop sellers. Enter a product keyword and get market analysis, competitor benchmarking, opportunity scoring, and operational strategy — all powered by real product data and DeepSeek AI.

---

## Screenshots

| Search | Analysis | Report |
|--------|----------|--------|
| Keyword search with demo prompts | Charts, competitor table, filters | AI insights, strategy, listing generator |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 · React 19 · Tailwind CSS v4 · shadcn/ui · Recharts · Framer Motion |
| **Backend** | FastAPI (Python) · Uvicorn · Pydantic v2 · SQLAlchemy 2.0 |
| **AI** | DeepSeek Chat API (market analysis + strategy generation) |
| **Data** | Firecrawl API (TikTok Shop search) + seed data fallback |
| **Cache** | Redis (24h TTL) with automatic in-memory fallback |
| **Storage** | MySQL (search history, products, analysis) |
| **i18n** | next-intl (English / 中文) |

---

## Quick Start

### Prerequisites

- Docker Desktop (for MySQL + Redis)
- Python 3.10+
- Node.js 20+
- API keys: [Firecrawl](https://firecrawl.dev) + [DeepSeek](https://deepseek.com)

### 1. Clone & Install

```bash
git clone https://github.com/submindd/TyON1.0.git
cd TyON1.0
```

### 2. Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys and database URLs
```

### 3. Start Services

```bash
# MySQL + Redis
docker compose up -d

# Backend
cd backend
pip install -r requirements.txt
python init_db.py
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### 4. Open Browser

| URL | Page |
|-----|------|
| `http://localhost:3000` | Home (redirects to search) |
| `http://localhost:3000/products` | Product library (20 demo products) |
| `http://localhost:3000/search` | Search → enter keyword → analysis |
| `http://127.0.0.1:8000/api/health` | Backend health check |

---

## Demo Keywords

The seed data includes 20 products across 4 categories:

| Category | Keywords |
|----------|----------|
| Wireless Earbuds | `wireless earbuds` |
| Portable Blender | `portable blender` |
| Phone Case | `phone case` |
| Yoga Mat | `yoga mat` |

> **Tip**: Before demoing, clear old Redis cache:
> ```bash
> cd backend
> python -c "import redis; r=redis.from_url('redis://localhost:6379/0'); r.delete(*r.keys('report:*'))"
> ```

---

## Project Structure

```
TyON1.0/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── init_db.py           # Database table creation
│   ├── api/routes.py        # /api/health, /api/products, /api/research
│   ├── core/                # config, db, redis_client
│   ├── models/db_models.py  # SQLAlchemy ORM
│   ├── schemas/             # Pydantic request/response
│   ├── services/            # scrape, llm, report (pipeline)
│   ├── scripts/             # fill_demo_data, match_local_images, etc.
│   └── seed_data/           # 20 pre-collected products
├── frontend/
│   ├── app/
│   │   ├── search/          # Search page (home)
│   │   ├── analysis/[keyword]/  # Charts + competitor table + filter
│   │   ├── report/[id]/     # AI report + listing generator
│   │   └── products/        # Product library grid
│   ├── components/
│   │   ├── layout/          # Header, Sidebar
│   │   ├── cards/           # InsightCard, StrategyCard, RecommendationCard
│   │   ├── charts/          # Radar, Bar (top sellers, price distribution)
│   │   └── ui/              # shadcn components + ProductThumb
│   ├── lib/                 # API client, filters, scoring, i18n glossary
│   ├── locales/             # en.json, zh.json
│   └── public/product-images/  # 20 demo product photos
└── docker-compose.yml       # MySQL + Redis
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/products` | All 20 seed products (with category) |
| `POST` | `/api/research` | Full pipeline: scrape → AI analysis → strategy |

---

## Data Pipeline

```
Keyword → Firecrawl Search (TikTok Shop)
       → Seed Data Fallback (if live data incomplete)
       → DeepSeek Analysis (product cleaning + opportunity score)
       → DeepSeek Strategy (audience, content, pricing, risk)
       → Redis Cache (24h) + In-Memory Cache
       → MySQL Persistence (async)
       → JSON Response → Frontend
```

---

## License

MIT
