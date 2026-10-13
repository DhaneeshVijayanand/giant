import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  Calendar, 
  ExternalLink,
  Scale
} from 'lucide-react';
import { fetchAIRecommendations } from '../services/api';
import { AIRecommendation } from '../types';

interface AIRecommendationsTabProps {
  industrySlug: string;
}

export const AIRecommendationsTab: React.FC<AIRecommendationsTabProps> = ({ industrySlug }) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const loadRecs = async (regenerate: boolean = false) => {
    try {
      if (regenerate) setIsRegenerating(true);
      else setLoading(true);
      const data = await fetchAIRecommendations(industrySlug, regenerate);
      setRecommendations(data);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    loadRecs();
  }, [industrySlug]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header Bar */}
      <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-violet" />
            AI Strategic Business Recommendations
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evidence-grounded decision models for {industrySlug.toUpperCase()}. Distinguishes correlation from causation.
          </p>
        </div>

        <button
          onClick={() => loadRecs(true)}
          disabled={isRegenerating || loading}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-accent-violet hover:bg-violet-600 active:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-accent-violet/20 flex-shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>{isRegenerating ? 'Synthesizing...' : 'Regenerate Recommendations'}</span>
        </button>
      </div>

      {/* Methodology Notice: Correlation vs Causation */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-start space-x-3 text-xs text-slate-300">
        <Scale className="w-4 h-4 text-accent-violet flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-purple-300 block mb-0.5">
            Analyst Methodology Notice: Correlation vs. Causation
          </span>
          <p className="text-purple-200/80 leading-relaxed">
            Market events (such as headline tariff changes or competitor launches) frequently correlate with volume fluctuations. Giant strictly isolates causal drivers (e.g. underlying network satisfaction, billing failure rates, switching costs) before prescribing executive intervention.
          </p>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="p-6 rounded-2xl bg-navy-900/40 border border-navy-800 animate-pulse h-64" />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-navy-900/30 border border-navy-800 text-xs text-slate-400">
          No recommendations found for this sector. Click "Regenerate Recommendations" above.
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-6 rounded-2xl bg-navy-900/70 border border-navy-800 hover:border-navy-700 transition-colors space-y-5"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-navy-800">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent-blue/15 text-accent-blue border border-accent-blue/30">
                      Strategic Directive
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confidence: {rec.confidence_level}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    {rec.title}
                  </h4>
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 bg-navy-950 px-3 py-1.5 rounded-lg border border-navy-800">
                  <Calendar className="w-3.5 h-3.5 text-accent-violet" />
                  <span>Review Date: <strong>{rec.suggested_review_date}</strong></span>
                </div>
              </div>

              {/* Problem & Evidence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800/80 space-y-1">
                  <span className="font-bold text-rose-300 uppercase tracking-wider text-[10px] block">
                    Business Problem
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {rec.business_problem}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800/80 space-y-1">
                  <span className="font-bold text-accent-blue uppercase tracking-wider text-[10px] block">
                    Supporting Primary Evidence
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {rec.supporting_evidence}
                  </p>
                </div>
              </div>

              {/* Action & Benefit Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-1">
                  <span className="font-bold text-emerald-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    Suggested Action Plan
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {rec.suggested_action}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 space-y-1">
                  <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Expected Business Benefit
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {rec.expected_benefit}
                  </p>
                </div>
              </div>

              {/* Risk & KPI Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-amber-950/15 border border-amber-800/30">
                  <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] block mb-1">
                    Potential Risks & Trade-Offs
                  </span>
                  <p className="text-amber-200/90 leading-relaxed">
                    {rec.potential_risks}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 flex flex-col justify-between">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                    Target KPI To Measure Success
                  </span>
                  <span className="text-sm font-extrabold text-accent-blue font-mono">
                    🎯 {rec.kpi_metric}
                  </span>
                </div>
              </div>

              {/* Correlation vs Causation Analysis Box */}
              <div className="p-3 rounded-lg bg-navy-950/90 border border-navy-800 text-[11px] text-slate-400">
                <strong className="text-slate-300 block mb-0.5">Causal Analysis Caveat:</strong>
                <p>{rec.correlation_vs_causation_note}</p>
              </div>

              {/* Sources */}
              {rec.sources && rec.sources.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-navy-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Sources:</span>
                  {rec.sources.map((s, sIdx) => (
                    <a
                      key={sIdx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-blue hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>{s.source}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
