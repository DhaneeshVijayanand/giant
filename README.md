# GIANT: Real-Time Industry Intelligence & Customer Churn Prediction Platform

[![Live App](https://img.shields.io/badge/Live%20App-Vercel-black.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://giant-virid.vercel.app/)
[![API Status](https://img.shields.io/badge/API-Render%20Live-46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)](https://giant-74pu.onrender.com/health)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Pytest](https://img.shields.io/badge/Pytest-47%20Passed-brightgreen.svg?style=for-the-badge&logo=pytest&logoColor=white)](https://pytest.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**Giant** is an enterprise-grade competitive intelligence platform engineered for **Strategy Executives, Product Leaders, and Industry Analysts**. It unifies verified real-time sector feeds across **Telecom**, **Fintech & Digital Payments**, and **Electric Vehicles (EV)** in India with calibrated Machine Learning for **Customer Churn Prediction** and deep **Microsoft Power BI** reporting.

---

## 🌐 Live Production Deployments

| Component | Production URL | Status | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | [https://giant-virid.vercel.app/](https://giant-virid.vercel.app/) | ![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel) | React 18 + Vite SPA with luxury Cobalt / Obsidian Glass UI |
| **Backend API Server** | [https://giant-74pu.onrender.com/](https://giant-74pu.onrender.com/) | ![Render](https://img.shields.io/badge/Render-Active-46E3B7?logo=render) | FastAPI + APScheduler automated polling engine |
| **Interactive API Docs** | [https://giant-74pu.onrender.com/docs](https://giant-74pu.onrender.com/docs) | ![Swagger](https://img.shields.io/badge/Swagger-UI-85EA2D?logo=swagger) | Interactive OpenAPI / Swagger interface |
| **Health Probe** | [https://giant-74pu.onrender.com/health](https://giant-74pu.onrender.com/health) | ![Health](https://img.shields.io/badge/Health-200%20OK-brightgreen) | Real-time database, scheduler, and uptime telemetry |

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Presentation Layer (Vercel)"]
        UI["React 18 + TypeScript + Tailwind"]
        UI --> W["Welcome & Clock Screen (/)"]
        UI --> S["Industry Selector (/industries)"]
        UI --> D["Intelligence Dashboard (/industry/:slug)"]
        UI --> BI["Power BI Analytics (/industry/:slug/news-bi)"]
        D --> Tabs["Tabs: News Radar | Market Leaders | Competitive Intel | Churn Studio"]
    end

    subgraph Security ["Security & Hardening Layer"]
        SH["OWASP Security Headers (CSP, Frame Options, HSTS)"]
        RL["In-Memory Rate Limiter (Token Bucket)"]
        SSRF["SSRF Guard & RFC1918 Private IP Filter"]
        CSVSEC["OWASP Formula Injection Defense"]
        FSEC["CSV Sanitization & Null-Byte Detector"]
    end

    subgraph Server ["Application Engine (Render Container)"]
        API["FastAPI Backend (/api/v1)"]
        SCHED["APScheduler (5m Breaking / 15m General / 24h Regulatory)"]
        ML["Churn ML Engine (Scikit-Learn Logistic Regression & Random Forest)"]
        DEDUP["News Clustering & Deduplication Engine"]
        EXPO["ReportLab PDF & Safe CSV Generators"]
        PBI_SRV["Power BI DirectQuery & Embed Token Manager"]
    end

    subgraph Persistence ["Data Sources & Telemetry"]
        DB[("SQLite / PostgreSQL Database")]
        RSS["Authorized RSS Feeds (ET Telecom, LiveMint, Inc42, RushLane)"]
        REG["Official Published Reports (TRAI, NPCI, MoRTH Vahan)"]
        AZURE["Microsoft Entra ID (Azure AD)"]
        PBISVC["Microsoft Power BI Service"]
    end

    Client --> Security --> API
    API --> DB
    API --> ML
    API --> DEDUP
    API --> EXPO
    API --> PBI_SRV
    SCHED --> RSS
    SCHED --> REG
    PBI_SRV --> AZURE --> PBISVC
```

---

## ✨ Core Platform Capabilities

### 1. Multi-Sector Real-Time Intelligence Radars
- **Telecom**: Real-time coverage of 5G rollouts, ARPU shifts, satcom spectrum debates, and TRAI telecom guidelines.
- **Fintech & Digital Banking**: Real-time updates on UPI volume, digital lending regulations, soundbox rollouts, and RBI notifications.
- **Electric Vehicles (EV)**: 2W/3W/4W registrations, battery gigafactories, charging infrastructure, and Vahan database trends.
- **Deduplication & Clustering**: Multi-source event grouping aggregates identical news stories across publishers into a single clustered card, listing all reporting outlets.
- **Four Independent Timestamps**: Explicit audit trail for every story:
  1. *Published At* (Article timestamp from original publisher)
  2. *Retrieved At* (When Giant ingested the article)
  3. *Last Verified Sync* (When the feed was last polled)
  4. *Next Scheduled Check* (APScheduler next execution time)

### 2. Market Leaders & Regulatory Benchmarks
- Sourced from official published filings:
  - **TRAI Monthly Reports**: Wireline and wireless subscriber counts, VLR active subscriber percentages, broadband market share.
  - **NPCI Monthly Volume**: UPI transaction counts and gross rupee value.
  - **MoRTH Vahan Registry**: Electric vehicle retail sales counts.
- **6-Month Historical Progression**: Responsive grouped bar visualizer with continuous trend lines and verified filing periods.
- **Brand Identity Palette**: Preserves official brand guidelines across charts:
  - **Reliance Jio**: `#3B82F6` (Electric Blue)
  - **Bharti Airtel**: `#A78BFA` (Vibrant Purple)
  - **Vodafone Idea**: `#FBBF24` (Amber Gold)
  - **BSNL**: `#64748B` (Steel Slate)

### 3. Head-to-Head Competitive Intelligence
- **Interactive Matchup Radar**: Select any two competitors (e.g. Jio vs. Airtel, PhonePe vs. Google Pay, Tata vs. Mahindra) to generate direct comparative analysis.
- **Tactical Development Categorization**: Filter competitor moves by Product Launch, Pricing Change, Regulatory Filing, or Strategic Partnership.
- **Persistent Watchlists**: Save and pin monitored entities with custom analyst notes, persisted across sessions.

### 4. Calibrated Customer Churn Prediction Studio
- **Principle of Customer-Level Modeling**: Recognizes that public macro news cannot predict individual customer churn; individual churn prediction requires customer-level operational telemetry.
- **Dual ML Architectures**:
  - *Baseline*: Regularized Logistic Regression (Interpretable odds ratios).
  - *Primary Calibrated*: Random Forest Classifier (Non-linear multi-feature interactions).
- **Leakage Prevention**: Customer identifiers stripped, 80/20 stratified train/test split, zero synthetic test inflation.
- **Key Metrics**: Accuracy, Precision, Recall, and ROC-AUC curve scores.
- **Feature Importance Drivers**: Identifies top churn indicators (Month-to-Month contracts, Tenancy duration, Fiber Tech, Electronic Check).
- **Risk Distribution Tiers**: Quantifies customer distribution across Low (<30%), Medium (30–60%), and High (>60%) churn risk.
- **Interactive Data Studio**:
  - Test on the verified **IBM Telco Benchmark** dataset (watermarked as *Demo data*).
  - Upload custom operational CSVs with automated schema detection, cleaning, and sanitization.
  - Full data privacy purge button (`DELETE /api/v1/churn/dataset`) instantly clearing raw records and model weights.

### 5. Microsoft Power BI Embedded & Native Fallback Studio
- **Dual Operating Modes**:
  - **Authenticated Embed**: Generates short-lived Azure AD Service Principal embed tokens with automatic proactive renewal 5 minutes prior to expiration.
  - **Native BI Fallback**: Operates without Azure credentials by compiling real database metrics into native sentiment, business impact, and entity distribution charts.
- **Live Direct Data Feeds**: Exposes sanitized JSON and CSV data streams (`/api/v1/powerbi/data-feed`) ready for Power BI Desktop Web Ingestion without exposing customer PII.
- **Interactive Setup Guide**: Comprehensive prerequisites checklist for Microsoft Entra ID app registration, Workspace ID, and Semantic Model configuration.

### 6. Starlink India Strategic Disruption Engine
- Analyzes potential market disruption from satellite Low Earth Orbit (LEO) mega-constellations.
- Models 3 distinct market entry scenarios:
  1. *High Disruption*: Direct enterprise, maritime, defense, and rural high-speed monopoly.
  2. *Moderate Coexistence*: Cellular backhaul partner to telcos with niche luxury consumer adoption.
  3. *Constrained Entry*: High user terminal hardware costs ($350+) limiting penetration to remote enterprise sites.
- 12 verified regulatory citations spanning TRAI, DoT, and IN-SPACe spectrum guidelines.

---

## 🎨 Luxury Obsidian & Cobalt Design System

The platform features an executive **Obsidian Black**, **Cobalt Blue Deep**, and **Pure White** aesthetic with physical glassmorphism:

| Token | Value | Applied To |
| :--- | :--- | :--- |
| **Obsidian Base** | `#000000` | Canvas base with subtle gradient glow mesh |
| **Pure White** | `#FFFFFF` | Primary headings, prominent KPIs, active badges |
| **Cobalt Blue Deep** | `#2C3480` | Signature brand accents, buttons, glowing pill borders |
| **Electric Cobalt** | `#5C6BE8` | Focused states, high-contrast links, interactive controls |
| **Slate Tint** | `#CBD5E1` / `#94A3B8` | Secondary body text and structural borders (`border-white/10`) |

### Glassmorphism Depth Levels
1. **`glass-base` (Depth 1)**: `backdrop-filter: blur(20px)` with translucent fill for data cards, chips, and sub-panels.
2. **`glass-raised` (Depth 2)**: `backdrop-filter: blur(28px)` with subtle outer top border highlight for main section containers and headers.
3. **`glass-overlay` (Depth 3)**: `backdrop-filter: blur(40px)` for floating top navigation capsules, modals, and mobile tab bars.
4. **Tabular Numerics**: Strict `tabular-nums` formatting across all financial metrics, timestamps, and percentages for vertical alignment.

---

## 🛡️ Enterprise Security & Hardening Controls

Giant implements defenses across every ingestion and export vector:

| Defense Vector | Implementation | Verification Test |
| :--- | :--- | :--- |
| **OWASP Security Headers** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, strict Content-Security-Policy (CSP) allowing Power BI iframe integration. | `test_security_headers_present` |
| **In-Memory Rate Limiting** | Sliding-window token bucket: 120 req/min for general API, 30 req/min for AI analysis, 15 req/min for CSV uploads. Returns HTTP 429 with `Retry-After: 60`. | `test_rate_limiter_exceed_limit` |
| **SSRF Attack Guard** | Rejects non-HTTP protocols, private RFC1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local IPs (`169.254.169.254`), loopbacks (`127.0.0.1`), and enforces an authorized RSS feed allowlist. | `test_ssrf_protection_blocks_internal_and_private_ips` |
| **CSV Upload Defense** | Strict `.csv` extension verification, MIME type validation, 10 MB payload limit, path traversal defense, and binary null-byte (`\x00`) executable payload detection. | `test_upload_security_rejects_binary_file` |
| **Formula Injection Guard** | Prepends single quotes (`'`) to dangerous spreadsheet formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) on all CSV export endpoints. | `test_formula_injection_defense` |
| **Flexible CORS Engine** | Handles wildcard `*`, single domains, and comma-separated origin lists without Pydantic JSON deserialization errors. | `test_api_endpoints.py` |
| **Container Hardening** | Runs on `python:3.11-slim` with non-root user permissions and dynamic `$PORT` routing for serverless container hosts. | `Dockerfile` inspection |

---

## ⚙️ Environment Variables Reference

```ini
# Server Settings
ENVIRONMENT=production
DEBUG=false
HOST=0.0.0.0
PORT=8000

# Database Connection (SQLite default, PostgreSQL supported)
DATABASE_URL=sqlite:///./giant.db
# DATABASE_URL=postgresql://user:password@hostname:5432/dbname

# CORS Allowed Origins (Comma-separated or * for public APIs)
CORS_ORIGINS=*

# Automated Polling Intervals
BREAKING_NEWS_INTERVAL_MINUTES=5
GENERAL_NEWS_INTERVAL_MINUTES=15
OFFICIAL_STATS_CHECK_HOURS=24

# Optional: AI Analyst (If unset, deterministic grounded synthesis is used)
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
LLM_SPEND_CAP_USD=10.0

# Optional: Microsoft Power BI Embedded (If unset, native fallback activates)
POWERBI_CLIENT_ID=
POWERBI_CLIENT_SECRET=
POWERBI_TENANT_ID=
POWERBI_WORKSPACE_ID=
POWERBI_REPORT_ID=
POWERBI_DATASET_ID=
```

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/DhaneeshVijayanand/giant.git
cd giant
```

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
- Local Application: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Automated Testing & Verification

### Backend Pytest Suite
```bash
cd backend
py -m pytest --cov=app tests/
```
```text
============================= test session starts =============================
platform win32 -- Python 3.13.1, pytest-9.1.1, pluggy-1.6.0
collected 47 items

tests\test_api_endpoints.py .....                                        [ 10%]
tests\test_milestone2.py ........                                        [ 27%]
tests\test_milestone3.py ........                                        [ 44%]
tests\test_milestone4.py .......                                         [ 59%]
tests\test_milestone5.py ......                                          [ 72%]
tests\test_milestone6.py .........                                       [ 91%]
tests\test_rss_and_news.py ....                                          [100%]
======================== 47 passed, 1 warning in 6.93s ========================
```

### Frontend Typecheck & Build
```bash
cd frontend
npm run build
```
```text
✓ 1500 modules transformed.
dist/index.html                    1.07 kB │ gzip:  0.57 kB
dist/assets/index-DKXaWIEU.css    59.28 kB │ gzip: 10.50 kB
dist/assets/index-CEB4vtW8.js    116.95 kB │ gzip: 24.88 kB
dist/assets/vendor-DFdD60e4.js   181.43 kB │ gzip: 56.87 kB
dist/assets/powerbi-DWeTH1gA.js  233.26 kB │ gzip: 40.31 kB
✓ built in 6.90s
```

---

## 👤 Author & Maintainer

- **Developer & Architect**: **Dhaneesh Vijayanand**
- **GitHub**: [@DhaneeshVijayanand](https://github.com/DhaneeshVijayanand)
- **Repository**: [https://github.com/DhaneeshVijayanand/giant](https://github.com/DhaneeshVijayanand/giant)
- **Email**: `216114899+DhaneeshVijayanand@users.noreply.github.com`
- **License**: MIT
