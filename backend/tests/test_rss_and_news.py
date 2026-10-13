import pytest
from app.services.tagger import tag_article
from app.services.rss_fetcher import clean_html, compute_guid

def test_tag_article_telecom():
    title = "Reliance Jio launches new 5G tariff plans to counter Bharti Airtel spectrum expansion"
    summary = "TRAI reports subscriber additions in rural broadband circles."
    companies, topics, sentiment, impact = tag_article(title, summary, "telecom")
    
    assert "Reliance Jio" in companies
    assert "Bharti Airtel" in companies
    assert impact in ["high", "medium"]

def test_tag_article_fintech():
    title = "PhonePe leads UPI market share with record transaction volume as RBI issues new guidelines"
    summary = "Google Pay and Paytm follow in monthly volume comparisons."
    companies, topics, sentiment, impact = tag_article(title, summary, "fintech")

    assert "PhonePe" in companies
    assert "Google Pay" in companies
    assert "Paytm" in companies
    assert any("Upi" in t or "Payments" in t for t in topics)

def test_clean_html():
    raw = "<p>This is <b>bold</b> and <a href='https://example.com'>link</a> &amp; more.</p>"
    cleaned = clean_html(raw)
    assert cleaned == "This is bold and link & more."

def test_compute_guid_deterministic():
    url = "https://example.com/news/1"
    title = "Test Headline"
    guid1 = compute_guid(url, title)
    guid2 = compute_guid(url, title)
    assert guid1 == guid2
    assert len(guid1) == 64
