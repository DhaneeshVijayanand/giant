from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ai_analyst import process_analyst_chat, check_spend_cap
from app.services.ai_recommendations import get_or_generate_recommendations

router = APIRouter(prefix="/ai", tags=["AI Business Analyst & Recommendations"])

class ChatRequest(BaseModel):
    query: str
    industry: str = "telecom"

@router.post("/chat")
async def chat_with_analyst(
    req: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Retrieval-Grounded AI Business Analyst:
    Answers strictly from stored articles and official data using the mandatory 4-part structure.
    Enforces prompt injection defenses and monthly spend caps.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    response = await process_analyst_chat(db, req.query, req.industry)
    return response

@router.get("/recommendations")
def get_recommendations(
    industry: str = Query("telecom", description="Industry slug (telecom, fintech, ev)"),
    regenerate: bool = Query(False, description="Force regenerate recommendations"),
    db: Session = Depends(get_db)
):
    """
    Generates or retrieves structured AI Business Recommendations for the selected industry.
    Includes business problem, supporting evidence, suggested action, expected benefit,
    potential risks, KPI to measure success, confidence level, and suggested review date.
    """
    recs = get_or_generate_recommendations(db, industry, force_regenerate=regenerate)
    return recs

@router.get("/spend")
def get_spend_status(db: Session = Depends(get_db)):
    """
    Returns current month LLM token usage, estimated spend USD, and configured spend cap.
    """
    allowed, current_spend, cap = check_spend_cap(db)
    return {
        "allowed": allowed,
        "current_spend_usd": round(current_spend, 4),
        "spend_cap_usd": cap,
        "spend_cap_exceeded": not allowed
    }
