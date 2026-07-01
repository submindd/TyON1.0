<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://via.placeholder.com/800x200/0d1117/ffffff?text=TyON+Logo+%28Dark%29">
    <img src="https://via.placeholder.com/800x200/ffffff/171717?text=TyON+Logo+%28Light%29" alt="TyON Logo" width="400" />
  </picture>
</p>

<p align="center">
  <strong>AI-Powered TikTok Shop Product Research &amp; Listing Generation Platform</strong>
</p>

<p align="center">
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" /></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi" alt="FastAPI" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" /></a>
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python" alt="Python" /></a>
  <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis" alt="Redis" /></a>
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql" alt="MySQL" /></a>
  <a href="https://www.deepseek.com/"><img src="https://img.shields.io/badge/AI-DeepSeek-4D6BFE" alt="DeepSeek AI" /></a>
</p>

---

## 📺 Demo

| Demo GIF | Demo Video | Live Demo |
|:--------:|:----------:|:---------:|
| *Coming soon* | *Coming soon* | *Coming soon* |

> Run locally in under 5 minutes — see [Installation](#-installation) below.

---

## 📖 Project Overview

**TyON** is an AI-driven product intelligence platform built for cross-border e-commerce sellers on TikTok Shop. It transforms a keyword into a complete market research report — combining real-time product data, AI analysis, and operational strategy — all in one workflow.

### What TyON does for you

- **🔍 Discover trending products** — Search TikTok Shop by keyword, powered by Firecrawl live data with intelligent seed-data fallback
- **📊 Analyze market opportunity** — DeepSeek AI evaluates competition, market size, growth trends, and scores opportunity (0–100)
- **🏷️ Benchmark competitors** — Side-by-side comparison of price, sales volume, ratings, and selling points across top products
- **📝 Generate product listings** — AI-assisted listing generator produces SEO-optimized titles, bullet points, and descriptions
- **📈 Visualize data** — Interactive radar charts, top-seller rankings, and price distribution charts powered by Recharts
- **🌐 Multi-language ready** — Full English / 中文 i18n support via `next-intl`

---

## 🤔 Why TyON

Cross-border e-commerce sellers face four critical bottlenecks:

| Pain Point | Manual Approach | TyON Solution |
|:---|:---|:---|
| **Slow product research** | Hours scrolling TikTok Shop, copying data into spreadsheets | AI scrapes + analyzes 8 products in seconds |
| **Tedious competitor analysis** | Manually comparing prices, reviews, and features across tabs | DeepSeek evaluates competition level, selling points, and gaps automatically |
| **Scattered data** | Product data lives in bookmarks, screenshots, and notes | Unified report with products, analysis, and strategy in one view |
| **Repetitive listing writing** | Writing SEO titles and bullet points from scratch for every product | AI generates optimized listing content tailored to your target audience |

**TyON automates the entire research → analysis → strategy pipeline**, letting sellers focus on what matters: making data-driven sourcing decisions.

---

## ✨ Features

| Feature | Description |
|:--------|:------------|
| **🔎 Product Research** | Search TikTok Shop by keyword via Firecrawl API; smart fallback to 20 curated seed products across 4 categories when live data is incomplete |
| **🧠 AI Market Analysis** | DeepSeek Chat API cleans product data, scores market opportunity (0–100), and identifies selling points, pain points, and differentiation angles |
| **📋 Competitor Benchmarking** | Compare top products on price, sales volume, ratings, and shop reputation with structured data tables and visual charts |
| **✍️ Listing Generator** | Client-side AI-assisted tool that produces SEO titles, bullet points, product descriptions, and backend search keywords |
| **📊 Data Visualization** | Radar charts for multi-dimensional comparison, horizontal bar charts for top sellers, and price distribution histograms |
| **⚡ Redis Caching** | 24-hour TTL Redis cache with automatic in-memory fallback — sub-10ms response on repeated queries |
| **🌍 i18n Support** | Full English and Simplified Chinese translations for all UI text, metrics glossary, and listing templates |
| **🎨 Modern UI** | Dark-themed professional interface built with Tailwind CSS v4, shadcn/ui, and Framer Motion animations |
| **🛡️ Resilient Pipeline** | Graceful degradation: Firecrawl → seed data → empty-state handling; Redis → in-memory cache; DB writes are fire-and-forget |

---

## 📸 Screenshots

<p align="center">
  <em>Screenshots coming soon</em>
</p>

| Search Page | Analysis Dashboard | AI Report |
|:-----------:|:-----------------:|:---------:|
| Keyword input with demo prompts, product grid | Radar chart, competitor table, opportunity score ring | AI insights, strategy cards, listing generator |
| *Placeholder* | *Placeholder* | *Placeholder* |

---

## 🏗️ System Architecture

### Architecture Overview

```mermaid
graph TB
    %% ── Styles ──────────────────────────────────────────────
    classDef frontend fill:#3178C6,color:#fff,stroke:#235a97
    classDef backend  fill:#009688,color:#fff,stroke:#007069
    classDef external fill:#FF6B35,color:#fff,stroke:#cc5529
    classDef data     fill:#4479A1,color:#fff,stroke:#355f7f
    classDef cache    fill:#DC382D,color:#fff,stroke:#b02d24
    classDef fallback fill:#FFA000,color:#000,stroke:#cc8000

    %% ── Frontend Layer ──────────────────────────────────────
    subgraph Frontend["<b>🌐 Frontend Layer</b> | Next.js 16 · React 19 · TypeScript"]
        direction LR
        Browser["Browser<br/><small>localhost:3000</small>"]
        SearchPg["Search Page<br/><small>/search</small>"]
        AnalysisPg["Analysis Dashboard<br/><small>/analysis/[keyword]</small>"]
        ReportPg["AI Report<br/><small>/report/[id]</small>"]
        ProductsPg["Product Library<br/><small>/products</small>"]
        Charts["Recharts<br/><small>Radar · Bar · Histogram</small>"]
        ListingGen["Listing Generator<br/><small>SEO · Bullets · Description</small>"]
    end

    %% ── Backend Layer ───────────────────────────────────────
    subgraph Backend["<b>⚙️ Backend Layer</b> | FastAPI · Python 3.10+"]
        direction TB
        APIGateway["REST API Gateway<br/><small>CORS · /api/*</small>"]
        
        subgraph Orchestrator["Report Service Orchestrator"]
            CacheCheck{"Cache Check<br/><small>Redis → Memory Fallback</small>"}
            Pipeline["Pipeline Engine<br/><small>Scrape → Analyze → Strategize</small>"]
            CacheWrite["Cache Writer<br/><small>24h TTL</small>"]
        end

        ScrapeSvc["Scrape Service<br/><small>Firecrawl /v1/search</small>"]
        LLMSvc["LLM Service<br/><small>DeepSeek Chat API</small>"]
        SeedData["Seed Data Fallback<br/><small>20 products × 4 categories</small>"]
    end

    %% ── External Services ───────────────────────────────────
    subgraph External["<b>☁️ External APIs</b>"]
        Firecrawl["Firecrawl API<br/><small>site:tiktok.com/shop search</small>"]
        DeepSeek["DeepSeek Chat API<br/><small>deepseek-chat · json_object</small>"]
    end

    %% ── Data Layer ──────────────────────────────────────────
    subgraph DataLayer["<b>💾 Data Layer</b>"]
        Redis[("Redis<br/><small>24h TTL Cache</small>")]
        MemCache[("In-Memory<br/><small>Dict Fallback</small>")]
        MySQL[("MySQL<br/><small>search_history<br/>products · analysis</small>")]
    end

    %% ── Edges ───────────────────────────────────────────────
    Browser --> SearchPg --> APIGateway
    SearchPg --> AnalysisPg
    AnalysisPg --> ReportPg
    SearchPg --> ProductsPg
    Charts --> AnalysisPg
    ListingGen --> ReportPg

    APIGateway --> Orchestrator
    CacheCheck -->|"✅ HIT"| APIGateway
    CacheCheck -->|"❌ MISS"| Pipeline
    Pipeline --> ScrapeSvc --> Firecrawl
    Pipeline -->|"live data<br/>incomplete"| SeedData
    Pipeline --> LLMSvc --> DeepSeek
    Pipeline --> CacheWrite
    CacheWrite --> Redis
    CacheWrite --> MemCache
    CacheWrite -.->|"async<br/>fire & forget"| MySQL
    APIGateway --> MySQL

    %% ── Apply Styles ────────────────────────────────────────
    class SearchPg,AnalysisPg,ReportPg,ProductsPg,Charts,ListingGen frontend
    class APIGateway,CacheCheck,Pipeline,CacheWrite,ScrapeSvc,LLMSvc,SeedData backend
    class Firecrawl,DeepSeek external
    class MySQL data
    class Redis cache
    class MemCache fallback
```

### Request Sequence

```mermaid
sequenceDiagram
    actor User as 👤 Seller
    participant FE as 🌐 Next.js Frontend
    participant API as ⚙️ FastAPI Backend
    participant Redis as 📦 Redis Cache
    participant Mem as 💾 Memory Cache
    participant FC as 🔥 Firecrawl API
    participant DS as 🧠 DeepSeek API
    participant DB as 🗄️ MySQL

    %% ── 1. Search Request ──────────────────────────────────
    User->>FE: Type keyword<br/><small>e.g. "wireless earbuds"</small>
    FE->>API: POST /api/research<br/><small>{keyword, platform: "tiktok", country: "US"}</small>
    
    %% ── 2. Cache Lookup ─────────────────────────────────────
    API->>Redis: GET report:tiktok:US:wireless earbuds
    
    alt Cache HIT
        Redis-->>API: ✅ Cached report JSON
        API-->>FE: Return cached result
        FE-->>User: Render Analysis + Report
    else Cache MISS — Pipeline
        Redis-->>API: ❌ nil
        
        API->>Mem: Check memory fallback
        alt Memory HIT (TTL valid)
            Mem-->>API: ✅ Cached report JSON
            API-->>FE: Return cached result
        else Memory MISS — Run Pipeline
            Mem-->>API: ❌ nil

            %% ── 3. Scrape Phase ────────────────────────────
            API->>FC: POST /v1/search<br/><small>query: 'site:tiktok.com/shop "wireless earbuds"'</small>
            FC-->>API: 8 search result items<br/><small>title · description · url</small>
            
            alt Live data incomplete
                API->>API: Load seed_data.json<br/><small>20 products × 4 categories</small>
            end
            
            Note over API: Parse: price · sales · rating · shop<br/>from text fields via regex

            %% ── 4. AI Analysis Phase ────────────────────────
            API->>DS: POST /v1/chat/completions<br/><small>system: "e-commerce analyst"<br/>user: product list JSON</small>
            DS-->>API: Analysis JSON<br/><small>· cleaned product<br/>· opportunity_score (0-100)<br/>· market_size, competition<br/>· selling_points, pain_points<br/>· differentiation_opportunities</small>

            %% ── 5. AI Strategy Phase ────────────────────────
            API->>DS: POST /v1/chat/completions<br/><small>system: "operational strategist"<br/>user: analysis result</small>
            DS-->>API: Strategy JSON<br/><small>· target_audience<br/>· content_ideas (3-5)<br/>· influencer_types<br/>· pricing_suggestion<br/>· risk_analysis<br/>· recommendation: 推荐/谨慎/不推荐</small>

            %% ── 6. Cache Write ──────────────────────────────
            API->>Redis: SET report:tiktok:US:wireless earbuds<br/><small>EX 86400 (24h TTL)</small>
            Redis-->>API: OK
            API->>Mem: Store in dict cache<br/><small>(timestamp, report_json)</small>

            %% ── 7. DB Persist (async) ───────────────────────
            API-->>DB: INSERT search_history<br/><small>keyword, platform, country</small>
            API-->>DB: INSERT products<br/><small>title, price, sold_count, rating, ...</small>
            API-->>DB: INSERT analysis<br/><small>opportunity_score, ai_summary, recommendation</small>
            Note over API,DB: 🔥 fire-and-forget<br/>never blocks the response
        end
    end

    %% ── 8. Response ─────────────────────────────────────────
    API-->>FE: ResearchResponse JSON<br/><small>{products[], analysis{}, strategy{}}</small>
    FE->>FE: Render: Radar chart + Bar chart +<br/>Competitor table + Opportunity ring
    FE-->>User: 📊 Interactive Analysis Dashboard
    User->>FE: Click through to Report
    FE-->>User: 📝 AI Report + Listing Generator
```

### Data Flow Diagram

```mermaid
flowchart LR
    %% ── Styles ──────────────────────────────────────────────
    classDef input    fill:#4CAF50,color:#fff,stroke:#388E3C
    classDef process  fill:#009688,color:#fff,stroke:#007069
    classDef ai       fill:#9C27B0,color:#fff,stroke:#7B1FA2
    classDef storage  fill:#FF9800,color:#000,stroke:#F57C00
    classDef output   fill:#2196F3,color:#fff,stroke:#1976D2

    %% ── Input ───────────────────────────────────────────────
    Keyword["🔑 Keyword<br/><small>'wireless earbuds'</small>"]
    Platform["🏪 Platform<br/><small>tiktok · US</small>"]

    %% ── Scrape ──────────────────────────────────────────────
    Scrape["🔍 Firecrawl Search<br/><small>/v1/search<br/>Google-indexed TikTok</small>"]
    Parse["📋 Parse & Clean<br/><small>regex: price · sales · rating · shop<br/>from title + description</small>"]
    Seed["🌱 Seed Data<br/><small>seed_data.json<br/>20 products × 4 categories<br/>fallback trigger:<br/>no price AND no sales<br/>in top 3 results</small>"]

    %% ── AI ──────────────────────────────────────────────────
    Analysis["🧠 DeepSeek Analysis<br/><small>AnalyzeResponse schema<br/>· clean product fields<br/>· opportunity_score 0-100<br/>· market_size: 大/中/小<br/>· competition: 高/中/低<br/>· growth_trend<br/>· selling_points (3-5)<br/>· pain_points (3-5)<br/>· differentiation_opportunities</small>"]
    Strategy["📝 DeepSeek Strategy<br/><small>StrategyResponse schema<br/>· target_audience<br/>· content_ideas (3-5)<br/>· influencer_types<br/>· pricing_suggestion<br/>· risk_analysis<br/>· recommendation</small>"]

    %% ── Merge ───────────────────────────────────────────────
    Merge["🔄 Assemble Report<br/><small>products[] +<br/>analysis{} +<br/>strategy{}</small>"]

    %% ── Cache ───────────────────────────────────────────────
    RedisCache[("⚡ Redis Cache<br/><small>key: report:{platform}:{country}:{keyword}<br/>TTL: 86,400s (24h)<br/>decode_responses=True</small>")]
    MemCache[("💾 Memory Fallback<br/><small>dict[str, tuple[timestamp, json]]<br/>same TTL as Redis<br/>no network dependency</small>")]

    %% ── DB ──────────────────────────────────────────────────
    DB[("🗄️ MySQL<br/><small>search_history<br/>  id, keyword, platform, country<br/>products<br/>  title, price, sold_count, rating<br/>  image_url, shop_name, platform<br/>analysis<br/>  opportunity_score, ai_summary<br/>  recommendation (JSON)</small>")]

    %% ── Output ──────────────────────────────────────────────
    CacheHit["⚡ Cache Hit<br/><small>sub-10ms response</small>"]
    Frontend["🌐 Frontend Response<br/><small>JSON → Recharts → UI</small>"]
    Dashboard["📊 Analysis Dashboard<br/><small>· Radar chart<br/>· Top sellers bar chart<br/>· Price distribution<br/>· Competitor table<br/>· Opportunity score ring</small>"]
    Report["📄 AI Report Page<br/><small>· Strategy cards<br/>· Insight cards<br/>· Recommendation<br/>· Listing Generator</small>"]

    %% ── Flow ────────────────────────────────────────────────
    Keyword --> Scrape
    Platform --> Scrape
    Scrape --> Parse
    Parse -->|"rich data ✅"| Merge
    Parse -->|"incomplete ❌"| Seed
    Seed --> Merge
    Merge --> Analysis
    Analysis --> Strategy
    Strategy --> RedisCache
    Strategy --> MemCache
    RedisCache --> CacheHit
    MemCache --> CacheHit
    CacheHit --> Frontend
    Strategy -.->|"async<br/>fire & forget"| DB
    Frontend --> Dashboard
    Frontend --> Report

    %% ── Apply Styles ────────────────────────────────────────
    class Keyword,Platform input
    class Scrape,Parse,Seed process
    class Analysis,Strategy ai
    class RedisCache,MemCache,DB storage
    class CacheHit,Frontend,Dashboard,Report output
```

### Component Interaction Map

```mermaid
graph TB
    classDef route    fill:#3178C6,color:#fff,stroke:#235a97
    classDef service  fill:#009688,color:#fff,stroke:#007069
    classDef schema   fill:#9C27B0,color:#fff,stroke:#7B1FA2
    classDef model    fill:#FF9800,color:#000,stroke:#F57C00
    classDef util     fill:#607D8B,color:#fff,stroke:#455A64

    subgraph Frontend["🌐 Frontend — Next.js 16"]
        direction TB
        subgraph Pages["📄 App Router Pages"]
            R_Search["/search<br/><small>search/page.tsx</small>"]
            R_Analysis["/analysis/[keyword]<br/><small>analysis/[keyword]/page.tsx</small>"]
            R_Report["/report/[id]<br/><small>report/[id]/page.tsx</small>"]
            R_Products["/products<br/><small>products/page.tsx</small>"]
        end
        
        subgraph Components["🧩 Components"]
            C_Radar["RadarChart"]
            C_Bar["TopSellers"]
            C_Price["PriceDistribution"]
            C_Insight["InsightCard"]
            C_Strategy["StrategyCard"]
            C_Listing["ListingGenerator"]
            C_Header["Header"]
            C_Sidebar["Sidebar"]
        end
        
        FE_Lib["lib/api.ts<br/><small>fetchReport() · fetchAllProducts()</small>"]
        FE_Types["types/report.ts<br/><small>ResearchResponse · AnalysisResult · StrategyResult</small>"]
        FE_i18n["locales/{en,zh}.json<br/><small>next-intl</small>"]
    end

    subgraph Backend["⚙️ Backend — FastAPI"]
        direction TB
        B_Routes["api/routes.py<br/><small>GET /health · /products<br/>POST /research</small>"]
        B_ReportSvc["services/report_service.py<br/><small>get_or_create_report()<br/>Cache → Scrape → LLM → Cache → DB</small>"]
        B_ScrapeSvc["services/scrape_service.py<br/><small>search_products()<br/>Firecrawl + Seed Fallback</small>"]
        B_LLMSvc["services/llm_service.py<br/><small>analyze_product()<br/>generate_strategy()</small>"]
        B_Schemas["schemas/report_schema.py<br/><small>ResearchRequest/Response<br/>AnalyzeResponse · StrategyResponse</small>"]
        B_Config["core/config.py<br/><small>Pydantic Settings</small>"]
        B_Redis["core/redis_client.py<br/><small>Async Redis Pool</small>"]
        B_DB["core/db.py<br/><small>AsyncSession + Engine</small>"]
        B_Models["models/db_models.py<br/><small>Product · Analysis · SearchHistory</small>"]
        B_Seed["seed_data/seed_data.json<br/><small>4 categories × 20 products</small>"]
    end

    subgraph External["☁️ External"]
        E_FC["Firecrawl API"]
        E_DS["DeepSeek Chat API"]
    end

    subgraph Data["💾 Data"]
        D_Redis[("Redis")]
        D_MySQL[("MySQL")]
    end

    %% Edges
    R_Search --> FE_Lib
    R_Analysis --> FE_Lib
    R_Report --> FE_Lib
    R_Products --> FE_Lib
    R_Analysis --> C_Radar & C_Bar & C_Price & C_Insight
    R_Report --> C_Strategy & C_Listing
    R_Search --> C_Header & C_Sidebar
    
    FE_Lib --> B_Routes
    FE_Types -.-> FE_Lib
    FE_i18n -.-> Pages & Components

    B_Routes --> B_ReportSvc
    B_ReportSvc --> B_Redis --> D_Redis
    B_ReportSvc --> B_ScrapeSvc --> E_FC
    B_ReportSvc --> B_LLMSvc --> E_DS
    B_ReportSvc -.-> B_Models --> B_DB --> D_MySQL
    B_ScrapeSvc --> B_Seed
    B_LLMSvc --> B_Schemas
    B_Routes --> B_Schemas
    B_ReportSvc --> B_Config
    B_ScrapeSvc --> B_Config
    B_LLMSvc --> B_Config

    class R_Search,R_Analysis,R_Report,R_Products route
    class B_ReportSvc,B_ScrapeSvc,B_LLMSvc service
    class B_Schemas,B_Config schema
    class B_Models,B_Seed model
    class FE_Lib,FE_Types,FE_i18n,B_Redis,B_DB util
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| [Next.js](https://nextjs.org/) | 16 | React framework with App Router |
| [React](https://react.dev/) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Utility-first CSS framework |
| [shadcn/ui](https://ui.shadcn.com/) | 4 | Accessible component primitives |
| [Recharts](https://recharts.org/) | 3 | Composable charting library |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Declarative animations |
| [next-intl](https://next-intl-docs.vercel.app/) | 4 | Internationalization |
| [TanStack Query](https://tanstack.com/query) | 5 | Server state management |

### Backend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| [FastAPI](https://fastapi.tiangolo.com/) | 0.110+ | Async Python web framework |
| [Uvicorn](https://www.uvicorn.org/) | 0.29+ | ASGI server |
| [SQLAlchemy](https://www.sqlalchemy.org/) | 2.0 | Async ORM (aiomysql driver) |
| [Pydantic](https://docs.pydantic.dev/) | v2 | Data validation & settings |
| [httpx](https://www.python-httpx.org/) | 0.27+ | Async HTTP client |

### Data & AI

| Technology | Purpose |
|:-----------|:--------|
| [MySQL](https://www.mysql.com/) | Persistent storage (search history, products, analysis) |
| [Redis](https://redis.io/) | Query cache with 24h TTL + in-memory fallback |
| [DeepSeek Chat API](https://platform.deepseek.com/) | Product analysis, market scoring, strategy generation |
| [Firecrawl API](https://firecrawl.dev/) | TikTok Shop product search via Google-indexed results |

---

## 📁 Project Structure

```
TyON/
├── backend/
│   ├── main.py                     # FastAPI app entry point
│   ├── init_db.py                  # Database table creation
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Environment variable template
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py               # GET /health, /products; POST /research
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py               # Pydantic settings (env vars)
│   │   ├── db.py                   # Async SQLAlchemy engine & session
│   │   └── redis_client.py         # Async Redis connection pool
│   ├── models/
│   │   ├── __init__.py
│   │   └── db_models.py            # Product, Analysis, SearchHistory ORM
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── report_schema.py        # Pydantic request/response & LLM output schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── scrape_service.py       # Firecrawl search + seed data fallback
│   │   ├── llm_service.py          # DeepSeek analysis + strategy generation
│   │   └── report_service.py       # Pipeline orchestrator + cache + DB persist
│   ├── scripts/
│   │   ├── fill_demo_data.py       # Populate DB with seed products
│   │   ├── fill_placeholder_images.py
│   │   ├── match_local_images.py
│   │   └── warmup_cache.py         # Pre-warm Redis cache for demo keywords
│   └── seed_data/
│       └── seed_data.json          # 20 pre-collected products × 4 categories
│
├── frontend/
│   ├── package.json                # Node dependencies & scripts
│   ├── next.config.ts              # Next.js configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── app/
│   │   ├── layout.tsx              # Root layout (providers, i18n)
│   │   ├── page.tsx                # Home (redirects to /search)
│   │   ├── globals.css             # Tailwind + shadcn theme
│   │   ├── search/
│   │   │   └── page.tsx            # Keyword search with demo prompts
│   │   ├── analysis/
│   │   │   └── [keyword]/
│   │   │       └── page.tsx        # Charts, competitor table, filters
│   │   ├── report/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # AI report + listing generator
│   │   └── products/
│   │       └── page.tsx            # Product library grid (20 products)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx          # Top navigation bar
│   │   │   └── sidebar.tsx         # Side navigation
│   │   ├── cards/
│   │   │   ├── insight-card.tsx    # AI insight display card
│   │   │   ├── strategy-card.tsx   # Strategy recommendation card
│   │   │   └── recommendation-card.tsx
│   │   ├── charts/
│   │   │   ├── radar-chart.tsx     # Multi-dimension comparison
│   │   │   ├── top-sellers.tsx     # Horizontal bar chart
│   │   │   └── price-distribution.tsx
│   │   ├── report/
│   │   │   └── listing-generator.tsx  # AI-assisted listing tool
│   │   └── ui/
│   │       ├── opportunity-ring.tsx   # Circular score indicator
│   │       ├── metric-tooltip.tsx
│   │       └── ...shadcn primitives
│   ├── lib/
│   │   ├── api.ts                  # Backend API client
│   │   ├── scoring.ts              # Opportunity score computation
│   │   ├── analysis-filters.ts     # Product filtering logic
│   │   ├── listing-template.ts     # Listing generation templates
│   │   ├── chart-utils.ts          # Chart data transformers
│   │   └── metricGlossary.ts       # i18n metric definitions
│   ├── types/
│   │   └── report.ts               # TypeScript interfaces
│   ├── locales/
│   │   ├── en.json                 # English translations
│   │   └── zh.json                 # 中文翻译
│   └── public/
│       └── product-images/         # 20 demo product photos
│
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Docker Desktop** — for MySQL & Redis (or use local installations)
- **Python 3.10+**
- **Node.js 20+**
- API keys: [Firecrawl](https://firecrawl.dev) (free tier available) + [DeepSeek](https://platform.deepseek.com)

### Quick Start

```bash
# 1. Clone
git clone https://github.com/submindd/TyON1.0.git
cd TyON1.0

# 2. Start infrastructure (MySQL + Redis)
# Use Docker or local installations:
docker run -d --name mysql-tyon -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=tyon mysql:8
docker run -d --name redis-tyon -p 6379:6379 redis:7-alpine

# 3. Environment
cp backend/.env.example backend/.env
# Edit backend/.env — add your FIRECRAWL_API_KEY and DEEPSEEK_API_KEY

# 4. Backend
cd backend
pip install -r requirements.txt
python init_db.py
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# 5. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

> 💡 Replace the `docker run` commands above with your own MySQL/Redis setup if you already have them installed locally.

### Verify

| URL | What You See |
|:----|:-------------|
| `http://localhost:3000` | Home (redirects to search) |
| `http://localhost:3000/search` | Keyword search with demo prompts |
| `http://localhost:3000/products` | Product library (20 demo products) |
| `http://127.0.0.1:8000/api/health` | `{"status": "ok"}` |
| `http://127.0.0.1:8000/docs` | FastAPI auto-generated Swagger UI |

---

## 🔐 Environment Variables

Create `backend/.env` from the template:

```bash
# Firecrawl — TikTok Shop product search
FIRECRAWL_API_KEY=fc-xxxxxxxxxxxxxxxx

# DeepSeek — AI market analysis + strategy generation
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx

# MySQL — persistent storage
MYSQL_URL=mysql+pymysql://user:password@localhost:3306/tyon

# Redis — query cache (24h TTL)
REDIS_URL=redis://localhost:6379/0
```

> **Note:** The app runs without API keys by falling back to seed data, but AI analysis will be unavailable. For the full experience, sign up for free tiers at [firecrawl.dev](https://firecrawl.dev) and [platform.deepseek.com](https://platform.deepseek.com).

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Request Body |
|:-------|:---------|:------------|:-------------|
| `GET` | `/api/health` | Health check | — |
| `GET` | `/api/products` | List all seed products (grouped by category) | — |
| `POST` | `/api/research` | Full pipeline: scrape → AI analysis → strategy | `{"keyword": "...", "platform": "tiktok", "country": "US"}` |

### Example: Research Request

```bash
curl -X POST http://127.0.0.1:8000/api/research \
  -H "Content-Type: application/json" \
  -d '{"keyword": "wireless earbuds", "platform": "tiktok", "country": "US"}'
```

<details>
<summary>Example Response (click to expand)</summary>

```json
{
  "products": [
    {
      "title": "Wireless Bluetooth Earbuds",
      "price": 14.90,
      "sold_count": "33.8K sold",
      "rating": 4.5,
      "image_url": "https://...",
      "product_url": "https://www.tiktok.com/...",
      "shop_name": "AudioPro Store",
      "data_source": "seed"
    }
  ],
  "analysis": {
    "product": { "title": "...", "price": "$14.90", "rating": 4.5, ... },
    "opportunity_score": 75,
    "market_size": "大",
    "competition": "中",
    "growth_trend": "+23% vs last month",
    "selling_points": ["Excellent value", "High demand", ...],
    "pain_points": ["Battery life complaints", ...],
    "differentiation_opportunities": ["Add noise cancellation", ...]
  },
  "strategy": {
    "target_audience": "Tech-savvy Gen Z consumers...",
    "content_ideas": ["Unboxing ASMR", "Before/after sound test", ...],
    "pricing_suggestion": "$14.90 - $24.90",
    "risk_analysis": "Moderate competition in the budget segment...",
    "recommendation": "推荐 - 市场需求大且竞争适中"
  }
}
```

</details>

---

## 🧠 Data Pipeline

```
Keyword → Firecrawl Search (TikTok Shop via Google index)
       ↓ (live data incomplete?)
       Seed Data Fallback (20 curated products × 4 categories)
       ↓
       DeepSeek Analysis — product cleaning + opportunity score + market sizing
       ↓
       DeepSeek Strategy — audience, content ideas, pricing, risk, recommendation
       ↓
       Redis Cache (24h TTL) + In-Memory Cache (automatic fallback)
       ↓
       MySQL Persistence (async, fire-and-forget)
       ↓
       JSON Response → Frontend Charts + Report + Listing Generator
```

---

## 🗺️ Roadmap

- [x] Product Research — Firecrawl search + seed data fallback
- [x] AI Analysis — DeepSeek market analysis + opportunity scoring
- [x] Listing Generation — AI-assisted SEO title, bullets, and description
- [x] Redis Caching — 24h TTL with automatic in-memory fallback
- [x] Data Visualization — Radar, bar, and price distribution charts
- [x] Multi-language — English / 中文 i18n
- [ ] User Authentication — Clerk or NextAuth integration
- [ ] Personal Dashboard — Saved reports, search history, favorites
- [ ] Multi-platform Support — Amazon, Shopee, Lazada
- [ ] Export Reports — PDF & CSV download
- [ ] Trend Tracking — Price & sales volume history over time
- [ ] Deployment — Docker Compose production config + cloud deploy guide

---

## 👤 Author

**submindd**

- GitHub: [@submindd](https://github.com/submindd)
- Project: [TyON1.0](https://github.com/submindd/TyON1.0)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Built with ❤️ using FastAPI, Next.js, DeepSeek &amp; Firecrawl</sub>
</p>
