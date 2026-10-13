# Architecture Decision Record (ADR)

## Project: Giant — Real-Time Industry Intelligence and Customer Churn Prediction Platform

### Date: 2026-10-13
### Status: Accepted

---

### Context & Problem Statement
Business Analysts need an enterprise-grade platform to monitor market shifts across three critical Indian sectors (Telecom, Fintech & Digital Payments, and Electric Vehicles), analyze competitors, forecast customer churn using real labeled customer datasets, and embed authentic Microsoft Power BI reports. 

The application must strictly follow non-negotiable data integrity principles:
1. **No Fabricated Data**: No fake headlines, artificial metrics, or synthetic live timestamps. If data is not yet fetched or unavailable, an explicit empty state or "Data not available" is rendered.
2. **Transparent Timestamps**: Source publication time, application ingestion time, database sync time, and Power BI refresh time must be captured and presented separately.
3. **Four-Page Guided Flow**: Page 1 (`/`) -> Page 2 (`/industries`) -> Page 3 (`/industry/:slug`) -> Page 3.1 (`/industry/:slug/news-bi`).

---

### Decision 1: Monorepo Structure with Frontend & Backend Separation
We adopt a clean monorepo architecture:
- `backend/`: Python 3.11+ with FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2 schemas, and background RSS fetchers.
- `frontend/`: React 18/19 with TypeScript, Vite, Tailwind CSS, Lucide Icons, and modern design tokens following the Dark Navy & Violet enterprise design system.
- Shared contracts via RESTful JSON APIs.

---

### Decision 2: Database Strategy (PostgreSQL with Local Development Support)
- Primary production target: **PostgreSQL** (compatible with Neon, Supabase, Render, Railway, or local Postgres).
- Connection abstraction: Handled transparently by SQLAlchemy. If `DATABASE_URL` is PostgreSQL, standard async/sync postgres drivers are utilized. A local SQLite database (`giant.db`) is supported automatically when `DATABASE_URL` is omitted, allowing zero-friction offline execution while maintaining full schema parity.
- Migrations: Managed via SQLAlchemy metadata with Alembic compatibility.

---

### Decision 3: RSS Feed Ingestion & Data Normalization Pipeline
- Allowed sources: Verified Indian and international financial/tech RSS feeds:
  - *Telecom*: Economic Times Telecom, LiveMint Telecom, Business Standard Technology, TRAI official releases.
  - *Fintech*: Inc42 Fintech, Economic Times BFSI / Banking, LiveMint Money, NPCI news.
  - *EV*: Autocar Professional India EV, RushLane, Economic Times Auto EV.
- Pipeline stages:
  1. Fetch XML/Atom feed via standard HTTP client (`httpx` / `feedparser`).
  2. Parse and normalize fields: Title, Summary, Clean URL, Publication Timestamp.
  3. Deduplication via URL hash / Title fuzzy matching.
  4. Tagging: Automatic entity tagging against known industry players (e.g., Reliance Jio, Bharti Airtel, Vodafone Idea, BSNL, Starlink, PhonePe, Google Pay, Paytm, Tata Motors, Mahindra, MG, etc.).
  5. Ingestion timestamp recorded independently as `retrieved_at`.

---

### Decision 4: Enterprise UI Design Tokens & Theme
- Background: Dark Navy foundation (`#0B0F19`, `#111827`, `#0F172A`).
- Accents: Electric Blue (`#3B82F6`) and Royal Violet (`#8B5CF6`).
- Typography: Inter / system sans-serif with readable weights and WCAG AA contrast compliance.
- Responsive breakpoints: Mobile (<640px), Tablet (640px-1024px), Desktop (>1024px).
- Reduced-motion adherence: Standard animations are disabled when `prefers-reduced-motion` is detected.

---

### Decision 5: Microsoft Power BI Integration (Page 3.1)
- Backend provides optimized REST views (`/api/v1/powerbi/news-feed`) designed for Power BI Desktop ingestion (DirectQuery or Scheduled Refresh) and Entra ID App Service Principal token generation.
- Frontend includes an authentic Power BI embed container using official embed configurations, paired with a dedicated setup walkthrough screen and a native dashboard fallback when tenant secrets are not yet configured.

---

### Decision 6: Version Control Identity
- Author: `Dhaneesh Vijayanand`
- Email: `216114899+DhaneeshVijayanand@users.noreply.github.com`
