import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.rss_fetcher import validate_feed_url
from app.services.reports_service import sanitize_csv_cell

client = TestClient(app)

def test_security_headers_present():
    """Verify OWASP-recommended security headers are returned on API responses."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "SAMEORIGIN"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "Content-Security-Policy" in response.headers
    assert "Permissions-Policy" in response.headers

def test_enhanced_health_check_endpoint():
    """Verify /health returns database connectivity, scheduler status, and uptime."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "scheduler" in data
    assert "uptime_seconds" in data
    assert isinstance(data["uptime_seconds"], int)

def test_ssrf_protection_blocks_internal_and_private_ips():
    """Verify SSRF validator blocks localhost, 127.0.0.1, private RFC1918 IPs, and non-allowlisted hosts."""
    # Loopback IP
    with pytest.raises(ValueError, match="SSRF"):
        validate_feed_url("http://127.0.0.1/rss")
    
    # Localhost
    with pytest.raises(ValueError, match="SSRF"):
        validate_feed_url("http://localhost:8080/feed")
        
    # Private RFC1918
    with pytest.raises(ValueError, match="SSRF"):
        validate_feed_url("http://192.168.1.50/admin")
        
    # Cloud metadata service (AWS/GCP)
    with pytest.raises(ValueError, match="SSRF"):
        validate_feed_url("http://169.254.169.254/latest/meta-data/")
        
    # Unauthorized external domain
    with pytest.raises(ValueError, match="SSRF"):
        validate_feed_url("https://malicious-attacker-site.com/exploit.rss")

def test_ssrf_protection_allows_configured_sources():
    """Verify SSRF validator allows authorized RSS domains from INDUSTRIES_CONFIG."""
    # Allowed domains: economictimes.indiatimes.com, livemint.com, etc.
    try:
        validate_feed_url("https://telecom.economictimes.indiatimes.com/rss/topstories")
        validate_feed_url("https://www.livemint.com/rss/technology")
        validate_feed_url("https://www.rushlane.com/feed")
    except ValueError as e:
        pytest.fail(f"Authorized URL was unexpectedly rejected: {e}")

def test_upload_security_rejects_binary_file():
    """Verify upload endpoint blocks binary payloads disguised as CSV."""
    binary_content = b"header1,header2\n\x00\x01\x02bad_binary_data"
    response = client.post(
        "/api/v1/churn/upload",
        files={"file": ("malicious.csv", binary_content, "text/csv")},
        data={"target_column": "Churn"}
    )
    assert response.status_code == 400
    assert "Binary or corrupted data detected" in response.json()["detail"]

def test_upload_security_rejects_non_csv():
    """Verify upload endpoint rejects unauthorized non-CSV file extensions."""
    response = client.post(
        "/api/v1/churn/upload",
        files={"file": ("script.py", b"print('hello')", "text/x-python")},
        data={"target_column": "Churn"}
    )
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]

def test_upload_security_rejects_invalid_mime():
    """Verify upload endpoint rejects executable MIME types even with .csv extension."""
    response = client.post(
        "/api/v1/churn/upload",
        files={"file": ("payload.csv", b"col1,col2\n1,2\n", "application/x-msdownload")},
        data={"target_column": "Churn"}
    )
    assert response.status_code == 400
    assert "Invalid MIME content-type" in response.json()["detail"]

def test_formula_injection_defense():
    """Verify sanitize_csv_cell neutralizes formula triggers (=, +, -, @)."""
    assert sanitize_csv_cell("=cmd|'/C calc'!A0") == "'=cmd|'/C calc'!A0"
    assert sanitize_csv_cell("+12345") == "'+12345"
    assert sanitize_csv_cell("-500") == "'-500"
    assert sanitize_csv_cell("@SUM(A1:A10)") == "'@SUM(A1:A10)"
    assert sanitize_csv_cell("Normal Text") == "Normal Text"
    assert sanitize_csv_cell(None) == ""

def test_rate_limiter_exceed_limit():
    """Verify in-memory rate limiter returns 429 when threshold is exceeded on AI chat."""
    from app.main import app
    # Directly test the rate limiter on /api/v1/ai/chat
    # The limit is 30/minute. Let's make 32 rapid requests to verify 429 is triggered.
    got_429 = False
    for _ in range(35):
        resp = client.post(
            "/api/v1/ai/chat",
            json={"industry": "telecom", "question": "test"}
        )
        if resp.status_code == 429:
            got_429 = True
            assert resp.headers.get("Retry-After") == "60"
            assert resp.json().get("error") == "too_many_requests"
            break
    assert got_429, "Rate limiter failed to trigger 429 Too Many Requests"
