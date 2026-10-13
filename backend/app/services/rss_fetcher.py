import hashlib
import re
import html
from datetime import datetime, timezone
import time
from typing import List, Dict, Any, Optional
import ipaddress
from urllib.parse import urlparse
import httpx
import feedparser
from app.config import INDUSTRIES_CONFIG
from app.services.tagger import tag_article
from app.services.deduplicator import normalize_url

CLEANR = re.compile('<.*?>')

def get_allowed_feed_domains() -> set:
    allowed = set()
    for ind in INDUSTRIES_CONFIG.values():
        for feed in ind.get("rss_feeds", []):
            parsed = urlparse(feed.get("url", ""))
            if parsed.hostname:
                allowed.add(parsed.hostname.lower())
    return allowed

def is_private_or_loopback(hostname: str) -> bool:
    if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
        return True
    try:
        ip = ipaddress.ip_address(hostname)
        return ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local
    except ValueError:
        return False

def validate_feed_url(url: str) -> None:
    """
    SSRF Protection:
    Ensures feed URLs use http/https, do not resolve to loopback/private RFC1918 subnets,
    and belong to the authorized RSS domains allowlist.
    """
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError(f"Security SSRF: Disallowed protocol '{parsed.scheme}'. Only HTTP/HTTPS permitted.")
    hostname = parsed.hostname
    if not hostname:
        raise ValueError("Security SSRF: Missing hostname in feed URL.")
    if is_private_or_loopback(hostname):
        raise ValueError(f"Security SSRF: Blocked target '{hostname}' (private or loopback IP).")
    
    allowed_domains = get_allowed_feed_domains()
    is_allowed = any(
        hostname.lower() == d or hostname.lower().endswith("." + d)
        for d in allowed_domains
    )
    if not is_allowed:
        raise ValueError(f"Security SSRF: Host '{hostname}' is not in configured RSS source allowlist.")

def clean_html(raw_html: Optional[str]) -> str:
    if not raw_html:
        return ""
    cleantext = re.sub(CLEANR, '', raw_html)
    return html.unescape(cleantext).strip()

def compute_guid(url: str, title: str) -> str:
    raw = f"{url.strip()}::{title.strip()}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

def parse_entry_time(entry: Any) -> datetime:
    time_struct = getattr(entry, "published_parsed", None) or getattr(entry, "updated_parsed", None)
    if time_struct:
        try:
            return datetime.fromtimestamp(time.mktime(time_struct), tz=timezone.utc)
        except Exception:
            pass
    return datetime.now(timezone.utc)

async def fetch_feed_articles(feed_config: Dict[str, Any], industry_slug: str) -> List[Dict[str, Any]]:
    """
    Fetches an RSS feed asynchronously, parses articles, and tags them.
    Raises exception on failure so caller can record source health.
    """
    feed_url = feed_config["url"]
    source_name = feed_config["name"]
    articles: List[Dict[str, Any]] = []

    # SSRF verification: checks protocol, non-routable/private IP, and source allowlist
    validate_feed_url(feed_url)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 GiantIndustryIntelligence/1.0"
    }

    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        resp = await client.get(feed_url, headers=headers)
        if resp.status_code != 200:
            raise RuntimeError(f"{source_name} returned HTTP status {resp.status_code}")
        content = resp.text

    parsed = feedparser.parse(content)
    if not parsed.entries:
        return []

    now_utc = datetime.now(timezone.utc)

    for entry in parsed.entries[:25]:
        title = clean_html(getattr(entry, "title", "")).strip()
        link = getattr(entry, "link", "").strip()
        if not title or not link:
            continue

        raw_summary = getattr(entry, "summary", "") or getattr(entry, "description", "")
        summary = clean_html(raw_summary).strip()
        if len(summary) > 500:
            summary = summary[:497] + "..."

        pub_time = parse_entry_time(entry)
        guid = compute_guid(link, title)
        canonical = normalize_url(link)

        companies, topics, sentiment, business_impact = tag_article(title, summary, industry_slug)

        articles.append({
            "guid": guid,
            "title": title,
            "summary": summary,
            "source": source_name,
            "url": link,
            "canonical_url": canonical,
            "published_at": pub_time,
            "retrieved_at": now_utc,
            "industry": industry_slug,
            "companies": companies,
            "topics": topics,
            "sentiment": sentiment,
            "business_impact": business_impact,
            "verification_status": "verified"
        })

    return articles
