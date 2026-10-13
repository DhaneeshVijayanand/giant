import { 
  Article, 
  IndustryCard, 
  IndustryOverview, 
  RefreshResponse,
  SourceHealthItem,
  SchedulerStatus,
  CompetitorMetric,
  CompetitorDevelopment,
  WatchlistItem
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
