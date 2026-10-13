from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from app.config import INDUSTRIES_CONFIG
from app.models.article import Article, SyncLog, SourceHealth
from app.services.rss_fetcher import fetch_feed_articles
from app.services.deduplicator import detect_duplicate_and_cluster
from app.schemas.article import IndustryCardResponse, IndustryOverviewResponse

async def sync_all_feeds(db: Session, target_industry: Optional[str] = None) -> Dict[str, Any]:
    """
    Polls RSS feeds for target industry (or all if None), deduplicates, clusters events,
    records source health, and commits new articles.
    """
    industries_to_sync = [target_industry] if target_industry else list(INDUSTRIES_CONFIG.keys())
    total_fetched = 0
    total_added = 0
    duplicates_merged = 0
    errors: List[str] = []

    for ind_slug in industries_to_sync:
        cfg = INDUSTRIES_CONFIG.get(ind_slug)
        if not cfg:
            continue
        
        # Load recent articles for deduplication and event clustering (past 72h)
        cutoff_72h = datetime.now(timezone.utc) - timedelta(hours=72)
        recent_records = (
            db.query(Article.id, Article.title, Article.url, Article.canonical_url, Article.cluster_id, Article.cluster_sources)
            .filter(Article.industry == ind_slug, Article.published_at >= cutoff_72h)
            .all()
        )
        recent_articles = [
            {
                "id": r.id,
                "title": r.title,
                "url": r.url,
                "canonical_url": r.canonical_url,
                "cluster_id": r.cluster_id,
                "cluster_sources": r.cluster_sources or []
            }
            for r in recent_records
        ]

        feeds = cfg.get("rss_feeds", [])
        for feed in feeds:
            start_time = datetime.now(timezone.utc)
            source_name = feed["name"]
            feed_url = feed["url"]
            category = feed.get("category", "general")
            check_interval_min = 5 if category == "breaking" else 15
            next_check = start_time + timedelta(minutes=check_interval_min)

            # Retrieve or create SourceHealth tracking
            health = db.query(SourceHealth).filter(SourceHealth.source_name == source_name).first()
            if not health:
                health = SourceHealth(
                    source_name=source_name,
                    industry=ind_slug,
                    url=feed_url,
                    status="healthy",
                    consecutive_failures=0
                )
                db.add(health)
                db.flush()

            health.last_attempt_at = start_time
            health.next_check_at = next_check

            try:
                fetched_articles = await fetch_feed_articles(feed, ind_slug)
                total_fetched += len(fetched_articles)
                added_count = 0

                for item in fetched_articles:
                    # Check exact guid first
                    existing_by_guid = db.query(Article).filter(Article.guid == item["guid"]).first()
                    if existing_by_guid:
                        continue

                    # Run duplicate detection and clustering
                    is_dup, cluster_id, src_list = detect_duplicate_and_cluster(
                        title=item["title"],
                        url=item["url"],
                        source=item["source"],
                        published_at=item["published_at"],
                        recent_articles=recent_articles
                    )

                    if is_dup:
                        duplicates_merged += 1
                        # Append source to existing article in same cluster
                        existing_in_cluster = (
                            db.query(Article)
                            .filter(Article.cluster_id == cluster_id)
                            .first()
                        )
                        if existing_in_cluster:
                            curr_sources = list(existing_in_cluster.cluster_sources or [])
                            # Avoid appending exact duplicate source name
                            if not any(s.get("source") == item["source"] for s in curr_sources):
                                curr_sources.append({
                                    "source": item["source"],
                                    "url": item["url"],
                                    "published_at": str(item["published_at"])
                                })
                                existing_in_cluster.cluster_sources = curr_sources
                        continue

                    # Insert new article with assigned cluster_id
                    item["cluster_id"] = cluster_id
                    item["cluster_sources"] = src_list
                    article = Article(**item)
                    db.add(article)
                    db.flush()
                    added_count += 1

                    # Add to in-memory list for subsequent articles in this batch
                    recent_articles.append({
                        "id": article.id,
                        "title": article.title,
                        "url": article.url,
                        "canonical_url": article.canonical_url,
                        "cluster_id": cluster_id,
                        "cluster_sources": src_list
                    })

                # Health update on success
                health.status = "healthy"
                health.consecutive_failures = 0
                health.last_success_at = datetime.now(timezone.utc)
                health.last_error = None

                db.commit()
                total_added += added_count

                # Record sync log
                end_time = datetime.now(timezone.utc)
                log = SyncLog(
                    source_name=source_name,
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
                err_msg = f"Failed to sync {source_name} ({ind_slug}): {str(e)}"
                errors.append(err_msg)

                # Health update on failure (keeps last good data in database)
                health = db.query(SourceHealth).filter(SourceHealth.source_name == source_name).first()
                if health:
                    health.consecutive_failures += 1
                    health.status = "failing"
                    health.last_error = str(e)
                    health.last_attempt_at = start_time
                    health.next_check_at = next_check

                end_time = datetime.now(timezone.utc)
                log = SyncLog(
                    source_name=source_name,
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
        "duplicates_merged": duplicates_merged,
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

        # Check source health to detect failures / stale data
        sources = db.query(SourceHealth).filter(SourceHealth.industry == slug).all()
        has_failing_source = any(s.status == "failing" for s in sources)

        sync_status = "healthy"
        if total_count == 0:
            sync_status = "empty"
        elif has_failing_source:
            sync_status = "stale"
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

def get_source_health_list(db: Session, industry: Optional[str] = None) -> List[Dict[str, Any]]:
    query = db.query(SourceHealth)
    if industry:
        query = query.filter(SourceHealth.industry == industry)
    sources = query.all()

    now_utc = datetime.now(timezone.utc)
    res = []
    for s in sources:
        res.append({
            "source_name": s.source_name,
            "industry": s.industry,
            "url": s.url,
            "status": s.status,
            "consecutive_failures": s.consecutive_failures,
            "last_attempt_at": s.last_attempt_at,
            "last_success_at": s.last_success_at,
            "next_check_at": s.next_check_at,
            "last_error": s.last_error,
            "is_stale": s.status == "failing" or (s.last_success_at and (now_utc - s.last_success_at.replace(tzinfo=timezone.utc if s.last_success_at.tzinfo is None else None)).total_seconds() > 3600 * 2)
        })
    return res
