export interface Article {
  id: number;
  guid: string;
  title: string;
  summary: string | null;
  source: string;
  url: string;
  published_at: string;
  retrieved_at: string;
  industry: 'telecom' | 'fintech' | 'ev';
  companies: string[];
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  business_impact: 'high' | 'medium' | 'low';
  verification_status: string;
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
  industries: string[];
  errors: string[];
}
