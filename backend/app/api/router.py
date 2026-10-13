from fastapi import APIRouter
from app.api.news import router as news_router
from app.api.industries import router as industries_router
from app.api.competitors import router as competitors_router
from app.api.scheduler_api import router as scheduler_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(news_router)
api_router.include_router(industries_router)
api_router.include_router(competitors_router)
api_router.include_router(scheduler_router)
