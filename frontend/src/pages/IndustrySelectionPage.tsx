import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Smartphone, 
  Zap, 
  Car, 
  ArrowRight, 
  Clock, 
  Newspaper, 
  RefreshCw, 
  AlertCircle,
  Layers
} from 'lucide-react';
import { fetchIndustryCards, triggerManualRefresh } from '../services/api';
import { IndustryCard } from '../types';

export const IndustrySelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<IndustryCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchIndustryCards();
      setCards(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch industry data. Check backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      await triggerManualRefresh();
      await loadCards();
    } catch (err: any) {
      alert(`Manual sync error: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getIndustryVisual = (slug: string) => {
    switch (slug) {
      case 'telecom':
        return {
          icon: <Smartphone className="w-6 h-6 text-accent-blue" />,
          accentBg: 'bg-accent-blue/10 border-accent-blue/30',
          hoverBorder: 'group-hover:border-accent-blue/60',
          gradientBadge: 'from-blue-600/20 to-blue-400/10 text-blue-400'
        };
      case 'fintech':
        return {
          icon: <Zap className="w-6 h-6 text-emerald-400" />,
          accentBg: 'bg-emerald-500/10 border-emerald-500/30',
          hoverBorder: 'group-hover:border-emerald-500/60',
          gradientBadge: 'from-emerald-600/20 to-emerald-400/10 text-emerald-400'
        };
      case 'ev':
        return {
          icon: <Car className="w-6 h-6 text-purple-400" />,
          accentBg: 'bg-purple-500/10 border-purple-500/30',
          hoverBorder: 'group-hover:border-purple-500/60',
          gradientBadge: 'from-purple-600/20 to-purple-400/10 text-purple-400'
        };
      default:
        return {
          icon: <Layers className="w-6 h-6 text-slate-400" />,
          accentBg: 'bg-slate-500/10 border-slate-500/30',
          hoverBorder: 'group-hover:border-slate-500/60',
          gradientBadge: 'from-slate-600/20 to-slate-400/10 text-slate-400'
        };
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'No sync recorded';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-between">
      
      {/* Header */}
      <header className="border-b border-navy-800 bg-navy-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-blue to-accent-violet flex items-center justify-center font-bold text-white text-base">
              G
            </div>
            <span className="font-extrabold text-base tracking-wider text-white">GIANT</span>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-medium text-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accent-blue' : ''}`} />
              <span>{isRefreshing ? 'Syncing Feeds...' : 'Sync Sources Now'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 my-auto">
        
        {/* Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            CHOOSE YOUR INDUSTRY
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-normal">
            Discover What's Happening. Understand Your Competitors. Make Smarter Decisions.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 rounded-2xl bg-navy-900/50 border border-navy-800 animate-pulse h-96 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-800" />
                  <div className="w-3/4 h-6 bg-navy-800 rounded" />
                  <div className="w-full h-16 bg-navy-800/60 rounded" />
                </div>
                <div className="w-full h-10 bg-navy-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-xl mx-auto p-6 rounded-2xl bg-red-950/40 border border-red-800 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <h2 className="text-base font-bold text-white mb-1">Backend Connection Notice</h2>
            <p className="text-xs text-red-200 mb-4">{error}</p>
            <button
              onClick={loadCards}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Industry Cards Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {cards.map((card) => {
              const visual = getIndustryVisual(card.slug);
              return (
                <div
                  key={card.slug}
                  onClick={() => navigate(`/industry/${card.slug}`)}
                  className={`group cursor-pointer rounded-2xl bg-navy-900/80 border border-navy-800 ${visual.hoverBorder} transition-all duration-200 p-6 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:scale-[1.01]`}
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${visual.accentBg}`}>
                        {visual.icon}
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-gradient-to-r ${visual.gradientBadge}`}>
                        {card.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-xl font-bold text-white group-hover:text-accent-blue transition-colors mb-2">
                      {card.name}
                    </h2>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-6">
                      {card.description}
                    </p>

                    {/* Live Metric Stats */}
                    <div className="grid grid-cols-2 gap-2.5 py-3 px-3.5 rounded-xl bg-navy-950/70 border border-navy-800/80 mb-5 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Articles</span>
                        <span className="text-sm font-extrabold text-white font-mono">{card.total_articles_count}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Last 24h New</span>
                        <span className="text-sm font-extrabold text-emerald-400 font-mono">+{card.new_articles_count_24h}</span>
                      </div>
                    </div>

                    {/* Latest Real Headline or Explicit Empty State */}
                    <div className="p-3.5 rounded-xl bg-navy-950/50 border border-navy-800/60 mb-6">
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-1.5">
                        <Newspaper className="w-3 h-3 text-accent-blue" />
                        <span className="font-semibold uppercase tracking-wider">Latest Live Headline</span>
                      </div>

                      {card.latest_headline ? (
                        <div>
                          <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-snug mb-1.5">
                            "{card.latest_headline}"
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Source: {card.latest_source || 'Verified Feed'}</span>
                            <span className="font-mono">{formatTimestamp(card.latest_published_at)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic py-1">
                          No articles recorded yet. Click Sync Sources to fetch.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action & Sync Timestamp */}
                  <div className="pt-4 border-t border-navy-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Last sync:</span>
                      </span>
                      <span className="font-mono text-slate-300">{formatTimestamp(card.last_sync_time)}</span>
                    </div>

                    <button
                      className="w-full py-2.5 px-4 rounded-xl bg-navy-800 hover:bg-accent-blue group-hover:bg-accent-blue text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md group-hover:shadow-accent-blue/20"
                    >
                      <span>Explore Industry</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-navy-900 py-4 text-center text-xs text-slate-400">
        GIANT Platform • Verified Multi-Sector Business Intelligence Engine
      </footer>

    </div>
  );
};
