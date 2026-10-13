from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal, ensure_schema_migrations
from app.api.router import api_router
from app.services.scheduler import init_scheduler, shutdown_scheduler
from app.services.competitor_service import seed_official_metrics_if_empty
import app.models

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

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "app": "Giant: Real-Time Industry Intelligence Platform",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
