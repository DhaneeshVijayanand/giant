import React, { useEffect, useState } from 'react';
import { 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
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
      <div className="py-24 text-center text-slate-500 dark:text-slate-400 text-xs">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Starlink Case Study and Satellite Intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none">
      
      {/* Case Study Header Glass Banner */}
      <div className="glass-raised rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-full bg-accent-blue/15 text-accent-blue border border-accent-blue/30 text-[10px] font-bold uppercase tracking-wider">
                Featured Case Study • Telecom
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-accent-green border border-emerald-500/30 text-[10px] font-bold">
                100% Sourced Evidence
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              WILL STARLINK DISRUPT INDIA'S TELECOM MARKET?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Evaluating Low Earth Orbit (LEO) satellite broadband economics, regulatory administrative spectrum assignment, security gateways, and competitive moats of Indian telecom incumbents.
            </p>
          </div>

          <button
            onClick={loadData}
            className="ios-btn-primary px-4 py-2 text-xs flex items-center space-x-2 self-start md:self-auto shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Evidence</span>
          </button>
        </div>

        {/* Grounding Disclaimer Banner */}
        <div className="p-4 rounded-2xl glass-base border-amber-500/40 flex items-start space-x-3 text-xs text-amber-700 dark:text-amber-200">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Methodology & Non-Negotiable Rules:</strong> Regulatory statements link directly to official sources (DoT, TRAI, IN-SPACe). All forecasts are transparent models with explicit inputs; assumptions are labeled as <strong>[Assumption]</strong>. Giant never assumes Starlink automatically causes customer churn from Jio, Airtel, Vi, or BSNL without customer-level empirical data.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Pill Track */}
      <div className="p-1.5 rounded-full glass-raised flex space-x-1 overflow-x-auto text-xs shadow-sm">
        <button
          onClick={() => setActiveSubTab('topics')}
          className={`px-4 py-2 rounded-full font-semibold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeSubTab === 'topics'
              ? 'ios-btn-primary shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>12 Core Topics & Verified Status</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono tabular-nums">12</span>
        </button>

        <button
          onClick={() => setActiveSubTab('scenarios')}
          className={`px-4 py-2 rounded-full font-semibold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeSubTab === 'scenarios'
              ? 'ios-btn-primary shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Three Disruption Scenarios</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono tabular-nums">3</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tracker')}
          className={`px-4 py-2 rounded-full font-semibold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeSubTab === 'tracker'
              ? 'ios-btn-primary shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Scenario Evidence Tracker</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-accent-green text-[10px] font-bold">Live</span>
        </button>

        <button
          onClick={() => setActiveSubTab('evidence')}
          className={`px-4 py-2 rounded-full font-semibold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeSubTab === 'evidence'
              ? 'ios-btn-primary shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-accent-green" />
          <span>Dynamic Evidence Pipeline</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono tabular-nums">
            {evidenceArticles.length}
          </span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl glass-base border-red-500/40 text-xs text-accent-red flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-accent-red flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SUB-TAB 1: 12 TOPICS GRID */}
      {activeSubTab === 'topics' && (
        <div className="space-y-6">
          
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1 text-[11px]">Filter Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  selectedCategory === cat
                    ? 'ios-btn-primary shadow-sm'
                    : 'glass-pill text-slate-600 dark:text-slate-300'
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
                className="p-6 rounded-3xl glass-raised hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full glass-base text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">
                      {topic.category}
                    </span>

                    {topic.has_evidence ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-accent-green border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Sourced Evidence
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full glass-base text-slate-400 text-[10px] font-bold">
                        Evidence not available
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {topic.title}
                  </h3>

                  <div className="p-3 rounded-2xl glass-base text-xs text-accent-blue font-semibold">
                    Status: {topic.status}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>

                {/* Source and Timestamps Strip */}
                <div className="pt-3 border-t border-slate-200/40 dark:border-white/10 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Official Citation:</span>
                    <a
                      href={topic.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-accent-blue hover:underline flex items-center space-x-1"
                    >
                      <span className="truncate max-w-[200px]">{topic.official_source}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Source Date:</span>
                    <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">{topic.source_date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Last Verified:</span>
                    <span className="font-mono tabular-nums">{formatDateTime(topic.last_updated)}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUB-TAB 2: THREE SCENARIOS */}
      {activeSubTab === 'scenarios' && (
        <div className="space-y-6">
          
          {/* Scenario Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {scenarios.map((sc) => {
              const isSelected = selectedScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`p-5 rounded-3xl text-left transition-all ${
                    isSelected
                      ? 'glass-raised border-accent-blue shadow-lg'
                      : 'glass-base hover:scale-[1.01]'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                    isSelected ? 'text-accent-blue' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {sc.probability_label}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                    {sc.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                    {sc.narrative}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Scenario Detailed Deep-Dive Card */}
          {selectedScenario && (
            <div className="p-6 sm:p-8 rounded-3xl glass-raised space-y-6 text-xs shadow-lg">
              
              <div>
                <span className="px-3 py-1 rounded-full bg-accent-blue/15 text-accent-blue border border-accent-blue/30 text-[10px] font-bold uppercase">
                  {selectedScenario.probability_label}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-2">
                  {selectedScenario.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {selectedScenario.narrative}
                </p>
              </div>

              {/* Assumptions Section */}
              <div className="p-4 rounded-2xl glass-base space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                  <Info className="w-3.5 h-3.5 text-accent-orange" />
                  Explicit Modeling Assumptions (Labeled):
                </h4>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                  {selectedScenario.assumptions.map((assump, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-accent-orange font-bold">•</span>
                      <span>{assump}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Winners & Losers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl glass-base border-emerald-500/30 space-y-2">
                  <h4 className="font-bold text-accent-green flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Potential Winners:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedScenario.winners.map((w, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-full glass-pill text-accent-green text-[11px] font-semibold">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl glass-base border-red-500/30 space-y-2">
                  <h4 className="font-bold text-accent-red flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Potential Losers / Pressured Entities:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedScenario.losers.map((l, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-full glass-pill text-accent-red text-[11px] font-semibold">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Validation KPIs Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>KPIs & Evidence Required to Validate Scenario:</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Real-Time Status Audit</span>
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-slate-200/40 dark:border-white/10">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
                    <thead className="glass-base text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200/40 dark:border-white/10">
                      <tr>
                        <th className="py-2.5 px-3.5">Validation KPI</th>
                        <th className="py-2.5 px-3.5">Threshold Condition</th>
                        <th className="py-2.5 px-3.5">Current Status</th>
                        <th className="py-2.5 px-3.5">Evidence Observation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/40 dark:divide-white/10">
                      {selectedScenario.validation_kpis.map((kpi, idx) => {
                        let statusBadge = 'glass-pill text-slate-500';
                        if (kpi.status === 'Supported') statusBadge = 'bg-emerald-500/20 text-accent-green font-bold border border-emerald-500/30';
                        else if (kpi.status === 'Contradicted') statusBadge = 'bg-red-500/20 text-accent-red font-bold border border-red-500/30';
                        else if (kpi.status === 'Not yet supported') statusBadge = 'bg-amber-500/20 text-accent-orange font-bold border border-amber-500/30';

                        return (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">{kpi.kpi}</td>
                            <td className="py-2.5 px-3.5 font-mono text-[11px] tabular-nums">{kpi.condition}</td>
                            <td className="py-2.5 px-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] inline-block whitespace-nowrap ${statusBadge}`}>
                                {kpi.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 text-[11px] text-slate-500 dark:text-slate-400">{kpi.evidence_note}</td>
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

      {/* SUB-TAB 3: SCENARIO EVIDENCE TRACKER */}
      {activeSubTab === 'tracker' && tracker && (
        <div className="p-6 sm:p-8 rounded-3xl glass-raised space-y-6 text-xs shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue block mb-1">
                Objective Alignment Engine
              </span>
              <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                Which Scenario Does Current Evidence Support Most?
              </h3>
            </div>

            <div className="px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-accent-green text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{tracker.most_supported_scenario}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-base space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">Evidence-Based Reasoning & Economic Synthesis:</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
              {tracker.confidence_reasoning}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tracker.key_evidence_pillars.map((pil, idx) => (
              <div key={idx} className="p-4 rounded-2xl glass-base space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">{pil.pillar}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">{pil.status}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl glass-base border-amber-500/30 text-amber-700 dark:text-amber-200/90 text-[11px] leading-relaxed">
            <strong>Analytical Standard:</strong> {tracker.disclaimer}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DYNAMIC EVIDENCE PIPELINE */}
      {activeSubTab === 'evidence' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl glass-raised flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-accent-green" />
                Live Satellite & Spectrum Evidence Pipeline
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Automatically filtered articles matching Starlink, SpaceX, satellite spectrum, LEO, and OneWeb keywords.
              </p>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              Last pipeline scan: {formatDateTime(lastEvidenceCheck)}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search satellite articles, spectrum notices, or publishers..."
              value={evidenceSearch}
              onChange={(e) => setEvidenceSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full glass-base text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>

          {/* Articles Feed */}
          {filteredEvidence.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs glass-raised rounded-3xl">
              No matching satellite evidence articles found in the database.
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredEvidence.map((art) => (
                <div 
                  key={art.id}
                  className="p-5 rounded-2xl glass-raised hover:-translate-y-1 transition-all duration-300 space-y-2.5 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-slate-900 dark:text-white hover:text-accent-blue flex items-center space-x-1.5 transition-colors"
                    >
                      <span>{art.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    </a>

                    <span className="px-2.5 py-0.5 rounded-full glass-base text-accent-blue text-[10px] font-mono self-start sm:self-auto font-bold">
                      {art.source}
                    </span>
                  </div>

                  {art.summary && (
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      {art.summary}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/40 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    <div className="flex items-center space-x-3">
                      <span>Published: {formatDateTime(art.published_at)}</span>
                      <span>Ingested: {formatDateTime(art.retrieved_at)}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {(art.topics || []).map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full glass-base">
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
