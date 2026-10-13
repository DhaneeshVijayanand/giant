from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.article import IndustryCardResponse, IndustryOverviewResponse
from app.services.news_service import get_industry_cards, get_industry_overview
from app.config import INDUSTRIES_CONFIG

router = APIRouter(prefix="/industries", tags=["Industries"])

@router.get("", response_model=List[IndustryCardResponse])
def get_all_industry_cards(db: Session = Depends(get_db)):
    """
    Page 2 industry cards: Real database counts, latest real headlines, and synchronization status.
    If no data exists yet, returns empty state metrics (never fake data).
    """
    return get_industry_cards(db)

@router.get("/{slug}", response_model=IndustryOverviewResponse)
def get_single_industry_overview(slug: str, db: Session = Depends(get_db)):
    """
    Page 3 industry overview: Metadata, tracked companies, and real data freshness timestamps.
    """
    if slug not in INDUSTRIES_CONFIG:
        raise HTTPException(status_code=404, detail=f"Industry '{slug}' not found. Available: telecom, fintech, ev")
    return get_industry_overview(db, slug)

@router.get("/{slug}/companies", response_model=List[str])
def get_industry_companies(slug: str):
    """
    Returns the list of tracked companies for an industry.
    """
    if slug not in INDUSTRIES_CONFIG:
        raise HTTPException(status_code=404, detail=f"Industry '{slug}' not found")
    return INDUSTRIES_CONFIG[slug]["companies"]
