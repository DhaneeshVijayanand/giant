from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# If sqlite, use connect_args check_same_thread=False
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_schema_migrations():
    """
    Safely adds any newly introduced columns to existing databases without data loss.
    """
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    if "articles" in inspector.get_table_names():
        existing_cols = {c["name"] for c in inspector.get_columns("articles")}
        with engine.connect() as conn:
            if "canonical_url" not in existing_cols:
                conn.execute(text("ALTER TABLE articles ADD COLUMN canonical_url VARCHAR(1024)"))
            if "cluster_id" not in existing_cols:
                conn.execute(text("ALTER TABLE articles ADD COLUMN cluster_id VARCHAR(128)"))
            if "is_duplicate" not in existing_cols:
                conn.execute(text("ALTER TABLE articles ADD COLUMN is_duplicate BOOLEAN DEFAULT 0"))
            if "cluster_sources" not in existing_cols:
                conn.execute(text("ALTER TABLE articles ADD COLUMN cluster_sources JSON DEFAULT '[]'"))
            conn.commit()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
