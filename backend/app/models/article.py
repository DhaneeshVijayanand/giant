from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
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
    published_at = Column(DateTime, nullable=False, index=True)
    retrieved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    industry = Column(String(64), nullable=False, index=True)
    companies = Column(JSON, default=list, nullable=False)
    topics = Column(JSON, default=list, nullable=False)
    sentiment = Column(String(32), default="neutral")
    business_impact = Column(String(32), default="medium")
    verification_status = Column(String(32), default="verified")

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
