from fastapi import APIRouter
from app.api.news import router as news_router
from app.api.industries import router as industries_router
from app.api.competitors import router as competitors_router
from app.api.scheduler_api import router as scheduler_router
from app.api.ai_api import router as ai_router
from app.api.churn_api import router as churn_router
from app.api.starlink_api import router as starlink_router
from app.api.reports_api import router as reports_router
from app.api.powerbi_api import router as powerbi_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(news_router)
api_router.include_router(industries_router)
api_router.include_router(competitors_router)
api_router.include_router(scheduler_router)
api_router.include_router(ai_router)
api_router.include_router(churn_router)
api_router.include_router(starlink_router)
api_router.include_router(reports_router)
api_router.include_router(powerbi_router)

