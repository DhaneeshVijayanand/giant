export interface Article {
  id: number;
  guid: string;
  title: string;
  summary: string | null;
  source: string;
  url: string;
  canonical_url?: string;
  published_at: string;
  retrieved_at: string;
  industry: 'telecom' | 'fintech' | 'ev';
  companies: string[];
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  business_impact: 'high' | 'medium' | 'low';
  verification_status: string;
  cluster_id?: string;
  cluster_sources?: Array<{
    source: string;
    url: string;
    published_at: string;
  }>;
}

export interface IndustryCard {
  slug: 'telecom' | 'fintech' | 'ev';
  name: string;
  badge: string;
  description: string;
  tracked_companies_count: number;
  total_articles_count: number;
  new_articles_count_24h: number;
  latest_headline: string | null;
  latest_source: string | null;
  latest_published_at: string | null;
  last_sync_time: string | null;
  sync_status: 'healthy' | 'stale' | 'empty';
}

export interface IndustryOverview {
  slug: string;
  name: string;
  badge: string;
  description: string;
  tracked_companies: string[];
  total_articles: number;
  last_sync_time: string | null;
  latest_retrieved_at: string | null;
  latest_published_at: string | null;
  data_freshness_status: 'real' | 'empty' | 'stale';
}

export interface RefreshResponse {
  status: string;
  synced_at: string;
  articles_fetched: number;
  articles_added: number;
  duplicates_merged?: number;
  industries: string[];
  errors: string[];
}

export interface SourceHealthItem {
  source_name: string;
  industry: string;
  url: string;
  status: 'healthy' | 'failing' | 'stale';
  consecutive_failures: number;
  last_attempt_at: string | null;
  last_success_at: string | null;
  next_check_at: string | null;
  last_error: string | null;
  is_stale: boolean;
}

export interface SchedulerStatus {
  running: boolean;
  active_jobs_count: number;
  breaking_news_interval_minutes: number;
  general_news_interval_minutes: number;
  official_stats_interval_hours: number;
  jobs: Array<{
    id: string;
    name: string;
    next_run_time: string | null;
    trigger: string;
  }>;
}

export interface CompetitorMetric {
  id: number;
  industry: string;
  entity_name: string;
  metric_name: string;
  metric_display_name: string;
  value: number;
  unit: string;
  period: string;
  period_date: string;
  source: string;
  source_url?: string;
  last_updated_at: string;
  notes: string;
}

export interface WatchlistItem {
  id: number;
  company_name: string;
  industry: string;
  added_at: string;
  notes?: string;
}

export interface CompetitorDevelopment {
  id: number;
  company_name: string;
  industry: string;
  category: 'product_launch' | 'price_change' | 'partnership' | 'announcement' | 'regulatory' | 'risk_opportunity';
  headline: string;
  details: string;
  business_significance: string;
  source: string;
  source_url?: string;
  published_date: string;
}
