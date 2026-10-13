import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Building2, 
  ExternalLink, 
  Search, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  TrendingUp, 
  Users, 
  BarChart2, 
  Bot, 
  FileSpreadsheet, 
  ShieldAlert, 
  Globe2, 
  Layers, 
  Sparkles,
  ArrowUpRight,
  Share2
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { MarketLeadersTab } from '../components/MarketLeadersTab';
import { CompetitorTrackerTab } from '../components/CompetitorTrackerTab';
import { 
  fetchIndustryOverview, 
  fetchNewsArticles, 
  fetchIndustryCompanies, 
  triggerManualRefresh,
  fetchSourceHealth,
  fetchSchedulerStatus
} from '../services/api';
import { Article, IndustryOverview, SourceHealthItem, SchedulerStatus } from '../types';

export const DashboardPage: React.FC = () => {
  const { slug = 'telecom' } = useParams<{ slug: string }>();

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('news');

  // Overview and Meta Data
  const [overview, setOverview] = useState<IndustryOverview | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);

  // News and Filter States
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedImpact, setSelectedImpact] = useState<string>('');

  // Source Health & Scheduler State (Milestone 2)
  const [sourcesHealth, setSourcesHealth] = useState<SourceHealthItem[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      const [ovData, compList, healthData, schedData] = await Promise.all([
        fetchIndustryOverview(slug),
        fetchIndustryCompanies(slug),
        fetchSourceHealth(slug),
        fetchSchedulerStatus()
      ]);
      setOverview(ovData);
      setCompanies(compList);
      setSourcesHealth(healthData);
      setSchedulerStatus(schedData);
    } catch (err) {
      console.error("Error loading overview / health:", err);
    }
  }, [slug]);

  const loadArticles = useCallback(async () => {
    try {
      setLoadingNews(true);
      const data = await fetchNewsArticles({
        industry: slug,
        company: selectedCompany || undefined,
        topic: selectedTopic || undefined,
        search: searchQuery || undefined,
        impact: selectedImpact || undefined,
        limit: 50
      });
      setArticles(data);
    } catch (err) {
      console.error("Error loading news articles:", err);
    } finally {
      setLoadingNews(false);
    }
  }, [slug, selectedCompany, selectedTopic, searchQuery, selectedImpact]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Frontend Auto-Refresh (Polling every 30 seconds when enabled)
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      loadData();
      loadArticles();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, loadData, loadArticles]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await triggerManualRefresh(slug);
      await Promise.all([loadData(), loadArticles()]);
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Distinct topics for filter dropdown
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    articles.forEach(a => (a.topics || []).forEach(t => set.add(t)));
    return Array.from(set);
  }, [articles]);

  const failingSources = sourcesHealth.filter(s => s.status === 'failing' || s.is_stale);

  // Compute next check time from scheduler jobs or source health
  const nextCheckTimestamp = useMemo(() => {
    if (sourcesHealth.length > 0) {
      const valid = sourcesHealth.map(s => s.next_check_at).filter(Boolean);
      if (valid.length > 0) return valid[0];
    }
    if (schedulerStatus?.jobs?.length) {
      return schedulerStatus.jobs[0].next_run_time;
    }
    return null;
  }, [sourcesHealth, schedulerStatus]);

  const formatDateTime = (timestamp: string | null) => {
    if (!timestamp) return 'N/A';
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + 
        ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timestamp;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Industry Overview', icon: <Layers className="w-4 h-4" /> },
    { id: 'news', label: 'Live Industry News', icon: <Radio className="w-4 h-4" /> },
    { id: 'market-leaders', label: 'Market Leaders', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'competitor-tracker', label: 'Competitor Tracker', icon: <Users className="w-4 h-4" /> },
    { id: 'ai-analyst', label: 'AI Business Analyst', icon: <Bot className="w-4 h-4" />, badge: 'Milestone 3' },
    { id: 'churn', label: 'Customer Churn', icon: <ShieldAlert className="w-4 h-4" />, badge: 'Milestone 3' },
    ...(slug === 'telecom' ? [{ id: 'starlink', label: 'Starlink Case Study', icon: <Globe2 className="w-4 h-4" />, badge: 'Milestone 4' }] : []),
    { id: 'recommendations', label: 'AI Recommendations', icon: <Sparkles className="w-4 h-4" />, badge: 'Milestone 3' },
    { id: 'reports', label: 'Reports & Exports', icon: <FileSpreadsheet className="w-4 h-4" />, badge: 'Milestone 4' },
  ];

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      
      {/* Persistent Navigation with All 4 Timestamps & Auto-Refresh */}
      <Navbar
        currentIndustry={slug}
        industryName={overview?.name}
        lastSyncTime={overview?.last_sync_time}
        nextCheckTime={nextCheckTimestamp}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
        hasStaleSource={failingSources.length > 0}
      />

      {/* Sub-header / Industry Banner */}
      <div className="bg-navy-900/40 border-b border-navy-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {overview?.name || slug.toUpperCase()} Intelligence
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-blue/15 text-accent-blue border border-accent-blue/30 font-semibold">
                {overview?.badge || 'Live Radar'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {overview?.description}
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center space-x-3 bg-navy-950/80 px-4 py-2.5 rounded-xl border border-navy-800 text-xs text-slate-300">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Articles</span>
              <span className="text-base font-extrabold text-white font-mono">{overview?.total_articles ?? 0}</span>
            </div>
            <div className="h-7 w-px bg-navy-800" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tracked Entities</span>
              <span className="text-base font-extrabold text-accent-blue font-mono">{companies.length}</span>
            </div>
            <div className="h-7 w-px bg-navy-800" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheduler Engine</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                APScheduler Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stale Source & Degradation Warning Banner (Milestone 2) */}
      {failingSources.length > 0 && (
        <div className="bg-amber-950/40 border-b border-amber-800/60 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Source Notice:</strong> One or more feeds ({failingSources.map(s => s.source_name).join(', ')}) reported connection issues. 
                <strong className="text-white ml-1">Retaining and displaying last-known-good verified data.</strong>
              </span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono hidden md:inline">
              Scheduler will retry with exponential backoff
            </span>
          </div>
        </div>
      )}

      {/* Horizontal Tabs Navigation */}
      <div className="bg-navy-950 border-b border-navy-800/80 sticky top-16 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-navy-800 text-slate-400 border border-navy-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* ================= TAB 1: LIVE INDUSTRY NEWS ================= */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search headlines, summaries or sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-accent-blue transition-colors text-xs"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Company filter */}
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-slate-200 focus:outline-none focus:border-accent-blue text-xs"
                >
                  <option value="">All Companies</option>
                  {companies.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Topic filter */}
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-slate-200 focus:outline-none focus:border-accent-blue text-xs"
                >
                  <option value="">All Topics</option>
                  {availableTopics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                {/* Impact filter */}
                <select
                  value={selectedImpact}
                  onChange={(e) => setSelectedImpact(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-slate-200 focus:outline-none focus:border-accent-blue text-xs"
                >
                  <option value="">All Impact Levels</option>
                  <option value="high">High Business Impact</option>
                  <option value="medium">Medium Impact</option>
                  <option value="low">Standard Feed</option>
                </select>

                {(searchQuery || selectedCompany || selectedTopic || selectedImpact) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCompany('');
                      setSelectedTopic('');
                      setSelectedImpact('');
                    }}
                    className="px-2.5 py-2 text-slate-400 hover:text-white underline text-xs"
                  >
                    Reset
                  </button>
                )}

              </div>

            </div>

            {/* Articles Stream */}
            {loadingNews ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="p-5 rounded-xl bg-navy-900/40 border border-navy-800 animate-pulse h-32" />
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-navy-900/30 border border-navy-800/60">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No articles found matching filters</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
                  No verified items match the current search or filters. Click below to reset or run a live sync.
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-lg bg-accent-blue hover:bg-blue-600 text-white text-xs font-semibold"
                >
                  Trigger Fresh Sync
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => {
                  const impactColor = 
                    article.business_impact === 'high' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                    article.business_impact === 'medium' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                    'bg-slate-700/30 text-slate-300 border-slate-700';

                  const sentimentColor =
                    article.sentiment === 'positive' ? 'text-emerald-400' :
                    article.sentiment === 'negative' ? 'text-rose-400' : 'text-slate-400';

                  const clusterCount = article.cluster_sources ? article.cluster_sources.length : 1;

                  return (
                    <article
                      key={article.id}
                      className="p-5 rounded-xl bg-navy-900/70 border border-navy-800/80 hover:border-navy-700 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="flex-1 space-y-2">
                        
                        {/* Tags & Metadata header */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="font-semibold text-accent-blue px-2 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/20">
                            {article.source}
                          </span>

                          <span className={`px-2 py-0.5 rounded border uppercase font-bold text-[10px] ${impactColor}`}>
                            {article.business_impact} Impact
                          </span>

                          <span className="text-slate-400">•</span>

                          <span className={`font-semibold capitalize ${sentimentColor}`}>
                            {article.sentiment} Sentiment
                          </span>

                          <span className="text-slate-400">•</span>

                          <span className="text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            {article.verification_status}
                          </span>

                          {/* Multi-source Event Clustering Badge (Milestone 2) */}
                          {clusterCount > 1 && (
                            <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-semibold flex items-center gap-1">
                              <Share2 className="w-3 h-3" />
                              Clustered Event ({clusterCount} Sources)
                            </span>
                          )}
                        </div>

                        {/* Title with link */}
                        <h2 className="text-base sm:text-lg font-bold text-white hover:text-accent-blue transition-colors leading-snug">
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1.5 group">
                            <span>{article.title}</span>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-accent-blue transition-transform flex-shrink-0 mt-1" />
                          </a>
                        </h2>

                        {/* Summary */}
                        {article.summary && (
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                            {article.summary}
                          </p>
                        )}

                        {/* Clustered Secondary Sources Links if merged */}
                        {article.cluster_sources && article.cluster_sources.length > 1 && (
                          <div className="p-2.5 rounded-lg bg-navy-950/70 border border-navy-800 text-[11px] text-slate-400">
                            <span className="text-slate-300 font-semibold mr-1.5">Additional Source Reports:</span>
                            {article.cluster_sources.slice(1).map((s, idx) => (
                              <a
                                key={idx}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent-blue hover:underline inline-flex items-center gap-1 mr-3"
                              >
                                <span>{s.source}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Tagged Companies & Topics */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2">
                          {(article.companies || []).map((comp) => (
                            <span key={comp} className="px-2 py-0.5 rounded text-[10px] font-medium bg-navy-800 text-slate-200 border border-navy-700">
                              🏢 {comp}
                            </span>
                          ))}
                          {(article.topics || []).map((top) => (
                            <span key={top} className="px-2 py-0.5 rounded text-[10px] font-medium bg-navy-950 text-slate-400 border border-navy-800">
                              #{top}
                            </span>
                          ))}
                        </div>

                      </div>

                      {/* Right Timestamp Box with All Separate Timestamps */}
                      <div className="md:w-56 p-3 rounded-lg bg-navy-950/80 border border-navy-800/80 flex flex-col justify-between text-[11px] text-slate-400 space-y-2 flex-shrink-0">
                        <div>
                          <div className="flex items-center space-x-1 text-slate-400 mb-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>Published Time:</span>
                          </div>
                          <div className="font-mono text-slate-200 font-medium">
                            {formatDateTime(article.published_at)}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-navy-800">
                          <div className="flex items-center space-x-1 text-slate-400 mb-0.5">
                            <Clock className="w-3 h-3" />
                            <span>Retrieved By App:</span>
                          </div>
                          <div className="font-mono text-slate-300">
                            {formatDateTime(article.retrieved_at)}
                          </div>
                        </div>

                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center justify-center space-x-1.5 py-1 px-2.5 rounded bg-navy-800 hover:bg-navy-700 text-accent-blue text-[11px] font-semibold transition-colors"
                        >
                          <span>Original Article</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                    </article>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 2: MARKET LEADERS (ACTIVE MILESTONE 2) ================= */}
        {activeTab === 'market-leaders' && (
          <MarketLeadersTab
            industrySlug={slug}
            trackedCompanies={companies}
          />
        )}

        {/* ================= TAB 3: COMPETITOR TRACKER & WATCHLIST (ACTIVE MILESTONE 2) ================= */}
        {activeTab === 'competitor-tracker' && (
          <CompetitorTrackerTab
            industrySlug={slug}
            allCompanies={companies}
          />
        )}

        {/* ================= TAB 4: INDUSTRY OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-accent-blue" />
                  Tracked Sector Entities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {companies.map((c) => (
                    <span key={c} className="px-2.5 py-1 rounded-md bg-navy-950 border border-navy-800 text-xs text-slate-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  Ingestion Health & Source Auditing
                </h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between pb-2 border-b border-navy-800">
                    <span className="text-slate-400">Total Ingested Articles:</span>
                    <span className="font-mono font-bold text-white">{overview?.total_articles ?? 0}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-navy-800">
                    <span className="text-slate-400">Last Verified Sync:</span>
                    <span className="font-mono text-slate-200">{formatDateTime(overview?.last_sync_time || null)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Next Scheduled Check:</span>
                    <span className="font-mono text-accent-blue">{formatDateTime(nextCheckTimestamp)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-accent-violet" />
                  Business Intelligence Directives
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  This intelligence dashboard extracts competitive signals, regulatory shifts, and pricing models directly from authorized RSS and official portal sources.
                </p>
                <button
                  onClick={() => setActiveTab('market-leaders')}
                  className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-accent-blue text-xs font-semibold"
                >
                  View Market Leaders & Benchmarks →
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================= SHELLS FOR FUTURE MILESTONES (M3, M4) ================= */}
        {['ai-analyst', 'churn', 'starlink', 'recommendations', 'reports'].includes(activeTab) && (
          <div className="p-10 rounded-2xl bg-navy-900/40 border border-navy-800 text-center max-w-2xl mx-auto my-12">
            <div className="w-12 h-12 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mx-auto mb-4 border border-accent-blue/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="inline-block px-3 py-1 rounded-full bg-navy-800 text-accent-blue border border-navy-700 text-xs font-semibold mb-4">
              Scheduled for {tabs.find(t => t.id === activeTab)?.badge || 'Upcoming Milestone'}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              This module will be activated in the next milestone according to the master plan. The underlying database schema and architecture have been primed to connect seamlessly.
            </p>
            <button
              onClick={() => setActiveTab('news')}
              className="px-4 py-2 rounded-lg bg-accent-blue hover:bg-blue-600 text-white text-xs font-semibold"
            >
              Return to Live News Radar
            </button>
          </div>
        )}

      </main>

    </div>
  );
};
