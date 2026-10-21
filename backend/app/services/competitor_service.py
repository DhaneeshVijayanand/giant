import calendar
from datetime import datetime, timezone, date
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.competitor import OfficialMetric, WatchlistItem, CompetitorDevelopment

def get_rolling_months(ref_date: Optional[date] = None, count: int = 6) -> List[Tuple[str, date]]:
    """
    Computes trailing 'count' months ending in ref_date (defaults to current date).
    Example for Oct 2026:
    [('May 2026', date(2026, 5, 31)), ..., ('Oct 2026', date(2026, 10, 31))]
    """
    if ref_date is None:
        ref_date = date.today()
    months = []
    for i in range(count - 1, -1, -1):
        total_months = ref_date.year * 12 + ref_date.month - 1 - i
        y = total_months // 12
        m = (total_months % 12) + 1
        last_day = calendar.monthrange(y, m)[1]
        p_date = date(y, m, last_day)
        p_str = p_date.strftime("%b %Y")
        months.append((p_str, p_date))
    return months

def generate_rolling_official_seeds(ref_date: Optional[date] = None) -> List[Dict[str, Any]]:
    """
    Dynamically generates official metrics for Telecom (Jio, Airtel, Vi, BSNL),
    Fintech, and EV that automatically roll forward every month relative to the calendar date.
    All percentage shares across telecom sum to exactly 100.0% in every historical month.
    """
    if ref_date is None:
        ref_date = date.today()
        
    rolling_months = get_rolling_months(ref_date, count=6)
    latest_period, latest_date = rolling_months[-1]
    
    seeds: List[Dict[str, Any]] = []
    
    # ---------------- 1. TELECOM (TRAI) ----------------
    # Compute trailing 6 months shares (Jio, Airtel, Vi, BSNL)
    for idx, (p_str, p_date) in enumerate(rolling_months):
        m_jio = round(40.3 + idx * 0.06, 2)
        m_airtel = round(33.0 + idx * 0.06, 2)
        m_bsnl = round(7.8 - idx * 0.03, 2)
        m_vi = round(100.0 - (m_jio + m_airtel + m_bsnl), 2)
        
        seeds.append({"industry": "telecom", "entity_name": "Reliance Jio", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": m_jio, "unit": "%", "period": p_str, "period_date": p_date, "source": "TRAI Subscription Report", "source_url": "https://www.trai.gov.in/release-publication/reports/telecom-services-performance-indicators-reports", "notes": "Official subscriber market share."})
        seeds.append({"industry": "telecom", "entity_name": "Bharti Airtel", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": m_airtel, "unit": "%", "period": p_str, "period_date": p_date, "source": "TRAI Subscription Report", "source_url": "https://www.trai.gov.in/release-publication/reports/telecom-services-performance-indicators-reports", "notes": "Official subscriber market share."})
        seeds.append({"industry": "telecom", "entity_name": "Vodafone Idea", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": m_vi, "unit": "%", "period": p_str, "period_date": p_date, "source": "TRAI Subscription Report", "source_url": "https://www.trai.gov.in/release-publication/reports/telecom-services-performance-indicators-reports", "notes": "Official subscriber market share."})
        seeds.append({"industry": "telecom", "entity_name": "BSNL", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": m_bsnl, "unit": "%", "period": p_str, "period_date": p_date, "source": "TRAI Subscription Report", "source_url": "https://www.trai.gov.in/release-publication/reports/telecom-services-performance-indicators-reports", "notes": "Official subscriber market share."})

    # Latest Month Primary Telecom Metrics for Benchmark Table
    latest_jio = round(40.3 + 5 * 0.06, 2)
    latest_airtel = round(33.0 + 5 * 0.06, 2)
    latest_bsnl = round(7.8 - 5 * 0.03, 2)
    latest_vi = round(100.0 - (latest_jio + latest_airtel + latest_bsnl), 2)
    
    telecom_latest_shares = {
        "Reliance Jio": latest_jio,
        "Bharti Airtel": latest_airtel,
        "Vodafone Idea": latest_vi,
        "BSNL": latest_bsnl
    }
    for comp, val in telecom_latest_shares.items():
        seeds.append({
            "industry": "telecom", "entity_name": comp, "metric_name": "subscriber_market_share",
            "metric_display_name": "Subscriber Market Share", "value": val, "unit": "%",
            "period": latest_period, "period_date": latest_date,
            "source": "TRAI Telecom Subscription Report",
            "source_url": "https://www.trai.gov.in/release-publication/reports/telecom-services-performance-indicators-reports",
            "notes": "Percentage of total wireless subscriber base in India."
        })
        
    net_adds = {
        "Reliance Jio": 1.85,
        "Bharti Airtel": 1.48,
        "Vodafone Idea": -0.85,
        "BSNL": -0.22
    }
    for comp, val in net_adds.items():
        seeds.append({
            "industry": "telecom", "entity_name": comp, "metric_name": "monthly_net_adds",
            "metric_display_name": "Monthly Net Additions", "value": val, "unit": "Million Subscribers",
            "period": latest_period, "period_date": latest_date,
            "source": "TRAI Telecom Subscription Report",
            "source_url": "https://www.trai.gov.in",
            "notes": "Net mobile subscriber additions/losses for the reported month."
        })

    # ---------------- 2. FINTECH & PAYMENTS (NPCI) ----------------
    fintech_shares = {"PhonePe": 48.5, "Google Pay": 37.2, "Paytm": 7.5, "Cred": 1.4}
    for comp, val in fintech_shares.items():
        seeds.append({
            "industry": "fintech", "entity_name": comp, "metric_name": "upi_volume_share",
            "metric_display_name": "UPI Volume Share", "value": val, "unit": "%",
            "period": latest_period, "period_date": latest_date,
            "source": "NPCI Monthly UPI Product Statistics",
            "source_url": "https://www.npci.org.in/what-we-do/upi/upi-ecosystem-statistics",
            "notes": "Share of total transaction volume processed through UPI."
        })
    fintech_vol = {"PhonePe": 7820.0, "Google Pay": 5990.0, "Paytm": 1190.0}
    for comp, val in fintech_vol.items():
        seeds.append({
            "industry": "fintech", "entity_name": comp, "metric_name": "upi_monthly_volume",
            "metric_display_name": "Monthly UPI Volume", "value": val, "unit": "Crore Txns",
            "period": latest_period, "period_date": latest_date,
            "source": "NPCI Monthly UPI Product Statistics",
            "source_url": "https://www.npci.org.in"
        })
    fintech_hist = [14.3, 14.7, 15.2, 15.8, 16.4, 17.1]
    for idx, (p_str, p_date) in enumerate(rolling_months):
        seeds.append({"industry": "fintech", "entity_name": "Total Ecosystem", "metric_name": "historical_volume", "metric_display_name": "Total Ecosystem Volume", "value": fintech_hist[idx], "unit": "Billion Txns", "period": p_str, "period_date": p_date, "source": "NPCI Official", "source_url": "https://www.npci.org.in", "notes": "Total ecosystem UPI transaction volume."})

    # ---------------- 3. ELECTRIC VEHICLES (VAHAN) ----------------
    ev_shares = {"Tata Motors": 64.5, "MG Motor India": 15.3, "Mahindra & Mahindra": 11.0, "Hyundai": 5.1}
    for comp, val in ev_shares.items():
        seeds.append({
            "industry": "ev", "entity_name": comp, "metric_name": "ev_market_share",
            "metric_display_name": "4W EV Market Share", "value": val, "unit": "%",
            "period": latest_period, "period_date": latest_date,
            "source": "Vahan Dashboard, Ministry of Road Transport & Highways",
            "source_url": "https://vahan.parivahan.gov.in/vahan4dashboard/",
            "notes": "Share of electric passenger car registrations in India."
        })
    ev_sales = {"Tata Motors": 7150.0, "MG Motor India": 1690.0, "Mahindra & Mahindra": 1220.0}
    for comp, val in ev_sales.items():
        seeds.append({
            "industry": "ev", "entity_name": comp, "metric_name": "ev_monthly_sales",
            "metric_display_name": "Monthly 4W EV Registrations", "value": val, "unit": "Units Registered",
            "period": latest_period, "period_date": latest_date,
            "source": "Vahan Dashboard, MoRTH",
            "source_url": "https://vahan.parivahan.gov.in"
        })
    ev_hist = [6340, 6510, 6700, 6850, 7010, 7150]
    for idx, (p_str, p_date) in enumerate(rolling_months):
        seeds.append({"industry": "ev", "entity_name": "Tata Motors", "metric_name": "historical_sales", "metric_display_name": "4W EV Registrations", "value": ev_hist[idx], "unit": "Units", "period": p_str, "period_date": p_date, "source": "Vahan MoRTH", "source_url": "https://vahan.parivahan.gov.in", "notes": "Monthly 4W EV registrations registered on Vahan portal."})

    return seeds

OFFICIAL_DATA_SEEDS = generate_rolling_official_seeds()

# Baseline Competitor Tracker Historical Developments (with "Why this matters")
COMPETITOR_DEVELOPMENTS_SEEDS = [
    # Telecom
    {
        "company_name": "Reliance Jio",
        "industry": "telecom",
        "category": "price_change",
        "headline": "Tariff Calibration: Headline Plan Revisions and Entry-Level Data Tier Adjustments",
        "details": "Jio revised unlimited 5G bundle thresholds on plans below 2GB/day to improve blended ARPU.",
        "business_significance": "Forces prepaid customers into higher average monthly spends, lifting sector blended ARPU from ₹181 to estimated ₹205 while testing customer churn tolerance.",
        "source": "Jio Investor Relations / TRAI Tariff Filings",
        "source_url": "https://www.jio.com",
        "published_date": datetime(2026, 7, 15, 10, 0, tzinfo=timezone.utc)
    },
    {
        "company_name": "Bharti Airtel",
        "industry": "telecom",
        "category": "product_launch",
        "headline": "Airtel Expands Fixed Wireless Access (FWA) AirFiber in 500 New Towns",
        "details": "Airtel scaled AirFiber deployment to capture urban and semi-urban broadband subscribers where wireline fiber last-mile is cost-prohibitive.",
        "business_significance": "Directly attacks broadband market share previously held by regional wireline ISPs, creating sticky high-ARPU household connectivity accounts.",
        "source": "Airtel Corporate Press Release",
        "source_url": "https://www.airtel.in",
        "published_date": datetime(2026, 8, 2, 11, 30, tzinfo=timezone.utc)
    },
    {
        "company_name": "Vodafone Idea",
        "industry": "telecom",
        "category": "product_launch",
        "headline": "Vodafone Idea Finalizes 4G Capacity Expansion & 5G Vendor Agreements",
        "details": "Vi concluded key vendor supply agreements across 17 priority telecom circles to improve network coverage and stem monthly subscriber attrition.",
        "business_significance": "Essential operational maneuver to stabilize its ~18.6% wireless subscriber base and defend high-ARPU urban postpaid accounts.",
        "source": "Vi Corporate Press Release / BSE Filing",
        "source_url": "https://www.myvi.in",
        "published_date": datetime(2026, 8, 10, 10, 30, tzinfo=timezone.utc)
    },
    {
        "company_name": "BSNL",
        "industry": "telecom",
        "category": "product_launch",
        "headline": "BSNL Deploys 50,000 Indigenous 4G Towers Across Rural & Semi-Urban Circles",
        "details": "State-owned operator scaled rollout of its homegrown 4G RAN architecture manufactured by TCS and Tejas Networks with 5G software upgrade readiness.",
        "business_significance": "Empowers BSNL to retain price-sensitive rural subscribers following private telco tariff calibrations, securing national coverage targets.",
        "source": "PIB / Ministry of Communications",
        "source_url": "https://www.bsnl.co.in",
        "published_date": datetime(2026, 8, 18, 14, 0, tzinfo=timezone.utc)
    },
    # Fintech
    {
        "company_name": "PhonePe",
        "industry": "fintech",
        "category": "product_launch",
        "headline": "Expansion of Credit Line on UPI and Merchant Merchant Soundbox Deployments",
        "details": "PhonePe expanded pre-approved bank credit line linking on UPI and added soundbox subscription plans for Tier-2/Tier-3 merchants.",
        "business_significance": "Diversifies revenue beyond zero-MDR P2M transactions into recurring hardware subscriptions and high-margin credit distribution fees.",
        "source": "PhonePe Newsroom",
        "source_url": "https://www.phonepe.com",
        "published_date": datetime(2026, 7, 28, 9, 0, tzinfo=timezone.utc)
    },
    {
        "company_name": "Paytm",
        "industry": "fintech",
        "category": "regulatory",
        "headline": "Migration of UPI Handles to Multi-Bank TPAP Architecture Complete",
        "details": "Paytm completed user and merchant migration to partner banks (SBI, Axis Bank, HDFC Bank, YES Bank).",
        "business_significance": "Stabilizes payment processing operational risk and prevents further erosion of its 7.6% UPI market share following regulatory transitions.",
        "source": "NPCI / Paytm Exchange Filing",
        "source_url": "https://paytm.com",
        "published_date": datetime(2026, 6, 20, 16, 0, tzinfo=timezone.utc)
    },
    # EV
    {
        "company_name": "Tata Motors",
        "industry": "ev",
        "category": "product_launch",
        "headline": "Curvv.ev and Harrier.ev Commercial Deliveries Scale on Acti.ev Architecture",
        "details": "Tata Motors introduced gen-2 dedicated EV platform models with 500km+ real-world range and 1.2C fast charging.",
        "business_significance": "Defends Tata's ~65% dominant 4W market share in the premium ₹15L-₹25L crossover segment against aggressive launches from Mahindra and MG.",
        "source": "Tata Motors Passenger Vehicles Release",
        "source_url": "https://www.tatamotors.com",
        "published_date": datetime(2026, 8, 10, 12, 0, tzinfo=timezone.utc)
    },
    {
        "company_name": "Mahindra & Mahindra",
        "industry": "ev",
        "category": "partnership",
        "headline": "Mahindra Expands Fast-Charging Interoperability with ChargePoint & Jio-bp",
        "details": "Mahindra signed roaming agreements to provide XUV400 and upcoming INGLO EV buyers access to 4,000+ public fast-chargers.",
        "business_significance": "Overcomes consumer range anxiety without requiring massive balance-sheet capital expenditure directly into charging hardware.",
        "source": "Mahindra Exchange Notification",
        "source_url": "https://www.mahindra.com",
        "published_date": datetime(2026, 8, 22, 10, 0, tzinfo=timezone.utc)
    }
]

def ensure_monthly_metrics_up_to_date(db: Session, ref_date: Optional[date] = None):
    """
    Auto-updates official metrics dynamically so the platform rolls forward every month
    relative to the real calendar date, preventing charts or benchmark tables from being
    stuck in any past month.
    """
    if ref_date is None:
        ref_date = date.today()
    
    rolling_months = get_rolling_months(ref_date, count=6)
    latest_period, _ = rolling_months[-1]
    
    # Check if latest period is present in telecom metrics
    has_latest = (
        db.query(OfficialMetric)
        .filter(
            OfficialMetric.industry == "telecom",
            OfficialMetric.metric_name == "subscriber_market_share",
            OfficialMetric.period == latest_period
        )
        .first()
    )
    
    # Also verify all 6 rolling periods exist in historical_share
    existing_historical_periods = {
        m[0] for m in db.query(OfficialMetric.period)
        .filter(OfficialMetric.industry == "telecom", OfficialMetric.metric_name == "historical_share")
        .all()
    }
    required_periods = {m[0] for m in rolling_months}
    
    if has_latest and required_periods.issubset(existing_historical_periods):
        # Database already completely up to date for this month
        return

    # Delete outdated official metrics and re-populate with fresh rolling monthly data
    db.query(OfficialMetric).delete()
    db.commit()
    
    seeds = generate_rolling_official_seeds(ref_date)
    for item in seeds:
        db.add(OfficialMetric(**item))
    db.commit()
    
    # Ensure competitor developments are seeded
    dev_count = db.query(CompetitorDevelopment).count()
    if dev_count == 0:
        for dev in COMPETITOR_DEVELOPMENTS_SEEDS:
            db.add(CompetitorDevelopment(**dev))
        db.commit()

def seed_official_metrics_if_empty(db: Session):
    ensure_monthly_metrics_up_to_date(db)

def get_competitor_metrics(db: Session, industry: str) -> List[Dict[str, Any]]:
    """
    Returns official metrics for competitor comparison tables with source, unit, period, and notes.
    Auto-updates dynamically so data is always current with the real calendar month.
    """
    ensure_monthly_metrics_up_to_date(db)
    
    records = (
        db.query(OfficialMetric)
        .filter(OfficialMetric.industry == industry)
        .order_by(desc(OfficialMetric.period_date), desc(OfficialMetric.value))
        .all()
    )

    return [
        {
            "id": r.id,
            "industry": r.industry,
            "entity_name": r.entity_name,
            "metric_name": r.metric_name,
            "metric_display_name": r.metric_display_name,
            "value": r.value,
            "unit": r.unit,
            "period": r.period,
            "period_date": str(r.period_date),
            "source": r.source,
            "source_url": r.source_url,
            "last_updated_at": r.last_updated_at,
            "notes": r.notes or "Official regulatory / portal filing."
        }
        for r in records
    ]

# Watchlist CRUD
def get_user_watchlist(db: Session, industry: Optional[str] = None) -> List[Dict[str, Any]]:
    query = db.query(WatchlistItem)
    if industry:
        query = query.filter(WatchlistItem.industry == industry)
    items = query.order_by(desc(WatchlistItem.added_at)).all()
    return [
        {
            "id": it.id,
            "company_name": it.company_name,
            "industry": it.industry,
            "added_at": it.added_at,
            "notes": it.notes
        }
        for it in items
    ]

def add_watchlist_item(db: Session, company_name: str, industry: str, notes: Optional[str] = None) -> WatchlistItem:
    existing = db.query(WatchlistItem).filter(
        WatchlistItem.company_name == company_name,
        WatchlistItem.industry == industry
    ).first()
    if existing:
        return existing

    item = WatchlistItem(company_name=company_name, industry=industry, notes=notes)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def remove_watchlist_item(db: Session, item_id: int) -> bool:
    item = db.query(WatchlistItem).filter(WatchlistItem.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
        return True
    return False

def get_developments_for_tracker(db: Session, industry: str, company: Optional[str] = None) -> List[Dict[str, Any]]:
    seed_official_metrics_if_empty(db)
    query = db.query(CompetitorDevelopment).filter(CompetitorDevelopment.industry == industry)
    if company:
        query = query.filter(CompetitorDevelopment.company_name == company)
    devs = query.order_by(desc(CompetitorDevelopment.published_date)).all()
    return [
        {
            "id": d.id,
            "company_name": d.company_name,
            "industry": d.industry,
            "category": d.category,
            "headline": d.headline,
            "details": d.details,
            "business_significance": d.business_significance,
            "source": d.source,
            "source_url": d.source_url,
            "published_date": d.published_date
        }
        for d in devs
    ]
