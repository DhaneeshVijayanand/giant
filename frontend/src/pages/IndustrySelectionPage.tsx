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
import { LiveClock } from '../components/LiveClock';
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
          icon: <Smartphone className="w-6 h-6 text-white" />,
          accentBg: 'bg-[#2C3480]/40 border-[#3B46A8]/50 shadow-[0_0_15px_rgba(44,52,128,0.3)]',
          hoverBorder: 'group-hover:border-[#5C6BE8]/60',
          badgeStyle: 'bg-[#2C3480]/40 text-white border-[#3B46A8]/60'
        };
      case 'fintech':
        return {
          icon: <Zap className="w-6 h-6 text-emerald-400" />,
          accentBg: 'bg-emerald-500/15 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
          hoverBorder: 'group-hover:border-emerald-400/60',
          badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
      case 'ev':
        return {
          icon: <Car className="w-6 h-6 text-purple-300" />,
          accentBg: 'bg-purple-500/15 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
          hoverBorder: 'group-hover:border-purple-400/60',
          badgeStyle: 'bg-purple-500/20 text-purple-200 border-purple-500/40'
        };
      default:
        return {
          icon: <Layers className="w-6 h-6 text-slate-300" />,
          accentBg: 'bg-slate-500/15 border-slate-500/30',
          hoverBorder: 'group-hover:border-slate-400/50',
          badgeStyle: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
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
    <div className="relative min-h-screen flex flex-col justify-between select-none">
      
      {/* Floating Glass Top Bar */}
      <div className="sticky top-3 z-50 px-3 sm:px-6 max-w-7xl mx-auto w-full pt-2">
        <header className="glass-raised rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between border border-white/10">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2C3480] via-[#3742A3] to-[#5C6BE8] flex items-center justify-center font-black text-white text-base shadow-[0_0_20px_rgba(44,52,128,0.4)] group-hover:scale-105 transition-transform">
              G
            </div>
            <span className="font-extrabold text-base tracking-wider text-white">GIANT</span>
          </Link>

          <div className="flex items-center space-x-2.5">
            {/* Real-time Live Clock */}
            <LiveClock />

            {/* Manual Sync Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="ios-btn-primary flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing Feeds...' : 'Sync Sources Now'}</span>
            </button>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 my-auto">
        
        {/* Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3 text-white drop-shadow-[0_2px_16px_rgba(44,52,128,0.3)]">
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
              <div key={n} className="p-6 rounded-3xl glass-raised animate-pulse h-96 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl glass-base" />
                  <div className="w-3/4 h-6 glass-base rounded-lg" />
                  <div className="w-full h-16 glass-base rounded-xl" />
                </div>
                <div className="w-full h-10 glass-base rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-xl mx-auto p-6 rounded-3xl glass-overlay border-red-500/40 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h2 className="text-base font-bold text-white mb-1">Backend Connection Notice</h2>
            <p className="text-xs text-red-300 mb-4">{error}</p>
            <button
              onClick={loadCards}
              className="ios-btn-primary px-5 py-2.5 text-xs font-semibold"
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
                  className={`group cursor-pointer rounded-3xl glass-raised ${visual.hoverBorder} hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-[0_20px_40px_rgba(44,52,128,0.25)] border border-white/10`}
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${visual.accentBg}`}>
                        {visual.icon}
                      </div>
                      <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border shadow-sm ${visual.badgeStyle}`}>
                        {card.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#5C6BE8] transition-colors mb-2">
                      {card.name}
                    </h2>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-6">
                      {card.description}
                    </p>

                    {/* Live Metric Stats */}
                    <div className="grid grid-cols-2 gap-3 py-3 px-4 rounded-2xl glass-base mb-5 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Articles</span>
                        <span className="text-base font-black text-white font-mono tabular-nums">{card.total_articles_count}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Last 24h New</span>
                        <span className="text-base font-black text-emerald-400 font-mono tabular-nums">+{card.new_articles_count_24h}</span>
                      </div>
                    </div>

                    {/* Latest Real Headline or Explicit Empty State */}
                    <div className="p-4 rounded-2xl glass-base mb-6">
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-2">
                        <Newspaper className="w-3.5 h-3.5 text-[#5C6BE8]" />
                        <span className="font-bold uppercase tracking-wider text-[10px] text-slate-300">Latest Live Headline</span>
                      </div>

                      {card.latest_headline ? (
                        <div>
                          <p className="text-xs font-semibold text-white line-clamp-2 leading-snug mb-2">
                            "{card.latest_headline}"
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="truncate max-w-[55%]">Source: {card.latest_source || 'Verified Feed'}</span>
                            <span className="font-mono tabular-nums">{formatTimestamp(card.latest_published_at)}</span>
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
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Last sync:</span>
                      </span>
                      <span className="font-mono tabular-nums font-medium text-slate-200">{formatTimestamp(card.last_sync_time)}</span>
                    </div>

                    <button
                      className="ios-btn-primary w-full py-3 px-4 text-xs flex items-center justify-center space-x-2 shadow-md group-hover:shadow-[0_0_25px_rgba(44,52,128,0.5)]"
                    >
                      <span>Explore Industry</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform motion-reduce:transform-none" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400">
        GIANT Platform • Verified Multi-Sector Business Intelligence Engine
      </footer>

    </div>
  );
};
