import { 
  Article, 
  IndustryCard, 
  IndustryOverview, 
  RefreshResponse,
  SourceHealthItem,
  SchedulerStatus,
  CompetitorMetric,
  CompetitorDevelopment,
  WatchlistItem,
  AIChatMessage,
  AIRecommendation,
  ChurnDatasetMetadata,
  ChurnEvaluationResult,
  StarlinkTopic,
  StarlinkScenario,
  StarlinkTracker,
  StarlinkEvidenceFeed,
  IndustryReport
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function fetchIndustryCards(): Promise<IndustryCard[]> {
  const res = await fetch(`${API_BASE}/industries`);
  if (!res.ok) {
    throw new Error(`Failed to load industries (status: ${res.status})`);
  }
  return res.json();
}

export async function fetchIndustryOverview(slug: string): Promise<IndustryOverview> {
  const res = await fetch(`${API_BASE}/industries/${slug}`);
  if (!res.ok) {
    throw new Error(`Failed to load industry details for ${slug} (status: ${res.status})`);
  }
  return res.json();
}

export async function fetchIndustryCompanies(slug: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/industries/${slug}/companies`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export interface NewsFilterParams {
  industry?: string;
  company?: string;
  topic?: string;
  search?: string;
  impact?: string;
  limit?: number;
  offset?: number;
}

export async function fetchNewsArticles(params: NewsFilterParams): Promise<Article[]> {
  const query = new URLSearchParams();
  if (params.industry) query.append('industry', params.industry);
  if (params.company) query.append('company', params.company);
  if (params.topic) query.append('topic', params.topic);
  if (params.search) query.append('search', params.search);
  if (params.impact) query.append('impact', params.impact);
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.offset) query.append('offset', params.offset.toString());

  const res = await fetch(`${API_BASE}/news?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch articles (status: ${res.status})`);
  }
  return res.json();
}

export async function triggerManualRefresh(industry?: string): Promise<RefreshResponse> {
  const url = industry 
    ? `${API_BASE}/news/refresh?industry=${encodeURIComponent(industry)}` 
    : `${API_BASE}/news/refresh`;

  const res = await fetch(url, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error(`Failed to refresh feeds (status: ${res.status})`);
  }
  return res.json();
}

export async function fetchSourceHealth(industry?: string): Promise<SourceHealthItem[]> {
  const url = industry 
    ? `${API_BASE}/scheduler/sources/health?industry=${encodeURIComponent(industry)}` 
    : `${API_BASE}/scheduler/sources/health`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchSchedulerStatus(): Promise<SchedulerStatus | null> {
  try {
    const res = await fetch(`${API_BASE}/scheduler/status`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchCompetitorMetrics(industry: string): Promise<CompetitorMetric[]> {
  const res = await fetch(`${API_BASE}/competitors/metrics?industry=${encodeURIComponent(industry)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch competitor metrics for ${industry}`);
  }
  return res.json();
}

export async function fetchCompetitorDevelopments(industry: string, company?: string): Promise<CompetitorDevelopment[]> {
  const url = company 
    ? `${API_BASE}/competitors/developments?industry=${encodeURIComponent(industry)}&company=${encodeURIComponent(company)}`
    : `${API_BASE}/competitors/developments?industry=${encodeURIComponent(industry)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch developments for ${industry}`);
  }
  return res.json();
}

export async function fetchWatchlist(industry?: string): Promise<WatchlistItem[]> {
  const url = industry 
    ? `${API_BASE}/competitors/watchlist?industry=${encodeURIComponent(industry)}` 
    : `${API_BASE}/competitors/watchlist`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function addToWatchlist(company_name: string, industry: string, notes?: string): Promise<WatchlistItem> {
  const res = await fetch(`${API_BASE}/competitors/watchlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company_name, industry, notes })
  });
  if (!res.ok) {
    throw new Error('Failed to add company to watchlist');
  }
  return res.json();
}

