from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.competitor_service import (
    get_competitor_metrics,
    get_user_watchlist,
    add_watchlist_item,
    remove_watchlist_item,
    get_developments_for_tracker
)

router = APIRouter(prefix="/competitors", tags=["Competitor Analytics & Watchlist"])

class WatchlistCreate(BaseModel):
    company_name: str
    industry: str
    notes: Optional[str] = None

@router.get("/metrics")
def list_competitor_metrics(
    industry: str = Query(..., description="Industry slug (telecom, fintech, ev)"),
    db: Session = Depends(get_db)
):
    """
    Returns official monthly metrics for competitor comparison tables and historical charts.
    Every metric contains source, unit, reporting period, and notes.
    """
    return get_competitor_metrics(db, industry)

@router.get("/developments")
def list_competitor_developments(
    industry: str = Query(..., description="Industry slug"),
    company: Optional[str] = Query(None, description="Filter by company"),
    db: Session = Depends(get_db)
):
    """
    Returns strategic competitor tracker developments with business significance notes.
    """
    return get_developments_for_tracker(db, industry, company)

@router.get("/watchlist")
def get_watchlist(
    industry: Optional[str] = Query(None, description="Optional industry filter"),
    db: Session = Depends(get_db)
):
    """
    Returns user's persistent watchlist items.
    """
    return get_user_watchlist(db, industry)

@router.post("/watchlist")
def add_watchlist(
    data: WatchlistCreate,
    db: Session = Depends(get_db)
):
    """
    Persistently adds an enterprise company to the watchlist.
    """
    item = add_watchlist_item(db, data.company_name, data.industry, data.notes)
    return item

@router.delete("/watchlist/{item_id}")
def delete_watchlist(
    item_id: int,
    db: Session = Depends(get_db)
):
    """
    Removes a company from the watchlist.
    """
    success = remove_watchlist_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
    return {"status": "deleted", "id": item_id}
