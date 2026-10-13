import httpx
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.models.article import Article

# ================= 1. POWER BI DATA LAYER (REPORTING VIEW) =================

def get_powerbi_reporting_dataset(
    db: Session, 
    industry: Optional[str] = None, 
    limit: int = 500
) -> List[Dict[str, Any]]:
    """
    Returns sanitized, reporting-optimized records designed specifically for Power BI.
    Fields:
      - article_id
      - headline
      - source
      - original_url
      - publication_timestamp
      - retrieval_timestamp
      - industry
      - company
      - topic
      - country
      - sentiment
      - business_impact
      - verification_status

    NON-NEGOTIABLE SECURITY RULE:
    Strictly excludes customer-level churn data, client emails, API keys, passwords, and tokens.
    """
    query = db.query(Article)
    if industry:
        query = query.filter(Article.industry == industry)
    
    articles = query.order_by(Article.published_at.desc()).limit(limit).all()

    reporting_rows = []
    for art in articles:
        # Determine primary company or fallback to general sector
        primary_company = art.companies[0] if (art.companies and len(art.companies) > 0) else "General Sector"
        primary_topic = art.topics[0] if (art.topics and len(art.topics) > 0) else "Market Overview"

        reporting_rows.append({
            "article_id": art.id,
            "headline": art.title,
            "source": art.source,
            "original_url": art.url,
            "publication_timestamp": art.published_at.isoformat() if art.published_at else None,
            "retrieval_timestamp": art.retrieved_at.isoformat() if art.retrieved_at else None,
            "industry": art.industry,
            "company": primary_company,
            "topic": primary_topic,
            "country": "India", # Primary geographical focus of Giant platform
            "sentiment": art.sentiment or "neutral",
            "business_impact": art.business_impact or "medium",
            "verification_status": art.verification_status or "verified"
        })

    return reporting_rows

# ================= 2. POWER BI CONFIGURATION & PREREQUISITES =================

PREREQUISITE_CHECKLIST = {
    "licence_and_workspace": {
        "title": "Power BI Licence & Dedicated Workspace",
        "requirement": "Power BI Pro or PPU with Microsoft Fabric / Power BI Embedded Capacity (A4/EM/F-SKU). 'Publish to web' is public and strictly prohibited.",
        "how_to_obtain": "Log into Power BI Service (app.powerbi.com), create a new Workspace (e.g. 'Giant Industry Intelligence'), and ensure the workspace is assigned to an active Capacity in Workspace Settings > Premium/Fabric."
    },
    "entra_app_registration": {
        "title": "Microsoft Entra (Azure AD) App Registration",
        "requirement": "Service principal with application secret and API permissions (Tenant.Read.All, Report.ReadWrite.All).",
        "how_to_obtain": "Navigate to Azure Portal > Microsoft Entra ID > App registrations > New registration. Note the Client ID and Tenant ID. Under 'Certificates & secrets', create a new Client Secret."
    },
    "tenant_settings_api": {
        "title": "Power BI Tenant Service Principal API Setting",
        "requirement": "Tenant administrator must enable service principals to use Power BI REST APIs.",
        "how_to_obtain": "Go to Power BI Admin Portal > Tenant settings > Developer settings > Enable 'Service principals can use Power BI APIs', and grant access to the security group containing your app registration."
    },
    "workspace_access": {
        "title": "Workspace Access for Service Principal",
        "requirement": "The registered service principal must be added as a Member or Admin to the workspace.",
        "how_to_obtain": "In Power BI Service, open your Workspace > Manage Access > Add people or groups > Search for your registered App Name > Assign 'Member' role."
    },
    "published_report_and_dataset": {
        "title": "Published Report & Semantic Model IDs",
        "requirement": "Report ID, Workspace ID, and Dataset ID published to the workspace.",
        "how_to_obtain": "Publish the Giant .pbix from Power BI Desktop to your workspace. Open the report in browser; the URL contains /groups/{workspaceId}/reports/{reportId}."
    },
    "database_connectivity": {
        "title": "Direct Database or On-Premises Data Gateway",
        "requirement": "A database Power BI can reach via public IP/firewall or the On-premises Data Gateway.",
        "how_to_obtain": "Configure PostgreSQL firewall rules or install the Power BI On-premises Data Gateway on your server. Alternatively, use Giant's direct REST feed endpoint."
    }
}

def check_powerbi_configuration_status() -> Dict[str, Any]:
    """
    Checks environment variables to verify Power BI integration status.
    Never fakes success: if any required credential is missing, returns clear diagnostics.
    """
    missing_items = []
    
    if not settings.POWERBI_CLIENT_ID:
        missing_items.append("POWERBI_CLIENT_ID")
    if not settings.POWERBI_CLIENT_SECRET:
        missing_items.append("POWERBI_CLIENT_SECRET")
    if not settings.POWERBI_TENANT_ID:
        missing_items.append("POWERBI_TENANT_ID")
    if not settings.POWERBI_WORKSPACE_ID:
        missing_items.append("POWERBI_WORKSPACE_ID")
    if not settings.POWERBI_REPORT_ID:
        missing_items.append("POWERBI_REPORT_ID")

    is_configured = len(missing_items) == 0

    return {
        "is_configured": is_configured,
        "missing_items": missing_items,
        "configured_items": [
            k for k in ["POWERBI_CLIENT_ID", "POWERBI_TENANT_ID", "POWERBI_WORKSPACE_ID", "POWERBI_REPORT_ID", "POWERBI_DATASET_ID"]
            if getattr(settings, k, None)
        ],
        "prerequisites": PREREQUISITE_CHECKLIST,
        "workspace_id": settings.POWERBI_WORKSPACE_ID or None,
        "report_id": settings.POWERBI_REPORT_ID or None,
        "dataset_id": settings.POWERBI_DATASET_ID or None,
        "tenant_id": settings.POWERBI_TENANT_ID or None
    }

