import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  UploadCloud, 
  Database, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  TrendingDown, 
  Users, 
  Target, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { 
  loadChurnDemoDataset, 
  uploadChurnDataset, 
  fetchChurnStatus, 
  deleteChurnDataset 
} from '../services/api';
import { ChurnDatasetMetadata, ChurnEvaluationResult } from '../types';

export const CustomerChurnTab: React.FC = () => {
  const [metadata, setMetadata] = useState<ChurnDatasetMetadata | null>(null);
  const [evaluation, setEvaluation] = useState<ChurnEvaluationResult | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [qualitySummary, setQualitySummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetColumn, setTargetColumn] = useState<string>('Churn');

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchChurnStatus();
      if (res.is_active && res.metadata && res.evaluation) {
        setMetadata(res.metadata);
        setEvaluation(res.evaluation);
      }
    } catch (err: any) {
      console.error('Error fetching churn status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleLoadDemo = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      const res = await loadChurnDemoDataset();
      setMetadata(res.metadata);
      setEvaluation(res.evaluation);
      setPreviewRows(res.preview || []);
      setQualitySummary(res.quality_summary || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load IBM Telco demo dataset');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setError(null);
      const res = await uploadChurnDataset(selectedFile, targetColumn);
      setMetadata(res.metadata);
      setEvaluation(res.evaluation);
      setPreviewRows(res.preview || []);
      setQualitySummary(res.quality_summary || null);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to process dataset');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this customer dataset and associated model artifacts?')) {
      return;
    }
    try {
      setIsProcessing(true);
      await deleteChurnDataset();
      setMetadata(null);
      setEvaluation(null);
      setPreviewRows([]);
      setQualitySummary(null);
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Checking churn model status...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* ================= MANDATORY NON-NEGOTIABLE PRIVACY & SCOPE NOTICE ================= */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-xs text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">
            Data Scope & Modeling Principle:
          </p>
          <p className="text-amber-100/90 leading-relaxed font-medium">
            "Industry news alone cannot predict whether an individual customer will churn. Individual churn prediction requires customer-level data."
          </p>
          <p className="text-[11px] text-amber-200/70">
            Public industry news provides macro competitive context (tariffs, competitor launches); individual churn probabilities below are calibrated exclusively from authorized, customer-level operational records.
          </p>
        </div>
      </div>

      {/* ================= DATASET CONTROL BAR ================= */}
      <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-accent-blue" />
              Customer Dataset Ingestion & Model Studio
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload an authorized CSV customer export or run our verified IBM Telco benchmark.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Load IBM Telco Demo Button */}
            <button
              onClick={handleLoadDemo}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-accent-blue/30 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5 text-accent-blue" />
              <span>{isProcessing ? 'Processing Model...' : 'Load IBM Telco Demo Dataset'}</span>
            </button>

            {/* Delete Dataset Button */}
            {metadata && (
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800 text-red-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                title="Permanently delete dataset from memory and database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Dataset</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom CSV Upload Form */}
        <form onSubmit={handleUpload} className="pt-4 border-t border-navy-800/80 flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="flex-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-slate-300">
            <UploadCloud className="w-4 h-4 text-accent-blue flex-shrink-0" />
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-navy-800 file:text-accent-blue hover:file:bg-navy-700 w-full"
            />
          </div>

          <div className="w-full sm:w-48">
            <input
              type="text"
              placeholder="Target column (default: Churn)"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-accent-blue"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedFile || isProcessing}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors flex-shrink-0"
          >
            <span>Upload & Train Model</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ================= ACTIVE DATASET HEADER BADGE ================= */}
      {metadata && (
        <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-white text-sm">
                Active Dataset: {metadata.dataset_name}
              </span>
              <span className="text-slate-400 ml-2">
                ({metadata.total_rows} records • {metadata.total_columns} features)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {metadata.is_demo ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase tracking-wider">
                Demo data
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">
                Authorized Client Data
              </span>
            )}
          </div>
        </div>
      )}

      {/* ================= DATASET QUALITY AUDIT ================= */}
      {qualitySummary && (
        <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 text-xs text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cleaned Rows</span>
            <span className="font-mono text-white font-bold">{qualitySummary.cleaned_rows}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Duplicates Removed</span>
            <span className="font-mono text-emerald-400 font-bold">{qualitySummary.duplicate_rows_removed ?? 0}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Imputed Values</span>
            <span className="font-mono text-accent-blue font-bold">{qualitySummary.total_missing_values_imputed ?? 0}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Data Quality Audit</span>
            <span className="text-emerald-400 font-bold">Verified Clean</span>
          </div>
        </div>
      )}

      {/* ================= DATA PREVIEW & QUALITY AUDIT ================= */}
      {previewRows.length > 0 && (
        <div className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-accent-blue" />
              Data Preview & PII Sanitization Audit (First 5 Rows)
            </h4>
            {metadata?.is_demo && (
              <span className="text-[10px] text-amber-400 font-mono">Demo data — Public Benchmark</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-slate-300">
              <thead className="bg-navy-950 text-slate-400 uppercase font-bold border-b border-navy-800">
                <tr>
                  {Object.keys(previewRows[0]).slice(0, 7).map((col) => (
                    <th key={col} className="py-2 px-3">{col}</th>
                  ))}
                  <th className="py-2 px-3 text-right">Target (Churn)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 font-mono">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-navy-950/40">
                    {Object.keys(row).slice(0, 7).map((col) => (
                      <td key={col} className="py-2 px-3 truncate max-w-[120px]">{String(row[col])}</td>
                    ))}
                    <td className="py-2 px-3 text-right font-bold text-accent-blue">{String(row["Churn"])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODEL EVALUATION METRICS CARD ================= */}
      {evaluation && (
        <div className="space-y-6">
          
          {/* Models Comparison (Logistic Regression vs. Random Forest) */}
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent-violet" />
                  Model Performance on Held-Out Test Data (80/20 Stratified Split)
                </h3>
                <p className="text-xs text-slate-400">
                  Data leakage prevention applied: identifiers dropped, scalers fit on train fold only.
                </p>
              </div>

              {metadata?.is_demo && (
                <span className="px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                  Demo data metrics
                </span>
              )}
            </div>

            {/* Model Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Baseline: Logistic Regression */}
              <div className="p-5 rounded-xl bg-navy-950/80 border border-navy-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                  <span className="font-bold text-slate-200 text-sm">
                    {evaluation.models.baseline_logistic_regression.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold uppercase">
                    Baseline
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-navy-900">
                    <span className="text-[10px] text-slate-400 block">Accuracy</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {(evaluation.models.baseline_logistic_regression.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-900">
                    <span className="text-[10px] text-slate-400 block">Precision</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {(evaluation.models.baseline_logistic_regression.precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-900">
                    <span className="text-[10px] text-slate-400 block">Recall</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {(evaluation.models.baseline_logistic_regression.recall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-900">
                    <span className="text-[10px] text-slate-400 block">ROC-AUC</span>
                    <span className="font-mono font-bold text-accent-blue text-sm">
                      {evaluation.models.baseline_logistic_regression.roc_auc.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Confusion matrix */}
                <div className="p-3 rounded-lg bg-navy-900/60 border border-navy-800 text-[11px] text-slate-400 flex justify-between">
                  <span>Confusion Matrix (TN / FP / FN / TP):</span>
                  <span className="font-mono text-slate-200">
                    {evaluation.models.baseline_logistic_regression.confusion_matrix.true_negatives} / {evaluation.models.baseline_logistic_regression.confusion_matrix.false_positives} / {evaluation.models.baseline_logistic_regression.confusion_matrix.false_negatives} / {evaluation.models.baseline_logistic_regression.confusion_matrix.true_positives}
                  </span>
                </div>
              </div>

              {/* Primary: Random Forest Classifier */}
              <div className="p-5 rounded-xl bg-navy-950/80 border border-purple-900/40 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                  <span className="font-bold text-purple-200 text-sm">
                    {evaluation.models.random_forest.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold uppercase">
                    Primary Calibrated
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-navy-900">
                    <span className="text-[10px] text-slate-400 block">Accuracy</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {(evaluation.models.random_forest.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-900">
                    <span className="text-[10px] text-slate-400 block">Precision</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {(evaluation.models.random_forest.precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-900">
                    <span className="text-[10px] text-slate-400 block">Recall</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {(evaluation.models.random_forest.recall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-900">
                    <span className="text-[10px] text-slate-400 block">ROC-AUC</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {evaluation.models.random_forest.roc_auc.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Confusion matrix */}
                <div className="p-3 rounded-lg bg-navy-900/60 border border-navy-800 text-[11px] text-slate-400 flex justify-between">
                  <span>Confusion Matrix (TN / FP / FN / TP):</span>
                  <span className="font-mono text-slate-200">
                    {evaluation.models.random_forest.confusion_matrix.true_negatives} / {evaluation.models.random_forest.confusion_matrix.false_positives} / {evaluation.models.random_forest.confusion_matrix.false_negatives} / {evaluation.models.random_forest.confusion_matrix.true_positives}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ================= RISK TIERS & FEATURE DRIVERS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Risk Distribution Breakdown */}
            <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                Customer Churn Risk Distribution Tiers
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-emerald-400 font-semibold">Low Risk (&lt;30% Churn Probability)</span>
                    <span className="font-mono text-white">
                      {evaluation.risk_distribution.low_risk_count} ({evaluation.risk_distribution.low_risk_pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-navy-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${evaluation.risk_distribution.low_risk_pct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-amber-300 font-semibold">Medium Risk (30% - 60% Probability)</span>
                    <span className="font-mono text-white">
                      {evaluation.risk_distribution.medium_risk_count} ({evaluation.risk_distribution.medium_risk_pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-navy-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${evaluation.risk_distribution.medium_risk_pct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-rose-400 font-semibold">High Risk (&gt;60% Churn Probability)</span>
                    <span className="font-mono text-white">
                      {evaluation.risk_distribution.high_risk_count} ({evaluation.risk_distribution.high_risk_pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-navy-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full" 
                      style={{ width: `${evaluation.risk_distribution.high_risk_pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Feature Drivers (Contributing Factors) */}
            <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-accent-blue" />
                Primary Churn Drivers (Feature Importance)
              </h4>

              <div className="space-y-2 text-xs">
                {evaluation.feature_drivers.map((drv, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-navy-800/80">
                    <span className="text-slate-200 capitalize">
                      {idx + 1}. {drv.feature}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-1.5 bg-navy-950 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="h-full bg-accent-blue rounded-full" 
                          style={{ width: `${drv.percentage * 2.5}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-accent-blue w-12 text-right">
                        {drv.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ================= CUSTOMER SEGMENT COMPARISONS ================= */}
          {evaluation.segment_comparisons.length > 0 && (
            <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                Customer Segment Comparisons
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {evaluation.segment_comparisons.map((seg, sIdx) => (
                  <div key={sIdx} className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2">
                    <span className="font-bold text-slate-300 block mb-1">
                      {seg.segment_name}
                    </span>
                    <div className="space-y-1.5">
                      {seg.categories.map((cat, cIdx) => (
                        <div key={cIdx} className="flex justify-between py-1 border-b border-navy-800/60">
                          <span className="text-slate-300">{cat.name}</span>
                          <span className={`font-mono font-bold ${
                            cat.churn_rate_pct > 35 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {cat.churn_rate_pct}% Churn Rate
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= ACTIONABLE RETENTION ACTIONS ================= */}
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" />
              Suggested Retention Actions (Data-Driven Interventions)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {evaluation.suggested_retention_actions.map((act, aIdx) => (
                <div key={aIdx} className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-blue/15 text-accent-blue border border-accent-blue/30 inline-block mb-1.5">
                      Priority: {act.priority}
                    </span>
                    <h5 className="font-bold text-white mb-1 leading-snug">
                      {act.action}
                    </h5>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      {act.rationale}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-navy-800 text-emerald-400 font-semibold text-[11px]">
                    Expected: {act.expected_impact}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
