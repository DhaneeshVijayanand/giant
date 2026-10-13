import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2, 
  TrendingUp,
  Target,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { sendAIChat, fetchAISpendStatus } from '../services/api';
import { AIChatMessage } from '../types';

interface AIAnalystTabProps {
  industrySlug: string;
}

export const AIAnalystTab: React.FC<AIAnalystTabProps> = ({ industrySlug }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: 'assistant',
      facts: 'Giant AI Business Analyst is grounded strictly in stored articles, official regulatory reports (TRAI, NPCI, Vahan), and verified competitor tracking records.',
      interpretation: 'I deliver structured, verifiable intelligence split strictly into four parts: Verified Facts, Evidence-Based Interpretation, Predictions/Assumptions, and Recommended Actions.',
      predictions: 'Assumptions and forward scenarios are explicitly labeled to distinguish correlation from verifiable causality.',
      actions: 'Select a sample inquiry below or ask a specific question regarding market share, tariffs, regulatory actions, or competitor maneuvers.',
      sources: []
    }
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [spendInfo, setSpendInfo] = useState<{ current_spend_usd: number; spend_cap_usd: number; spend_cap_exceeded: boolean } | null>(null);
  
  // Collapsible glass section state: messageIndex-sectionName -> boolean
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (msgIdx: number, sectionName: string) => {
    const key = `${msgIdx}-${sectionName}`;
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What are the most important telecom developments today?",
    "Which companies are gaining market share?",
    "How could Starlink affect Indian telecom providers?",
    "What are the latest UPI regulatory developments?",
    "What new EV technologies are emerging?",
    "What business risks should companies investigate?",
    "Which customer segments may be more likely to switch providers?"
  ];

  const loadSpend = async () => {
    try {
      const data = await fetchAISpendStatus();
      setSpendInfo(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadSpend();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      role: 'user',
      query: q
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const assistantMsg = await sendAIChat(q, industrySlug);
      setMessages(prev => [...prev, { ...assistantMsg, role: 'assistant' }]);
      await loadSpend();
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          facts: 'Connection / Inference Notice',
          interpretation: err.message || 'Unable to retrieve answer.',
          predictions: 'N/A',
          actions: 'Please verify server logs and retry.',
          sources: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none">
      
      {/* Top Banner & Spend Cap Status */}
      <div className="glass-raised rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-accent-green flex-shrink-0" />
          <span>
            Retrieval-Grounded Intelligence: Evaluates only indexed articles and verified filings. 
            <strong className="text-slate-900 dark:text-white ml-1 font-semibold">Zero Hallucinations Policy.</strong>
          </span>
        </div>

        {spendInfo && (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-base text-[11px] font-mono tabular-nums">
            <DollarSign className="w-3.5 h-3.5 text-accent-blue" />
            <span>Monthly Spend:</span>
            <span className="font-bold text-slate-900 dark:text-white">${spendInfo.current_spend_usd.toFixed(4)}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500">${spendInfo.spend_cap_usd.toFixed(2)} cap</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-2.5">
        <span className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
          Suggested Analyst Inquiries
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-left px-3.5 py-1.5 rounded-full glass-pill text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="space-y-6 min-h-[420px] p-4 sm:p-6 rounded-3xl glass-raised">
        {messages.map((msg, index) => {
          if (msg.role === 'user') {
            return (
              <div key={index} className="flex justify-end">
                <div className="max-w-xl px-5 py-3 rounded-3xl rounded-br-md bg-accent-blue text-white text-xs sm:text-sm font-medium shadow-md shadow-accent-blue/25 leading-relaxed">
                  {msg.query}
                </div>
              </div>
            );
          }

          // Four-Part Grounded Assistant Message as Collapsible Glass Sections
          const isCollapsedFacts = collapsedSections[`${index}-facts`];
          const isCollapsedInterp = collapsedSections[`${index}-interp`];
          const isCollapsedPred = collapsedSections[`${index}-pred`];
          const isCollapsedActions = collapsedSections[`${index}-actions`];

          return (
            <div key={index} className="space-y-3.5 max-w-4xl p-5 sm:p-6 rounded-3xl glass-base shadow-sm">
              
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200/40 dark:border-white/10 text-xs font-bold text-accent-blue">
                <div className="w-6 h-6 rounded-lg bg-accent-blue/15 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-accent-blue" />
                </div>
                <span>GIANT AI BUSINESS ANALYST</span>
                {msg.spend_cap_exceeded && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold border border-amber-500/30">
                    Spend Cap Paused
                  </span>
                )}
              </div>

              {/* Part 1: Verified Facts (Collapsible) */}
              <div className="rounded-2xl glass-raised border-blue-500/30 overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection(index, 'facts')}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-accent-blue uppercase tracking-wider focus:outline-none"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-blue" />
                    <span>1. Verified Facts (Primary Evidence)</span>
                  </div>
                  {isCollapsedFacts ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
                </button>
                {!isCollapsedFacts && (
                  <div className="px-4 pb-3.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line pl-9">
                    {msg.facts}
                  </div>
                )}
              </div>

              {/* Part 2: Evidence-Based Interpretation (Collapsible) */}
              <div className="rounded-2xl glass-raised border-purple-500/30 overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection(index, 'interp')}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-accent-purple uppercase tracking-wider focus:outline-none"
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-accent-purple" />
                    <span>2. Evidence-Based Interpretation</span>
                  </div>
                  {isCollapsedInterp ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
                </button>
                {!isCollapsedInterp && (
                  <div className="px-4 pb-3.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line pl-9">
                    {msg.interpretation}
                  </div>
                )}
              </div>

              {/* Part 3: Predictions and Assumptions (Collapsible) */}
              <div className="rounded-2xl glass-raised border-amber-500/30 overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection(index, 'pred')}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider focus:outline-none"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>3. Predictions & Assumptions (Explicitly Labeled)</span>
                  </div>
                  {isCollapsedPred ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
                </button>
                {!isCollapsedPred && (
                  <div className="px-4 pb-3.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line pl-9">
                    {msg.predictions}
                  </div>
                )}
              </div>

              {/* Part 4: Recommended Actions (Collapsible) */}
              <div className="rounded-2xl glass-raised border-emerald-500/30 overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection(index, 'actions')}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-accent-green uppercase tracking-wider focus:outline-none"
                >
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-accent-green" />
                    <span>4. Recommended Business Actions</span>
                  </div>
                  {isCollapsedActions ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
                </button>
                {!isCollapsedActions && (
                  <div className="px-4 pb-3.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line pl-9">
                    {msg.actions}
                  </div>
                )}
              </div>

              {/* Grounded Source Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-3 border-t border-slate-200/40 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">Sources Cited in Answer:</span>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-full glass-pill text-accent-blue font-semibold hover:underline"
                      >
                        <span className="truncate max-w-xs">{src.source}: {src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}

        {isLoading && (
          <div className="p-4 rounded-2xl glass-base animate-pulse flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
            <Bot className="w-4 h-4 text-accent-blue animate-spin" />
            <span>Retrieving indexed filings, checking prompt defenses, and synthesizing 4-part intelligence...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Field & Submit Pill */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="glass-raised rounded-full p-2 flex items-center gap-3 shadow-lg"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask the AI Business Analyst about ${industrySlug.toUpperCase()} market developments, tariffs, or competitors...`}
          className="flex-1 px-5 py-2.5 rounded-full glass-base text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="ios-btn-primary px-6 py-2.5 text-xs sm:text-sm flex items-center space-x-2 disabled:opacity-50"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
