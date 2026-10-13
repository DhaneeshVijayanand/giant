import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowLeft, 
  Settings, 
  ExternalLink, 
  Layers, 
  TrendingUp, 
  PieChart as PieIcon
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { fetchIndustryOverview, fetchNewsArticles, triggerManualRefresh } from '../services/api';
import { Article, IndustryOverview } from '../types';

export const PowerBIPage: React.FC = () => {
  const { slug = 'telecom' } = useParams<{ slug: string }>();
  const [overview, setOverview] = useState<IndustryOverview | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'fallback' | 'setup'>('fallback');

  const loadData = async () => {
    try {
      setLoading(true);
      const [ov, arts] = await Promise.all([
        fetchIndustryOverview(slug),
        fetchNewsArticles({ industry: slug, limit: 100 })
      ]);
      setOverview(ov);
      setArticles(arts);
    } catch (err) {
      console.error("Error loading Power BI fallback data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug]);

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

  // Compute breakdown stats from real articles
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

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar
        currentIndustry={slug}
        industryName={overview?.name}
        lastSyncTime={overview?.last_sync_time}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Header Bar */}
      <div className="bg-navy-900/60 border-b border-navy-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to={`/industry/${slug}`}
              className="inline-flex items-center space-x-1.5 text-xs text-accent-blue hover:underline mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {overview?.name || slug.toUpperCase()} Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              LIVE NEWS INTELLIGENCE: POWER BI
              <span className="text-xs px-2.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                Milestone 5 Interface
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Sector: <strong className="text-white">{overview?.name}</strong> • Powered by Giant Persistent Pipeline
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('fallback')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'fallback'
                  ? 'bg-accent-violet text-white shadow-md shadow-accent-violet/20'
                  : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-700'
              }`}
            >
              Native BI Fallback
            </button>
            <button
              onClick={() => setViewMode('setup')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'setup'
                  ? 'bg-accent-violet text-white shadow-md shadow-accent-violet/20'
                  : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-700'
              }`}
            >
              Power BI Service Setup
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
            <div className="h-44 rounded-2xl bg-navy-900/50 border border-navy-800" />
            <div className="h-44 rounded-2xl bg-navy-900/50 border border-navy-800" />
            <div className="h-44 rounded-2xl bg-navy-900/50 border border-navy-800" />
          </div>
        ) : (
          <>
            {/* VIEW 1: Native Fallback Dashboard */}
            {viewMode === 'fallback' && (
              <div className="space-y-6">
                
                {/* Notice Banner */}
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-start space-x-3 text-xs">
                  <BarChart3 className="w-5 h-5 text-accent-violet flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-200 font-semibold mb-0.5">
                  Native Analytics Dashboard (Active Fallback)
                </p>
                <p className="text-purple-300/80 leading-relaxed">
                  Per project rules, this native dashboard is explicitly identified as our local high-fidelity fallback. Authentic Microsoft Power BI Service embedding requires Azure tenant credentials (see Setup Guide). All data below is 100% real and computed from the database.
                </p>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Sentiment Chart Card */}
              <div className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-accent-blue" />
                  Sentiment Distribution
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-emerald-400">Positive</span>
                      <span className="font-mono text-white">{sentimentBreakdown['positive'] || 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${(sentimentBreakdown['positive'] || 0) / (articles.length || 1) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Neutral</span>
                      <span className="font-mono text-white">{sentimentBreakdown['neutral'] || 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-400 rounded-full" 
                        style={{ width: `${(sentimentBreakdown['neutral'] || 0) / (articles.length || 1) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-rose-400">Negative</span>
                      <span className="font-mono text-white">{sentimentBreakdown['negative'] || 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full" 
                        style={{ width: `${(sentimentBreakdown['negative'] || 0) / (articles.length || 1) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Breakdown Card */}
              <div className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Business Impact Analysis
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-rose-300 font-semibold">High Strategic Impact</span>
                      <span className="font-mono text-white">{impactBreakdown['high'] || 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full" 
                        style={{ width: `${(impactBreakdown['high'] || 0) / (articles.length || 1) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-amber-300 font-semibold">Medium Impact</span>
                      <span className="font-mono text-white">{impactBreakdown['medium'] || 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${(impactBreakdown['medium'] || 0) / (articles.length || 1) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 font-semibold">Standard Ingestion</span>
                      <span className="font-mono text-white">{impactBreakdown['low'] || 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-500 rounded-full" 
                        style={{ width: `${(impactBreakdown['low'] || 0) / (articles.length || 1) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Mentioned Companies */}
              <div className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Top Mentioned Competitors
                </h3>
                {topCompanies.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No specific entity tags detected yet.</p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {topCompanies.map(([comp, count]) => (
                      <div key={comp} className="flex items-center justify-between py-1 border-b border-navy-800/80">
                        <span className="text-slate-200 font-medium">🏢 {comp}</span>
                        <span className="font-mono font-bold text-accent-blue px-2 py-0.5 rounded bg-accent-blue/10">
                          {count} {count === 1 ? 'article' : 'articles'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Quick Articles Table */}
            <div className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Live Data Feed Stream ({articles.length} records available to Power BI)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-navy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-navy-800">
                    <tr>
                      <th className="py-2.5 px-3">Headline</th>
                      <th className="py-2.5 px-3">Source</th>
                      <th className="py-2.5 px-3">Impact</th>
                      <th className="py-2.5 px-3">Published</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800/60 font-sans">
                    {articles.slice(0, 10).map((a) => (
                      <tr key={a.id} className="hover:bg-navy-950/40">
                        <td className="py-2.5 px-3 font-medium text-white max-w-md truncate">{a.title}</td>
                        <td className="py-2.5 px-3 font-semibold text-accent-blue">{a.source}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            a.business_impact === 'high' ? 'bg-rose-500/15 text-rose-300' :
                            a.business_impact === 'medium' ? 'bg-amber-500/15 text-amber-300' :
                            'bg-slate-700/30 text-slate-400'
                          }`}>
                            {a.business_impact}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                          {new Date(a.published_at).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-blue hover:underline inline-flex items-center gap-1 font-semibold"
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

        {/* VIEW 2: Power BI Service Setup Instructions */}
        {viewMode === 'setup' && (
          <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-6">
            <div className="flex items-center space-x-3 text-purple-400 mb-2">
              <Settings className="w-6 h-6" />
              <h2 className="text-xl font-bold text-white">Power BI Service Integration Setup</h2>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              To embed a live Power BI report into Giant without public URL exposure, the following genuine Microsoft cloud infrastructure is configured during <strong>Milestone 5</strong>:
            </p>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
                <h4 className="font-bold text-white mb-1">1. Microsoft Entra ID (Azure AD) App Registration</h4>
                <p className="text-slate-400 mb-2">Register an application to authenticate server-side via Service Principal:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Client ID: <code className="text-accent-blue font-mono">POWERBI_CLIENT_ID</code></li>
                  <li>Client Secret: <code className="text-accent-blue font-mono">POWERBI_CLIENT_SECRET</code></li>
                  <li>Tenant ID: <code className="text-accent-blue font-mono">POWERBI_TENANT_ID</code></li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
                <h4 className="font-bold text-white mb-1">2. Power BI Workspace & Capacity</h4>
                <p className="text-slate-400">
                  Create a dedicated Power BI Workspace with Power BI Pro / PPU or Fabric capacity, and grant the Service Principal read access.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
                <h4 className="font-bold text-white mb-1">3. Direct Data Model Ingestion</h4>
                <p className="text-slate-400">
                  Connect Power BI Desktop directly to Giant's database view <code className="text-accent-blue font-mono">/api/v1/powerbi/news-feed</code>, build visual analytics, and publish to the configured workspace.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-navy-800 flex justify-end">
              <button
                onClick={() => setViewMode('fallback')}
                className="px-4 py-2 rounded-lg bg-accent-blue hover:bg-blue-600 text-white text-xs font-semibold"
              >
                Back to Native Analytics Fallback
              </button>
            </div>
          </div>
        )}
        </>
      )}

      </main>

    </div>
  );
};
