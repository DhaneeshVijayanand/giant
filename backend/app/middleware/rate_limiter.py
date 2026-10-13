import time
from collections import defaultdict
from typing import Dict, List
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

class InMemoryRateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Sliding window in-memory rate limiter middleware.
    Protects public API endpoints from denial of service and LLM quota abuse.
    """
    def __init__(self, app):
        super().__init__(app)
        # Store timestamps of requests: ip -> list of timestamps
        self.general_requests: Dict[str, List[float]] = defaultdict(list)
        self.ai_requests: Dict[str, List[float]] = defaultdict(list)
        self.upload_requests: Dict[str, List[float]] = defaultdict(list)
        
        # Configurable limits per minute
        self.GENERAL_LIMIT_PER_MINUTE = 120
        self.AI_LIMIT_PER_MINUTE = 30
        self.UPLOAD_LIMIT_PER_MINUTE = 15

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        client = request.client
        return client.host if client else "127.0.0.1"

    def _is_rate_limited(self, timestamps: List[float], limit: int, window: float = 60.0) -> bool:
        now = time.time()
        # Remove timestamps older than window
        while timestamps and timestamps[0] < now - window:
            timestamps.pop(0)
        if len(timestamps) >= limit:
            return True
        timestamps.append(now)
        return False

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        
        # Bypass rate limits for health checks and documentation
        if path in ("/", "/health", "/docs", "/openapi.json", "/redoc") or path.startswith("/static"):
            return await call_next(request)

        client_ip = self._get_client_ip(request)

        # 1. Specialized AI rate limit
        if path.startswith("/api/v1/ai/chat") or path.startswith("/api/v1/ai/recommendations"):
            if self._is_rate_limited(self.ai_requests[client_ip], self.AI_LIMIT_PER_MINUTE):
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "AI Rate limit exceeded. Maximum 30 AI requests per minute.",
                        "error": "too_many_requests",
                        "retry_after_seconds": 60
                    },
                    headers={"Retry-After": "60"}
                )

        # 2. Specialized Upload rate limit
        elif path.startswith("/api/v1/churn/upload"):
            if self._is_rate_limited(self.upload_requests[client_ip], self.UPLOAD_LIMIT_PER_MINUTE):
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Upload rate limit exceeded. Maximum 15 uploads per minute.",
                        "error": "too_many_requests",
                        "retry_after_seconds": 60
                    },
                    headers={"Retry-After": "60"}
                )

        # 3. General API rate limit
        elif path.startswith("/api/v1/"):
            if self._is_rate_limited(self.general_requests[client_ip], self.GENERAL_LIMIT_PER_MINUTE):
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "API Rate limit exceeded. Maximum 120 requests per minute.",
                        "error": "too_many_requests",
                        "retry_after_seconds": 60
                    },
                    headers={"Retry-After": "60"}
                )

        response = await call_next(request)
        return response
