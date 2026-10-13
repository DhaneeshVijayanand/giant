import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Bookmark, 
  BookmarkCheck, 
  Plus, 
  Trash2, 
  Calendar, 
  ExternalLink, 
  Lightbulb
} from 'lucide-react';
import { 
  fetchWatchlist, 
  addToWatchlist, 
  removeFromWatchlist, 
  fetchCompetitorDevelopments 
} from '../services/api';
import { WatchlistItem, CompetitorDevelopment } from '../types';

interface CompetitorTrackerTabProps {
  industrySlug: string;
  allCompanies: string[];
}

export const CompetitorTrackerTab: React.FC<CompetitorTrackerTabProps> = ({ industrySlug, allCompanies }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [developments, setDevelopments] = useState<CompetitorDevelopment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Watchlist Form State
  const [selectedCompanyToAdd, setSelectedCompanyToAdd] = useState<string>('');
  const [noteToAdd, setNoteToAdd] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter State
  const [filterMode, setFilterMode] = useState<'all' | 'watched'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [wl, devs] = await Promise.all([
        fetchWatchlist(industrySlug),
        fetchCompetitorDevelopments(industrySlug)
      ]);
      setWatchlist(wl);
      setDevelopments(devs);
    } catch (err) {
      console.error('Error loading tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [industrySlug]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyToAdd) return;
    try {
      setIsSubmitting(true);
      await addToWatchlist(selectedCompanyToAdd, industrySlug, noteToAdd || undefined);
      setSelectedCompanyToAdd('');
      setNoteToAdd('');
      await loadData();
    } catch (err: any) {
      alert(`Error adding to watchlist: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await removeFromWatchlist(id);
      await loadData();
    } catch (err: any) {
      alert(`Error removing: ${err.message}`);
    }
  };

  const watchedCompanyNames = new Set(watchlist.map(w => w.company_name.toLowerCase()));

  // Filter developments
  const filteredDevelopments = developments.filter(dev => {
    if (filterMode === 'watched' && !watchedCompanyNames.has(dev.company_name.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && dev.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'product_launch':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'price_change':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'partnership':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'regulatory':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-700/30 text-slate-300 border-slate-700';
    }
  };

  const formatCategoryLabel = (cat: string) => {
    return cat.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="space-y-8">
      
      {/* ================= TOP SECTION: PERSISTENT WATCHLIST ================= */}
      <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-accent-blue" />
              Persistent Analyst Watchlist ({watchlist.length} Monitored)
            </h3>
            <p className="text-xs text-slate-400">
              Saved in database and persisted across sessions. Tracks alerts and market shifts.
            </p>
          </div>
        </div>

        {/* Watchlist Chips Grid */}
        {watchlist.length === 0 ? (
          <div className="p-4 rounded-xl bg-navy-950/60 border border-dashed border-navy-800 text-center text-xs text-slate-400">
            No entities on your watchlist for this sector yet. Add a company below to begin tracking.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {watchlist.map((item) => (
              <div 
                key={item.id} 
                className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800/80 flex items-start justify-between gap-3 group hover:border-accent-blue/40 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-1.5 font-bold text-sm text-white">
                    <BookmarkCheck className="w-4 h-4 text-accent-blue" />
                    <span>{item.company_name}</span>
                  </div>
                  {item.notes ? (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">"{item.notes}"</p>
                  ) : (
                    <span className="text-[10px] text-slate-500 mt-1 block">Active Watch Target</span>
                  )}
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                    Added: {new Date(item.added_at).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-navy-900 transition-colors"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add to Watchlist Form */}
        <form onSubmit={handleAdd} className="pt-3 border-t border-navy-800/80 flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedCompanyToAdd}
            onChange={(e) => setSelectedCompanyToAdd(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-xs text-slate-200 focus:outline-none focus:border-accent-blue"
            required
          >
            <option value="">Select Company to Watch...</option>
            {allCompanies
              .filter(c => !watchlist.some(w => w.company_name.toLowerCase() === c.toLowerCase()))
              .map(c => (
                <option key={c} value={c}>{c}</option>
              ))
            }
          </select>

          <input
            type="text"
            placeholder="Analyst note or thesis (optional)..."
            value={noteToAdd}
            onChange={(e) => setNoteToAdd(e.target.value)}
            className="w-full flex-1 px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-blue"
          />

          <button
            type="submit"
            disabled={!selectedCompanyToAdd || isSubmitting}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : 'Add to Watchlist'}</span>
          </button>
        </form>

      </div>

      {/* ================= BOTTOM SECTION: STRATEGIC DEVELOPMENTS TRACKER ================= */}
      <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-6">
        
        {/* Tracker Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Strategic Competitor Developments Radar
            </h3>
            <p className="text-xs text-slate-400">
              Chronological log of verified strategic maneuvers with analyst significance breakdown.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Watchlist Filter Mode Toggle */}
            <div className="inline-flex rounded-lg bg-navy-950 p-0.5 border border-navy-700">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterMode === 'all' ? 'bg-navy-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Industry
              </button>
              <button
                onClick={() => setFilterMode('watched')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterMode === 'watched' ? 'bg-accent-blue text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Watchlist Only ({watchlist.length})
              </button>
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-slate-200 focus:outline-none focus:border-accent-blue text-xs"
            >
              <option value="all">All Categories</option>
              <option value="product_launch">Product Launches</option>
              <option value="price_change">Price / Tariff Changes</option>
              <option value="partnership">Partnerships</option>
              <option value="regulatory">Regulatory Items</option>
            </select>
          </div>
        </div>

        {/* Developments Stream */}
        {loading ? (
          <div className="p-12 text-center animate-pulse text-xs text-slate-400">
            Loading strategic competitor developments...
          </div>
        ) : filteredDevelopments.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-navy-950/40 border border-navy-800 text-xs text-slate-400">
            No developments match the current filter selection.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDevelopments.map((dev) => (
              <div
                key={dev.id}
                className="p-5 rounded-xl bg-navy-950/70 border border-navy-800 hover:border-navy-700 transition-colors space-y-3"
              >
                {/* Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm">
                      🏢 {dev.company_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getCategoryColor(dev.category)}`}>
                      {formatCategoryLabel(dev.category)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(dev.published_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Headline & Details */}
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">
                    {dev.headline}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dev.details}
                  </p>
                </div>

                {/* CRITICAL: "Why this matters" Analyst Box */}
                <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-800/40 flex items-start space-x-2.5 text-xs">
                  <Lightbulb className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-purple-300 block mb-0.5 uppercase tracking-wider text-[10px]">
                      Why this matters to Business Analysts:
                    </span>
                    <p className="text-purple-200/90 leading-relaxed">
                      {dev.business_significance}
                    </p>
                  </div>
                </div>

                {/* Source attribution link */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Source: {dev.source}</span>
                  {dev.source_url && (
                    <a
                      href={dev.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-blue hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Verification Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
