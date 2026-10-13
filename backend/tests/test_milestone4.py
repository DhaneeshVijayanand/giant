import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from app.main import app
from app.models.article import Article
from app.database import get_db
from app.services.reports_service import sanitize_csv_cell

def test_starlink_case_study_topics():
    with TestClient(app) as client:
        response = client.get("/api/v1/starlink/case-study")
        assert response.status_code == 200
        data = response.json()
        
        assert data["title"] == "WILL STARLINK DISRUPT INDIA'S TELECOM MARKET?"
        assert data["industry"] == "telecom"
        assert data["total_topics"] == 12
        
        topics = data["topics"]
        assert len(topics) == 12
        
        # Verify required topics exist
        expected_ids = {
            "regulatory_approval", "spectrum_allocation", "security_clearances",
            "launch_developments", "pricing_affordability", "service_availability_coverage",
            "satellite_capabilities", "rural_remote_connectivity", "existing_alternatives",
            "switching_factors", "competitor_responses", "partnership_opportunities"
        }
        actual_ids = {t["id"] for t in topics}
        assert expected_ids == actual_ids
        
        # Every topic must have source, date, and last_updated
        for t in topics:
            assert "title" in t
            assert "status" in t
            assert "official_source" in t
            assert "source_date" in t
            assert "last_updated" in t
            assert len(t["official_source"]) > 0

def test_starlink_scenarios_and_tracker():
    with TestClient(app) as client:
        response = client.get("/api/v1/starlink/scenarios")
        assert response.status_code == 200
        data = response.json()
        
        scenarios = data["scenarios"]
        assert len(scenarios) == 3
        
        scenario_ids = [s["id"] for s in scenarios]
        assert "scenario_1_conservative" in scenario_ids
        assert "scenario_2_moderate" in scenario_ids
        assert "scenario_3_high_disruption" in scenario_ids
        
        # Verify each scenario has required fields and assumptions labeled
        for s in scenarios:
            assert "assumptions" in s
            assert "winners" in s
            assert "losers" in s
            assert "segments_switching" in s
            assert "business_opportunities" in s
            assert "risks_to_incumbents" in s
            assert "strategic_recommendations" in s
            assert "validation_kpis" in s
            
            # Verify explicit assumption labeling
            for a in s["assumptions"]:
                assert a.startswith("[Assumption]")
                
            # Verify KPI statuses
            for kpi in s["validation_kpis"]:
                assert kpi["status"] in ["Supported", "Not yet supported", "Contradicted", "No data"]
                
        # Verify scenario tracker
        tracker = data["tracker"]
        assert "most_supported_scenario" in tracker
        assert "confidence_reasoning" in tracker
        assert "disclaimer" in tracker
        assert "financial prediction" in tracker["disclaimer"].lower() or "prediction" in tracker["disclaimer"].lower()

def test_starlink_evidence_pipeline():
    with TestClient(app) as client:
        db = next(get_db())
        
        # Insert a sample satellite article
        now = datetime.now(timezone.utc)
        ts = int(now.timestamp())
        art = Article(
            guid=f"test-guid-sat-{ts}",
            title="TRAI releases recommendations on satellite spectrum assignment",
            summary="Department of Telecommunications to review satellite spectrum pricing for Starlink and OneWeb.",
            source="Official Gazette",
            url=f"https://trai.gov.in/test-sat-{ts}",
            published_at=now,
            retrieved_at=now,
            industry="telecom",
            topics=["Spectrum", "Satellite"],
            business_impact="High"
        )
        db.add(art)
        db.commit()
        
        response = client.get("/api/v1/starlink/evidence?limit=10")
        assert response.status_code == 200
        data = response.json()
        
        assert data["total_matched"] > 0
        assert any("satellite" in a["title"].lower() or "spectrum" in a["title"].lower() for a in data["articles"])
        assert "last_checked_at" in data

def test_reports_generation_json():
    with TestClient(app) as client:
        response = client.get("/api/v1/reports/generate?industry=telecom")
        assert response.status_code == 200
        data = response.json()
        
        assert "report_id" in data
        assert data["industry_slug"] == "telecom"
        assert "generated_at" in data
        
        # Verify 4-part executive summary
        es = data["executive_summary"]
        assert len(es["part_1_verified_facts"]) > 0
        assert len(es["part_2_evidence_interpretation"]) > 0
        assert len(es["part_3_predictions_and_assumptions"]) > 0
        assert len(es["part_4_recommended_actions"]) > 0
        assert "source_citation" in es
        
        # Verify competitor metrics
        assert "competitor_metrics" in data
        assert "TRAI" in data["competitor_metrics"]["source"]
        
        # Verify key news section
        assert "key_news" in data

def test_csv_formula_injection_defense():
    # Test formula injection prefix sanitization
    assert sanitize_csv_cell("=1+1") == "'=1+1"
    assert sanitize_csv_cell("+2+2") == "'+2+2"
    assert sanitize_csv_cell("-3+3") == "'-3+3"
    assert sanitize_csv_cell("@SUM(A1:A10)") == "'@SUM(A1:A10)"
    assert sanitize_csv_cell("\tTABBED") == "'\tTABBED"
    assert sanitize_csv_cell("\rRETURN") == "'\rRETURN"
    assert sanitize_csv_cell("=CMD|' /C calc'!A0") == "'=CMD|' /C calc'!A0"
    
    # Safe values must not be mangled
    assert sanitize_csv_cell("Reliance Jio") == "Reliance Jio"
    assert sanitize_csv_cell("Bharti Airtel") == "Bharti Airtel"
    assert sanitize_csv_cell(12345) == "12345"
    assert sanitize_csv_cell("") == ""
    assert sanitize_csv_cell(None) == ""

def test_reports_csv_export_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/reports/export/csv?industry=telecom")
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/csv")
        assert "attachment; filename=" in response.headers["content-disposition"]
        
        content = response.text
        assert "GIANT BUSINESS INTELLIGENCE PLATFORM" in content
        assert "EXECUTIVE SUMMARY" in content
        assert "COMPETITOR & MARKET BENCHMARKS" in content

def test_reports_pdf_export_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/reports/export/pdf?industry=telecom")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert "attachment; filename=" in response.headers["content-disposition"]
        
        pdf_bytes = response.content
        assert len(pdf_bytes) > 1000
        assert pdf_bytes.startswith(b"%PDF-")
