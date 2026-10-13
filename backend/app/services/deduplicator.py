import re
import urllib.parse
from typing import List, Dict, Any, Tuple, Optional
import hashlib

TRACKING_PARAMS = {
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'ref', 'fbclid', 'gclid', 'msclkid', 'mc_cid', 'mc_eid', '_ga', '_gl'
}

STOP_WORDS = {
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will',
    'with', 'says', 'said', 'report', 'reports', 'india', 'new', 'after'
}

def normalize_url(url: str) -> str:
    """
    Strips tracking query parameters, fragments, and trailing slashes.
    """
    if not url:
        return ""
    try:
        parsed = urllib.parse.urlparse(url.strip())
        # Parse query params and strip tracking params
        query_dict = urllib.parse.parse_qs(parsed.query, keep_blank_values=False)
        filtered_query = {k: v for k, v in query_dict.items() if k.lower() not in TRACKING_PARAMS}
        new_query = urllib.parse.urlencode(filtered_query, doseq=True)

        clean_path = parsed.path.rstrip('/')
        return urllib.parse.urlunparse((
            parsed.scheme.lower(),
            parsed.netloc.lower(),
            clean_path,
            "",
            new_query,
            "" # strip fragment
        ))
    except Exception:
        return url.strip()

def tokenize_title(title: str) -> set:
    words = re.findall(r'\b[a-z0-9]+\b', title.lower())
    return {w for w in words if w not in STOP_WORDS and len(w) > 2}

def title_similarity(t1: str, t2: str) -> float:
    """
    Computes Jaccard word set similarity between two titles.
    """
    s1 = tokenize_title(t1)
    s2 = tokenize_title(t2)
    if not s1 or not s2:
        return 0.0
    intersection = s1.intersection(s2)
    union = s1.union(s2)
    return len(intersection) / len(union)

def detect_duplicate_and_cluster(
    title: str,
    url: str,
    source: str,
    published_at: Any,
    recent_articles: List[Dict[str, Any]]
) -> Tuple[bool, Optional[str], List[Dict[str, Any]]]:
    """
    Checks candidate article against recent articles (e.g. past 72 hours).
    Returns:
    - is_duplicate (bool): True if candidate is a near-exact duplicate of an existing article
    - cluster_id (str): Shared event cluster identifier
    - cluster_sources (list): List of sources reporting this event
    """
    canonical = normalize_url(url)
    
    for existing in recent_articles:
        existing_canonical = existing.get("canonical_url") or normalize_url(existing.get("url", ""))
        existing_title = existing.get("title", "")
        existing_cluster_id = existing.get("cluster_id")
        
        # 1. Exact canonical URL match
        if canonical and existing_canonical and canonical == existing_canonical:
            cluster_id = existing_cluster_id or hashlib.md5(f"event::{existing_title}".encode('utf-8')).hexdigest()[:16]
            return True, cluster_id, [{"source": source, "url": url, "published_at": str(published_at)}]
        
        # 2. High title similarity (same headline from syndication or aggregator)
        sim = title_similarity(title, existing_title)
        if sim >= 0.75:
            # Duplicate / syndicated rewrite
            cluster_id = existing_cluster_id or hashlib.md5(f"event::{existing_title}".encode('utf-8')).hexdigest()[:16]
            return True, cluster_id, [{"source": source, "url": url, "published_at": str(published_at)}]
        
        # 3. Moderate similarity (multiple outlets covering the same breaking event)
        if sim >= 0.50:
            cluster_id = existing_cluster_id or hashlib.md5(f"event::{existing_title}".encode('utf-8')).hexdigest()[:16]
            return False, cluster_id, [{"source": source, "url": url, "published_at": str(published_at)}]

    # New unique event
    new_cluster_id = hashlib.md5(f"event::{title}".encode('utf-8')).hexdigest()[:16]
    return False, new_cluster_id, [{"source": source, "url": url, "published_at": str(published_at)}]
