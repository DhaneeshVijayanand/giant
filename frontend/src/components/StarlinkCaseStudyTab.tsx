import React, { useEffect, useState } from 'react';
import { 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  Layers, 
  Sparkles, 
  Info,
  RefreshCw, 
  Search
} from 'lucide-react';
import { 
  fetchStarlinkCaseStudy, 
  fetchStarlinkScenarios, 
  fetchStarlinkEvidence 
} from '../services/api';
import { 
  StarlinkTopic, 
  StarlinkScenario, 
  StarlinkTracker, 
  Article 
} from '../types';

export const StarlinkCaseStudyTab: React.FC = () => {
  const [topics, setTopics] = useState<StarlinkTopic[]>([]);
  const [scenarios, setScenarios] = useState<StarlinkScenario[]>([]);
  const [tracker, setTracker] = useState<StarlinkTracker | null>(null);
  const [evidenceArticles, setEvidenceArticles] = useState<Article[]>([]);
  const [lastEvidenceCheck, setLastEvidenceCheck] = useState<string | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and tab states
  const [activeSubTab, setActiveSubTab] = useState<'topics' | 'scenarios' | 'evidence' | 'tracker'>('topics');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario_2_moderate');
  const [evidenceSearch, setEvidenceSearch] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [caseStudyData, scenariosData, evidenceData] = await Promise.all([
        fetchStarlinkCaseStudy(),
        fetchStarlinkScenarios(),
        fetchStarlinkEvidence(20)
      ]);
      setTopics(caseStudyData.topics || []);
      setScenarios(scenariosData.scenarios || []);
      setTracker(scenariosData.tracker || null);
      setEvidenceArticles(evidenceData.articles || []);
      setLastEvidenceCheck(evidenceData.last_checked_at);
    } catch (err: any) {
      setError(err.message || 'Failed to load Starlink Case Study data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = ['all', ...Array.from(new Set(topics.map(t => t.category)))];

  const filteredTopics = topics.filter(t => {
    if (selectedCategory === 'all') return true;
    return t.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

  const filteredEvidence = evidenceArticles.filter(a => {
    if (!evidenceSearch) return true;
    const q = evidenceSearch.toLowerCase();
    return a.title.toLowerCase().includes(q) || (a.summary || '').toLowerCase().includes(q) || (a.source || '').toLowerCase().includes(q);
  });

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

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Starlink Case Study and Satellite Intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* ================= CASE STUDY HEADER BANNER ================= */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-900 to-indigo-950/60 border border-navy-800 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-accent-blue/20 text-accent-blue border border-accent-blue/40 text-[10px] font-bold uppercase tracking-wider">
                Featured Case Study • Telecom
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                100% Sourced Evidence
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              WILL STARLINK DISRUPT INDIA'S TELECOM MARKET?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Evaluating Low Earth Orbit (LEO) satellite broadband economics, regulatory administrative spectrum assignment, security gateways, and competitive moats of Indian telecom incumbents.
            </p>
          </div>

          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-accent-blue" />
            <span>Refresh Evidence</span>
          </button>
        </div>

        {/* Non-Negotiable Grounding Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2.5 text-xs text-amber-200">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Methodology & Non-Negotiable Rules:</strong> Regulatory statements link directly to official sources (DoT, TRAI, IN-SPACe). All forecasts are transparent models with explicit inputs; assumptions are labeled as <strong>[Assumption]</strong>. Giant never assumes Starlink automatically causes customer churn from Jio, Airtel, Vi, or BSNL without customer-level empirical data.
          </p>
        </div>
      </div>

      {/* ================= SUB-NAVIGATION BAR ================= */}
      <div className="flex items-center space-x-2 border-b border-navy-800 pb-3 overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setActiveSubTab('topics')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'topics'
              ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>12 Core Topics & Verified Status</span>
          <span className="px-1.5 py-0.2 rounded-full bg-navy-950 text-[10px] text-slate-300 font-mono">12</span>
        </button>

        <button
          onClick={() => setActiveSubTab('scenarios')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'scenarios'
              ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Three Disruption Scenarios</span>
          <span className="px-1.5 py-0.2 rounded-full bg-navy-950 text-[10px] text-slate-300 font-mono">3</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tracker')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'tracker'
              ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Scenario Evidence Tracker</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Live</span>
        </button>

        <button
          onClick={() => setActiveSubTab('evidence')}
          className={`px-3.5 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'evidence'
              ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Dynamic Evidence Pipeline</span>
          <span className="px-1.5 py-0.2 rounded-full bg-navy-950 text-[10px] text-slate-300 font-mono">
            {evidenceArticles.length}
          </span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ================= SUB-TAB 1: 12 TOPICS GRID ================= */}
      {activeSubTab === 'topics' && (
        <div className="space-y-6">
          
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium mr-1 text-[11px]">Filter Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-accent-blue text-white'
                    : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-navy-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTopics.map((topic) => (
              <div 
                key={topic.id}
                className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800 hover:border-navy-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-navy-950 text-slate-400 border border-navy-800 text-[10px] font-bold uppercase">
                      {topic.category}
                    </span>

                    {topic.has_evidence ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Sourced Evidence
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                        Evidence not available
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-accent-blue transition-colors">
                    {topic.title}
                  </h3>

                  <div className="p-2.5 rounded-lg bg-navy-950/70 border border-navy-800/80 text-xs text-accent-blue font-semibold">
                    Status: {topic.status}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>

                {/* Source and Timestamps Strip */}
                <div className="pt-3 border-t border-navy-800/80 space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Official Citation:</span>
                    <a
                      href={topic.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-slate-200 hover:text-accent-blue flex items-center space-x-1"
                    >
                      <span className="truncate max-w-[200px]">{topic.official_source}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Source Date:</span>
                    <span className="font-mono text-slate-300">{topic.source_date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Verified:</span>
                    <span className="font-mono text-slate-400">{formatDateTime(topic.last_updated)}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= SUB-TAB 2: THREE SCENARIOS ================= */}
      {activeSubTab === 'scenarios' && (
        <div className="space-y-6">
          
          {/* Scenario Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {scenarios.map((sc) => {
              const isSelected = selectedScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-navy-900 border-accent-blue shadow-lg shadow-accent-blue/10'
                      : 'bg-navy-900/40 border-navy-800 hover:border-navy-700 text-slate-400'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                    isSelected ? 'text-accent-blue' : 'text-slate-400'
                  }`}>
                    {sc.probability_label}
                  </span>
                  <h4 className="text-xs font-bold text-white mb-1.5">
                    {sc.name}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {sc.narrative}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Scenario Detailed Deep-Dive Card */}
          {selectedScenario && (
            <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-6 text-xs">
              
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-accent-blue/15 text-accent-blue border border-accent-blue/30 text-[10px] font-bold uppercase">
                  {selectedScenario.probability_label}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1.5">
                  {selectedScenario.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedScenario.narrative}
                </p>
              </div>

              {/* Assumptions Section */}
              <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  Explicit Modeling Assumptions (Labeled):
                </h4>
                <ul className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                  {selectedScenario.assumptions.map((assump, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{assump}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Winners & Losers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                  <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Potential Winners:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedScenario.winners.map((w, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-[11px]">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 space-y-2">
                  <h4 className="font-bold text-red-300 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    Potential Losers / Pressured Entities:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedScenario.losers.map((l, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-red-950/60 border border-red-800/60 text-red-200 text-[11px]">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Segments Most Likely to Switch */}
              <div className="space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-accent-blue" />
                  Customer Segments Most Likely to Consider Switching:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedScenario.segments_switching.map((seg, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-navy-950 border border-navy-800 text-slate-300 text-xs flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-blue flex-shrink-0" />
                      <span>{seg}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opportunities & Risks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-white">Business Opportunities:</h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {selectedScenario.business_opportunities.map((opp, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-accent-blue font-bold">→</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white">Risks to Incumbent Providers:</h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {selectedScenario.risks_to_incumbents.map((risk, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-amber-400 font-bold">!</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Strategic Recommendations */}
              <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-violet" />
                  Strategic Recommendations for Business Analysts:
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {selectedScenario.strategic_recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-accent-violet font-bold">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Validation KPIs Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-white flex items-center justify-between">
                  <span>KPIs & Evidence Required to Validate Scenario:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Real-Time Status Audit</span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-navy-950 text-slate-400 uppercase font-bold border-b border-navy-800">
                      <tr>
                        <th className="py-2.5 px-3">Validation KPI</th>
                        <th className="py-2.5 px-3">Threshold Condition</th>
                        <th className="py-2.5 px-3">Current Status</th>
                        <th className="py-2.5 px-3">Evidence Observation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-800/60">
                      {selectedScenario.validation_kpis.map((kpi, idx) => {
                        let statusBadge = 'bg-slate-800 text-slate-300';
                        if (kpi.status === 'Supported') statusBadge = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold';
                        else if (kpi.status === 'Contradicted') statusBadge = 'bg-red-500/20 text-red-300 border border-red-500/30 font-bold';
                        else if (kpi.status === 'Not yet supported') statusBadge = 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold';

                        return (
                          <tr key={idx} className="hover:bg-navy-950/40">
                            <td className="py-2.5 px-3 font-semibold text-white">{kpi.kpi}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">{kpi.condition}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] inline-block whitespace-nowrap ${statusBadge}`}>
                                {kpi.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-400">{kpi.evidence_note}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ================= SUB-TAB 3: SCENARIO EVIDENCE TRACKER ================= */}
      {activeSubTab === 'tracker' && tracker && (
        <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-6 text-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue block mb-1">
                Objective Alignment Engine
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Which Scenario Does Current Evidence Support Most?
              </h3>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{tracker.most_supported_scenario}</span>
            </div>
          </div>

          {/* Reasoning Card */}
          <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2">
            <h4 className="font-bold text-white text-xs">Evidence-Based Reasoning & Economic Synthesis:</h4>
            <p className="text-slate-300 leading-relaxed text-xs">
              {tracker.confidence_reasoning}
            </p>
          </div>

          {/* Key Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tracker.key_evidence_pillars.map((pil, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-navy-950/50 border border-navy-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{pil.pillar}</span>
                <span className="text-xs font-semibold text-slate-200 block">{pil.status}</span>
              </div>
            ))}
          </div>

          {/* Non-Prediction Notice */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[11px] leading-relaxed">
            <strong>Analytical Standard:</strong> {tracker.disclaimer}
          </div>

        </div>
      )}

      {/* ================= SUB-TAB 4: DYNAMIC EVIDENCE PIPELINE ================= */}
      {activeSubTab === 'evidence' && (
        <div className="space-y-6">
          
          <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                Live Satellite & Spectrum Evidence Pipeline
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Automatically filtered articles matching Starlink, SpaceX, satellite spectrum, LEO, and OneWeb keywords.
              </p>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Last pipeline scan: {formatDateTime(lastEvidenceCheck)}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search satellite articles, spectrum notices, or publishers..."
              value={evidenceSearch}
              onChange={(e) => setEvidenceSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-accent-blue"
            />
          </div>

          {/* Articles Feed */}
          {filteredEvidence.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-navy-900/30 rounded-2xl border border-navy-800">
              No matching satellite evidence articles found in the database.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvidence.map((art) => (
                <div 
                  key={art.id}
                  className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 hover:border-navy-700 transition-colors space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-white hover:text-accent-blue flex items-center space-x-1.5 transition-colors"
                    >
                      <span>{art.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    </a>

                    <span className="px-2 py-0.5 rounded bg-navy-950 text-accent-blue border border-navy-800 text-[10px] font-mono self-start sm:self-auto">
                      {art.source}
                    </span>
                  </div>

                  {art.summary && (
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {art.summary}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-navy-800/80 text-[10px] text-slate-400 font-mono">
                    <div className="flex items-center space-x-3">
                      <span>Published: {formatDateTime(art.published_at)}</span>
                      <span>Ingested: {formatDateTime(art.retrieved_at)}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {(art.topics || []).map((t, i) => (
                        <span key={i} className="px-1.5 py-0.2 rounded bg-navy-950 text-slate-400 border border-navy-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
