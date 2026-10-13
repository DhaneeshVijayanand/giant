from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Date
from datetime import datetime, timezone
from app.database import Base

class OfficialMetric(Base):
    __tablename__ = "official_metrics"

    id = Column(Integer, primary_key=True, index=True)
    industry = Column(String(64), nullable=False, index=True)
    entity_name = Column(String(128), nullable=False, index=True)
    metric_name = Column(String(128), nullable=False, index=True) # e.g. subscriber_market_share
    metric_display_name = Column(String(128), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(64), nullable=False) # e.g. "%", "Million", "Crore Txns"
    period = Column(String(64), nullable=False, index=True) # e.g. "Aug 2026", "2026-Q2"
    period_date = Column(Date, nullable=False, index=True)
    source = Column(String(256), nullable=False) # e.g. "TRAI Telecom Subscription Report"
    source_url = Column(String(512), nullable=True)
    last_updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    notes = Column(Text, nullable=True)

class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(64), default="default_analyst", nullable=False, index=True)
    company_name = Column(String(128), nullable=False, index=True)
    industry = Column(String(64), nullable=False, index=True)
    added_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    notes = Column(Text, nullable=True)

class CompetitorDevelopment(Base):
    __tablename__ = "competitor_developments"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(128), nullable=False, index=True)
    industry = Column(String(64), nullable=False, index=True)
    category = Column(String(64), nullable=False) # "product_launch", "price_change", "partnership", "announcement", "regulatory", "risk_opportunity"
    headline = Column(String(512), nullable=False)
    details = Column(Text, nullable=False)
    business_significance = Column(Text, nullable=False) # Why this matters to business analysts
    source = Column(String(256), nullable=False)
    source_url = Column(String(512), nullable=True)
    published_date = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
