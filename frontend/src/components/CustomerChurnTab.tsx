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
      <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Checking churn model status...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none">
      
      {/* Privacy & Modeling Scope Notice */}
      <div className="glass-raised border-amber-500/40 rounded-3xl p-5 flex items-start space-x-3.5 text-xs text-amber-700 dark:text-amber-200 shadow-md">
        <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-600 dark:text-amber-300 uppercase tracking-wider text-[11px]">
            Data Scope & Modeling Principle:
          </p>
          <p className="leading-relaxed font-semibold text-slate-900 dark:text-amber-100">
            "Industry news alone cannot predict whether an individual customer will churn. Individual churn prediction requires customer-level data."
          </p>
          <p className="text-[11px] text-slate-600 dark:text-amber-200/70">
            Public industry news provides macro competitive context (tariffs, competitor launches); individual churn probabilities below are calibrated exclusively from authorized, customer-level operational records.
          </p>
        </div>
      </div>

      {/* Dataset Control Bar */}
      <div className="glass-raised rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-accent-blue" />
              Customer Dataset Ingestion & Model Studio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload an authorized CSV customer export or run our verified IBM Telco benchmark.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Load IBM Telco Demo Button */}
            <button
              onClick={handleLoadDemo}
              disabled={isProcessing}
              className="glass-pill px-4 py-2 rounded-full text-slate-900 dark:text-white text-xs font-semibold flex items-center space-x-2 disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5 text-accent-blue" />
              <span>{isProcessing ? 'Processing Model...' : 'Load IBM Telco Demo Dataset'}</span>
            </button>

            {/* Delete Dataset Button */}
            {metadata && (
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="px-4 py-2 rounded-full glass-base text-accent-red border-red-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50 hover:bg-red-500/10"
                title="Permanently delete dataset from memory and database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Dataset</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom CSV Upload Form */}
        <form onSubmit={handleUpload} className="pt-4 border-t border-slate-200/40 dark:border-white/10 flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="flex-1 w-full flex items-center gap-2 px-4 py-2.5 rounded-full glass-base text-slate-600 dark:text-slate-300">
            <UploadCloud className="w-4 h-4 text-accent-blue flex-shrink-0" />
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-blue/15 file:text-accent-blue hover:file:bg-accent-blue/25 w-full cursor-pointer"
            />
          </div>

          <div className="w-full sm:w-56">
            <input
              type="text"
              placeholder="Target column (default: Churn)"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full glass-base text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedFile || isProcessing}
            className="ios-btn-primary w-full sm:w-auto px-6 py-2.5 text-xs flex items-center justify-center space-x-1.5 disabled:opacity-50 flex-shrink-0"
          >
            <span>Upload & Train Model</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {error && (
          <div className="p-3.5 rounded-2xl glass-base border-red-500/40 text-xs text-accent-red flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-accent-red flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Active Dataset Header Badge */}
      {metadata && (
        <div className="glass-raised rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Active Dataset: {metadata.dataset_name}
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-2 tabular-nums">
                ({metadata.total_rows} records • {metadata.total_columns} features)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {metadata.is_demo ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 font-bold text-xs uppercase tracking-wider border border-amber-500/40">
                Demo data
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-accent-green font-bold text-xs border border-emerald-500/40">
                Authorized Client Data
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dataset Quality Audit */}
      {qualitySummary && (
        <div className="glass-base rounded-2xl p-4 text-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Cleaned Rows</span>
            <span className="font-mono text-slate-900 dark:text-white font-black text-sm tabular-nums">{qualitySummary.cleaned_rows}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Duplicates Removed</span>
            <span className="font-mono text-accent-green font-black text-sm tabular-nums">{qualitySummary.duplicate_rows_removed ?? 0}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Imputed Values</span>
            <span className="font-mono text-accent-blue font-black text-sm tabular-nums">{qualitySummary.total_missing_values_imputed ?? 0}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Data Quality Audit</span>
            <span className="text-accent-green font-bold text-sm">Verified Clean</span>
          </div>
        </div>
      )}

      {/* Data Preview & Sanitization Audit Table */}
      {previewRows.length > 0 && (
        <div className="glass-raised rounded-3xl p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent-blue" />
              Data Preview & PII Sanitization Audit (First 5 Rows)
            </h4>
            {metadata?.is_demo && (
              <span className="text-[10px] text-amber-500 font-mono font-bold">Demo data — Public Benchmark</span>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/40 dark:border-white/10">
            <table className="w-full text-left text-[11px] text-slate-700 dark:text-slate-200">
              <thead className="glass-base uppercase font-bold border-b border-slate-200/40 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  {Object.keys(previewRows[0]).slice(0, 7).map((col) => (
                    <th key={col} className="py-2.5 px-3.5">{col}</th>
                  ))}
                  <th className="py-2.5 px-3.5 text-right">Target (Churn)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40 dark:divide-white/10 font-mono tabular-nums">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    {Object.keys(row).slice(0, 7).map((col) => (
                      <td key={col} className="py-2.5 px-3.5 truncate max-w-[120px]">{String(row[col])}</td>
                    ))}
                    <td className="py-2.5 px-3.5 text-right font-black text-accent-blue">{String(row["Churn"])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Model Evaluation Metrics Cards */}
      {evaluation && (
        <div className="space-y-6">
          
          {/* Models Comparison */}
          <div className="glass-raised rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent-purple" />
                  Model Performance on Held-Out Test Data (80/20 Stratified Split)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Data leakage prevention applied: identifiers dropped, scalers fit on train fold only.
                </p>
              </div>

              {metadata?.is_demo && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Demo data metrics
                </span>
              )}
            </div>

            {/* Model Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Baseline: Logistic Regression */}
              <div className="glass-base rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/40 dark:border-white/10">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {evaluation.models.baseline_logistic_regression.name}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full glass-pill text-slate-500 font-bold uppercase">
                    Baseline
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl glass-raised">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Accuracy</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm tabular-nums">
                      {(evaluation.models.baseline_logistic_regression.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl glass-raised">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Precision</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm tabular-nums">
                      {(evaluation.models.baseline_logistic_regression.precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl glass-raised">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Recall</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm tabular-nums">
                      {(evaluation.models.baseline_logistic_regression.recall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl glass-raised">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">ROC-AUC</span>
                    <span className="font-mono font-black text-accent-blue text-sm tabular-nums">
                      {evaluation.models.baseline_logistic_regression.roc_auc.toFixed(3)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl glass-base text-[11px] text-slate-500 dark:text-slate-400 flex justify-between font-mono tabular-nums">
                  <span>Confusion Matrix (TN / FP / FN / TP):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {evaluation.models.baseline_logistic_regression.confusion_matrix.true_negatives} / {evaluation.models.baseline_logistic_regression.confusion_matrix.false_positives} / {evaluation.models.baseline_logistic_regression.confusion_matrix.false_negatives} / {evaluation.models.baseline_logistic_regression.confusion_matrix.true_positives}
                  </span>
                </div>
              </div>

              {/* Primary: Random Forest Classifier */}
              <div className="glass-base rounded-2xl p-5 border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/40 dark:border-white/10">
                  <span className="font-bold text-accent-purple text-sm">
                    {evaluation.models.random_forest.name}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-accent-purple font-bold uppercase">
                    Primary Calibrated
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl glass-raised">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Accuracy</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm tabular-nums">
                      {(evaluation.models.random_forest.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl glass-raised">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Precision</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm tabular-nums">
                      {(evaluation.models.random_forest.precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl glass-raised">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Recall</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm tabular-nums">
                      {(evaluation.models.random_forest.recall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl glass-raised">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">ROC-AUC</span>
                    <span className="font-mono font-black text-accent-green text-sm tabular-nums">
                      {evaluation.models.random_forest.roc_auc.toFixed(3)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl glass-base text-[11px] text-slate-500 dark:text-slate-400 flex justify-between font-mono tabular-nums">
                  <span>Confusion Matrix (TN / FP / FN / TP):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {evaluation.models.random_forest.confusion_matrix.true_negatives} / {evaluation.models.random_forest.confusion_matrix.false_positives} / {evaluation.models.random_forest.confusion_matrix.false_negatives} / {evaluation.models.random_forest.confusion_matrix.true_positives}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Risk Tiers & Feature Drivers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Risk Distribution Breakdown */}
            <div className="glass-raised rounded-3xl p-6 sm:p-7 space-y-5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-accent-red" />
                Customer Churn Risk Distribution Tiers
              </h4>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1.5 font-semibold">
                    <span className="text-accent-green">Low Risk (&lt;30% Churn Probability)</span>
                    <span className="font-mono text-slate-900 dark:text-white tabular-nums">
                      {evaluation.risk_distribution.low_risk_count} ({evaluation.risk_distribution.low_risk_pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full glass-base rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-green rounded-full transition-all duration-500" 
                      style={{ width: `${evaluation.risk_distribution.low_risk_pct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5 font-semibold">
                    <span className="text-accent-orange">Medium Risk (30% - 60% Probability)</span>
                    <span className="font-mono text-slate-900 dark:text-white tabular-nums">
                      {evaluation.risk_distribution.medium_risk_count} ({evaluation.risk_distribution.medium_risk_pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full glass-base rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-orange rounded-full transition-all duration-500" 
                      style={{ width: `${evaluation.risk_distribution.medium_risk_pct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5 font-semibold">
                    <span className="text-accent-red">High Risk (&gt;60% Churn Probability)</span>
                    <span className="font-mono text-slate-900 dark:text-white tabular-nums">
                      {evaluation.risk_distribution.high_risk_count} ({evaluation.risk_distribution.high_risk_pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full glass-base rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-red rounded-full transition-all duration-500" 
                      style={{ width: `${evaluation.risk_distribution.high_risk_pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Feature Drivers */}
            <div className="glass-raised rounded-3xl p-6 sm:p-7 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-accent-blue" />
                Primary Churn Drivers (Feature Importance)
              </h4>

              <div className="space-y-2.5 text-xs">
                {evaluation.feature_drivers.map((drv, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-200/40 dark:border-white/10">
                    <span className="text-slate-800 dark:text-slate-200 capitalize font-medium">
                      {idx + 1}. {drv.feature}
                    </span>
                    <div className="flex items-center space-x-2.5">
                      <div className="w-24 h-2 glass-base rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="h-full bg-accent-blue rounded-full" 
                          style={{ width: `${drv.percentage * 2.5}%` }}
                        />
                      </div>
                      <span className="font-mono font-black text-accent-blue w-12 text-right tabular-nums">
                        {drv.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Actionable Retention Actions */}
          <div className="glass-raised rounded-3xl p-6 sm:p-7 space-y-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-accent-green" />
              Suggested Retention Actions (Data-Driven Interventions)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {evaluation.suggested_retention_actions.map((act, aIdx) => (
                <div key={aIdx} className="glass-base rounded-2xl p-4 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-accent-blue/15 text-accent-blue border border-accent-blue/30 inline-block mb-1.5">
                      Priority: {act.priority}
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                      {act.action}
                    </h5>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                      {act.rationale}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/40 dark:border-white/10 text-accent-green font-bold text-[11px]">
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
