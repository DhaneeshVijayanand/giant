# Giant Platform: Production Deployment & Operations Guide

This guide covers deploying the **Giant: Real-Time Industry Intelligence and Customer Churn Prediction Platform** to production environments.

---

## 1. Architecture Topology

```mermaid
flowchart TD
    Client["Browser / Business Analyst"] -->|HTTPS / Port 443| Frontend["Frontend (Vercel / Nginx)"]
    Frontend -->|REST API / CORS| Backend["FastAPI Backend (Render / Docker)"]
    Backend -->|SQLAlchemy / DirectQuery| DB[("PostgreSQL Database (Managed / Docker)")]
    Backend -->|Background Worker| APScheduler["APScheduler (5m/15m/daily polling)"]
    APScheduler -->|Authorized RSS Feeds| RSS["ET Telecom, LiveMint, Inc42, RushLane"]
    APScheduler -->|Official Benchmarks| Regulators["TRAI, NPCI, MoRTH Vahan"]
    Backend -->|OAuth2 Client Credentials| AzureAD["Microsoft Entra ID"]
    AzureAD -->|Embed Token| PowerBI["Power BI Service"]
    PowerBI -->|Direct Iframe| Frontend
```

---

## 2. Option A: Cloud Deployment (Recommended: Vercel + Render/Railway)

### A. Frontend on Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Build command: `npm run build`. Output directory: `dist`.
5. Environment Variables:
   - `VITE_API_URL`: Set to your production backend URL (e.g. `https://giant-api.onrender.com`).
6. Deploy. Vercel automatically honors `frontend/vercel.json` for SPA routing and security headers.

### B. Backend on Render or Railway
> **Important:** The backend runs APScheduler in background threads. Deploy as a standard **Web Service** or **Always-On Worker** (do not use serverless lambdas that freeze CPU between requests, as this stops background news ingestion).

1. Create a new **Web Service** pointing to this repository.
2. Root directory: `backend`.
3. Runtime: **Python 3.13** or **Docker** (`backend/Dockerfile`).
4. Build command: `pip install -r requirements.txt`.
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Health Check Path: `/health`.

### C. Managed PostgreSQL Database
1. Provision a PostgreSQL 15+ database on Render, Supabase, Neon, or AWS RDS.
2. Provide the connection string as `DATABASE_URL` to the backend.
3. On first startup, the backend automatically runs migrations and seeds official benchmarks.

---

## 3. Option B: Self-Hosted Docker Compose Deployment

To deploy the complete multi-container stack (Backend + Frontend Nginx + PostgreSQL) on a Linux VPS / VM:

1. Clone repository to server:
   ```bash
   git clone https://github.com/DhaneeshVijayanand/giant.git
   cd giant
   ```

2. Configure environment file:
   ```bash
   cp .env.example .env
   # Edit .env with your production secrets
   ```

3. Launch stack:
   ```bash
   docker compose up -d --build
   ```

4. Verify services:
   ```bash
   docker compose ps
   curl http://localhost:8000/health
   ```

---

## 4. Production Environment Variable Reference

| Variable Name | Required | Default | Purpose |
|---|---|---|---|
| `ENVIRONMENT` | Yes | `production` | Set to `production` in live environments |
| `DEBUG` | No | `false` | Disable debug stacktraces in production |
| `DATABASE_URL` | Yes | SQLite fallback | PostgreSQL connection string (`postgresql://user:pass@host:5432/dbname`) |
| `CORS_ORIGINS` | Yes | `http://localhost:5173` | Comma-separated list of allowed frontend origins |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key for live AI analyst synthesis |
| `ANTHROPIC_API_KEY` | Optional | `""` | Anthropic Claude API key fallback |
| `LLM_SPEND_CAP_USD` | No | `10.0` | Hard spending ceiling for external LLM API usage |
| `POWERBI_CLIENT_ID` | Optional | `""` | Azure AD Service Principal Application ID |
| `POWERBI_CLIENT_SECRET` | Optional | `""` | Azure AD Service Principal Client Secret |
| `POWERBI_TENANT_ID` | Optional | `""` | Microsoft Entra Directory (Tenant) ID |
| `POWERBI_WORKSPACE_ID` | Optional | `""` | Power BI Premium/Fabric Workspace GUID |
| `POWERBI_REPORT_ID` | Optional | `""` | Power BI Published Report GUID |
| `POWERBI_DATASET_ID` | Optional | `""` | Power BI Semantic Model GUID |

---

## 5. Security & Reliability Controls in Production

1. **OWASP Security Headers**:
   - Every response includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and strict CSP allowing Power BI iframes.
2. **In-Memory Rate Limiting**:
   - General API: 120 requests/min per IP.
   - AI Analyst (`/api/v1/ai/chat`): 30 requests/min per IP.
   - Dataset Upload (`/api/v1/churn/upload`): 15 requests/min per IP.
   - Triggers standard HTTP 429 Too Many Requests with `Retry-After: 60`.
3. **SSRF Defense**:
   - Connectors only fetch from allowlisted RSS providers in `INDUSTRIES_CONFIG`. Loopback (`127.0.0.1`, `localhost`) and private RFC1918 subnets are rejected.
4. **Formula Injection Neutralization**:
   - CSV exports sanitize dangerous formula characters (`=`, `+`, `-`, `@`) with prepended single-quotes to protect spreadsheet users.
5. **PII and Data Leakage Protection**:
   - Customer dataset uploads are sanitized, evaluated in-memory, and PII columns are masked. Power BI feeds strictly exclude customer datasets.

---

## 6. Automated Database Backup Procedures

### Windows (PowerShell)
```powershell
cd backend/scripts
.\backup_database.ps1 -BackupDir "C:\backups\giant"
```

### Linux / Docker (Bash)
```bash
cd backend/scripts
chmod +x backup_database.sh
./backup_database.sh /var/backups/giant
```
Add to `crontab` for automated daily backups at 02:00 AM:
```cron
0 2 * * * /path/to/giant/backend/scripts/backup_database.sh /var/backups/giant >> /var/log/giant_backup.log 2>&1
```

---

## 7. Health Check and Monitoring

The backend exposes a health probe endpoint at `/health`:
```json
{
  "status": "healthy",
  "database": "connected",
  "scheduler": {
    "running": true,
    "active_jobs_count": 3
  },
  "uptime_seconds": 3840,
  "environment": "production"
}
```
If the database connection drops, `/health` returns HTTP `503 Service Unavailable` with `"status": "degraded"`.
