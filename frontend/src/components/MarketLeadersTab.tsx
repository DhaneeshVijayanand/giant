import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ExternalLink, 
  BarChart3, 
  ShieldCheck, 
  Building2
} from 'lucide-react';
import { fetchCompetitorMetrics } from '../services/api';
import { CompetitorMetric } from '../types';

interface MarketLeadersTabProps {
  industrySlug: string;
  trackedCompanies: string[];
}

export const MarketLeadersTab: React.FC<MarketLeadersTabProps> = ({ industrySlug, trackedCompanies }) => {
  const [metrics, setMetrics] = useState<CompetitorMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMetricType, setSelectedMetricType] = useState<string>('all');
  const [selectedHistoricalCompany, setSelectedHistoricalCompany] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchCompetitorMetrics(industrySlug);
        setMetrics(data);
      } catch (err) {
        console.error('Error loading competitor metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [industrySlug]);

  // Group metrics by company
  const metricsByCompany = trackedCompanies.map((company) => {
    const compMetrics = metrics.filter((m) => m.entity_name.toLowerCase() === company.toLowerCase());
    return {
      company,
      metrics: compMetrics,
    };
  });

  // Unique metric names for filter
  const metricTypes = Array.from(new Set(metrics.map((m) => m.metric_name)));

  // Historical time-series metrics (for charting)
  const historicalMetrics = useMemo(() => {
    return metrics.filter((m) => m.metric_name.startsWith('historical_'));
  }, [metrics]);

  const historicalCompanies = useMemo(() => {
    return Array.from(new Set(historicalMetrics.map((m) => m.entity_name)));
  }, [historicalMetrics]);

  // Sort chronologically ascending so trends read left-to-right (past -> present)
  const sortedHistoricalMetrics = useMemo(() => {
    return [...historicalMetrics].sort((a, b) => a.period_date.localeCompare(b.period_date));
  }, [historicalMetrics]);

  // Unique chronological periods
  const historicalPeriods = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    sortedHistoricalMetrics.forEach((m) => {
      if (!seen.has(m.period)) {
        seen.add(m.period);
        list.push(m.period);
      }
    });
    return list;
  }, [sortedHistoricalMetrics]);

  const getCompanyStyle = (companyName: string) => {
    const name = companyName.toLowerCase();
    if (name.includes('jio')) {
      return {
        hex: '#3B82F6',
        barStyle: { background: 'linear-gradient(to top, #1d4ed8, #2563eb, #3B82F6)' },
        border: 'border-[#3B82F6]',
        shadow: 'shadow-blue-500/30 group-hover:shadow-blue-400/80',
        badgeText: 'text-[#60a5fa]',
        badgeBorder: 'border-[#3B82F6]/60',
        dot: 'bg-[#3B82F6] ring-2 ring-[#3B82F6]/30',
        pillActive: 'bg-[#3B82F6] text-white font-black shadow-md shadow-blue-500/30',
      };
    } else if (name.includes('airtel')) {
      return {
        hex: '#A78BFA',
        barStyle: { background: 'linear-gradient(to top, #6d28d9, #8b5cf6, #A78BFA)' },
        border: 'border-[#A78BFA]',
        shadow: 'shadow-purple-500/30 group-hover:shadow-violet-400/80',
        badgeText: 'text-[#c4b5fd]',
        badgeBorder: 'border-[#A78BFA]/60',
        dot: 'bg-[#A78BFA] ring-2 ring-[#A78BFA]/30',
        pillActive: 'bg-[#A78BFA] text-slate-950 font-black shadow-md shadow-purple-500/30',
      };
    } else if (name.includes('vodafone') || name.includes('vi')) {
      return {
        hex: '#FBBF24',
        barStyle: { background: 'linear-gradient(to top, #b45309, #d97706, #FBBF24)' },
        border: 'border-[#FBBF24]',
        shadow: 'shadow-amber-500/30 group-hover:shadow-amber-400/80',
        badgeText: 'text-[#fde68a]',
        badgeBorder: 'border-[#FBBF24]/60',
        dot: 'bg-[#FBBF24] ring-2 ring-[#FBBF24]/30',
        pillActive: 'bg-[#FBBF24] text-slate-950 font-black shadow-md shadow-amber-500/30',
      };
    } else if (name.includes('bsnl')) {
      return {
        hex: '#64748B',
        barStyle: { background: 'linear-gradient(to top, #334155, #475569, #64748B)' },
        border: 'border-[#64748B]',
        shadow: 'shadow-slate-500/30 group-hover:shadow-slate-400/80',
        badgeText: 'text-[#cbd5e1]',
        badgeBorder: 'border-[#64748B]/70',
        dot: 'bg-[#64748B] ring-2 ring-[#64748B]/30',
        pillActive: 'bg-[#64748B] text-white font-black shadow-md shadow-slate-500/30',
      };
    } else {
      return {
        hex: '#818CF8',
        barStyle: { background: 'linear-gradient(to top, #4338ca, #4f46e5, #818CF8)' },
        border: 'border-indigo-400/80',
        shadow: 'shadow-indigo-500/30 group-hover:shadow-indigo-400/80',
        badgeText: 'text-indigo-300',
        badgeBorder: 'border-indigo-400/60',
        dot: 'bg-indigo-400 ring-2 ring-indigo-400/30',
        pillActive: 'bg-indigo-500 text-white font-black shadow-md shadow-indigo-500/30',
      };
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Official Data Methodology Banner */}
      <div className="p-4 rounded-2xl glass-base flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <span>
            Strict Data Integrity: Metrics are sourced from official published regulatory reports (TRAI, NPCI, Vahan) with explicit periods, units, and sources.
          </span>
        </div>
        <span className="font-mono text-[11px] text-ios-blue px-3 py-1 rounded-full bg-ios-blue/10 border border-ios-blue/20 flex-shrink-0">
          Zero Fabricated Share Figures
        </span>
      </div>

      {/* Historical Trend Chart Card */}
      {historicalMetrics.length > 0 && (() => {
        const activeItems = selectedHistoricalCompany === 'all'
          ? sortedHistoricalMetrics
          : sortedHistoricalMetrics.filter((m) => m.entity_name === selectedHistoricalCompany);

        const maxVal = Math.max(...activeItems.map((m) => m.value), 1);
        const sourceLabel = historicalMetrics[0]?.source || 'Official Periodic Reports';

        return (
          <div className="p-6 sm:p-7 rounded-3xl glass-raised space-y-6 overflow-hidden">
            {/* Header with Title and Entity Selector */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                  6-Month Historical Progression (Official Periodic Series)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Official monthly metric trajectories across verified filing cycles.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Company Filter Tabs (When multiple companies exist) */}
                {historicalCompanies.length > 1 && (
                  <div className="inline-flex rounded-xl glass-control p-1 text-xs">
                    <button
                      onClick={() => setSelectedHistoricalCompany('all')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        selectedHistoricalCompany === 'all'
                          ? 'bg-ios-blue text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {historicalCompanies.length > 2 ? 'Compare All' : 'Compare Both'}
                    </button>
                    {historicalCompanies.map((comp) => {
                      const isSelected = selectedHistoricalCompany === comp;
                      return (
                        <button
                          key={comp}
                          onClick={() => setSelectedHistoricalCompany(comp)}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                            isSelected
                              ? 'bg-ios-blue text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {comp}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Source Pill */}
                <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 glass-control px-3.5 py-1.5 rounded-full border border-glass-border shadow-sm">
                  Source: {sourceLabel}
                </div>
              </div>
            </div>

            {/* Legend for Multi-Company Comparison with Vibrant Indicators */}
            {selectedHistoricalCompany === 'all' && historicalCompanies.length > 1 && (
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold px-1">
                {historicalCompanies.map((comp) => {
                  const style = getCompanyStyle(comp);
                  return (
                    <div key={comp} className="flex items-center space-x-1.5">
                      <span className={`w-3 h-3 rounded-full ${style.dot} shadow-sm`} />
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{comp}</span>
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">({style.hex})</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modern Glass Bar Chart Container with Horizontal Scroll Protection */}
            <div className="rounded-2xl glass-base p-4 sm:p-6 border border-glass-border space-y-3 overflow-hidden">
              <div className="w-full overflow-x-auto min-w-0 pb-1 scrollbar-thin">
                <div className="min-w-[620px]">
                  {/* Plotting Canvas with Reference Grid */}
                  <div className="relative h-64 w-full flex items-end justify-between gap-3 sm:gap-6 pt-10 pb-1 px-3 border-b-2 border-slate-300/50 dark:border-white/25">
                    
                    {/* Horizontal Guide Lines */}
                    <div className="absolute inset-x-0 top-4 border-b border-dashed border-slate-300/30 dark:border-white/10 pointer-events-none flex justify-between px-2">
                      <span className="text-[10px] font-mono text-slate-400 -mt-2.5">
                        Max: {maxVal.toLocaleString()}
                      </span>
                    </div>
                    <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-300/30 dark:border-white/10 pointer-events-none flex justify-between px-2">
                      <span className="text-[10px] font-mono text-slate-400 -mt-2.5">
                        Mid: {Math.round(maxVal / 2).toLocaleString()}
                      </span>
                    </div>

                    {/* Bars Display */}
                    {selectedHistoricalCompany === 'all' && historicalCompanies.length > 1 ? (
                      // Grouped side-by-side bars by Period
                      historicalPeriods.map((period) => {
                        const periodItems = sortedHistoricalMetrics.filter((m) => m.period === period);
                        return (
                          <div 
                            key={period} 
                            className="flex-1 flex flex-col items-center justify-end h-full z-10 min-w-[90px] max-w-[160px]"
                          >
                            <div className="flex items-end justify-center gap-1 sm:gap-1.5 w-full h-full pb-0.5">
                              {periodItems.map((item) => {
                                const style = getCompanyStyle(item.entity_name);
                                const heightPct = Math.min(100, Math.max(16, (item.value / maxVal) * 100));

                                return (
                                  <div 
                                    key={item.id} 
                                    className="flex flex-col items-center justify-end h-full group cursor-pointer flex-1 max-w-[28px] sm:max-w-[34px]"
                                  >
                                    {/* Value Badge */}
                                    <div className={`mb-1.5 px-1 py-0.5 rounded-md bg-slate-900/95 border ${style.badgeBorder} text-[9px] sm:text-[10px] font-mono font-bold tabular-nums ${style.badgeText} shadow-md group-hover:scale-110 transition-transform whitespace-nowrap`}>
                                      {item.value}{item.unit}
                                    </div>

                                    {/* Vibrant Gradient Bar */}
                                    <div 
                                      className={`w-full rounded-t-lg border-t-2 border-x ${style.border} shadow-lg ${style.shadow} group-hover:brightness-125 transition-all duration-200`}
                                      style={{ height: `${heightPct}%`, ...style.barStyle }}
                                      title={`${item.entity_name} (${item.period}): ${item.value} ${item.unit} [${style.hex}]`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // Single entity view (or single company in industry)
                      activeItems.map((item) => {
                        const style = getCompanyStyle(item.entity_name);
                        const heightPct = Math.min(100, Math.max(16, (item.value / maxVal) * 100));

                        return (
                          <div 
                            key={item.id} 
                            className="flex-1 flex flex-col items-center justify-end h-full z-10 group cursor-pointer max-w-[80px]"
                          >
                            {/* Value Badge */}
                            <div className={`mb-2.5 px-2 py-0.5 rounded-lg bg-slate-900/95 border ${style.badgeBorder} text-[10px] sm:text-[11px] font-mono font-bold tabular-nums ${style.badgeText} shadow-md group-hover:scale-110 transition-transform whitespace-nowrap`}>
                              {item.value.toLocaleString()} {item.unit}
                            </div>

                            {/* Vibrant Gradient Bar */}
                            <div 
                              className={`w-full max-w-[48px] rounded-t-xl border-t-2 border-x ${style.border} shadow-lg ${style.shadow} group-hover:brightness-125 transition-all duration-200`}
                              style={{ height: `${heightPct}%`, ...style.barStyle }}
                              title={`${item.entity_name} (${item.period}): ${item.value} ${item.unit} [${style.hex}]`}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dedicated Label Row Below Baseline */}
                  <div className="flex items-start justify-between gap-3 sm:gap-6 px-3 pt-2 text-center">
                    {selectedHistoricalCompany === 'all' && historicalCompanies.length > 1 ? (
                      historicalPeriods.map((period) => (
                        <div key={period} className="flex-1 min-w-[90px] max-w-[160px]">
                          <div className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
                            {period}
                          </div>
                        </div>
                      ))
                    ) : (
                      activeItems.map((item) => (
                        <div key={item.id} className="flex-1 max-w-[80px]">
                          <div className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
                            {item.period}
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-mono text-sky-600 dark:text-sky-400 font-semibold truncate mt-0.5">
                            {item.entity_name}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Competitor Benchmark Table */}
      <div className="p-6 sm:p-7 rounded-3xl glass-raised space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-ios-indigo" />
              Competitor Benchmark Table (Official Reports)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Comparing verified performance indicators. Unreported metrics display "Data not available".
            </p>
          </div>

          {metricTypes.length > 0 && (
            <select
              value={selectedMetricType}
              onChange={(e) => setSelectedMetricType(e.target.value)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-ios-blue cursor-pointer shadow-md"
            >
              <option value="all" className="bg-slate-900 text-white">All Available Metrics</option>
              {metricTypes.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-white">{t.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center animate-pulse text-xs text-slate-600 dark:text-slate-400">
            Loading official regulatory indicators...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-glass-border">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="glass-control text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-glass-border">
                <tr>
                  <th className="py-3 px-4">Company / Entity</th>
                  <th className="py-3 px-4">Metric Indicator</th>
                  <th className="py-3 px-4">Reported Value</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Official Source</th>
                  <th className="py-3 px-4 text-right">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {metricsByCompany.map(({ company, metrics: compM }) => {
                  const filteredCompM = selectedMetricType === 'all'
                    ? compM
                    : compM.filter(m => m.metric_name === selectedMetricType);

                  if (filteredCompM.length === 0) {
                    return (
                      <tr key={company} className="hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {company}
                        </td>
                        <td className="py-3 px-4 text-slate-500 italic" colSpan={5}>
                          Data not available (Unpublished or non-public entity in this cycle)
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                          Private / N/A
                        </td>
                      </tr>
                    );
                  }

                  return filteredCompM.map((m) => (
                    <tr key={`${m.id}-${m.metric_name}`} className="hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-ios-blue" />
                        {m.entity_name}
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        {m.metric_display_name}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-ios-blue text-sm tabular-nums">
                        {m.value > 0 && m.metric_name.includes('net_adds') ? `+${m.value}` : m.value}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px] tabular-nums">
                        {m.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300 tabular-nums">
                        {m.period}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {m.source_url ? (
                          <a 
                            href={m.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-ios-blue hover:underline inline-flex items-center gap-1"
                          >
                            <span>{m.source}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span>{m.source}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 text-[11px] max-w-xs truncate" title={m.notes}>
                        {m.notes}
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
