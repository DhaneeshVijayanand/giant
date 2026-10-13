from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ArticleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    guid: str
    title: str
    summary: Optional[str] = None
    source: str
    url: str
    published_at: datetime
    retrieved_at: datetime
    industry: str
    companies: List[str] = []
    topics: List[str] = []
    sentiment: str = "neutral"
    business_impact: str = "medium"
    verification_status: str = "verified"

class IndustryCardResponse(BaseModel):
    slug: str
    name: str
    badge: str
    description: str
    tracked_companies_count: int
    total_articles_count: int
    new_articles_count_24h: int
    latest_headline: Optional[str] = None
    latest_source: Optional[str] = None
    latest_published_at: Optional[datetime] = None
    last_sync_time: Optional[datetime] = None
    sync_status: str = "healthy" # "healthy", "stale", "empty"

class IndustryOverviewResponse(BaseModel):
    slug: str
    name: str
    badge: str
    description: str
    tracked_companies: List[str]
    total_articles: int
    last_sync_time: Optional[datetime] = None
    latest_retrieved_at: Optional[datetime] = None
    latest_published_at: Optional[datetime] = None
    data_freshness_status: str = "real" # "real", "empty", "stale"

class RefreshResponse(BaseModel):
    status: str
    synced_at: datetime
    articles_fetched: int
    articles_added: int
    industries: List[str]
    errors: List[str] = []