# ================= 3. AZURE AD & POWER BI EMBED TOKEN SERVICE =================

async def get_azure_ad_token() -> Optional[str]:
    """
    Authenticates via Service Principal with Azure AD OAuth 2.0 client credentials grant.
    """
    if not (settings.POWERBI_CLIENT_ID and settings.POWERBI_CLIENT_SECRET and settings.POWERBI_TENANT_ID):
        return None

    token_url = f"https://login.microsoftonline.com/{settings.POWERBI_TENANT_ID}/oauth2/v2.0/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": settings.POWERBI_CLIENT_ID,
        "client_secret": settings.POWERBI_CLIENT_SECRET,
        "scope": "https://analysis.windows.net/powerbi/api/.default"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(token_url, data=data)
            if resp.status_code == 200:
                payload = resp.json()
                return payload.get("access_token")
        except Exception:
            pass
    return None

async def generate_powerbi_embed_token(industry: Optional[str] = None) -> Dict[str, Any]:
    """
    Generates a secure, short-lived Power BI embed token server-side.
    Rules:
    - Secrets never reach frontend code.
    - Only the short-lived embed token reaches the browser.
    - If credentials are not configured, returns clear setup diagnostics and never simulates success.
    """
    status = check_powerbi_configuration_status()
    if not status["is_configured"]:
        return {
            "is_configured": False,
            "error": "Microsoft Power BI credentials are not configured in environment variables.",
            "missing_items": status["missing_items"],
            "prerequisites": status["prerequisites"]
        }

    aad_token = await get_azure_ad_token()
    if not aad_token:
        return {
            "is_configured": False,
            "error": "Failed to authenticate Service Principal with Microsoft Entra ID (Azure AD). Verify Client ID, Client Secret, and Tenant ID.",
            "missing_items": [],
            "prerequisites": status["prerequisites"]
        }

    headers = {
        "Authorization": f"Bearer {aad_token}",
        "Content-Type": "application/json"
    }

    # 1. Fetch Report Metadata
    report_url = f"https://api.powerbi.com/v1.0/myorg/groups/{settings.POWERBI_WORKSPACE_ID}/reports/{settings.POWERBI_REPORT_ID}"
    embed_token_url = f"https://api.powerbi.com/v1.0/myorg/groups/{settings.POWERBI_WORKSPACE_ID}/reports/{settings.POWERBI_REPORT_ID}/GenerateToken"

    async with httpx.AsyncClient(timeout=12.0) as client:
        try:
            rep_resp = await client.get(report_url, headers=headers)
            if rep_resp.status_code != 200:
                return {
                    "is_configured": False,
                    "error": f"Failed to retrieve report from Power BI workspace (HTTP {rep_resp.status_code}). Verify workspace permissions for the service principal.",
                    "missing_items": [],
                    "prerequisites": status["prerequisites"]
                }

            rep_data = rep_resp.json()
            embed_url = rep_data.get("embedUrl")
            dataset_id = rep_data.get("datasetId") or settings.POWERBI_DATASET_ID

            # 2. Request Short-Lived Embed Token
            token_payload = {
                "accessLevel": "View",
                "allowSaveAs": False
            }
            tok_resp = await client.post(embed_token_url, headers=headers, json=token_payload)
            if tok_resp.status_code != 200:
                return {
                    "is_configured": False,
                    "error": f"Failed to generate Power BI Embed Token (HTTP {tok_resp.status_code}). Ensure workspace has Fabric / Power BI Premium capacity.",
                    "missing_items": [],
                    "prerequisites": status["prerequisites"]
                }

            token_data = tok_resp.json()
            embed_token = token_data.get("token")
            expiration = token_data.get("expiration")

            # 3. Fetch Real Power BI Data-Refresh Timestamp (Never simulated)
            last_refresh_time = None
            if dataset_id:
                refresh_url = f"https://api.powerbi.com/v1.0/myorg/groups/{settings.POWERBI_WORKSPACE_ID}/datasets/{dataset_id}/refreshes?$top=1"
                ref_resp = await client.get(refresh_url, headers=headers)
                if ref_resp.status_code == 200:
                    ref_data = ref_resp.json()
                    value_list = ref_data.get("value", [])
                    if value_list:
                        last_refresh_time = value_list[0].get("endTime") or value_list[0].get("startTime")

            return {
                "is_configured": True,
                "report_id": settings.POWERBI_REPORT_ID,
                "embed_url": embed_url,
                "embed_token": embed_token,
                "token_expiry": expiration,
                "last_refresh_time": last_refresh_time,
                "dataset_id": dataset_id,
                "industry_filter": industry,
                "view_mode": "embedded"
            }

        except Exception as ex:
            return {
                "is_configured": False,
                "error": f"Network communication error with Power BI REST API: {str(ex)}",
                "missing_items": [],
                "prerequisites": status["prerequisites"]
            }
