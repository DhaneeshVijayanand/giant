from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.database import get_db
from app.services.starlink_service import (
    STARLINK_TOPICS,
    STARLINK_SCENARIOS,
    get_scenario_evidence_tracker,
    fetch_starlink_evidence_articles
)

router = APIRouter(prefix="/starlink", tags=["Starlink Case Study"])

@router.get("/case-study", response_model=Dict[str, Any])
def get_starlink_case_study():
    """
    Returns the 12 structured case study topics for 'WILL STARLINK DISRUPT INDIA'S TELECOM MARKET?'
    Each topic includes verified official sources (DoT, TRAI, IN-SPACe), publication dates,
    and timestamps, or explicitly flags 'Evidence not available'.
    """
    return {
        "title": "WILL STARLINK DISRUPT INDIA'S TELECOM MARKET?",
        "industry": "telecom",
        "total_topics": len(STARLINK_TOPICS),
        "topics": STARLINK_TOPICS,
        "disclaimer": "All regulatory and market claims are grounded in official public records (DoT, TRAI, IN-SPACe) or explicitly designated as assumptions. Giant does not assume or simulate arbitrary customer churn."
    }

@router.get("/scenarios", response_model=Dict[str, Any])
def get_starlink_scenarios():
    """
    Returns the three structured scenarios (Conservative, Moderate, High Disruption),
    their assumptions, segment switches, risks, and the evidence-based Scenario Tracker.
    """
    return {
        "scenarios": STARLINK_SCENARIOS,
        "tracker": get_scenario_evidence_tracker()
    }

@router.get("/evidence", response_model=Dict[str, Any])
def get_starlink_evidence_feed(
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Pulls dynamically matched satellite & telecom articles from the verified database.
    Updates in real-time as the RSS scheduler ingests new articles.
    """
    return fetch_starlink_evidence_articles(db, limit=limit)
