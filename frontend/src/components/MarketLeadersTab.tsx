import React, { useEffect, useState } from 'react';
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
  const historicalMetrics = metrics.filter((m) => m.metric_name.startsWith('historical_'));

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
        const displayedMetrics = historicalMetrics.slice(0, 12);
        const maxVal = Math.max(...displayedMetrics.map(m => m.value), 1);

        return (
          <div className="p-6 sm:p-7 rounded-3xl glass-raised space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                  6-Month Historical Progression (Official Periodic Series)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Official monthly metric trajectories across verified filing cycles.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 glass-control px-3.5 py-1.5 rounded-full border border-glass-border w-fit shadow-sm">
                Source: {displayedMetrics[0]?.source}
              </div>
            </div>

            {/* High-Visibility Modern Glass Bar Chart */}
            <div className="rounded-2xl glass-base p-4 sm:p-6 border border-glass-border space-y-3">
              {/* Plotting Canvas with Reference Grid */}
              <div className="relative h-60 w-full flex items-end gap-2 sm:gap-4 pt-10 pb-1 px-2 border-b-2 border-slate-300/50 dark:border-white/25">
                
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-x-0 top-4 border-b border-dashed border-slate-300/30 dark:border-white/10 pointer-events-none flex justify-between px-2">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 -mt-2.5">
                    Max: {maxVal.toLocaleString()}
                  </span>
                </div>
                <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-300/30 dark:border-white/10 pointer-events-none flex justify-between px-2">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 -mt-2.5">
                    Mid: {Math.round(maxVal / 2).toLocaleString()}
                  </span>
                </div>

                {/* Bars */}
                {displayedMetrics.map((item, idx) => {
                  const heightPct = Math.min(100, Math.max(18, (item.value / maxVal) * 100));

                  return (
                    <div 
                      key={idx} 
                      className="flex-1 flex flex-col items-center justify-end h-full z-10 group cursor-pointer"
                    >
                      {/* Persistent High-Contrast Value Badge */}
                      <div className="mb-2.5 px-2 py-0.5 rounded-lg bg-white/95 dark:bg-slate-900/95 border border-slate-300/80 dark:border-cyan-400/40 text-[10px] sm:text-[11px] font-mono font-bold tabular-nums text-slate-900 dark:text-cyan-300 shadow-md group-hover:scale-110 group-hover:border-cyan-400 transition-transform whitespace-nowrap">
                        {item.value.toLocaleString()} {item.unit}
                      </div>

                      {/* Solid Luminous Gradient Bar with High-Contrast Border & Glow */}
                      <div 
                        className="w-full max-w-[46px] rounded-t-xl bg-gradient-to-t from-blue-600 via-sky-500 to-cyan-400 dark:from-blue-600 dark:via-sky-400 dark:to-cyan-300 border-t-2 border-x border-cyan-200/60 shadow-lg shadow-sky-500/30 group-hover:brightness-125 group-hover:shadow-cyan-400/60 transition-all duration-200"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Dedicated Label Row Below Baseline */}
              <div className="flex items-start justify-between gap-2 sm:gap-4 px-2 pt-1.5 text-center">
                {displayedMetrics.map((item, idx) => (
                  <div key={idx} className="flex-1 min-w-0">
                    <div className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.period}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-mono text-sky-600 dark:text-sky-400 font-semibold truncate mt-0.5">
                      {item.entity_name}
                    </div>
                  </div>
                ))}
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
              className="px-3.5 py-1.5 rounded-xl glass-control text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-ios-blue/40"
            >
              <option value="all">All Available Metrics</option>
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
