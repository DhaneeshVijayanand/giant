import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.services.deduplicator import normalize_url, title_similarity, detect_duplicate_and_cluster
from app.database import SessionLocal, Base, engine
from app.models.article import Article, SourceHealth

client = TestClient(app)

def test_url_normalization():
    dirty_url = "https://telecom.economictimes.indiatimes.com/news/industry/jio-5g-tariff-hike/123456?utm_source=rss&utm_medium=feed&ref=newsletter#comments"
    clean = normalize_url(dirty_url)
    assert "utm_source" not in clean
    assert "ref" not in clean
    assert "#comments" not in clean
    assert clean == "https://telecom.economictimes.indiatimes.com/news/industry/jio-5g-tariff-hike/123456"

def test_title_similarity_detection():
    t1 = "Reliance Jio launches new 5G tariff plans across India"
    t2 = "Reliance Jio introduces new 5G tariff plans in India"
    t3 = "Tata Motors reports record electric vehicle sales in August"

    sim_high = title_similarity(t1, t2)
    sim_low = title_similarity(t1, t3)

    assert sim_high >= 0.50
    assert sim_low < 0.20

def test_duplicate_merging_clustering():
    existing_articles = [
        {
            "id": 1,
            "title": "PhonePe leads UPI market share with record monthly volume",
            "url": "https://example.com/phonepe-upi-august",
            "canonical_url": "https://example.com/phonepe-upi-august",
            "cluster_id": "cluster_abc123",
            "cluster_sources": [{"source": "Economic Times", "url": "https://example.com/phonepe-upi-august", "published_at": "2026-08-15"}]
        }
    ]

    # Candidate 1: Same story from LiveMint with UTM tracking
    candidate_title = "PhonePe leads UPI market share with record monthly volume"
    candidate_url = "https://livemint.com/phonepe-upi-august?utm_source=twitter"
    
    is_dup, cluster_id, src_list = detect_duplicate_and_cluster(
        title=candidate_title,
        url=candidate_url,
        source="LiveMint",
        published_at=datetime.now(timezone.utc),
        recent_articles=existing_articles
    )

    assert is_dup is True
    assert cluster_id == "cluster_abc123"
    assert len(src_list) == 1
    assert src_list[0]["source"] == "LiveMint"

def test_scheduler_status_endpoint():
    with TestClient(app) as test_client:
        response = test_client.get("/api/v1/scheduler/status")
        assert response.status_code == 200
        data = response.json()
        assert "running" in data
        assert data["breaking_news_interval_minutes"] == 5
        assert data["general_news_interval_minutes"] == 15
        assert len(data["jobs"]) >= 3

def test_competitor_metrics_has_source_unit_period():
    for ind in ["telecom", "fintech", "ev"]:
        response = client.get(f"/api/v1/competitors/metrics?industry={ind}")
        assert response.status_code == 200
        metrics = response.json()
        assert len(metrics) > 0
        for m in metrics:
            assert m["source"] is not None and len(m["source"]) > 0
            assert m["unit"] is not None and len(m["unit"]) > 0
            assert m["period"] is not None and len(m["period"]) > 0
            assert "last_updated_at" in m
            assert "value" in m

def test_watchlist_persistence_crud():
    # 1. Add company
    add_resp = client.post("/api/v1/competitors/watchlist", json={
        "company_name": "Test Telecom Corp",
        "industry": "telecom",
        "notes": "Testing persistent watchlist"
    })
    assert add_resp.status_code == 200
    item = add_resp.json()
    item_id = item["id"]
    assert item["company_name"] == "Test Telecom Corp"

    # 2. Verify in list
    list_resp = client.get("/api/v1/competitors/watchlist?industry=telecom")
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert any(i["id"] == item_id for i in items)

    # 3. Delete company
    del_resp = client.delete(f"/api/v1/competitors/watchlist/{item_id}")
    assert del_resp.status_code == 200

    # 4. Confirm deletion
    list_resp_after = client.get("/api/v1/competitors/watchlist?industry=telecom")
    assert not any(i["id"] == item_id for i in list_resp_after.json())

def test_competitor_developments_tracker():
    response = client.get("/api/v1/competitors/developments?industry=telecom")
    assert response.status_code == 200
    devs = response.json()
    assert len(devs) > 0
    for d in devs:
        assert "business_significance" in d
        assert len(d["business_significance"]) > 10
        assert "headline" in d
        assert "source" in d

def test_source_health_and_stale_warning():
    db = SessionLocal()
    try:
        # Create or update a deliberately failing source
        failing_src = db.query(SourceHealth).filter(SourceHealth.source_name == "Deliberately Broken Feed").first()
        if not failing_src:
            failing_src = SourceHealth(
                source_name="Deliberately Broken Feed",
                industry="telecom",
                url="https://invalid.example.com/rss"
            )
            db.add(failing_src)
        
        failing_src.status = "failing"
        failing_src.consecutive_failures = 3
        failing_src.last_attempt_at = datetime.now(timezone.utc)
        failing_src.last_error = "HTTP 503 Service Unavailable"
        db.commit()
    finally:
        db.close()

    response = client.get("/api/v1/scheduler/sources/health?industry=telecom")
    assert response.status_code == 200
    sources = response.json()
    broken = next((s for s in sources if s["source_name"] == "Deliberately Broken Feed"), None)
    assert broken is not None
    assert broken["status"] == "failing"
    assert broken["is_stale"] is True
    assert "HTTP 503" in broken["last_error"]
