from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean, Float, Date
from datetime import datetime, timezone
from app.database import Base

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    guid = Column(String(512), unique=True, index=True, nullable=False)
    title = Column(String(512), nullable=False)
    summary = Column(Text, nullable=True)
    source = Column(String(128), nullable=False, index=True)
    url = Column(String(1024), nullable=False)
    canonical_url = Column(String(1024), nullable=True, index=True)
    published_at = Column(DateTime, nullable=False, index=True)
    retrieved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    industry = Column(String(64), nullable=False, index=True)
    companies = Column(JSON, default=list, nullable=False)
    topics = Column(JSON, default=list, nullable=False)
    sentiment = Column(String(32), default="neutral")
    business_impact = Column(String(32), default="medium")
    verification_status = Column(String(32), default="verified")
    
    # Event Clustering & Deduplication
    cluster_id = Column(String(128), nullable=True, index=True)
    is_duplicate = Column(Boolean, default=False)
    cluster_sources = Column(JSON, default=list) # Array of {source, url, published_at}

class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(128), nullable=False)
    industry = Column(String(64), nullable=False, index=True)
    sync_started_at = Column(DateTime, nullable=False)
    sync_completed_at = Column(DateTime, nullable=False)
    status = Column(String(32), nullable=False) # "success", "error"
    articles_fetched = Column(Integer, default=0)
    articles_new = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)

class SourceHealth(Base):
    __tablename__ = "source_health"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(128), unique=True, nullable=False)
    industry = Column(String(64), nullable=False, index=True)
    url = Column(String(1024), nullable=False)
    status = Column(String(32), default="healthy") # "healthy", "failing", "stale"
    consecutive_failures = Column(Integer, default=0)
    last_attempt_at = Column(DateTime, nullable=True)
    last_success_at = Column(DateTime, nullable=True)
    next_check_at = Column(DateTime, nullable=True)
    last_error = Column(Text, nullable=True)
