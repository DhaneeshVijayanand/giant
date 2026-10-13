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
      <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Strict Data Integrity: Metrics are sourced from official published regulatory reports (TRAI, NPCI, Vahan) with explicit periods, units, and sources.
          </span>
        </div>
        <span className="font-mono text-[11px] text-accent-blue px-2.5 py-1 rounded bg-accent-blue/10 border border-accent-blue/20">
          Zero Fabricated Share Figures
        </span>
      </div>

      {/* Historical Trend Chart Card */}
      {historicalMetrics.length > 0 && (
        <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-blue" />
                6-Month Historical Progression (Official Periodic Series)
              </h3>
              <p className="text-xs text-slate-400">
                Official monthly metric trajectories across verified filing cycles.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-400 bg-navy-950 px-3 py-1 rounded border border-navy-800">
              Source: {historicalMetrics[0]?.source}
            </div>
          </div>

          {/* Clean Responsive SVG Trend Visualization */}
          <div className="h-44 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-navy-800">
            {historicalMetrics.slice(0, 12).map((item, idx) => {
              // Normalized height percent (base 100)
              const maxVal = Math.max(...historicalMetrics.map(m => m.value), 1);
              const heightPct = Math.max(15, (item.value / maxVal) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div className="text-[10px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {item.value}{item.unit}
                  </div>
                  <div 
                    className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-accent-blue/40 to-accent-blue group-hover:to-accent-violet transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-400 font-medium mt-2 truncate w-full text-center">
                    {item.period}
                  </span>
                  <span className="text-[9px] text-slate-500 truncate w-full text-center font-mono">
                    {item.entity_name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Competitor Benchmark Table */}
      <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent-violet" />
              Competitor Benchmark Table (Official Reports)
            </h3>
            <p className="text-xs text-slate-400">
              Comparing verified performance indicators. Unreported metrics display "Data not available".
            </p>
          </div>

          {metricTypes.length > 0 && (
            <select
              value={selectedMetricType}
              onChange={(e) => setSelectedMetricType(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-xs text-slate-200 focus:outline-none focus:border-accent-blue"
            >
              <option value="all">All Available Metrics</option>
              {metricTypes.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center animate-pulse text-xs text-slate-400">
            Loading official regulatory indicators...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-950 text-slate-400 uppercase text-[10px] font-bold border-b border-navy-800">
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
              <tbody className="divide-y divide-navy-800/60">
                {metricsByCompany.map(({ company, metrics: compM }) => {
                  const filteredCompM = selectedMetricType === 'all'
                    ? compM
                    : compM.filter(m => m.metric_name === selectedMetricType);

                  if (filteredCompM.length === 0) {
                    return (
                      <tr key={company} className="hover:bg-navy-950/40">
                        <td className="py-3 px-4 font-semibold text-white flex items-center gap-1.5">
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
                    <tr key={`${m.id}-${m.metric_name}`} className="hover:bg-navy-950/40">
                      <td className="py-3 px-4 font-semibold text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-accent-blue" />
                        {m.entity_name}
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-medium">
                        {m.metric_display_name}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-accent-blue text-sm">
                        {m.value > 0 && m.metric_name.includes('net_adds') ? `+${m.value}` : m.value}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {m.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {m.period}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {m.source_url ? (
                          <a 
                            href={m.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-accent-blue hover:underline inline-flex items-center gap-1"
                          >
                            <span>{m.source}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span>{m.source}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px] max-w-xs truncate" title={m.notes}>
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
