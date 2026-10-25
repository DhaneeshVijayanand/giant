from typing import List, Dict, Any, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Giant: Real-Time Industry Intelligence Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DATABASE_URL: str = "sqlite:///./giant.db"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v: Any) -> Any:
        if isinstance(v, str):
            stripped = v.strip()
            if not stripped.startswith('['):
                return [item.strip() for item in stripped.split(',') if item.strip()]
        return v

    # Check intervals
    BREAKING_NEWS_INTERVAL_MINUTES: int = 5
    GENERAL_NEWS_INTERVAL_MINUTES: int = 15
    OFFICIAL_STATS_CHECK_HOURS: int = 24

    # AI Configuration (Milestone 3)
    GEMINI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    LLM_SPEND_CAP_USD: float = 10.0

    # Power BI Configuration (Milestone 5)
    POWERBI_CLIENT_ID: str = ""
    POWERBI_CLIENT_SECRET: str = ""
    POWERBI_TENANT_ID: str = ""
    POWERBI_WORKSPACE_ID: str = ""
    POWERBI_REPORT_ID: str = ""
    POWERBI_DATASET_ID: str = ""

settings = Settings()

# Static Industry Metadata & Company tracking definitions (Section 7)
INDUSTRIES_CONFIG: Dict[str, Dict[str, Any]] = {
    "telecom": {
        "slug": "telecom",
        "name": "Telecom",
        "badge": "Connectivity & 5G",
        "description": "Mobile network operators, broadband fiber, 5G rollouts, satellite connectivity, and TRAI regulatory updates.",
        "companies": [
            "Reliance Jio",
            "Bharti Airtel",
            "Vodafone Idea",
            "BSNL"
        ],
        "keywords": [
            "telecom", "5g", "6g", "spectrum", "trai", "dot", "jio", "airtel", 
            "vodafone idea", "vi", "bsnl", "starlink", "satellite", "broadband", 
            "fiber", "arpu", "subscribers", "tower", "tariff"
        ],
        "rss_feeds": [
            {
                "name": "ET Telecom",
                "url": "https://telecom.economictimes.indiatimes.com/rss/topstories",
                "category": "breaking"
            },
            {
                "name": "LiveMint Technology",
                "url": "https://www.livemint.com/rss/technology",
                "category": "general"
            },
            {
                "name": "Business Standard Tech",
                "url": "https://www.business-standard.com/rss/technology-108.rss",
                "category": "general"
            }
        ]
    },
    "fintech": {
        "slug": "fintech",
        "name": "Fintech & Digital Payments",
        "badge": "UPI & Digital Banking",
        "description": "Unified Payments Interface (UPI), merchant payments, digital lending, neo-banking, and RBI regulatory directives.",
        "companies": [
            "PhonePe",
            "Google Pay",
            "Paytm",
            "Cred",
            "Razorpay",
            "Pine Labs",
            "BharatPe",
            "HDFC Bank",
            "SBI",
            "ICICI Bank",
            "NPCI",
            "Jio Financial Services"
        ],
        "keywords": [
            "upi", "fintech", "payments", "rbi", "npci", "phonepe", "google pay", 
            "paytm", "razorpay", "lending", "neobank", "digital payment", "qr code", 
            "wallet", "p2p", "merchant", "soundbox", "credit line"
        ],
        "rss_feeds": [
            {
                "name": "ET BFSI / Fintech",
                "url": "https://bfsi.economictimes.indiatimes.com/rss/fintech",
                "category": "breaking"
            },
            {
                "name": "Inc42 Fintech",
                "url": "https://inc42.com/category/buzz/feed/",
                "category": "general"
            },
            {
                "name": "YourStory Fintech",
                "url": "https://yourstory.com/feed",
                "category": "general"
            }
        ]
    },
    "ev": {
        "slug": "ev",
        "name": "Electric Vehicles",
        "badge": "Clean Mobility & EV",
        "description": "Electric passenger vehicles, 2-wheelers, commercial EV fleets, battery manufacturing, and charging infrastructure.",
        "companies": [
            "Tata Motors",
            "Mahindra & Mahindra",
            "MG Motor India",
            "Hyundai",
            "Ola Electric",
            "Ather Energy",
            "TVS Motor",
            "Bajaj Auto",
            "VinFast",
            "Tesla",
            "BYD"
        ],
        "keywords": [
            "ev", "electric vehicle", "battery", "charging station", "tata motors", 
            "mahindra", "ola electric", "ather", "vinfast", "tesla", "mg motor", 
            "fame", "pm e-drive", "vahan", "lithium", "gigafactory", "range"
        ],
        "rss_feeds": [
            {
                "name": "Google News India EV",
                "url": "https://news.google.com/rss/search?q=electric+vehicles+india+when:7d&hl=en-IN&gl=IN&ceid=IN:en",
                "category": "breaking"
            },
            {
                "name": "RushLane",
                "url": "https://www.rushlane.com/feed",
                "category": "general"
            },
            {
                "name": "Autocar India",
                "url": "https://www.autocarindia.com/rss/news",
                "category": "general"
            }
        ]
    }
}
