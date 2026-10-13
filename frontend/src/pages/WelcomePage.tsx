import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Database, 
  BarChart, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Clock updating
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 5-second auto redirect
  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate('/industries');
      return;
    }
    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, navigate]);

  const handleSkip = () => {
    navigate('/industries');
  };

  return (
    <div className="relative min-h-screen bg-navy-950 flex flex-col justify-between overflow-hidden select-none">
      
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-blue/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-violet/15 rounded-full blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-violet flex items-center justify-center font-black text-white text-xl tracking-wider shadow-xl shadow-accent-blue/25">
            G
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-wider">GIANT</span>
            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              Enterprise Intelligence
            </span>
          </div>
        </div>

        {/* Live Date and Time */}
        <div className="flex items-center space-x-4 text-xs text-slate-300">
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-800">
            <Clock className="w-3.5 h-3.5 text-accent-blue" />
            <span>{currentDate}</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-slate-100">{currentTime}</span>
          </div>

          <button
            onClick={handleSkip}
            className="group flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-navy-800/80 hover:bg-navy-700 border border-navy-700 hover:border-slate-500 text-xs font-semibold text-slate-200 transition-all"
          >
            <span>Skip ({secondsLeft}s)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Center Hero */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center flex flex-col items-center justify-center my-auto">
        
        {/* Subtle pill badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/25 text-accent-blue text-xs font-semibold mb-6">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Real-Time Market Radar & Churn Analytics</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
          HELLO, <span className="bg-gradient-to-r from-accent-blue via-indigo-400 to-accent-violet bg-clip-text text-transparent">BUSINESS ANALYST!</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 font-normal max-w-2xl mb-10 leading-relaxed">
          Understand Markets. Predict Change. Make Better Decisions.
        </p>

        {/* Interactive Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-10 text-left">
          <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-accent-blue flex items-center justify-center mb-2.5">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-white mb-1">Verified News & Feeds</h2>
            <p className="text-xs text-slate-400">Strictly authentic RSS feeds, publication timestamps, and zero simulated metrics.</p>
          </div>

          <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-white mb-1">Customer Churn Prediction</h2>
            <p className="text-xs text-slate-400">Calibrated ML algorithms with precision, recall, and retention insights on customer data.</p>
          </div>

          <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-accent-violet flex items-center justify-center mb-2.5">
              <BarChart className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-white mb-1">Power BI Deep Integration</h2>
            <p className="text-xs text-slate-400">Dedicated schema models, enterprise embed tokens, and live intelligence analytics.</p>
          </div>
        </div>

        {/* Primary CTA and Countdown */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleSkip}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:from-blue-600 hover:to-violet-600 text-white font-semibold text-sm shadow-lg shadow-accent-blue/25 hover:shadow-accent-blue/40 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Proceed to Industry Selection</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <span className="text-xs text-slate-400">
            Auto-advancing in <strong className="text-white font-mono">{secondsLeft}s</strong>
          </span>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-navy-900">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-accent-blue" />
          <span>Strict Enterprise Integrity: No Hallucinated Metrics or Fabricated Timestamps.</span>
        </div>
        <div className="mt-2 sm:mt-0 font-mono">
          GIANT Platform v1.0
        </div>
      </footer>

    </div>
  );
};