export async function removeFromWatchlist(itemId: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/competitors/watchlist/${itemId}`, {
    method: 'DELETE'
  });
  return res.ok;
}

// ================= MILESTONE 3: AI ANALYST & RECOMMENDATIONS =================

export async function sendAIChat(query: string, industry: string): Promise<AIChatMessage> {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, industry })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to communicate with AI Business Analyst');
  }
  return res.json();
}

export async function fetchAIRecommendations(industry: string, regenerate: boolean = false): Promise<AIRecommendation[]> {
  const res = await fetch(`${API_BASE}/ai/recommendations?industry=${encodeURIComponent(industry)}&regenerate=${regenerate}`);
  if (!res.ok) {
    throw new Error('Failed to fetch AI business recommendations');
  }
  return res.json();
}

export async function fetchAISpendStatus(): Promise<{ allowed: boolean; current_spend_usd: number; spend_cap_usd: number; spend_cap_exceeded: boolean }> {
  const res = await fetch(`${API_BASE}/ai/spend`);
  if (!res.ok) return { allowed: true, current_spend_usd: 0, spend_cap_usd: 10, spend_cap_exceeded: false };
  return res.json();
}

// ================= MILESTONE 3: CUSTOMER CHURN INTELLIGENCE =================

export interface ChurnDatasetResponse {
  metadata: ChurnDatasetMetadata;
  quality_summary: any;
  preview: any[];
  evaluation: ChurnEvaluationResult;
}

export async function loadChurnDemoDataset(): Promise<ChurnDatasetResponse> {
  const res = await fetch(`${API_BASE}/churn/load-demo`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to load IBM Telco demonstration dataset');
  }
  return res.json();
}

export async function uploadChurnDataset(file: File, targetColumn: string = 'Churn'): Promise<ChurnDatasetResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_column', targetColumn);

  const res = await fetch(`${API_BASE}/churn/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload and validate CSV dataset');
  }
  return res.json();
}

export async function fetchChurnStatus(): Promise<{ is_active: boolean; metadata?: ChurnDatasetMetadata; evaluation?: ChurnEvaluationResult }> {
  const res = await fetch(`${API_BASE}/churn/status`);
  if (!res.ok) return { is_active: false };
  return res.json();
}

export async function deleteChurnDataset(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/churn/dataset`, {
    method: 'DELETE'
  });
  return res.ok;
}

// ================= MILESTONE 4: STARLINK CASE STUDY =================

export async function fetchStarlinkCaseStudy(): Promise<{
  title: string;
  industry: string;
  total_topics: number;
  topics: StarlinkTopic[];
  disclaimer: string;
}> {
  const res = await fetch(`${API_BASE}/starlink/case-study`);
  if (!res.ok) throw new Error('Failed to fetch Starlink case study topics');
  return res.json();
}

export async function fetchStarlinkScenarios(): Promise<{
  scenarios: StarlinkScenario[];
  tracker: StarlinkTracker;
}> {
  const res = await fetch(`${API_BASE}/starlink/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch Starlink scenario models');
  return res.json();
}

export async function fetchStarlinkEvidence(limit: number = 20): Promise<StarlinkEvidenceFeed> {
  const res = await fetch(`${API_BASE}/starlink/evidence?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch live Starlink evidence articles');
  return res.json();
}

// ================= MILESTONE 4: REPORTS AND EXPORTS =================

export async function fetchIndustryReport(
  industry: string = 'telecom',
  startDate?: string,
  endDate?: string,
  company?: string
): Promise<IndustryReport> {
  const params = new URLSearchParams({ industry });
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (company) params.append('company', company);

  const res = await fetch(`${API_BASE}/reports/generate?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to generate industry intelligence report');
  return res.json();
}

export function getReportCsvExportUrl(
  industry: string = 'telecom',
  startDate?: string,
  endDate?: string,
  company?: string
): string {
  const params = new URLSearchParams({ industry });
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (company) params.append('company', company);
  return `${API_BASE}/reports/export/csv?${params.toString()}`;
}

export function getReportPdfExportUrl(
  industry: string = 'telecom',
  startDate?: string,
  endDate?: string,
  company?: string
): string {
  const params = new URLSearchParams({ industry });
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (company) params.append('company', company);
  return `${API_BASE}/reports/export/pdf?${params.toString()}`;
}
