import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Database, 
  BarChart, 
  ShieldCheck, 
  Globe
} from 'lucide-react';
import { LiveClock } from '../components/LiveClock';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate('/industries');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none">
      
      {/* Top Header Floating Glass Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-accent-blue via-indigo-500 to-accent-purple flex items-center justify-center font-black text-white text-xl tracking-wider shadow-lg shadow-accent-blue/30">
            G
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider text-slate-900 dark:text-white">GIANT</span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest">
              Enterprise Intelligence
            </span>
          </div>
        </div>

        {/* Live Date, Time, and GET INTO THE WORLD Pill */}
        <div className="flex items-center space-x-3 text-xs">
          <LiveClock />

          {/* Glass (GET INTO THE WORLD) Pill */}
          <button
            onClick={handleEnter}
            aria-label="GET INTO THE WORLD - Proceed to industry selection"
            className="group flex items-center space-x-2 px-4 py-2 rounded-full glass-pill font-bold tracking-wider text-xs text-slate-800 dark:text-slate-100 hover:text-accent-blue dark:hover:text-accent-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue transition-all uppercase"
          >
            <Globe className="w-3.5 h-3.5 text-accent-blue group-hover:rotate-12 transition-transform motion-reduce:transform-none" />
            <span>GET INTO THE WORLD</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform motion-reduce:transform-none" />
          </button>
        </div>
      </header>

      {/* Center Hero Glass Card */}
      <main className="relative z-10 max-w-4xl mx-auto w-full my-auto py-8">
        
        {/* Soft Background Chart/Network Motif */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-25 dark:opacity-20 pointer-events-none">
          <svg className="w-full h-full max-w-3xl" viewBox="0 0 600 300" fill="none">
            <path d="M50 250 C 150 150, 250 280, 350 180 C 450 80, 550 120, 580 90" stroke="url(#paint0_linear)" strokeWidth="3" strokeDasharray="6 6" />
            <circle cx="350" cy="180" r="6" fill="#007AFF" />
            <circle cx="450" cy="80" r="5" fill="#AF52DE" />
            <circle cx="580" cy="90" r="7" fill="#30B0C7" />
            <defs>
              <linearGradient id="paint0_linear" x1="50" y1="250" x2="580" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007AFF" />
                <stop offset="0.5" stopColor="#AF52DE" />
                <stop offset="1" stopColor="#30B0C7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Large Centered Frosted Glass Panel */}
        <div className="glass-raised rounded-3xl p-6 sm:p-10 lg:p-12 text-center flex flex-col items-center">
          
          {/* Subtle iOS Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-accent-blue/15 border border-accent-blue/30 text-accent-blue text-xs font-semibold mb-6 shadow-sm">
            <Activity className="w-3.5 h-3.5 animate-pulse motion-reduce:animate-none" />
            <span>Real-Time Market Radar & Churn Analytics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight text-slate-900 dark:text-white">
            WELCOME TO{' '}
            <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-sky-400 dark:via-cyan-300 dark:to-sky-200 bg-clip-text text-transparent font-black filter dark:drop-shadow-[0_2px_16px_rgba(56,189,248,0.35)]">
              GIANT!
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 font-normal max-w-2xl mb-10 leading-relaxed">
            Understand Markets. Predict Change. Make Better Decisions.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-10 text-left">
            <div className="p-5 rounded-2xl glass-base hover:scale-[1.02] transition-transform motion-reduce:transform-none">
              <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center mb-3">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Verified News & Feeds</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Strictly authentic RSS feeds, publication timestamps, and zero simulated metrics.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-base hover:scale-[1.02] transition-transform motion-reduce:transform-none">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-accent-green flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Customer Churn Prediction</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Calibrated ML algorithms with precision, recall, and retention insights on customer data.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-base hover:scale-[1.02] transition-transform motion-reduce:transform-none">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-accent-purple flex items-center justify-center mb-3">
                <BarChart className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Power BI Deep Integration</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dedicated schema models, enterprise embed tokens, and live intelligence analytics.
              </p>
            </div>
          </div>

          {/* Primary CTA: GET INTO THE WORLD */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleEnter}
              aria-label="GET INTO THE WORLD - Enter Platform"
              className="ios-btn-primary px-9 py-4 text-base font-extrabold tracking-wider flex items-center justify-center space-x-3 shadow-xl shadow-accent-blue/30 hover:shadow-accent-blue/50 active:scale-[0.98] transition-all group uppercase"
            >
              <Globe className="w-5 h-5 text-white/90 group-hover:rotate-12 transition-transform motion-reduce:transform-none" />
              <span>GET INTO THE WORLD</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform motion-reduce:transform-none" />
            </button>
          </div>

        </div>

      </main>

      {/* Footer Floating Glass Banner */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-accent-blue" />
          <span>Strict Enterprise Integrity: No Hallucinated Metrics or Fabricated Timestamps.</span>
        </div>
        <div className="mt-2 sm:mt-0 font-mono text-[11px]">
          GIANT Platform v1.0
        </div>
      </footer>

    </div>
  );
};
