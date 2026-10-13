from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from app.config import INDUSTRIES_CONFIG
from app.models.article import Article, SyncLog
from app.services.rss_fetcher import fetch_feed_articles
from app.schemas.article import IndustryCardResponse, IndustryOverviewResponse

async def sync_all_feeds(db: Session, target_industry: Optional[str] = None) -> Dict[str, Any]:
    """
    Polls RSS feeds for target industry (or all if None), deduplicates, and commits new articles.
    """
    industries_to_sync = [target_industry] if target_industry else list(INDUSTRIES_CONFIG.keys())
    total_fetched = 0
    total_added = 0
    errors: List[str] = []

    for ind_slug in industries_to_sync:
        cfg = INDUSTRIES_CONFIG.get(ind_slug)
        if not cfg:
            continue
        
        feeds = cfg.get("rss_feeds", [])
        for feed in feeds:
            start_time = datetime.now(timezone.utc)
            try:
                fetched_articles = await fetch_feed_articles(feed, ind_slug)
                total_fetched += len(fetched_articles)
                added_count = 0

                for item in fetched_articles:
                    # Deduplicate based on guid
                    existing = db.query(Article.id).filter(Article.guid == item["guid"]).first()
                    if not existing:
                        article = Article(**item)
                        db.add(article)
                        added_count += 1

                db.commit()
                total_added += added_count

                # Record sync log
                end_time = datetime.now(timezone.utc)
                log = SyncLog(
                    source_name=feed["name"],
                    industry=ind_slug,
                    sync_started_at=start_time,
                    sync_completed_at=end_time,
                    status="success",
                    articles_fetched=len(fetched_articles),
                    articles_new=added_count,
                    error_message=None
                )
                db.add(log)
                db.commit()

            except Exception as e:
                db.rollback()
                err_msg = f"Failed to sync {feed['name']} ({ind_slug}): {str(e)}"
                errors.append(err_msg)
                end_time = datetime.now(timezone.utc)
                log = SyncLog(
                    source_name=feed["name"],
                    industry=ind_slug,
                    sync_started_at=start_time,
                    sync_completed_at=end_time,
                    status="error",
                    articles_fetched=0,
                    articles_new=0,
                    error_message=str(e)
                )
                db.add(log)
                db.commit()

    return {
        "status": "success" if not errors else "partial_error",
        "synced_at": datetime.now(timezone.utc),
        "articles_fetched": total_fetched,
        "articles_added": total_added,
        "industries": industries_to_sync,
        "errors": errors
    }

def get_articles_filtered(
    db: Session,
    industry: Optional[str] = None,
    company: Optional[str] = None,
    topic: Optional[str] = None,
    search: Optional[str] = None,
    impact: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> List[Article]:
    query = db.query(Article)

    if industry:
        query = query.filter(Article.industry == industry)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Article.title.ilike(search_pattern),
                Article.summary.ilike(search_pattern),
                Article.source.ilike(search_pattern)
            )
        )

    if impact:
        query = query.filter(Article.business_impact == impact.lower())

    # Order by newest publication first
    query = query.order_by(desc(Article.published_at))
    articles = query.offset(offset).limit(limit).all()

    # In-memory filter for JSON company/topic if specified
    if company:
        articles = [a for a in articles if company.lower() in [c.lower() for c in (a.companies or [])]]
    if topic:
        articles = [a for a in articles if topic.lower() in [t.lower() for t in (a.topics or [])]]

    return articles

def get_industry_cards(db: Session) -> List[IndustryCardResponse]:
    """
    Computes summary data for Page 2 cards directly from the database.
    """
    cards: List[IndustryCardResponse] = []
    now_utc = datetime.now(timezone.utc)
    one_day_ago = now_utc - timedelta(hours=24)

    for slug, cfg in INDUSTRIES_CONFIG.items():
        total_count = db.query(func.count(Article.id)).filter(Article.industry == slug).scalar() or 0
        new_24h_count = db.query(func.count(Article.id)).filter(
            Article.industry == slug,
            Article.retrieved_at >= one_day_ago
        ).scalar() or 0

        latest_art = (
            db.query(Article)
            .filter(Article.industry == slug)
            .order_by(desc(Article.published_at))
            .first()
        )

        last_sync = (
            db.query(SyncLog)
            .filter(SyncLog.industry == slug, SyncLog.status == "success")
            .order_by(desc(SyncLog.sync_completed_at))
            .first()
        )

        sync_status = "healthy"
        if total_count == 0:
            sync_status = "empty"
        elif last_sync and (now_utc - last_sync.sync_completed_at.replace(tzinfo=timezone.utc if last_sync.sync_completed_at.tzinfo is None else None)).total_seconds() > 3600 * 6:
            sync_status = "stale"

        cards.append(IndustryCardResponse(
            slug=slug,
            name=cfg["name"],
            badge=cfg["badge"],
            description=cfg["description"],
            tracked_companies_count=len(cfg["companies"]),
            total_articles_count=total_count,
            new_articles_count_24h=new_24h_count,
            latest_headline=latest_art.title if latest_art else None,
            latest_source=latest_art.source if latest_art else None,
            latest_published_at=latest_art.published_at if latest_art else None,
            last_sync_time=last_sync.sync_completed_at if last_sync else None,
            sync_status=sync_status
        ))

    return cards

def get_industry_overview(db: Session, slug: str) -> IndustryOverviewResponse:
    cfg = INDUSTRIES_CONFIG.get(slug)
    if not cfg:
        raise ValueError(f"Industry '{slug}' not found")

    total_count = db.query(func.count(Article.id)).filter(Article.industry == slug).scalar() or 0
    latest_art = (
        db.query(Article)
        .filter(Article.industry == slug)
        .order_by(desc(Article.published_at))
        .first()
    )
    last_sync = (
        db.query(SyncLog)
        .filter(SyncLog.industry == slug, SyncLog.status == "success")
        .order_by(desc(SyncLog.sync_completed_at))
        .first()
    )

    data_status = "real" if total_count > 0 else "empty"

    return IndustryOverviewResponse(
        slug=slug,
        name=cfg["name"],
        badge=cfg["badge"],
        description=cfg["description"],
        tracked_companies=cfg["companies"],
        total_articles=total_count,
        last_sync_time=last_sync.sync_completed_at if last_sync else None,
        latest_retrieved_at=latest_art.retrieved_at if latest_art else None,
        latest_published_at=latest_art.published_at if latest_art else None,
        data_freshness_status=data_status
    )
