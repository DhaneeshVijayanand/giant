import hashlib
import re
import html
from datetime import datetime, timezone
import time
from typing import List, Dict, Any, Optional
import httpx
import feedparser
from app.services.tagger import tag_article

CLEANR = re.compile('<.*?>')

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
    """
    feed_url = feed_config["url"]
    source_name = feed_config["name"]
    articles: List[Dict[str, Any]] = []

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 GiantIndustryIntelligence/1.0"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(feed_url, headers=headers)
            if resp.status_code != 200:
                print(f"[RSS Fetcher] Warning: {source_name} returned status {resp.status_code}")
                return []
            content = resp.text
    except Exception as e:
        print(f"[RSS Fetcher] Error connecting to {source_name} ({feed_url}): {e}")
        return []

    parsed = feedparser.parse(content)
    if not parsed.entries:
        return []

    now_utc = datetime.now(timezone.utc)

    for entry in parsed.entries[:25]: # Take top 25 newest entries per feed
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

        companies, topics, sentiment, business_impact = tag_article(title, summary, industry_slug)

        articles.append({
            "guid": guid,
            "title": title,
            "summary": summary,
            "source": source_name,
            "url": link,
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
