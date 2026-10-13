from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.article import ArticleResponse, RefreshResponse
from app.services.news_service import get_articles_filtered, sync_all_feeds
from app.models.article import SyncLog

router = APIRouter(prefix="/news", tags=["News"])

@router.get("", response_model=List[ArticleResponse])
def list_news(
    industry: Optional[str] = Query(None, description="Industry slug filter (telecom, fintech, ev)"),
    company: Optional[str] = Query(None, description="Company filter"),
    topic: Optional[str] = Query(None, description="Topic filter"),
    search: Optional[str] = Query(None, description="Search keyword in title or summary"),
    impact: Optional[str] = Query(None, description="Impact level: high, medium, low"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Returns verified industry news articles with working source URLs, real publication timestamps,
    and system retrieval timestamps.
    """
    articles = get_articles_filtered(
        db=db,
        industry=industry,
        company=company,
        topic=topic,
        search=search,
        impact=impact,
        limit=limit,
        offset=offset
    )
    return articles

@router.post("/refresh", response_model=RefreshResponse)
async def manual_refresh(
    industry: Optional[str] = Query(None, description="Specific industry slug to refresh"),
    db: Session = Depends(get_db)
):
    """
    Manual refresh button: fetches authorized RSS feeds, deduplicates, stores in database,
    and returns synchronization summary.
    """
    result = await sync_all_feeds(db, target_industry=industry)
    return result

@router.get("/sync-status")
def get_sync_status(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Returns latest synchronization logs showing timestamp and status for each RSS source.
    """
    logs = db.query(SyncLog).order_by(SyncLog.sync_completed_at.desc()).limit(limit).all()
    return logs
