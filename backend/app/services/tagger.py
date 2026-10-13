import re
from typing import List, Tuple
from app.config import INDUSTRIES_CONFIG

HIGH_IMPACT_KEYWORDS = [
    "launch", "licence", "license", "approval", "banned", "fine", "penalty",
    "spectrum", "tariff hike", "price hike", "price cut", "merger", "acquisition",
    "disrupt", "outage", "scam", "fraud", "record high", "slump", "invests",
    "partnership", "joint venture", "quarterly result", "profit", "loss", "rbi directive",
    "starlink", "satellite", "ipo"
]

POSITIVE_KEYWORDS = [
    "growth", "surge", "record", "soars", "expands", "profit", "rises", "boost",
    "breakthrough", "success", "innovative", "gains", "lead", "strengthens", "milestone"
]

NEGATIVE_KEYWORDS = [
    "drop", "fall", "loss", "slump", "penalty", "fraud", "breach", "fine",
    "outage", "decline", "probe", "delay", "struggles", "default", "warning", "ban"
]

def tag_article(title: str, summary: str, industry_slug: str) -> Tuple[List[str], List[str], str, str]:
    """
    Returns (detected_companies, detected_topics, sentiment, business_impact)
    """
    combined_text = f"{title} {summary}".lower()
    industry_meta = INDUSTRIES_CONFIG.get(industry_slug, {})
    
    # 1. Company Detection
    tracked_companies = industry_meta.get("companies", [])
    detected_companies: List[str] = []
    for company in tracked_companies:
        # Check whole word match
        pattern = r'\b' + re.escape(company.lower()) + r'\b'
        if re.search(pattern, combined_text):
            detected_companies.append(company)

    # 2. Topic Detection
    detected_topics: List[str] = []
    keywords = industry_meta.get("keywords", [])
    for kw in keywords:
        pattern = r'\b' + re.escape(kw.lower()) + r'\b'
        if re.search(pattern, combined_text):
            detected_topics.append(kw.title())
    
    # Deduplicate topics and limit
    detected_topics = list(dict.fromkeys(detected_topics))[:5]
    if not detected_topics:
        detected_topics = [industry_meta.get("name", "Industry")]

    # 3. Sentiment Detection
    pos_count = sum(1 for kw in POSITIVE_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', combined_text))
    neg_count = sum(1 for kw in NEGATIVE_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', combined_text))
    
    if pos_count > neg_count:
        sentiment = "positive"
    elif neg_count > pos_count:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    # 4. Business Impact Detection
    high_count = sum(1 for kw in HIGH_IMPACT_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', combined_text))
    if high_count >= 2:
        business_impact = "high"
    elif high_count == 1 or len(detected_companies) > 0:
        business_impact = "medium"
    else:
        business_impact = "low"

    return detected_companies, detected_topics, sentiment, business_impact
