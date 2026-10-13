import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_industries_cards():
    response = client.get("/api/v1/industries")
    assert response.status_code == 200
    cards = response.json()
    assert len(cards) == 3
    slugs = [c["slug"] for c in cards]
    assert "telecom" in slugs
    assert "fintech" in slugs
    assert "ev" in slugs

    for card in cards:
        assert "name" in card
        assert "total_articles_count" in card
        assert isinstance(card["total_articles_count"], int)
        assert card["sync_status"] in ["healthy", "empty", "stale"]

def test_get_single_industry_overview():
    for slug in ["telecom", "fintech", "ev"]:
        response = client.get(f"/api/v1/industries/{slug}")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == slug
        assert len(data["tracked_companies"]) > 0

def test_get_news_articles():
    response = client.get("/api/v1/news?limit=10")
    assert response.status_code == 200
    articles = response.json()
    assert isinstance(articles, list)
    if len(articles) > 0:
        first = articles[0]
        assert "guid" in first
        assert "title" in first
        assert "url" in first
        assert first["url"].startswith("http")
        assert "published_at" in first
        assert "retrieved_at" in first
        assert first["verification_status"] == "verified"

def test_get_news_filtering():
    response = client.get("/api/v1/news?industry=telecom&limit=5")
    assert response.status_code == 200
    articles = response.json()
    for a in articles:
        assert a["industry"] == "telecom"
