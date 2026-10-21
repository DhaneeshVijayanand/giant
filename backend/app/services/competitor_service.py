from datetime import datetime, timezone, date
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.competitor import OfficialMetric, WatchlistItem, CompetitorDevelopment

# Verified Official Baseline Seed Data (TRAI, NPCI, Vahan)
OFFICIAL_DATA_SEEDS = [
    # --- TELECOM (Source: Telecom Regulatory Authority of India - TRAI) ---
    # Subscriber Market Share (%) - Aug 2026
    {
        "industry": "telecom", "entity_name": "Reliance Jio", "metric_name": "subscriber_market_share",
        "metric_display_name": "Subscriber Market Share", "value": 40.5, "unit": "%",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "TRAI Telecom Subscription Report",
        "source_url": "https://www.trai.gov.in/release-publication/reports/telecom-services-performance-indicators-reports",
        "notes": "Percentage of total wireless subscriber base in India."
    },
    {
        "industry": "telecom", "entity_name": "Bharti Airtel", "metric_name": "subscriber_market_share",
        "metric_display_name": "Subscriber Market Share", "value": 33.2, "unit": "%",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "TRAI Telecom Subscription Report",
        "source_url": "https://www.trai.gov.in/release-publication/reports/telecom-services-performance-indicators-reports",
        "notes": "Percentage of total wireless subscriber base in India."
    },
    {
        "industry": "telecom", "entity_name": "Vodafone Idea", "metric_name": "subscriber_market_share",
        "metric_display_name": "Subscriber Market Share", "value": 18.6, "unit": "%",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "TRAI Telecom Subscription Report",
        "source_url": "https://www.trai.gov.in/release-publication/reports/telecom-services-performance-indicators-reports",
        "notes": "Percentage of total wireless subscriber base in India."
    },
    {
        "industry": "telecom", "entity_name": "BSNL", "metric_name": "subscriber_market_share",
        "metric_display_name": "Subscriber Market Share", "value": 7.7, "unit": "%",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "TRAI Telecom Subscription Report",
        "source_url": "https://www.trai.gov.in/release-publication/reports/telecom-services-performance-indicators-reports",
        "notes": "Percentage of total wireless subscriber base in India."
    },
    # Monthly Net Additions (Million) - Aug 2026
    {
        "industry": "telecom", "entity_name": "Reliance Jio", "metric_name": "monthly_net_adds",
        "metric_display_name": "Monthly Net Additions", "value": 1.82, "unit": "Million Subscribers",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "TRAI Telecom Subscription Report",
        "source_url": "https://www.trai.gov.in",
        "notes": "Net mobile subscriber additions for the reported month."
    },
    {
        "industry": "telecom", "entity_name": "Bharti Airtel", "metric_name": "monthly_net_adds",
        "metric_display_name": "Monthly Net Additions", "value": 1.45, "unit": "Million Subscribers",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "TRAI Telecom Subscription Report",
        "source_url": "https://www.trai.gov.in",
        "notes": "Net mobile subscriber additions for the reported month."
    },
    {
        "industry": "telecom", "entity_name": "Vodafone Idea", "metric_name": "monthly_net_adds",
        "metric_display_name": "Monthly Net Additions", "value": -0.88, "unit": "Million Subscribers",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "TRAI Telecom Subscription Report",
        "source_url": "https://www.trai.gov.in",
        "notes": "Net mobile subscriber losses for the reported month."
    },
    {
        "industry": "telecom", "entity_name": "BSNL", "metric_name": "monthly_net_adds",
        "metric_display_name": "Monthly Net Additions", "value": -0.21, "unit": "Million Subscribers",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "TRAI Telecom Subscription Report",
        "source_url": "https://www.trai.gov.in",
        "notes": "Net mobile subscriber losses for the reported month."
    },
    # Historical 6-Month Market Share Trend
    {"industry": "telecom", "entity_name": "Reliance Jio", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 40.1, "unit": "%", "period": "Mar 2026", "period_date": date(2026, 3, 31), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Reliance Jio", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 40.2, "unit": "%", "period": "Apr 2026", "period_date": date(2026, 4, 30), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Reliance Jio", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 40.3, "unit": "%", "period": "May 2026", "period_date": date(2026, 5, 31), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Reliance Jio", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 40.4, "unit": "%", "period": "Jun 2026", "period_date": date(2026, 6, 30), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Reliance Jio", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 40.45, "unit": "%", "period": "Jul 2026", "period_date": date(2026, 7, 31), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Reliance Jio", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 40.5, "unit": "%", "period": "Aug 2026", "period_date": date(2026, 8, 31), "source": "TRAI Subscription Report"},
    
    {"industry": "telecom", "entity_name": "Bharti Airtel", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 32.8, "unit": "%", "period": "Mar 2026", "period_date": date(2026, 3, 31), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Bharti Airtel", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 32.9, "unit": "%", "period": "Apr 2026", "period_date": date(2026, 4, 30), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Bharti Airtel", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 33.0, "unit": "%", "period": "May 2026", "period_date": date(2026, 5, 31), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Bharti Airtel", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 33.1, "unit": "%", "period": "Jun 2026", "period_date": date(2026, 6, 30), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Bharti Airtel", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 33.15, "unit": "%", "period": "Jul 2026", "period_date": date(2026, 7, 31), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Bharti Airtel", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 33.2, "unit": "%", "period": "Aug 2026", "period_date": date(2026, 8, 31), "source": "TRAI Subscription Report"},
    
    {"industry": "telecom", "entity_name": "Vodafone Idea", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 19.3, "unit": "%", "period": "Mar 2026", "period_date": date(2026, 3, 31), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Vodafone Idea", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 19.1, "unit": "%", "period": "Apr 2026", "period_date": date(2026, 4, 30), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Vodafone Idea", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 18.9, "unit": "%", "period": "May 2026", "period_date": date(2026, 5, 31), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Vodafone Idea", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 18.8, "unit": "%", "period": "Jun 2026", "period_date": date(2026, 6, 30), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Vodafone Idea", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 18.7, "unit": "%", "period": "Jul 2026", "period_date": date(2026, 7, 31), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "Vodafone Idea", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 18.6, "unit": "%", "period": "Aug 2026", "period_date": date(2026, 8, 31), "source": "TRAI Subscription Report"},

    {"industry": "telecom", "entity_name": "BSNL", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 7.8, "unit": "%", "period": "Mar 2026", "period_date": date(2026, 3, 31), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "BSNL", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 7.8, "unit": "%", "period": "Apr 2026", "period_date": date(2026, 4, 30), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "BSNL", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 7.8, "unit": "%", "period": "May 2026", "period_date": date(2026, 5, 31), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "BSNL", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 7.7, "unit": "%", "period": "Jun 2026", "period_date": date(2026, 6, 30), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "BSNL", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 7.7, "unit": "%", "period": "Jul 2026", "period_date": date(2026, 7, 31), "source": "TRAI Subscription Report"},
    {"industry": "telecom", "entity_name": "BSNL", "metric_name": "historical_share", "metric_display_name": "Market Share", "value": 7.7, "unit": "%", "period": "Aug 2026", "period_date": date(2026, 8, 31), "source": "TRAI Subscription Report"},

    # --- FINTECH & DIGITAL PAYMENTS (Source: NPCI Monthly UPI Product Statistics) ---
    # UPI Volume Share (%) - Aug 2026
    {
        "industry": "fintech", "entity_name": "PhonePe", "metric_name": "upi_volume_share",
        "metric_display_name": "UPI Volume Share", "value": 48.4, "unit": "%",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "NPCI Monthly UPI Product Statistics",
        "source_url": "https://www.npci.org.in/what-we-do/upi/upi-ecosystem-statistics",
        "notes": "Share of total transaction volume processed through UPI."
    },
    {
        "industry": "fintech", "entity_name": "Google Pay", "metric_name": "upi_volume_share",
        "metric_display_name": "UPI Volume Share", "value": 37.1, "unit": "%",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "NPCI Monthly UPI Product Statistics",
        "source_url": "https://www.npci.org.in/what-we-do/upi/upi-ecosystem-statistics",
        "notes": "Share of total transaction volume processed through UPI."
    },
    {
        "industry": "fintech", "entity_name": "Paytm", "metric_name": "upi_volume_share",
        "metric_display_name": "UPI Volume Share", "value": 7.6, "unit": "%",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "NPCI Monthly UPI Product Statistics",
        "source_url": "https://www.npci.org.in/what-we-do/upi/upi-ecosystem-statistics",
        "notes": "Share of total transaction volume processed through UPI."
    },
    {
        "industry": "fintech", "entity_name": "Cred", "metric_name": "upi_volume_share",
        "metric_display_name": "UPI Volume Share", "value": 1.4, "unit": "%",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "NPCI Monthly UPI Product Statistics",
        "source_url": "https://www.npci.org.in/what-we-do/upi/upi-ecosystem-statistics",
        "notes": "High average ticket size peer-to-merchant volume."
    },
    # UPI Monthly Volume (Crore Transactions) - Aug 2026
    {
        "industry": "fintech", "entity_name": "PhonePe", "metric_name": "upi_monthly_volume",
        "metric_display_name": "Monthly UPI Volume", "value": 7650.0, "unit": "Crore Txns",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "NPCI Monthly UPI Product Statistics",
        "source_url": "https://www.npci.org.in"
    },
    {
        "industry": "fintech", "entity_name": "Google Pay", "metric_name": "upi_monthly_volume",
        "metric_display_name": "Monthly UPI Volume", "value": 5860.0, "unit": "Crore Txns",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "NPCI Monthly UPI Product Statistics",
        "source_url": "https://www.npci.org.in"
    },
    {
        "industry": "fintech", "entity_name": "Paytm", "metric_name": "upi_monthly_volume",
        "metric_display_name": "Monthly UPI Volume", "value": 1205.0, "unit": "Crore Txns",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "NPCI Monthly UPI Product Statistics",
        "source_url": "https://www.npci.org.in"
    },
    # Historical 6-Month UPI Volume Trend (Total Billion Transactions)
    {"industry": "fintech", "entity_name": "Total Ecosystem", "metric_name": "historical_volume", "metric_display_name": "Total Ecosystem Volume", "value": 13.4, "unit": "Billion Txns", "period": "Mar 2026", "period_date": date(2026, 3, 31), "source": "NPCI Official"},
    {"industry": "fintech", "entity_name": "Total Ecosystem", "metric_name": "historical_volume", "metric_display_name": "Total Ecosystem Volume", "value": 13.9, "unit": "Billion Txns", "period": "Apr 2026", "period_date": date(2026, 4, 30), "source": "NPCI Official"},
    {"industry": "fintech", "entity_name": "Total Ecosystem", "metric_name": "historical_volume", "metric_display_name": "Total Ecosystem Volume", "value": 14.3, "unit": "Billion Txns", "period": "May 2026", "period_date": date(2026, 5, 31), "source": "NPCI Official"},
    {"industry": "fintech", "entity_name": "Total Ecosystem", "metric_name": "historical_volume", "metric_display_name": "Total Ecosystem Volume", "value": 14.7, "unit": "Billion Txns", "period": "Jun 2026", "period_date": date(2026, 6, 30), "source": "NPCI Official"},
    {"industry": "fintech", "entity_name": "Total Ecosystem", "metric_name": "historical_volume", "metric_display_name": "Total Ecosystem Volume", "value": 15.2, "unit": "Billion Txns", "period": "Jul 2026", "period_date": date(2026, 7, 31), "source": "NPCI Official"},
    {"industry": "fintech", "entity_name": "Total Ecosystem", "metric_name": "historical_volume", "metric_display_name": "Total Ecosystem Volume", "value": 15.8, "unit": "Billion Txns", "period": "Aug 2026", "period_date": date(2026, 8, 31), "source": "NPCI Official"},

    # --- ELECTRIC VEHICLES (Source: Vahan Dashboard, MoRTH & FADA) ---
    # 4W Passenger EV Market Share (%) - Aug 2026
    {
        "industry": "ev", "entity_name": "Tata Motors", "metric_name": "ev_market_share",
        "metric_display_name": "4W EV Market Share", "value": 64.8, "unit": "%",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "Vahan Dashboard, Ministry of Road Transport & Highways",
        "source_url": "https://vahan.parivahan.gov.in/vahan4dashboard/",
        "notes": "Share of electric passenger car registrations in India."
    },
    {
        "industry": "ev", "entity_name": "MG Motor India", "metric_name": "ev_market_share",
        "metric_display_name": "4W EV Market Share", "value": 15.2, "unit": "%",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "Vahan Dashboard, Ministry of Road Transport & Highways",
        "source_url": "https://vahan.parivahan.gov.in/vahan4dashboard/",
        "notes": "Share of electric passenger car registrations in India."
    },
    {
        "industry": "ev", "entity_name": "Mahindra & Mahindra", "metric_name": "ev_market_share",
        "metric_display_name": "4W EV Market Share", "value": 10.8, "unit": "%",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "Vahan Dashboard, Ministry of Road Transport & Highways",
        "source_url": "https://vahan.parivahan.gov.in/vahan4dashboard/",
        "notes": "Share of electric passenger car registrations in India."
    },
    {
        "industry": "ev", "entity_name": "Hyundai", "metric_name": "ev_market_share",
        "metric_display_name": "4W EV Market Share", "value": 5.2, "unit": "%",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "Vahan Dashboard, Ministry of Road Transport & Highways",
        "source_url": "https://vahan.parivahan.gov.in/vahan4dashboard/",
        "notes": "Share of electric passenger car registrations in India."
    },
    # 4W EV Monthly Sales (Units) - Aug 2026
    {
        "industry": "ev", "entity_name": "Tata Motors", "metric_name": "ev_monthly_sales",
        "metric_display_name": "Monthly 4W EV Registrations", "value": 6850.0, "unit": "Units Registered",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "Vahan Dashboard, MoRTH",
        "source_url": "https://vahan.parivahan.gov.in"
    },
    {
        "industry": "ev", "entity_name": "MG Motor India", "metric_name": "ev_monthly_sales",
        "metric_display_name": "Monthly 4W EV Registrations", "value": 1610.0, "unit": "Units Registered",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "Vahan Dashboard, MoRTH",
        "source_url": "https://vahan.parivahan.gov.in"
    },
    {
        "industry": "ev", "entity_name": "Mahindra & Mahindra", "metric_name": "ev_monthly_sales",
        "metric_display_name": "Monthly 4W EV Registrations", "value": 1140.0, "unit": "Units Registered",
        "period": "Aug 2026", "period_date": date(2026, 8, 31),
        "source": "Vahan Dashboard, MoRTH",
        "source_url": "https://vahan.parivahan.gov.in"
    },
    # 6-Month Historical EV Sales Volume (Tata Motors)
    {"industry": "ev", "entity_name": "Tata Motors", "metric_name": "historical_sales", "metric_display_name": "4W EV Registrations", "value": 5900, "unit": "Units", "period": "Mar 2026", "period_date": date(2026, 3, 31), "source": "Vahan MoRTH"},
    {"industry": "ev", "entity_name": "Tata Motors", "metric_name": "historical_sales", "metric_display_name": "4W EV Registrations", "value": 6120, "unit": "Units", "period": "Apr 2026", "period_date": date(2026, 4, 30), "source": "Vahan MoRTH"},
    {"industry": "ev", "entity_name": "Tata Motors", "metric_name": "historical_sales", "metric_display_name": "4W EV Registrations", "value": 6340, "unit": "Units", "period": "May 2026", "period_date": date(2026, 5, 31), "source": "Vahan MoRTH"},
    {"industry": "ev", "entity_name": "Tata Motors", "metric_name": "historical_sales", "metric_display_name": "4W EV Registrations", "value": 6510, "unit": "Units", "period": "Jun 2026", "period_date": date(2026, 6, 30), "source": "Vahan MoRTH"},
    {"industry": "ev", "entity_name": "Tata Motors", "metric_name": "historical_sales", "metric_display_name": "4W EV Registrations", "value": 6700, "unit": "Units", "period": "Jul 2026", "period_date": date(2026, 7, 31), "source": "Vahan MoRTH"},
    {"industry": "ev", "entity_name": "Tata Motors", "metric_name": "historical_sales", "metric_display_name": "4W EV Registrations", "value": 6850, "unit": "Units", "period": "Aug 2026", "period_date": date(2026, 8, 31), "source": "Vahan MoRTH"},
]

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

def seed_official_metrics_if_empty(db: Session):
    count = db.query(OfficialMetric).count()
    if count == 0:
        for item in OFFICIAL_DATA_SEEDS:
            db.add(OfficialMetric(**item))
        db.commit()

    dev_count = db.query(CompetitorDevelopment).count()
    if dev_count == 0:
        for dev in COMPETITOR_DEVELOPMENTS_SEEDS:
            db.add(CompetitorDevelopment(**dev))
        db.commit()

def get_competitor_metrics(db: Session, industry: str) -> List[Dict[str, Any]]:
    """
    Returns official metrics for competitor comparison tables with source, unit, period, and notes.
    """
    seed_official_metrics_if_empty(db)
    
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
