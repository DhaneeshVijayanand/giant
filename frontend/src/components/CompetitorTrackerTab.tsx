import React, { useEffect, useState, useMemo } from 'react';
import { 
  ArrowRightLeft, 
  Building2, 
  Calendar, 
  ExternalLink, 
  Lightbulb, 
  Bookmark, 
  BookmarkCheck, 
  Plus, 
  Trash2, 
  Sparkles,
  Scale,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  fetchWatchlist, 
  addToWatchlist, 
  removeFromWatchlist, 
  fetchCompetitorDevelopments,
  fetchCompetitorMetrics 
} from '../services/api';
import { WatchlistItem, CompetitorDevelopment, CompetitorMetric } from '../types';

interface CompetitorTrackerTabProps {
  industrySlug: string;
  allCompanies: string[];
}

export const CompetitorTrackerTab: React.FC<CompetitorTrackerTabProps> = ({ industrySlug, allCompanies }) => {
  // Data state
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [developments, setDevelopments] = useState<CompetitorDevelopment[]>([]);
  const [metrics, setMetrics] = useState<CompetitorMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected companies for head-to-head Company vs Company analysis
  const [companyA, setCompanyA] = useState<string>('');
  const [companyB, setCompanyB] = useState<string>('');

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Watchlist modal / collapse toggle
  const [showWatchlistSection, setShowWatchlistSection] = useState<boolean>(false);
  const [selectedCompanyToAdd, setSelectedCompanyToAdd] = useState<string>('');
  const [noteToAdd, setNoteToAdd] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load all competitor data on mount or industry switch
  const loadData = async () => {
    try {
      setLoading(true);
      const [wl, devs, mets] = await Promise.all([
        fetchWatchlist(industrySlug).catch(() => []),
        fetchCompetitorDevelopments(industrySlug).catch(() => []),
        fetchCompetitorMetrics(industrySlug).catch(() => [])
      ]);
      setWatchlist(wl);
      setDevelopments(devs);
      setMetrics(mets);
    } catch (err) {
      console.error('Error loading competitor tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [industrySlug]);

  // Set intelligent defaults for Company A and Company B once companies are known
  useEffect(() => {
    if (allCompanies && allCompanies.length > 0) {
      if (!companyA || !allCompanies.includes(companyA)) {
        setCompanyA(allCompanies[0]);
      }
      if (!companyB || !allCompanies.includes(companyB)) {
        setCompanyB(allCompanies.length > 1 ? allCompanies[1] : allCompanies[0]);
      }
    }
  }, [allCompanies]);

  // Swap Company A and Company B
  const handleSwap = () => {
    const temp = companyA;
    setCompanyA(companyB);
    setCompanyB(temp);
  };

  // Watchlist management handlers (persisting full functionality)
  const handleAddWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyToAdd) return;
    try {
      setIsSubmitting(true);
      await addToWatchlist(selectedCompanyToAdd, industrySlug, noteToAdd || undefined);
      setSelectedCompanyToAdd('');
      setNoteToAdd('');
      const updatedWl = await fetchWatchlist(industrySlug);
      setWatchlist(updatedWl);
    } catch (err: any) {
      alert(`Error adding to watchlist: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveWatchlist = async (id: number) => {
    try {
      await removeFromWatchlist(id);
      const updatedWl = await fetchWatchlist(industrySlug);
      setWatchlist(updatedWl);
    } catch (err: any) {
      alert(`Error removing: ${err.message}`);
    }
  };

  // Filter developments for Company A and Company B
  const movesA = useMemo(() => {
    if (!companyA) return [];
    return developments.filter(d => {
      const matchCompany = d.company_name.toLowerCase() === companyA.toLowerCase();
      if (!matchCompany) return false;
      if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
      return true;
    });
  }, [developments, companyA, selectedCategory]);

  const movesB = useMemo(() => {
    if (!companyB) return [];
    return developments.filter(d => {
      const matchCompany = d.company_name.toLowerCase() === companyB.toLowerCase();
      if (!matchCompany) return false;
      if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
      return true;
    });
  }, [developments, companyB, selectedCategory]);

  // Get key metric for Company A and Company B (e.g. subscriber market share or volume)
  const getEntityMetric = (companyName: string) => {
    if (!companyName) return null;
    const directMatches = metrics.filter(m => m.entity_name.toLowerCase() === companyName.toLowerCase());
    if (directMatches.length === 0) return null;
    // Prefer subscriber_market_share or highest recent value
    const shareMetric = directMatches.find(m => m.metric_name.toLowerCase().includes('share') || m.metric_name.toLowerCase().includes('subscriber'));
    return shareMetric || directMatches[0];
  };

  const metricA = getEntityMetric(companyA);
  const metricB = getEntityMetric(companyB);

  // Category badge colors
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'product_launch':
        return 'bg-ios-blue/15 text-ios-blue border-ios-blue/30';
      case 'price_change':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'partnership':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'regulatory':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'glass-control text-slate-300 border-glass-border';
    }
  };

  const formatCategoryLabel = (cat: string) => {
    return cat.replace(/_/g, ' ').toUpperCase();
  };

  // Generate popular preset matchups
  const presets = useMemo(() => {
    if (allCompanies.length < 2) return [];
    const list: Array<[string, string]> = [];
    if (allCompanies.length >= 2) list.push([allCompanies[0], allCompanies[1]]);
    if (allCompanies.length >= 3) list.push([allCompanies[0], allCompanies[2]]);
    if (allCompanies.length >= 4) list.push([allCompanies[0], allCompanies[3]]);
    if (allCompanies.length >= 3) list.push([allCompanies[1], allCompanies[2]]);
    if (allCompanies.length >= 4) list.push([allCompanies[1], allCompanies[3]]);
    if (allCompanies.length >= 4) list.push([allCompanies[2], allCompanies[3]]);
    return list;
  }, [allCompanies]);

  // Dynamic Brand Styling for Company A and B
  const getBrandCardStyle = (companyName: string) => {
    const name = (companyName || '').toLowerCase();
    if (name.includes('jio')) {
      return {
        hex: '#3B82F6',
        border: 'border-[#3B82F6]/50',
        bg: 'bg-blue-950/20',
        badge: 'bg-[#3B82F6]/20 text-[#60a5fa] border-[#3B82F6]/40',
        metric: 'text-[#60a5fa]',
        selectRing: 'focus:ring-[#3B82F6]',
        selectBorder: 'border-[#3B82F6]/50'
      };
    } else if (name.includes('airtel')) {
      return {
        hex: '#A78BFA',
        border: 'border-[#A78BFA]/50',
        bg: 'bg-purple-950/20',
        badge: 'bg-[#A78BFA]/20 text-[#c4b5fd] border-[#A78BFA]/40',
        metric: 'text-[#c4b5fd]',
        selectRing: 'focus:ring-[#A78BFA]',
        selectBorder: 'border-[#A78BFA]/50'
      };
    } else if (name.includes('vodafone') || name.includes('vi')) {
      return {
        hex: '#FBBF24',
        border: 'border-[#FBBF24]/50',
        bg: 'bg-amber-950/20',
        badge: 'bg-[#FBBF24]/20 text-[#fde68a] border-[#FBBF24]/40',
        metric: 'text-[#fde68a]',
        selectRing: 'focus:ring-[#FBBF24]',
        selectBorder: 'border-[#FBBF24]/50'
      };
    } else if (name.includes('bsnl')) {
      return {
        hex: '#64748B',
        border: 'border-[#64748B]/60',
        bg: 'bg-slate-900/40',
        badge: 'bg-[#64748B]/25 text-[#cbd5e1] border-[#64748B]/50',
        metric: 'text-[#cbd5e1]',
        selectRing: 'focus:ring-[#64748B]',
        selectBorder: 'border-[#64748B]/60'
      };
    }
    return {
      hex: '#3B82F6',
      border: 'border-blue-500/40',
      bg: 'bg-blue-950/20',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      metric: 'text-blue-300',
      selectRing: 'focus:ring-blue-400',
      selectBorder: 'border-blue-500/40'
    };
  };

  const brandA = getBrandCardStyle(companyA);
  const brandB = getBrandCardStyle(companyB);

  return (
    <div className="space-y-6">

      {/* ================= HERO: COMPANY VS COMPANY SELECTOR ================= */}
      <div className="p-6 sm:p-8 rounded-3xl glass-raised border border-glass-border space-y-6 relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Title */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-ios-blue/15 border border-ios-blue/30 text-ios-blue text-xs font-bold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Head-to-Head Intelligence Radar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Competitive Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select any two entities to immediately analyze what is happening between them, their tactical shifts, and analyst takeaways.
            </p>
          </div>

          {/* Quick Preset Matchup Pills */}
          {presets.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline">
                Quick Matchups:
              </span>
              {presets.map(([comp1, comp2], idx) => {
                const isSelected = 
                  (companyA === comp1 && companyB === comp2) || 
                  (companyA === comp2 && companyB === comp1);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCompanyA(comp1);
                      setCompanyB(comp2);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-ios-blue text-white shadow-md shadow-ios-blue/20'
                        : 'glass-pill text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {comp1} vs {comp2}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* The Two Company Selection Cards with "VS" Divider */}
        <div className="relative grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          
          {/* Company A Selection Card (Left, 5 Cols) */}
          <div className={`md:col-span-5 p-5 rounded-2xl glass-base border-2 ${brandA.border} ${brandA.bg} space-y-3.5 shadow-lg relative transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${brandA.badge}`}>
                Company A ({brandA.hex})
              </span>
              {metricA && (
                <span className={`text-xs font-mono font-bold ${brandA.metric} tabular-nums`}>
                  {metricA.value}{metricA.unit} {metricA.metric_display_name}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="company-a-select" className="text-xs font-semibold text-slate-400 block">
                Select Primary Entity:
              </label>
              <select
                id="company-a-select"
                value={companyA}
                onChange={(e) => setCompanyA(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border ${brandA.selectBorder} text-sm font-bold text-white focus:outline-none focus:ring-2 ${brandA.selectRing} cursor-pointer transition-all`}
              >
                {allCompanies.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c} {c === companyB ? '(Currently Company B)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
              <span>Tracked Developments:</span>
              <span className="font-bold text-white font-mono">{movesA.length} moves logged</span>
            </div>
          </div>

          {/* Interactive "VS" Pill & Swap Button (Center, 1 Col) */}
          <div className="md:col-span-1 flex flex-col items-center justify-center py-2 md:py-0">
            <button
              onClick={handleSwap}
              aria-label="Swap Company A and Company B"
              title="Click to swap Company A and Company B"
              className="group flex flex-col items-center justify-center p-3 rounded-2xl glass-control border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/20 active:scale-95 transition-all shadow-md"
            >
              <span className="text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-300">
                VS
              </span>
              <ArrowRightLeft className="w-4 h-4 text-purple-300 group-hover:rotate-180 transition-transform duration-300 mt-1" />
            </button>
          </div>

          {/* Company B Selection Card (Right, 5 Cols) */}
          <div className={`md:col-span-5 p-5 rounded-2xl glass-base border-2 ${brandB.border} ${brandB.bg} space-y-3.5 shadow-lg relative transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${brandB.badge}`}>
                Company B ({brandB.hex})
              </span>
              {metricB && (
                <span className={`text-xs font-mono font-bold ${brandB.metric} tabular-nums`}>
                  {metricB.value}{metricB.unit} {metricB.metric_display_name}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="company-b-select" className="text-xs font-semibold text-slate-400 block">
                Select Competing Entity:
              </label>
              <select
                id="company-b-select"
                value={companyB}
                onChange={(e) => setCompanyB(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border ${brandB.selectBorder} text-sm font-bold text-white focus:outline-none focus:ring-2 ${brandB.selectRing} cursor-pointer transition-all`}
              >
                {allCompanies.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c} {c === companyA ? '(Currently Company A)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
              <span>Tracked Developments:</span>
              <span className="font-bold text-white font-mono">{movesB.length} moves logged</span>
            </div>
          </div>

        </div>

      </div>

      {/* ================= EXECUTIVE HEAD-TO-HEAD SYNTHESIS ================= */}
      <div className="p-6 sm:p-7 rounded-3xl glass-raised border border-glass-border space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              What Is Happening: {companyA} vs {companyB}
            </h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full glass-control text-slate-400 font-mono">
            Direct Comparative Matrix
          </span>
        </div>

        {/* Metric Comparison Bar if metrics are available */}
        {metricA && metricB && (
          <div className="p-4 rounded-2xl glass-base border border-glass-border space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-blue-400">{companyA}: {metricA.value}{metricA.unit}</span>
              <span className="text-slate-400">{metricA.metric_display_name}</span>
              <span className="text-purple-400">{companyB}: {metricB.value}{metricB.unit}</span>
            </div>
            
            {/* Visual ratio bar */}
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="bg-gradient-to-r from-blue-600 to-sky-400 h-full transition-all duration-500" 
                style={{ width: `${(metricA.value / (metricA.value + metricB.value)) * 100}%` }}
                title={`${companyA}: ${metricA.value}${metricA.unit}`}
              />
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500" 
                style={{ width: `${(metricB.value / (metricA.value + metricB.value)) * 100}%` }}
                title={`${companyB}: ${metricB.value}${metricB.unit}`}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Source: {metricA.source}</span>
              <span>Source: {metricB.source}</span>
            </div>
          </div>
        )}

        {/* Comparative Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl glass-base border border-blue-500/20 space-y-1.5">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
              {companyA} Tactical Focus
            </span>
            <p className="text-slate-300 leading-relaxed">
              {movesA.length > 0 
                ? `Active in ${Array.from(new Set(movesA.map(m => formatCategoryLabel(m.category)))).join(', ')}. Most recent move: "${movesA[0].headline}".`
                : `No specific recent moves logged in this period. Maintaining current market position.`
              }
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-base border border-purple-500/20 space-y-1.5">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
              {companyB} Tactical Focus
            </span>
            <p className="text-slate-300 leading-relaxed">
              {movesB.length > 0 
                ? `Active in ${Array.from(new Set(movesB.map(m => formatCategoryLabel(m.category)))).join(', ')}. Most recent move: "${movesB[0].headline}".`
                : `No specific recent moves logged in this period. Maintaining current market position.`
              }
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
              Analyst Friction Point
            </span>
            <p className="text-slate-200 leading-relaxed">
              {companyA === companyB 
                ? `You have selected the same company for both sides. Select two distinct competitors above to analyze competitive friction.`
                : `Competitive intensity between ${companyA} and ${companyB} is shaped by tariff adjustments, product rollouts, and regulatory benchmarks. Monitor subscriber migration trends closely.`
              }
            </p>
          </div>
        </div>

      </div>

      {/* ================= CATEGORY FILTER TABS ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400">Filter Moves:</span>
          <div className="inline-flex rounded-xl glass-control p-1 gap-1">
            {[
              { id: 'all', label: 'All Moves' },
              { id: 'price_change', label: 'Price Changes' },
              { id: 'product_launch', label: 'Product Launches' },
              { id: 'partnership', label: 'Partnerships' },
              { id: 'regulatory', label: 'Regulatory' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-ios-blue text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-blue-400 font-bold">{movesA.length}</span> for {companyA} vs <span className="text-purple-400 font-bold">{movesB.length}</span> for {companyB}
        </div>
      </div>

      {/* ================= SIDE-BY-SIDE DUAL STREAM: COMPANY A vs COMPANY B ================= */}
      {loading ? (
        <div className="p-16 text-center animate-pulse text-xs text-slate-400 rounded-3xl glass-raised">
          Loading competitor data and strategic developments...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ================= LEFT COLUMN: COMPANY A DEVELOPMENTS ================= */}
          <div className="space-y-4">
            
            {/* Column Header */}
            <div className="p-4 rounded-2xl glass-raised border-l-4 border-blue-500 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-white text-sm">{companyA}</h4>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                {movesA.length} {movesA.length === 1 ? 'Move' : 'Moves'}
              </span>
            </div>

            {/* List of moves for Company A */}
            {movesA.length === 0 ? (
              <div className="p-8 text-center rounded-2xl glass-base border border-dashed border-glass-border text-xs text-slate-400">
                No developments recorded for <strong className="text-white">{companyA}</strong> in this category.
              </div>
            ) : (
              movesA.map((dev) => (
                <div
                  key={dev.id}
                  className="p-5 rounded-2xl glass-base border border-glass-border hover:border-blue-500/40 transition-all space-y-3.5 shadow-sm"
                >
                  {/* Category & Date */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(dev.category)}`}>
                      {formatCategoryLabel(dev.category)}
                    </span>
                    <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 tabular-nums">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(dev.published_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Headline & Details */}
                  <div>
                    <h5 className="text-sm font-bold text-white leading-snug mb-1.5">
                      {dev.headline}
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dev.details}
                    </p>
                  </div>

                  {/* Why this matters to Business Analysts */}
                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start space-x-2.5 text-xs">
                    <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-300 block mb-0.5 text-[10px] uppercase tracking-wider">
                        Business Analyst Takeaway:
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        {dev.business_significance}
                      </p>
                    </div>
                  </div>

                  {/* Source */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    <span>Source: {dev.source}</span>
                    {dev.source_url && (
                      <a
                        href={dev.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ================= RIGHT COLUMN: COMPANY B DEVELOPMENTS ================= */}
          <div className="space-y-4">
            
            {/* Column Header */}
            <div className="p-4 rounded-2xl glass-raised border-l-4 border-purple-500 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold text-white text-sm">{companyB}</h4>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                {movesB.length} {movesB.length === 1 ? 'Move' : 'Moves'}
              </span>
            </div>

            {/* List of moves for Company B */}
            {movesB.length === 0 ? (
              <div className="p-8 text-center rounded-2xl glass-base border border-dashed border-glass-border text-xs text-slate-400">
                No developments recorded for <strong className="text-white">{companyB}</strong> in this category.
              </div>
            ) : (
              movesB.map((dev) => (
                <div
                  key={dev.id}
                  className="p-5 rounded-2xl glass-base border border-glass-border hover:border-purple-500/40 transition-all space-y-3.5 shadow-sm"
                >
                  {/* Category & Date */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(dev.category)}`}>
                      {formatCategoryLabel(dev.category)}
                    </span>
                    <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 tabular-nums">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(dev.published_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Headline & Details */}
                  <div>
                    <h5 className="text-sm font-bold text-white leading-snug mb-1.5">
                      {dev.headline}
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dev.details}
                    </p>
                  </div>

                  {/* Why this matters to Business Analysts */}
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-start space-x-2.5 text-xs">
                    <Lightbulb className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-purple-300 block mb-0.5 text-[10px] uppercase tracking-wider">
                        Business Analyst Takeaway:
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        {dev.business_significance}
                      </p>
                    </div>
                  </div>

                  {/* Source */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    <span>Source: {dev.source}</span>
                    {dev.source_url && (
                      <a
                        href={dev.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ================= PERSISTENT WATCHLIST DRAWER (COLLAPSED BY DEFAULT) ================= */}
      <div className="pt-4">
        <div className="rounded-2xl glass-base border border-glass-border overflow-hidden">
          <button
            onClick={() => setShowWatchlistSection(!showWatchlistSection)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-ios-blue" />
              <span>Persistent Watchlist Management ({watchlist.length} Monitored)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <span className="text-[11px] font-normal hidden sm:inline">Add/remove entities to database</span>
              {showWatchlistSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showWatchlistSection && (
            <div className="p-5 border-t border-glass-border space-y-4 bg-slate-950/30">
              {/* Watchlist Chips */}
              {watchlist.length === 0 ? (
                <div className="p-4 rounded-xl glass-base text-center text-xs text-slate-400">
                  No entities currently bookmarked. Add an entity below to persist across sessions.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {watchlist.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl glass-control flex items-start justify-between gap-2 border border-glass-border"
                    >
                      <div>
                        <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
                          <BookmarkCheck className="w-3.5 h-3.5 text-ios-blue flex-shrink-0" />
                          <span>{item.company_name}</span>
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">"{item.notes}"</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveWatchlist(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add form */}
              <form onSubmit={handleAddWatchlist} className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <select
                  value={selectedCompanyToAdd}
                  onChange={(e) => setSelectedCompanyToAdd(e.target.value)}
                  className="w-full sm:w-56 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white focus:outline-none focus:ring-1 focus:ring-ios-blue cursor-pointer"
                  required
                >
                  <option value="" className="bg-slate-900 text-white">Select Entity...</option>
                  {allCompanies
                    .filter(c => !watchlist.some(w => w.company_name.toLowerCase() === c.toLowerCase()))
                    .map(c => (
                      <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                    ))
                  }
                </select>

                <input
                  type="text"
                  placeholder="Optional analyst thesis note..."
                  value={noteToAdd}
                  onChange={(e) => setNoteToAdd(e.target.value)}
                  className="w-full flex-1 px-3 py-2 rounded-xl glass-control text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-ios-blue"
                />

                <button
                  type="submit"
                  disabled={!selectedCompanyToAdd || isSubmitting}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-ios-blue hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Add Watch Target'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
