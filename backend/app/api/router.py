from fastapi import APIRouter
from app.api.news import router as news_router
from app.api.industries import router as industries_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(news_router)
api_router.include_router(industries_router)
