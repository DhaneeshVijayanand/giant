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

// Milestone 3 Types
export interface AIChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  query?: string;
  facts?: string;
  interpretation?: string;
  predictions?: string;
  actions?: string;
  sources?: Array<{
    title: string;
    source: string;
    url: string;
    published_at: string;
  }>;
  evidence_found?: boolean;
  spend_cap_exceeded?: boolean;
}

export interface AIRecommendation {
  id: number;
  industry: string;
  title: string;
  business_problem: string;
  supporting_evidence: string;
  suggested_action: string;
  expected_benefit: string;
  potential_risks: string;
  kpi_metric: string;
  confidence_level: string;
  correlation_vs_causation_note: string;
  sources: Array<{
    title: string;
    source: string;
    url: string;
  }>;
  suggested_review_date: string;
  created_at?: string;
}

export interface ChurnDatasetMetadata {
  id?: number;
  dataset_name: string;
  filename: string;
  total_rows: number;
  total_columns: number;
  columns_list: string[];
  target_column: string;
  is_demo: boolean;
  attribution?: string;
}

export interface ChurnModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
  };
}

export interface ChurnEvaluationResult {
  data_leakage_prevented_columns: string[];
  sample_size_evaluated: number;
  test_split_size: number;
  models: {
    baseline_logistic_regression: ChurnModelMetrics;
    random_forest: ChurnModelMetrics;
  };
  risk_distribution: {
    low_risk_count: number;
    low_risk_pct: number;
    medium_risk_count: number;
    medium_risk_pct: number;
    high_risk_count: number;
    high_risk_pct: number;
  };
  feature_drivers: Array<{
    feature: string;
    importance: number;
    percentage: number;
  }>;
  segment_comparisons: Array<{
    segment_name: string;
    categories: Array<{
      name: string;
      churn_rate_pct: number;
    }>;
  }>;
  suggested_retention_actions: Array<{
    priority: string;
    action: string;
    rationale: string;
    expected_impact: string;
  }>;
  business_caveats: string[];
}

// Milestone 4 Types
export interface StarlinkTopic {
  id: string;
  title: string;
  status: string;
  has_evidence: boolean;
  is_assumption: boolean;
  official_source: string;
  source_date: string;
  source_url: string;
  last_updated: string;
  summary: string;
  category: string;
}

export interface StarlinkValidationKPI {
  kpi: string;
  condition: string;
  status: 'Supported' | 'Not yet supported' | 'Contradicted' | 'No data';
  evidence_note: string;
}

export interface StarlinkScenario {
  id: string;
  name: string;
  probability_label: string;
  narrative: string;
  assumptions: string[];
  winners: string[];
  losers: string[];
  segments_switching: string[];
  business_opportunities: string[];
  risks_to_incumbents: string[];
  strategic_recommendations: string[];
  validation_kpis: StarlinkValidationKPI[];
}

export interface StarlinkTracker {
  most_supported_scenario: string;
  confidence_reasoning: string;
  key_evidence_pillars: Array<{
    pillar: string;
    status: string;
  }>;
  disclaimer: string;
}

export interface StarlinkEvidenceFeed {
  total_matched: number;
  articles: Article[];
  last_checked_at: string;
  search_keywords_used: string[];
}

export interface IndustryReport {
  report_id: string;
  industry_slug: string;
  industry_name: string;
  regulator: string;
  scope: string;
  generated_at: string;
  date_range: {
    start: string;
    end: string;
  };
  filters_applied: {
    company: string;
    total_articles_analyzed: number;
  };
  executive_summary: {
    part_1_verified_facts: string[];
    part_2_evidence_interpretation: string;
    part_3_predictions_and_assumptions: string[];
    part_4_recommended_actions: string[];
    source_citation: string;
  };
  competitor_metrics: {
    source: string;
    unit: string;
    period: string;
    table: Array<{
      entity: string;
      metric: string;
      value: number;
      unit: string;
      period: string;
    }>;
  };
  churn_findings?: {
    metadata: ChurnDatasetMetadata;
    evaluation: ChurnEvaluationResult;
  } | null;
  recommendations: AIRecommendation[];
  key_news: Array<{
    id: number;
    title: string;
    source_name: string;
    url: string;
    published_at: string;
    impact_rating: string;
    topics: string[];
  }>;
}
