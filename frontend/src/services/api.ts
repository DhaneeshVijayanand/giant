import { Article, IndustryCard, IndustryOverview, RefreshResponse } from '../types';

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
