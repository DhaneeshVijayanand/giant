from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.scheduler import get_scheduler_status
from app.services.news_service import get_source_health_list

router = APIRouter(prefix="/scheduler", tags=["Scheduler & Source Monitoring"])

@router.get("/status")
def scheduler_status():
    """
    Returns running status of APScheduler, configured intervals, active jobs, and next execution times.
    """
    return get_scheduler_status()

@router.get("/sources/health")
def sources_health(
    industry: Optional[str] = Query(None, description="Optional industry slug filter"),
    db: Session = Depends(get_db)
):
    """
    Returns health status of all data sources, consecutive failures, last error message,
    and stale warnings while keeping last-known-good data available.
    """
    return get_source_health_list(db, industry)
