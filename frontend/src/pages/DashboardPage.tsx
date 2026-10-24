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
  ShieldAlert, 
  Layers, 
  ArrowUpRight,
  Share2
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { MarketLeadersTab } from '../components/MarketLeadersTab';
import { CompetitorTrackerTab } from '../components/CompetitorTrackerTab';
import { CustomerChurnTab } from '../components/CustomerChurnTab';
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

  // Source Health & Scheduler State
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

  const tabs: Array<{ id: string; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'overview', label: 'Industry Overview', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'news', label: 'Live Industry News', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'market-leaders', label: 'Market Leaders', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'competitor-tracker', label: 'Competitive Intelligence', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'churn', label: 'Customer Churn', icon: <ShieldAlert className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="relative min-h-screen flex flex-col pb-20 md:pb-10">
      
      {/* Floating Translucent Navigation Bar */}
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Industry Banner Card */}
        <div className="glass-raised rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(44,52,128,0.3)]">
                  {overview?.name || slug.toUpperCase()} Intelligence
                </h1>
                <span className="text-xs px-3 py-1 rounded-full bg-[#2C3480]/40 text-white border border-[#3B46A8]/50 shadow-[0_0_12px_rgba(44,52,128,0.25)] font-bold">
                  {overview?.badge || 'Live Radar'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {overview?.description}
              </p>
            </div>

            {/* Quick Metrics Strip */}
            <div className="flex items-center space-x-3.5 glass-base p-4 rounded-2xl text-xs self-start md:self-auto border border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Articles</span>
                <span className="text-base font-black text-white font-mono tabular-nums">{overview?.total_articles ?? 0}</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Tracked Entities</span>
                <span className="text-base font-black text-white font-mono tabular-nums">{companies.length}</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Scheduler Engine</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  APScheduler Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stale Source & Degradation Warning Banner */}
        {failingSources.length > 0 && (
          <div className="glass-raised border-amber-500/40 rounded-2xl px-5 py-3 text-xs text-amber-300 flex items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Source Notice:</strong> One or more feeds ({failingSources.map(s => s.source_name).join(', ')}) reported connection issues. 
                <strong className="text-white ml-1">Retaining and displaying last-known-good verified data.</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium hidden md:inline text-amber-300/80">
              Retrying with exponential backoff
            </span>
          </div>
        )}

        {/* iOS-Style Segmented Tab Bar (Desktop & Tablet) */}
        <div className="hidden md:flex p-1.5 rounded-full glass-raised overflow-x-auto gap-1 border border-white/10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C6BE8] ${
                  isActive
                    ? 'ios-btn-primary shadow-[0_0_18px_rgba(44,52,128,0.5)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 font-bold text-slate-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="space-y-6">
          
          {/* ================= TAB 1: LIVE INDUSTRY NEWS ================= */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              
              {/* Filter Glass Bar */}
              <div className="glass-raised rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs border border-white/10">
                
                {/* Search input with rounded pill feel */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search headlines, summaries or sources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full glass-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5C6BE8] transition-all text-xs border border-white/10"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Company filter */}
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="px-4 py-2.5 rounded-full bg-[#070914] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#5C6BE8] text-xs font-semibold cursor-pointer shadow-sm hover:border-white/40 transition-colors"
                  >
                    <option value="" className="bg-[#070914] text-white">All Companies</option>
                    {companies.map((c) => (
                      <option key={c} value={c} className="bg-[#070914] text-white">{c}</option>
                    ))}
                  </select>

                  {/* Topic filter */}
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="px-4 py-2.5 rounded-full bg-[#070914] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#5C6BE8] text-xs font-semibold cursor-pointer shadow-sm hover:border-white/40 transition-colors"
                  >
                    <option value="" className="bg-[#070914] text-white">All Topics</option>
                    {availableTopics.map((t) => (
                      <option key={t} value={t} className="bg-[#070914] text-white">{t}</option>
                    ))}
                  </select>

                  {/* Impact filter */}
                  <select
                    value={selectedImpact}
                    onChange={(e) => setSelectedImpact(e.target.value)}
                    className="px-4 py-2.5 rounded-full bg-[#070914] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#5C6BE8] text-xs font-semibold cursor-pointer shadow-sm hover:border-white/40 transition-colors"
                  >
                    <option value="" className="bg-[#070914] text-white">All Impact Levels</option>
                    <option value="high" className="bg-[#070914] text-white">High Business Impact</option>
                    <option value="medium" className="bg-[#070914] text-white">Medium Impact</option>
                    <option value="low" className="bg-[#070914] text-white">Standard Feed</option>
                  </select>

                  {(searchQuery || selectedCompany || selectedTopic || selectedImpact) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCompany('');
                        setSelectedTopic('');
                        setSelectedImpact('');
                      }}
                      className="px-3 py-2 rounded-full glass-pill text-white hover:text-white font-semibold text-xs border border-white/20"
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
                    <div key={n} className="p-6 rounded-3xl glass-raised animate-pulse h-36 border border-white/10" />
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <div className="p-12 text-center rounded-3xl glass-raised border border-white/10">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white mb-1">No articles found matching filters</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
                    No verified items match the current search or filters. Click below to reset or run a live sync.
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="ios-btn-primary px-5 py-2.5 text-xs font-semibold"
                  >
                    Trigger Fresh Sync
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => {
                    const impactStyle = 
                      article.business_impact === 'high' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                      article.business_impact === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'glass-base text-slate-300 border-white/10';

                    const sentimentColor =
                      article.sentiment === 'positive' ? 'text-emerald-400' :
                      article.sentiment === 'negative' ? 'text-rose-400' : 'text-slate-400';

                    const clusterCount = article.cluster_sources ? article.cluster_sources.length : 1;

                    return (
                      <article
                        key={article.id}
                        className="glass-raised rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row md:items-start justify-between gap-6 border border-white/10 hover:border-white/25 hover:shadow-[0_15px_30px_rgba(44,52,128,0.2)]"
                      >
                        <div className="flex-1 space-y-2.5">
                          
                          {/* Tags & Metadata header */}
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="font-bold text-white px-3 py-0.5 rounded-full bg-[#2C3480]/40 border border-[#3B46A8]/50 shadow-sm">
                              {article.source}
                            </span>

                            <span className={`px-2.5 py-0.5 rounded-full border uppercase font-bold text-[10px] ${impactStyle}`}>
                              {article.business_impact} Impact
                            </span>

                            <span className="text-slate-600">•</span>

                            <span className={`font-semibold capitalize ${sentimentColor}`}>
                              {article.sentiment} Sentiment
                            </span>

                            <span className="text-slate-600">•</span>

                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {article.verification_status}
                            </span>

                            {/* Multi-source Event Clustering Badge */}
                            {clusterCount > 1 && (
                              <span className="px-3 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1">
                                <Share2 className="w-3 h-3" />
                                Clustered Event ({clusterCount} Sources)
                              </span>
                            )}
                          </div>

                          {/* Title with link */}
                          <h2 className="text-base sm:text-lg font-bold text-white hover:text-[#5C6BE8] transition-colors leading-snug">
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1.5 group">
                              <span>{article.title}</span>
                              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#5C6BE8] transition-transform flex-shrink-0 mt-1" />
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
                            <div className="p-3 rounded-2xl glass-base text-[11px] text-slate-400 border border-white/10">
                              <span className="text-slate-200 font-bold mr-1.5">Additional Source Reports:</span>
                              {article.cluster_sources.slice(1).map((s, idx) => (
                                <a
                                  key={idx}
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#5C6BE8] hover:underline inline-flex items-center gap-1 mr-3"
                                >
                                  <span>{s.source}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Tagged Companies & Topics */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {(article.companies || []).map((comp) => (
                              <span key={comp} className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold glass-pill text-white border border-white/10">
                                🏢 {comp}
                              </span>
                            ))}
                            {(article.topics || []).map((top) => (
                              <span key={top} className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold glass-base text-slate-300 border border-white/10">
                                #{top}
                              </span>
                            ))}
                          </div>

                        </div>

                        {/* Right Timestamp Box with All Separate Timestamps */}
                        <div className="md:w-56 p-4 rounded-2xl glass-base flex flex-col justify-between text-[11px] text-slate-400 space-y-2.5 flex-shrink-0 border border-white/10">
                          <div>
                            <div className="flex items-center space-x-1.5 mb-0.5">
                              <Calendar className="w-3.5 h-3.5 text-[#5C6BE8]" />
                              <span className="font-semibold text-slate-300">Published Time:</span>
                            </div>
                            <div className="font-mono text-white font-bold tabular-nums">
                              {formatDateTime(article.published_at)}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/10">
                            <div className="flex items-center space-x-1.5 mb-0.5">
                              <Clock className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="font-semibold text-slate-300">Retrieved By App:</span>
                            </div>
                            <div className="font-mono text-slate-300 tabular-nums">
                              {formatDateTime(article.retrieved_at)}
                            </div>
                          </div>

                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-full bg-[#2C3480]/30 hover:bg-[#2C3480]/60 border border-[#3B46A8]/50 text-white text-[11px] font-bold transition-all shadow-sm"
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

          {/* ================= TAB 2: MARKET LEADERS ================= */}
          {activeTab === 'market-leaders' && (
            <MarketLeadersTab
              industrySlug={slug}
              trackedCompanies={companies}
            />
          )}

          {/* ================= TAB 3: COMPETITOR TRACKER & WATCHLIST ================= */}
          {activeTab === 'competitor-tracker' && (
            <CompetitorTrackerTab
              industrySlug={slug}
              allCompanies={companies}
            />
          )}

          {/* ================= TAB 4: INDUSTRY OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="p-6 sm:p-7 rounded-3xl glass-raised border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-3.5 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#5C6BE8]" />
                    Tracked Sector Entities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {companies.map((c) => (
                      <span key={c} className="px-3 py-1 rounded-full glass-base text-xs font-semibold text-white border border-white/10">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 sm:p-7 rounded-3xl glass-raised border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-3.5 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    Ingestion Health & Source Auditing
                  </h3>
                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="flex justify-between pb-2 border-b border-white/10">
                      <span>Total Ingested Articles:</span>
                      <span className="font-mono font-black text-white tabular-nums">{overview?.total_articles ?? 0}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-white/10">
                      <span>Last Verified Sync:</span>
                      <span className="font-mono text-slate-200 tabular-nums">{formatDateTime(overview?.last_sync_time || null)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Scheduled Check:</span>
                      <span className="font-mono text-[#5C6BE8] font-bold tabular-nums">{formatDateTime(nextCheckTimestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-7 rounded-3xl glass-raised border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-3.5 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-purple-400" />
                    Business Intelligence Directives
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    This intelligence dashboard extracts competitive signals, regulatory shifts, and pricing models directly from authorized RSS and official portal sources.
                  </p>
                  <button
                    onClick={() => setActiveTab('market-leaders')}
                    className="ios-btn-primary px-4 py-2 text-xs font-semibold"
                  >
                    View Market Leaders & Benchmarks →
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ================= TAB 5: CUSTOMER CHURN INTELLIGENCE ================= */}
          {activeTab === 'churn' && (
            <CustomerChurnTab />
          )}

        </div>

      </div>

      {/* ================= MOBILE BOTTOM TAB BAR ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-overlay px-1 py-1.5 flex items-center justify-around border-t border-white/10 shadow-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all ${
                isActive 
                  ? 'text-white font-bold scale-105 drop-shadow-[0_0_10px_rgba(92,107,232,0.8)]' 
                  : 'text-slate-400'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[55px]">
                {tab.id === 'competitor-tracker' ? 'Intel' : tab.id === 'market-leaders' ? 'Leaders' : tab.id === 'churn' ? 'Churn' : tab.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
};
