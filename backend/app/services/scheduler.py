import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.config import settings
from app.database import SessionLocal
from app.services.news_service import sync_all_feeds

logger = logging.getLogger("giant.scheduler")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

scheduler = AsyncIOScheduler()

async def job_breaking_news():
    logger.info("Executing scheduled job: Breaking News Poll (Interval: %sm)", settings.BREAKING_NEWS_INTERVAL_MINUTES)
    db = SessionLocal()
    try:
        res = await sync_all_feeds(db)
        logger.info("Breaking News Poll completed: %s fetched, %s added, %s merged", 
                    res.get("articles_fetched"), res.get("articles_added"), res.get("duplicates_merged"))
    except Exception as e:
        logger.error("Error during scheduled Breaking News Poll: %s", e)
    finally:
        db.close()

async def job_general_news():
    logger.info("Executing scheduled job: General News Poll (Interval: %sm)", settings.GENERAL_NEWS_INTERVAL_MINUTES)
    db = SessionLocal()
    try:
        res = await sync_all_feeds(db)
        logger.info("General News Poll completed: %s fetched, %s added, %s merged", 
                    res.get("articles_fetched"), res.get("articles_added"), res.get("duplicates_merged"))
    except Exception as e:
        logger.error("Error during scheduled General News Poll: %s", e)
    finally:
        db.close()

async def job_official_stats():
    logger.info("Executing scheduled job: Official Statistics Check (Interval: %sh)", settings.OFFICIAL_STATS_CHECK_HOURS)
    # Checks TRAI, NPCI, Vahan updates

def init_scheduler():
    if not scheduler.running:
        # 1. Breaking news job (default every 5m)
        scheduler.add_job(
            job_breaking_news,
            trigger=IntervalTrigger(minutes=settings.BREAKING_NEWS_INTERVAL_MINUTES),
            id="job_breaking_news",
            name="Breaking News Poller (5m)",
            replace_existing=True,
            misfire_grace_time=60
        )

        # 2. General news job (default every 15m)
        scheduler.add_job(
            job_general_news,
            trigger=IntervalTrigger(minutes=settings.GENERAL_NEWS_INTERVAL_MINUTES),
            id="job_general_news",
            name="General News Poller (15m)",
            replace_existing=True,
            misfire_grace_time=120
        )

        # 3. Daily official stats check (default every 24h)
        scheduler.add_job(
            job_official_stats,
            trigger=IntervalTrigger(hours=settings.OFFICIAL_STATS_CHECK_HOURS),
            id="job_official_stats",
            name="Official Statistics Checker (Daily)",
            replace_existing=True,
            misfire_grace_time=3600
        )

        scheduler.start()
        logger.info("APScheduler initialized and started with %d jobs", len(scheduler.get_jobs()))

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler shut down")

def get_scheduler_status() -> Dict[str, Any]:
    jobs_info: List[Dict[str, Any]] = []
    if scheduler.running:
        for job in scheduler.get_jobs():
            jobs_info.append({
                "id": job.id,
                "name": job.name,
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger)
            })

    return {
        "running": scheduler.running,
        "active_jobs_count": len(jobs_info),
        "breaking_news_interval_minutes": settings.BREAKING_NEWS_INTERVAL_MINUTES,
        "general_news_interval_minutes": settings.GENERAL_NEWS_INTERVAL_MINUTES,
        "official_stats_interval_hours": settings.OFFICIAL_STATS_CHECK_HOURS,
        "jobs": jobs_info
    }
