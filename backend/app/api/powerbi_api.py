import io
import csv
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.database import get_db
from app.services.powerbi_service import (
    get_powerbi_reporting_dataset,
    check_powerbi_configuration_status,
    generate_powerbi_embed_token
)
from app.services.reports_service import sanitize_csv_cell

router = APIRouter(prefix="/powerbi", tags=["Microsoft Power BI Integration"])

@router.get("/status", response_model=Dict[str, Any])
def get_powerbi_status():
    """
    Returns current Power BI integration readiness, missing environment variables,
    and prerequisite requirements. Never simulates success.
    """
    return check_powerbi_configuration_status()

@router.get("/embed-config", response_model=Dict[str, Any])
async def get_embed_config(
    industry: Optional[str] = Query(default=None, description="Active industry filter (telecom, fintech, ev)")
):
    """
    Returns the Azure AD service principal embed token, report embed URL, and real
    dataset refresh timestamp. If unconfigured, returns missing items for the setup screen.
    """
    return await generate_powerbi_embed_token(industry=industry)

@router.post("/refresh-token", response_model=Dict[str, Any])
async def refresh_embed_token(
    industry: Optional[str] = Query(default=None)
):
    """
    Renews the short-lived embed token before it expires, preventing page disconnects.
    """
    return await generate_powerbi_embed_token(industry=industry)

@router.get("/data-feed")
def get_data_feed(
    industry: Optional[str] = Query(default=None, description="Optional industry filter"),
    limit: int = Query(default=500, ge=1, le=2000),
    format: str = Query(default="json", description="Output format (json or csv)"),
    db: Session = Depends(get_db)
):
    """
    Direct data layer feed designed for Power BI Desktop Web connector or scheduled ingestion.
    Contains headline, source, timestamps, industry, company, topic, sentiment, and impact.
    Strictly excludes customer-level churn data, client emails, and secrets.
    """
    records = get_powerbi_reporting_dataset(db, industry=industry, limit=limit)
    
    if format.lower() == "csv":
        output = io.StringIO()
        if records:
            writer = csv.writer(output)
            headers = list(records[0].keys())
            writer.writerow([sanitize_csv_cell(h) for h in headers])
            for r in records:
                writer.writerow([sanitize_csv_cell(r[h]) for h in headers])
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=giant_powerbi_feed_{industry or 'all'}.csv"}
        )

    return {
        "status": "success",
        "industry": industry or "all",
        "total_records": len(records),
        "dataset_name": "Giant Live News Reporting Layer (Read-Only)",
        "security_policy": "Excluded all customer PII, secrets, and credentials.",
        "records": records
    }
