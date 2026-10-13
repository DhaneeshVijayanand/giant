from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import io

from app.database import get_db
from app.services.reports_service import (
    generate_industry_report,
    export_report_to_csv,
    export_report_to_pdf
)

router = APIRouter(prefix="/reports", tags=["Reports and Exports"])

@router.get("/generate", response_model=Dict[str, Any])
def get_industry_report(
    industry: str = Query(default="telecom", description="Industry slug (telecom, fintech, ev)"),
    start_date: Optional[str] = Query(default=None, description="Start date filter (ISO format)"),
    end_date: Optional[str] = Query(default=None, description="End date filter (ISO format)"),
    company: Optional[str] = Query(default=None, description="Company filter"),
    db: Session = Depends(get_db)
):
    """
    Generates an executive intelligence report preview with 4-part grounded summary,
    competitor benchmarks, churn intelligence findings, and verified source citations.
    """
    return generate_industry_report(
        db=db,
        industry_slug=industry,
        start_date=start_date,
        end_date=end_date,
        company=company
    )

@router.get("/export/csv")
def export_report_csv(
    industry: str = Query(default="telecom"),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    company: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    """
    Exports the report to CSV with OWASP formula injection protection.
    Forces spreadsheet applications (Excel, Calc) to parse dangerous leading characters as text.
    """
    report = generate_industry_report(
        db=db,
        industry_slug=industry,
        start_date=start_date,
        end_date=end_date,
        company=company
    )
    csv_content = export_report_to_csv(report)
    
    filename = f"giant_report_{industry}_{report['report_id']}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/pdf")
def export_report_pdf(
    industry: str = Query(default="telecom"),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    company: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    """
    Generates and downloads a multi-page PDF report with ReportLab.
    """
    report = generate_industry_report(
        db=db,
        industry_slug=industry,
        start_date=start_date,
        end_date=end_date,
        company=company
    )
    pdf_bytes = export_report_to_pdf(report)
    
    filename = f"giant_report_{industry}_{report['report_id']}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
