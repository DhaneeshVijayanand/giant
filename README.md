# GIANT: Real-Time Industry Intelligence and Customer Churn Prediction Platform

Giant is an enterprise-grade platform for Business Analysts to monitor market shifts across Telecom, Fintech & Digital Payments, and Electric Vehicles in India and globally, predict customer churn using calibrated ML models, and visualize business intelligence in Microsoft Power BI.

---

## Architecture & Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (Dark Navy & Violet Enterprise Design System), Lucide Icons.
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2 schemas.
- **Database**: PostgreSQL (Production) / SQLite (Zero-config local development).
- **Pipeline**: Automated RSS and official portal connectors with entity tagging, impact scoring, and deduplication.
- **Testing**: `pytest` for backend unit and API testing; `tsc` and Vite build validation for frontend.

---

## 4-Page Guided Flow
1. **Page 1 (`/`)**: Welcome Screen with 5-second automatic countdown, Skip control, live clock, and enterprise branding.
2. **Page 2 (`/industries`)**: Industry Selection with live database-backed cards for Telecom, Fintech, and Electric Vehicles.
3. **Page 3 (`/industry/:slug`)**: Industry Intelligence Dashboard featuring Live News with entity filters, original source links, publication vs. retrieval timestamps, and tabbed shells for future modules.
4. **Page 3.1 (`/industry/:slug/news-bi`)**: Live News Intelligence with Power BI Service setup instructions and high-fidelity native fallback analytics.

---

## Quickstart Guide

### 1. Backend Setup
```powershell
cd e:\giant\backend
# Requirements are already installed; if needed:
py -m pip install -r requirements.txt

# Run the backend API server (runs on http://127.0.0.1:8000)
py -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```powershell
cd e:\giant\frontend
# Install dependencies
npm.cmd install

# Start development server (runs on http://localhost:5173)
npm.cmd run dev
```

### 3. Running Backend Tests
```powershell
cd e:\giant\backend
py -m pytest tests/
```

### 4. Running Frontend Production Build
```powershell
cd e:\giant\frontend
npm.cmd run build
```
