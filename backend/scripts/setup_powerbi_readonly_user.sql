-- =====================================================================
-- GIANT PLATFORM: POSTGRESQL READ-ONLY USER & VIEW SETUP FOR POWER BI
-- =====================================================================
-- Description:
-- Sets up a dedicated, read-only database user and reporting view for
-- Microsoft Power BI Desktop / Service data ingestion.
-- 
-- NON-NEGOTIABLE SECURITY COMPLIANCE:
-- 1. Excludes all customer-level data (churn records, user IDs).
-- 2. Excludes application secrets, tokens, API spend logs, and sync credentials.
-- 3. Grants SELECT strictly on the reporting view only.
-- =====================================================================

-- Step 1: Create Reporting View (Sanitized News Intelligence Layer)
CREATE OR REPLACE VIEW v_powerbi_news_reporting AS
SELECT 
    id AS article_id,
    title AS headline,
    source,
    url AS original_url,
    published_at AS publication_timestamp,
    retrieved_at AS retrieval_timestamp,
    industry,
    CASE 
        WHEN json_array_length(companies) > 0 THEN companies->>0 
        ELSE 'General Sector' 
    END AS company,
    CASE 
        WHEN json_array_length(topics) > 0 THEN topics->>0 
        ELSE 'Market Overview' 
    END AS topic,
    'India' AS country,
    sentiment,
    business_impact,
    verification_status
FROM articles
WHERE verification_status = 'verified' OR verification_status IS NULL;

-- Step 2: Create Dedicated Read-Only Role
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'giant_powerbi_reader') THEN
        CREATE ROLE giant_powerbi_reader WITH LOGIN PASSWORD 'CHANGE_THIS_TO_SECURE_PASSWORD';
    END IF;
END
$$;

-- Step 3: Grant Connect on Database
GRANT CONNECT ON DATABASE giant TO giant_powerbi_reader;

-- Step 4: Grant Schema Usage
GRANT USAGE ON SCHEMA public TO giant_powerbi_reader;

-- Step 5: Grant SELECT ONLY on the Sanitized Reporting View
GRANT SELECT ON v_powerbi_news_reporting TO giant_powerbi_reader;

-- Step 6: Revoke Access to Sensitive Tables (Security Enforcement)
REVOKE ALL ON TABLE churn_dataset_meta FROM giant_powerbi_reader;
REVOKE ALL ON TABLE ai_chat_logs FROM giant_powerbi_reader;
REVOKE ALL ON TABLE ai_spend_tracker FROM giant_powerbi_reader;
REVOKE ALL ON TABLE sync_logs FROM giant_powerbi_reader;
REVOKE ALL ON TABLE source_health FROM giant_powerbi_reader;

-- Verification Query (Run as giant_powerbi_reader):
-- SELECT article_id, headline, source, industry, company, sentiment FROM v_powerbi_news_reporting LIMIT 10;
