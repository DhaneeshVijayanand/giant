from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, JSON
from datetime import datetime, timezone
from app.database import Base

class AIChatLog(Base):
    __tablename__ = "ai_chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(Text, nullable=False)
    industry = Column(String(64), nullable=False, index=True)
    response_facts = Column(Text, nullable=False)
    response_interpretation = Column(Text, nullable=False)
    response_predictions = Column(Text, nullable=False)
    response_actions = Column(Text, nullable=False)
    sources_cited = Column(JSON, default=list) # [{title, source, url, published_at}]
    model_used = Column(String(64), default="giant-rag-engine")
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    estimated_cost_usd = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class AISpendTracker(Base):
    __tablename__ = "ai_spend_tracker"

    id = Column(Integer, primary_key=True, index=True)
    month_year = Column(String(16), unique=True, index=True) # e.g. "2026-10"
    total_tokens = Column(Integer, default=0)
    total_spend_usd = Column(Float, default=0.0)
    spend_cap_usd = Column(Float, default=10.0)
    last_updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class AIRecommendationItem(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    industry = Column(String(64), nullable=False, index=True)
    title = Column(String(256), nullable=False)
    business_problem = Column(Text, nullable=False)
    supporting_evidence = Column(Text, nullable=False)
    suggested_action = Column(Text, nullable=False)
    expected_benefit = Column(Text, nullable=False)
    potential_risks = Column(Text, nullable=False)
    kpi_metric = Column(String(128), nullable=False)
    confidence_level = Column(String(32), default="High (85%)") # High, Medium, Low
    correlation_vs_causation_note = Column(Text, nullable=False)
    sources = Column(JSON, default=list)
    suggested_review_date = Column(String(64), nullable=False) # e.g. "Nov 30, 2026"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class ChurnDatasetMeta(Base):
    __tablename__ = "churn_datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(256), nullable=False)
    dataset_name = Column(String(256), nullable=False)
    total_rows = Column(Integer, default=0)
    total_columns = Column(Integer, default=0)
    columns_list = Column(JSON, default=list)
    target_column = Column(String(64), default="Churn")
    is_demo = Column(Boolean, default=False)
    attribution = Column(String(256), nullable=True) # e.g. "IBM Telco Customer Churn"
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(32), default="ready") # "uploaded", "trained", "error"
    model_metrics = Column(JSON, nullable=True)
    feature_importances = Column(JSON, nullable=True)
    risk_distribution = Column(JSON, nullable=True)
    segment_comparisons = Column(JSON, nullable=True)
