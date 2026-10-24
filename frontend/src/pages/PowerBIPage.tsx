import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowLeft, 
  Settings, 
  ExternalLink, 
  TrendingUp, 
  PieChart as PieIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Download,
  ShieldCheck,
  Building2,
  Radio
} from 'lucide-react';
import * as pbi from 'powerbi-client';
import { Navbar } from '../components/Navbar';
import { 
  fetchIndustryOverview, 
  fetchNewsArticles, 
  triggerManualRefresh,
  fetchPowerBIEmbedConfig,
  refreshPowerBIEmbedToken,
  fetchPowerBIStatus,
  getPowerBIDataFeedUrl
} from '../services/api';
import { Article, IndustryOverview, PowerBIEmbedConfig, PowerBIStatus } from '../types';

export const PowerBIPage: React.FC = () => {
  const { slug = 'telecom' } = useParams<{ slug: string }>();
  const [overview, setOverview] = useState<IndustryOverview | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Power BI Integration States
  const [embedConfig, setEmbedConfig] = useState<PowerBIEmbedConfig | null>(null);
  const [powerBIStatus, setPowerBIStatus] = useState<PowerBIStatus | null>(null);
  const [viewMode, setViewMode] = useState<'embedded' | 'fallback' | 'setup'>('fallback');
  const [tokenRenewing, setTokenRenewing] = useState<boolean>(false);
  const [embedError, setEmbedError] = useState<string | null>(null);

  const embedContainerRef = useRef<HTMLDivElement | null>(null);
  const reportRef = useRef<pbi.Embed | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setEmbedError(null);
      const [ov, arts, pbiCfg, pbiStat] = await Promise.all([
        fetchIndustryOverview(slug),
        fetchNewsArticles({ industry: slug, limit: 100 }),
        fetchPowerBIEmbedConfig(slug).catch(() => ({ is_configured: false } as PowerBIEmbedConfig)),
        fetchPowerBIStatus().catch(() => null)
      ]);
      setOverview(ov);
      setArticles(arts);
      setEmbedConfig(pbiCfg);
      setPowerBIStatus(pbiStat);

      if (pbiCfg.is_configured && pbiCfg.embed_token && pbiCfg.embed_url) {
        setViewMode('embedded');
      } else {
        setViewMode('fallback');
      }
    } catch (err: any) {
      console.error("Error loading Power BI data:", err);
      setViewMode('fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  // Embed Power BI Report if configured
  useEffect(() => {
    if (viewMode === 'embedded' && embedConfig?.is_configured && embedConfig.embed_token && embedConfig.embed_url && embedContainerRef.current) {
      try {
        const powerbi = new pbi.service.Service(
          pbi.factories.hpmFactory,
          pbi.factories.wpmpFactory,
          pbi.factories.routerFactory
        );

        // Reset previous embed
        powerbi.reset(embedContainerRef.current);

        const config: pbi.IReportEmbedConfiguration = {
          type: 'report',
          tokenType: pbi.models.TokenType.Embed,
          accessToken: embedConfig.embed_token,
          embedUrl: embedConfig.embed_url,
          id: embedConfig.report_id,
          permissions: pbi.models.Permissions.Read,
          settings: {
            panes: {
              filters: { expanded: false, visible: true },
              pageNavigation: { visible: true }
            },
            background: pbi.models.BackgroundType.Transparent
          }
        };

        const report = powerbi.embed(embedContainerRef.current, config);
        reportRef.current = report;

        report.on('loaded', () => {
          setEmbedError(null);
        });

        report.on('error', (event: any) => {
          console.error('Power BI Embed error:', event.detail);
          setEmbedError(event.detail?.message || 'Error communicating with Power BI Service');
        });
      } catch (err: any) {
        setEmbedError(err.message || 'Failed to initialize Power BI Embedder');
      }
    }
  }, [viewMode, embedConfig]);

  // Token auto-renewal before expiration
  useEffect(() => {
    if (!embedConfig?.token_expiry || !embedConfig.is_configured) return;

    const expiryTime = new Date(embedConfig.token_expiry).getTime();
    const now = Date.now();
    const refreshInMs = Math.max(10000, expiryTime - now - (5 * 60 * 1000)); // Renew 5 minutes before expiry

    const timer = setTimeout(async () => {
      try {
        setTokenRenewing(true);
        const renewed = await refreshPowerBIEmbedToken(slug);
        if (renewed.is_configured && renewed.embed_token) {
          setEmbedConfig(renewed);
          if (reportRef.current && (reportRef.current as any).setAccessToken) {
            await (reportRef.current as any).setAccessToken(renewed.embed_token);
          }
        }
      } catch (err) {
        console.error('Token auto-renewal failed:', err);
      } finally {
        setTokenRenewing(false);
      }
    }, refreshInMs);

    return () => clearTimeout(timer);
  }, [embedConfig, slug]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await triggerManualRefresh(slug);
      await loadData();
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Compute stats for Native BI Fallback
  const sentimentBreakdown = articles.reduce((acc, a) => {
    acc[a.sentiment] = (acc[a.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const impactBreakdown = articles.reduce((acc, a) => {
    acc[a.business_impact] = (acc[a.business_impact] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const companyMentions = articles.reduce((acc, a) => {
    (a.companies || []).forEach(c => {
      acc[c] = (acc[c] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topCompanies = Object.entries(companyMentions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const formatDateTime = (timestamp: string | null | undefined) => {
    if (!timestamp) return 'N/A';
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + 
        ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timestamp;
    }
  };

  const csvFeedUrl = getPowerBIDataFeedUrl(slug, 'csv');
  const jsonFeedUrl = getPowerBIDataFeedUrl(slug, 'json');

  return (
    <div className="min-h-screen text-white flex flex-col">
      <Navbar
        currentIndustry={slug}
        industryName={overview?.name}
        lastSyncTime={overview?.last_sync_time}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Header Bar */}
      <div className="glass-base border-b border-white/10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              to={`/industry/${slug}`}
              className="inline-flex items-center space-x-1.5 text-xs text-[#5C6BE8] hover:underline mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {overview?.name || slug.toUpperCase()} Dashboard</span>
            </Link>
            
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_12px_rgba(44,52,128,0.3)]">
                LIVE NEWS INTELLIGENCE: POWER BI
              </h1>
              {embedConfig?.is_configured ? (
                <span className="text-xs px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Service Principal Active
                </span>
              ) : (
                <span className="text-xs px-3 py-0.5 rounded-full bg-[#2C3480]/40 text-white border border-[#3B46A8]/50 font-semibold">
                  Native Fallback Active
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-1">
              Sector: <strong className="text-white">{overview?.name}</strong> • Reporting Data Layer Powered by Giant Pipeline
            </p>
          </div>

          {/* Mode Switcher Buttons (iOS Segmented Style) */}
          <div className="flex items-center p-1 rounded-2xl glass-control border border-white/10">
            {embedConfig?.is_configured && (
              <button
                onClick={() => setViewMode('embedded')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'embedded'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Embedded Power BI Report
              </button>
            )}

            <button
              onClick={() => setViewMode('fallback')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'fallback'
                  ? 'ios-btn-primary shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Native BI Fallback
            </button>

            <button
              onClick={() => setViewMode('setup')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                viewMode === 'setup'
                  ? 'ios-btn-primary shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Setup & Prerequisites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-[#5C6BE8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Connecting to Power BI Service & Reporting Layer...
          </div>
        ) : (
          <>
            {/* ================= VIEW 1: EMBEDDED POWER BI REPORT (WHEN CONFIGURED) ================= */}
            {viewMode === 'embedded' && embedConfig?.is_configured && (
              <div className="space-y-4">
                {/* Embed Metadata & Freshness Banner */}
                <div className="p-4 rounded-2xl glass-base flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-white/10">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-white">
                        Authenticated Microsoft Power BI Embed Session
                      </span>
                      <span className="text-slate-400 ml-2">
                        (Workspace: <code className="text-[#5C6BE8] font-mono">{powerBIStatus?.workspace_id?.slice(0, 8)}...</code>)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-[11px] text-slate-300 font-mono">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#5C6BE8]" />
                      <span>
                        Service Data-Refresh: <strong>{formatDateTime(embedConfig.last_refresh_time)}</strong>
                      </span>
                    </div>

                    {tokenRenewing && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Renewing token...
                      </span>
                    )}
                  </div>
                </div>

                {embedError && (
                  <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{embedError}</span>
                  </div>
                )}

                {/* Power BI Embed Container */}
                <div 
                  ref={embedContainerRef}
                  className="w-full h-[750px] rounded-3xl glass-raised border border-white/10 shadow-2xl overflow-hidden"
                />

              </div>
            )}

            {/* ================= VIEW 2: NATIVE DASHBOARD FALLBACK ================= */}
            {viewMode === 'fallback' && (
              <div className="space-y-6">
                
                {/* Mandatory Fallback Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#2C3480]/20 border border-[#3B46A8]/40 flex items-start space-x-3 text-xs text-slate-200">
                  <BarChart3 className="w-5 h-5 text-[#5C6BE8] flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-white uppercase tracking-wider text-[11px]">
                      Native dashboard (Power BI not connected)
                    </p>
                    <p className="leading-relaxed font-medium text-slate-200">
                      Per project rules, this native dashboard is explicitly identified as our local high-fidelity fallback. Authentic Microsoft Power BI Service embedding requires Azure tenant credentials. All metrics below are computed directly from the real database.
                    </p>
                    {!embedConfig?.is_configured && (
                      <p className="text-[11px] text-slate-300">
                        Missing Azure credentials: <code className="text-[#5C6BE8] font-mono font-bold">{(powerBIStatus?.missing_items || []).join(', ') || 'Azure Service Principal'}</code>. Switch to <strong>Setup & Prerequisites</strong> for configuration details.
                      </p>
                    )}
                  </div>
                </div>

                {/* Visualizations Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  {/* Sentiment Distribution */}
                  <div className="p-6 sm:p-7 rounded-3xl glass-raised space-y-4 border border-white/10">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <PieIcon className="w-4 h-4 text-[#5C6BE8]" />
                      Sentiment Classification
                    </h3>
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-emerald-400 font-semibold">Positive</span>
                          <span className="font-mono tabular-nums text-white font-bold">{sentimentBreakdown['positive'] || 0}</span>
                        </div>
                        <div className="h-2 w-full glass-control rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${(sentimentBreakdown['positive'] || 0) / (articles.length || 1) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-slate-300 font-semibold">Neutral</span>
                          <span className="font-mono tabular-nums text-white font-bold">{sentimentBreakdown['neutral'] || 0}</span>
                        </div>
                        <div className="h-2 w-full glass-control rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-slate-400 rounded-full" 
                            style={{ width: `${(sentimentBreakdown['neutral'] || 0) / (articles.length || 1) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-rose-400 font-semibold">Negative</span>
                          <span className="font-mono tabular-nums text-white font-bold">{sentimentBreakdown['negative'] || 0}</span>
                        </div>
                        <div className="h-2 w-full glass-control rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-rose-500 rounded-full" 
                            style={{ width: `${(sentimentBreakdown['negative'] || 0) / (articles.length || 1) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Impact Distribution */}
                  <div className="p-6 sm:p-7 rounded-3xl glass-raised space-y-4 border border-white/10">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      Business Impact Distribution
                    </h3>
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-rose-400 font-semibold">High Impact</span>
                          <span className="font-mono tabular-nums text-white font-bold">{impactBreakdown['high'] || 0}</span>
                        </div>
                        <div className="h-2 w-full glass-control rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-rose-500 rounded-full" 
                            style={{ width: `${(impactBreakdown['high'] || 0) / (articles.length || 1) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-amber-400 font-semibold">Medium Impact</span>
                          <span className="font-mono tabular-nums text-white font-bold">{impactBreakdown['medium'] || 0}</span>
                        </div>
                        <div className="h-2 w-full glass-control rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-amber-500 rounded-full" 
                            style={{ width: `${(impactBreakdown['medium'] || 0) / (articles.length || 1) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-slate-400 font-semibold">Low Impact</span>
                          <span className="font-mono tabular-nums text-white font-bold">{impactBreakdown['low'] || 0}</span>
                        </div>
                        <div className="h-2 w-full glass-control rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-slate-500 rounded-full" 
                            style={{ width: `${(impactBreakdown['low'] || 0) / (articles.length || 1) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Most-Mentioned Companies */}
                  <div className="p-6 sm:p-7 rounded-3xl glass-raised space-y-4 border border-white/10">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#5C6BE8]" />
                      Top Mentioned Entities
                    </h3>
                    {topCompanies.length === 0 ? (
                      <p className="text-xs text-slate-400">No entity mentions recorded yet.</p>
                    ) : (
                      <div className="space-y-2.5 text-xs">
                        {topCompanies.map(([comp, count]) => (
                          <div key={comp} className="flex items-center justify-between p-2.5 rounded-2xl glass-base border border-white/10">
                            <span className="text-white font-medium truncate max-w-[150px]">{comp}</span>
                            <span className="font-mono tabular-nums text-[#5C6BE8] font-bold">{count} mentions</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Live Data Feed Stream Table */}
                <div className="p-6 sm:p-7 rounded-3xl glass-raised space-y-4 border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Live Reporting Data Layer Stream ({articles.length} verified records available)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Sanitized view feeds Power BI Desktop and Service without customer PII.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={csvFeedUrl}
                        download
                        className="px-3.5 py-1.5 rounded-xl glass-control hover:bg-white/10 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all border border-white/10"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Download Feed CSV</span>
                      </a>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="glass-control text-slate-300 uppercase text-[10px] font-bold border-b border-white/10">
                        <tr>
                          <th className="py-3 px-3.5">Headline</th>
                          <th className="py-3 px-3.5">Source</th>
                          <th className="py-3 px-3.5">Impact</th>
                          <th className="py-3 px-3.5">Sentiment</th>
                          <th className="py-3 px-3.5">Published</th>
                          <th className="py-3 px-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {articles.slice(0, 8).map((a) => (
                          <tr key={a.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3.5 font-medium text-white max-w-md truncate">{a.title}</td>
                            <td className="py-3 px-3.5 font-semibold text-white">{a.source}</td>
                            <td className="py-3 px-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                                a.business_impact === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                a.business_impact === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'glass-control text-slate-300 border border-white/10'
                              }`}>
                                {a.business_impact}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 capitalize text-slate-300">{a.sentiment}</td>
                            <td className="py-3 px-3.5 font-mono tabular-nums text-[11px] text-slate-400">
                              {formatDateTime(a.published_at)}
                            </td>
                            <td className="py-3 px-3.5 text-right">
                              <a
                                href={a.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#5C6BE8] hover:underline inline-flex items-center gap-1 font-semibold"
                              >
                                <span>Open</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ================= VIEW 3: SETUP & PREREQUISITES CHECKLIST ================= */}
            {viewMode === 'setup' && (
              <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl glass-raised space-y-6 text-xs border border-white/10">
                
                <div className="flex items-center space-x-3 text-white">
                  <Settings className="w-6 h-6 text-[#5C6BE8]" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Microsoft Power BI Integration Setup & Prerequisites
                    </h2>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Step-by-step checklist to configure server-side Azure AD embedding.
                    </p>
                  </div>
                </div>

                {/* Configuration Health Status */}
                <div className={`p-5 rounded-2xl border flex items-start space-x-3 ${
                  powerBIStatus?.is_configured
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                }`}>
                  {powerBIStatus?.is_configured ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold text-white">
                      {powerBIStatus?.is_configured ? 'All Credentials Configured' : 'Credentials Missing in Environment'}
                    </p>
                    <p className="leading-relaxed text-slate-300">
                      {powerBIStatus?.is_configured
                        ? 'Your Azure Service Principal credentials are loaded from environment variables and ready to generate embed tokens.'
                        : `The following environment variables are missing in backend/.env: ${(powerBIStatus?.missing_items || []).join(', ')}.`}
                    </p>
                  </div>
                </div>

                {/* Prerequisites Checklist */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#5C6BE8]" />
                    Prerequisite Checklist (How to Obtain Each Item)
                  </h3>

                  {powerBIStatus?.prerequisites && Object.entries(powerBIStatus.prerequisites).map(([key, item]) => {
                    const isConfigured = (
                      (key === 'licence_and_workspace' && !!powerBIStatus.workspace_id) ||
                      (key === 'published_report_and_dataset' && !!powerBIStatus.report_id) ||
                      (key === 'entra_app_registration' && !!powerBIStatus.tenant_id)
                    );

                    return (
                      <div key={key} className="p-5 rounded-2xl glass-base border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-xs flex items-center gap-2">
                            {isConfigured ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-amber-400" />
                            )}
                            {item.title}
                          </h4>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                            isConfigured
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {isConfigured ? 'Provided' : 'Action Required'}
                          </span>
                        </div>

                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          <strong>Requirement:</strong> {item.requirement}
                        </p>
                        <p className="text-slate-400 text-[11px] leading-relaxed glass-control p-3 rounded-xl border border-white/10">
                          <strong>How to obtain:</strong> {item.how_to_obtain}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Data Ingestion Feed Endpoints for Desktop */}
                <div className="p-5 rounded-2xl glass-base border border-white/10 space-y-3">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    Direct Power BI Desktop Data Feed URLs
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    In Power BI Desktop, select <em>Get Data &gt; Web</em> and paste either endpoint below:
                  </p>

                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="p-3 rounded-xl glass-control border border-white/10 flex items-center justify-between">
                      <span className="text-[#5C6BE8] truncate">{jsonFeedUrl}</span>
                      <span className="text-slate-400 text-[10px] ml-2">JSON Format</span>
                    </div>

                    <div className="p-3 rounded-xl glass-control border border-white/10 flex items-center justify-between">
                      <span className="text-[#5C6BE8] truncate">{csvFeedUrl}</span>
                      <span className="text-slate-400 text-[10px] ml-2">CSV Format</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setViewMode('fallback')}
                    className="px-4 py-2.5 rounded-xl glass-control hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/10"
                  >
                    Return to Native Dashboard
                  </button>

                  <Link
                    to={`/industry/${slug}`}
                    className="ios-btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md"
                  >
                    Back to Industry Radar
                  </Link>
                </div>

              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
};
