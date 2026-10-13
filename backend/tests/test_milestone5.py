import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import get_db
from app.services.powerbi_service import get_powerbi_reporting_dataset, check_powerbi_configuration_status

def test_powerbi_reporting_dataset():
    db = next(get_db())
    records = get_powerbi_reporting_dataset(db, limit=20)
    
    assert len(records) > 0
    
    required_fields = {
        "article_id", "headline", "source", "original_url",
        "publication_timestamp", "retrieval_timestamp", "industry",
        "company", "topic", "country", "sentiment",
        "business_impact", "verification_status"
    }
    
    for r in records:
        for field in required_fields:
            assert field in r, f"Missing required reporting field: {field}"
            
        # Security test: ensure customer data and secrets are never present
        r_str = str(r).lower()
        assert "password" not in r_str
        assert "secret" not in r_str
        assert "customerid" not in r_str
        assert "churn" not in r_str

def test_powerbi_data_feed_json_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/powerbi/data-feed?industry=telecom&limit=15")
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "success"
        assert data["industry"] == "telecom"
        assert "total_records" in data
        assert "records" in data
        assert len(data["records"]) <= 15
        
        for rec in data["records"]:
            assert rec["industry"] == "telecom"

def test_powerbi_data_feed_csv_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/powerbi/data-feed?format=csv&limit=10")
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/csv")
        assert "attachment; filename=" in response.headers["content-disposition"]
        
        content = response.text
        assert "headline" in content.lower()
        assert "source" in content.lower()
        assert "industry" in content.lower()

def test_powerbi_status_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/powerbi/status")
        assert response.status_code == 200
        data = response.json()
        
        assert "is_configured" in data
        assert "missing_items" in data
        assert "prerequisites" in data
        
        # Verify all prerequisite items are detailed for the user
        prereqs = data["prerequisites"]
        assert "licence_and_workspace" in prereqs
        assert "entra_app_registration" in prereqs
        assert "tenant_settings_api" in prereqs
        assert "workspace_access" in prereqs
        assert "published_report_and_dataset" in prereqs
        assert "database_connectivity" in prereqs

def test_powerbi_embed_config_unconfigured():
    with TestClient(app) as client:
        response = client.get("/api/v1/powerbi/embed-config?industry=telecom")
        assert response.status_code == 200
        data = response.json()
        
        # When unconfigured in dev/test, MUST return is_configured: False and clear error
        assert data["is_configured"] is False
        assert "error" in data
        assert "prerequisites" in data
        # Must NEVER return a simulated fake token
        assert "embed_token" not in data or data.get("embed_token") is None

def test_powerbi_refresh_token_unconfigured():
    with TestClient(app) as client:
        response = client.post("/api/v1/powerbi/refresh-token?industry=telecom")
        assert response.status_code == 200
        data = response.json()
        
        assert data["is_configured"] is False
        assert "error" in data
