import React, { useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ShieldAlert, 
  TrendingUp, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { 
  fetchIndustryReport, 
  getReportCsvExportUrl, 
  getReportPdfExportUrl, 
  fetchIndustryCompanies 
} from '../services/api';
import { IndustryReport } from '../types';

interface ReportsExportsTabProps {
  industrySlug: string;
}

export const ReportsExportsTab: React.FC<ReportsExportsTabProps> = ({ industrySlug }) => {
  const [report, setReport] = useState<IndustryReport | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedIndustry, setSelectedIndustry] = useState<string>(industrySlug);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [dateRangeOption, setDateRangeOption] = useState<string>('all');

  const computeDates = (option: string) => {
    if (option === 'all') return { startDate: undefined, endDate: undefined };
    const now = new Date();
    const days = option === '7d' ? 7 : option === '30d' ? 30 : 90;
    const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return {
      startDate: past.toISOString(),
      endDate: now.toISOString()
    };
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const { startDate, endDate } = computeDates(dateRangeOption);
      const [repData, compList] = await Promise.all([
        fetchIndustryReport(selectedIndustry, startDate, endDate, selectedCompany || undefined),
        fetchIndustryCompanies(selectedIndustry)
      ]);
      setReport(repData);
      setCompanies(compList);
    } catch (err: any) {
      setError(err.message || 'Failed to generate industry report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [selectedIndustry, dateRangeOption, selectedCompany]);

  const { startDate, endDate } = computeDates(dateRangeOption);
  const csvUrl = getReportCsvExportUrl(selectedIndustry, startDate, endDate, selectedCompany || undefined);
  const pdfUrl = getReportPdfExportUrl(selectedIndustry, startDate, endDate, selectedCompany || undefined);

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none">
      
      {/* Controls & Export Actions Bar */}
      <div className="glass-raised rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-accent-blue" />
              Industry Reports & Verified Data Exports
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generate structured executive summaries, market share benchmarks, churn findings, and multi-format exports.
            </p>
          </div>

          {/* Quick Export Action Buttons */}
          <div className="flex items-center space-x-2.5 self-start md:self-auto">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="ios-btn-primary px-5 py-2.5 text-xs flex items-center space-x-2 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
            </a>

            <a
              href={csvUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="glass-pill px-4 py-2.5 rounded-full text-slate-800 dark:text-slate-100 text-xs font-semibold flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-accent-green" />
              <span>Export CSV (Safe)</span>
            </a>
          </div>
        </div>

        {/* Filter Selection Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200/40 dark:border-white/10 text-xs">
          
          {/* Industry Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Industry:</span>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3.5 py-1.5 rounded-full glass-base text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-blue cursor-pointer"
            >
              <option value="telecom">Telecom</option>
              <option value="fintech">Fintech & Payments</option>
              <option value="ev">Electric Vehicles</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Date Range:</span>
            <select
              value={dateRangeOption}
              onChange={(e) => setDateRangeOption(e.target.value)}
              className="px-3.5 py-1.5 rounded-full glass-base text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-blue cursor-pointer"
            >
              <option value="all">All Available Records</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          {/* Company Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Company:</span>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-3.5 py-1.5 rounded-full glass-base text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-blue cursor-pointer"
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Refresh button */}
          <button
            onClick={loadReport}
            className="p-2 rounded-full glass-pill text-slate-600 dark:text-slate-300 ml-auto"
            title="Refresh Report"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-accent-blue' : ''}`} />
          </button>
        </div>

        {/* CSV Formula Injection Protection Notice */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
          <span>
            CSV exports feature OWASP formula injection protection: cells with =, +, -, @ are sanitized to prevent macro execution in Excel and Calc.
          </span>
        </div>

      </div>

      {error && (
        <div className="p-4 rounded-2xl glass-base border-red-500/40 text-xs text-accent-red flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-accent-red flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !report && (
        <div className="py-24 text-center text-slate-500 dark:text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Compiling multi-section intelligence report...
        </div>
      )}

      {/* REPORT PREVIEW CANVAS */}
      {report && (
        <div className="p-6 sm:p-10 rounded-3xl glass-raised space-y-8 text-xs shadow-2xl">
          
          {/* Document Header */}
          <div className="space-y-3 pb-6 border-b border-slate-200/40 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-accent-blue uppercase tracking-widest font-bold">
                  {report.report_id}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  Giant Intelligence Report: {report.industry_name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Primary Regulator: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{report.regulator}</strong>
                </p>
              </div>

              <div className="text-right sm:text-right text-[11px] text-slate-500 dark:text-slate-400 font-mono space-y-0.5 self-start sm:self-auto tabular-nums">
                <div>Generated: <span className="text-slate-800 dark:text-slate-200">{formatDateTime(report.generated_at)}</span></div>
                <div>Scope: <span className="text-slate-800 dark:text-slate-200">{report.filters_applied.company}</span></div>
                <div>Articles Analyzed: <span className="text-accent-blue font-bold">{report.filters_applied.total_articles_analyzed}</span></div>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-purple" />
              1. Executive Summary (Four-Part Grounded Analysis)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Part 1: Facts */}
              <div className="p-4 sm:p-5 rounded-2xl glass-base space-y-2">
                <span className="text-[10px] uppercase font-bold text-accent-green block tracking-wider">
                  Part 1 • Verified Facts
                </span>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  {report.executive_summary.part_1_verified_facts.map((fact, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-[11px]">
                      <span className="text-accent-green font-bold">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Part 2: Interpretation */}
              <div className="p-4 sm:p-5 rounded-2xl glass-base space-y-2">
                <span className="text-[10px] uppercase font-bold text-accent-blue block tracking-wider">
                  Part 2 • Evidence-Based Interpretation
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {report.executive_summary.part_2_evidence_interpretation}
                </p>
              </div>

              {/* Part 3: Predictions */}
              <div className="p-4 sm:p-5 rounded-2xl glass-base space-y-2">
                <span className="text-[10px] uppercase font-bold text-accent-orange block tracking-wider">
                  Part 3 • Predictions & Assumptions (Explicitly Labeled)
                </span>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  {report.executive_summary.part_3_predictions_and_assumptions.map((pred, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-[11px]">
                      <span className="text-accent-orange font-bold">•</span>
                      <span>{pred}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Part 4: Actions */}
              <div className="p-4 sm:p-5 rounded-2xl glass-base space-y-2">
                <span className="text-[10px] uppercase font-bold text-accent-purple block tracking-wider">
                  Part 4 • Strategic Recommended Actions
                </span>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  {report.executive_summary.part_4_recommended_actions.map((act, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-[11px]">
                      <span className="text-accent-purple font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Section 2: Benchmarks */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-blue" />
                2. Official Competitor & Market Share Benchmarks
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Source: {report.competitor_metrics.source} • Period: {report.competitor_metrics.period}
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/40 dark:border-white/10 glass-base">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="glass-base text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200/40 dark:border-white/10">
                  <tr>
                    <th className="py-2.5 px-3.5">Entity Name</th>
                    <th className="py-2.5 px-3.5">Metric Name</th>
                    <th className="py-2.5 px-3.5 text-right">Value</th>
                    <th className="py-2.5 px-3.5">Unit</th>
                    <th className="py-2.5 px-3.5">Reporting Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40 dark:divide-white/10 font-mono tabular-nums">
                  {report.competitor_metrics.table.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white font-sans">{row.entity}</td>
                      <td className="py-2.5 px-3.5 font-sans">{row.metric}</td>
                      <td className="py-2.5 px-3.5 text-right font-black text-accent-blue">{row.value}</td>
                      <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400">{row.unit}</td>
                      <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400">{row.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Churn Findings */}
          {report.churn_findings && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  3. Customer Churn Intelligence Summary
                </h3>

                {report.churn_findings.metadata?.is_demo && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 font-bold text-[10px] uppercase">
                    Demo data
                  </span>
                )}
              </div>

              <div className="p-5 rounded-2xl glass-base grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono tabular-nums">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-sans font-bold">Dataset</span>
                  <span className="text-slate-900 dark:text-white font-bold">{report.churn_findings.metadata.dataset_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-sans font-bold">Sample Size</span>
                  <span className="text-accent-blue font-bold">{report.churn_findings.metadata.total_rows} records</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-sans font-bold">Primary Model</span>
                  <span className="text-slate-900 dark:text-white font-bold">Random Forest</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-sans font-bold">ROC-AUC / Accuracy</span>
                  <span className="text-accent-green font-bold">
                    {report.churn_findings.evaluation.models.random_forest.roc_auc} / {report.churn_findings.evaluation.models.random_forest.accuracy}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Key News */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-blue" />
              4. Key Verified Industry Developments & Source Citations
            </h3>

            <div className="space-y-2.5">
              {report.key_news.map((n) => (
                <div 
                  key={n.id}
                  className="p-3.5 rounded-2xl glass-base flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-800 dark:text-slate-200 hover:text-accent-blue flex items-center space-x-1.5"
                  >
                    <span>{n.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  </a>

                  <div className="flex items-center space-x-3 text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-full glass-pill text-accent-blue font-bold">
                      {n.source_name}
                    </span>
                    <span>{formatDateTime(n.published_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Disclaimer */}
          <div className="p-4 rounded-2xl glass-base text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">Compliance Disclaimer:</strong> This report is compiled by Giant from verified authorized public feeds, regulatory disclosures, and customer analytics. No fabricated data is included. All projections are labeled as assumptions.
          </div>

        </div>
      )}

    </div>
  );
};
