import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, SessionLocal, ensure_schema_migrations
from app.api.router import api_router
from app.services.scheduler import init_scheduler, shutdown_scheduler, get_scheduler_status
from app.services.competitor_service import seed_official_metrics_if_empty
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.rate_limiter import InMemoryRateLimiterMiddleware
import app.models

APP_START_TIME = time.time()

# Initialize tables and ensure migrations
Base.metadata.create_all(bind=engine)
ensure_schema_migrations()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    db = SessionLocal()
    try:
        seed_official_metrics_if_empty(db)
    finally:
        db.close()
    
    init_scheduler()
    yield
    # Shutdown actions
    shutdown_scheduler()

app = FastAPI(
    title="Giant: Real-Time Industry Intelligence Platform API",
    description="Backend API powering Industry Intelligence, Competitor Tracking, and Churn Prediction.",
    version="1.0.0",
    lifespan=lifespan
)

# 1. Rate Limiting Middleware (in-memory token bucket/sliding window)
app.add_middleware(InMemoryRateLimiterMiddleware)

# 2. Security Headers Middleware (OWASP recommended headers)
app.add_middleware(SecurityHeadersMiddleware)

# 3. CORS Middleware with configured origins
allowed_origins = list(settings.CORS_ORIGINS) if settings.CORS_ORIGINS else [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "app": "Giant: Real-Time Industry Intelligence Platform",
        "status": "online",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check(response: Response):
    """
    Comprehensive system health probe:
    - Tests database connection with a roundtrip query
    - Checks background scheduler status
    - Returns uptime and timestamp
    """
    uptime_seconds = int(time.time() - APP_START_TIME)
    db_status = "connected"
    scheduler_info = get_scheduler_status()

    # Verify database connection
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "degraded",
            "database": db_status,
            "scheduler": scheduler_info.get("running", False),
            "uptime_seconds": uptime_seconds
        }

    return {
        "status": "healthy",
        "database": db_status,
        "scheduler": {
            "running": scheduler_info.get("running", False),
            "active_jobs_count": scheduler_info.get("active_jobs_count", 0)
        },
        "uptime_seconds": uptime_seconds,
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
