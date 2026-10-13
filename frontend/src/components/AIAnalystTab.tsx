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
  DollarSign
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
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner & Spend Cap Status */}
      <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Retrieval-Grounded Intelligence: Evaluates only indexed articles and verified filings. 
            <strong className="text-white ml-1">Zero Hallucinations Policy.</strong>
          </span>
        </div>

        {spendInfo && (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-navy-950 border border-navy-800 text-[11px] font-mono text-slate-300">
            <DollarSign className="w-3.5 h-3.5 text-accent-blue" />
            <span>Monthly Spend:</span>
            <span className="font-bold text-white">${spendInfo.current_spend_usd.toFixed(4)}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">${spendInfo.spend_cap_usd.toFixed(2)} cap</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-2">
        <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
          Suggested Analyst Inquiries
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-left px-3 py-1.5 rounded-lg bg-navy-900/80 hover:bg-navy-800 border border-navy-800 hover:border-accent-blue/40 text-xs text-slate-300 hover:text-white transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="space-y-6 min-h-[400px] p-6 rounded-2xl bg-navy-900/40 border border-navy-800">
        {messages.map((msg, index) => {
          if (msg.role === 'user') {
            return (
              <div key={index} className="flex justify-end">
                <div className="max-w-2xl px-4 py-3 rounded-2xl bg-accent-blue text-white text-xs sm:text-sm font-medium shadow-md shadow-accent-blue/20">
                  {msg.query}
                </div>
              </div>
            );
          }

          // Four-Part Grounded Assistant Message
          return (
            <div key={index} className="space-y-4 max-w-4xl p-5 rounded-2xl bg-navy-950/80 border border-navy-800">
              
              <div className="flex items-center space-x-2 pb-3 border-b border-navy-800/80 text-xs font-bold text-accent-blue">
                <Bot className="w-4 h-4" />
                <span>GIANT AI BUSINESS ANALYST</span>
                {msg.spend_cap_exceeded && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Spend Cap Paused
                  </span>
                )}
              </div>

              {/* Part 1: Verified Facts */}
              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-800/30 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-300 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-blue" />
                  <span>1. Verified Facts (Primary Evidence)</span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans pl-5">
                  {msg.facts}
                </div>
              </div>

              {/* Part 2: Evidence-Based Interpretation */}
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/30 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-accent-violet" />
                  <span>2. Evidence-Based Interpretation</span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line pl-5">
                  {msg.interpretation}
                </div>
              </div>

              {/* Part 3: Predictions and Assumptions */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Predictions & Assumptions (Explicitly Labeled)</span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line pl-5">
                  {msg.predictions}
                </div>
              </div>

              {/* Part 4: Recommended Actions */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>4. Recommended Business Actions</span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line pl-5">
                  {msg.actions}
                </div>
              </div>

              {/* Grounded Source Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-3 border-t border-navy-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300 block mb-1.5">Sources Cited in Answer:</span>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-navy-900 border border-navy-800 hover:border-accent-blue/50 text-accent-blue transition-colors"
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
          <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800 animate-pulse flex items-center space-x-3 text-xs text-slate-400">
            <Bot className="w-4 h-4 text-accent-blue animate-spin" />
            <span>Retrieving indexed filings, checking prompt defenses, and synthesizing 4-part intelligence...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Field & Submit */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex items-center gap-3 p-2 rounded-xl bg-navy-900/80 border border-navy-800"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask the AI Business Analyst about ${industrySlug.toUpperCase()} market developments, tariffs, or competitors...`}
          className="flex-1 px-4 py-2.5 rounded-lg bg-navy-950 border border-navy-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-blue transition-colors"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="px-5 py-2.5 rounded-lg bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors shadow-md shadow-accent-blue/20"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
