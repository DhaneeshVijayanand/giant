import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Radio, 
  RefreshCw, 
  Layers, 
  BarChart3, 
  ChevronRight,
  Building2,
  Zap,
  Smartphone
} from 'lucide-react';

interface NavbarProps {
  currentIndustry?: string;
  industryName?: string;
  lastSyncTime?: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentIndustry,
  industryName,
  lastSyncTime,
  onRefresh,
  isRefreshing = false,
}) => {
  const navigate = useNavigate();

  const getIndustryIcon = () => {
    switch (currentIndustry) {
      case 'telecom':
        return <Smartphone className="w-4 h-4 text-accent-blue" />;
      case 'fintech':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'ev':
        return <Building2 className="w-4 h-4 text-purple-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatSyncTime = (timestamp?: string | null) => {
    if (!timestamp) return 'No sync recorded';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-navy-950/85 backdrop-blur-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Industry Breadcrumb */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-accent-blue to-accent-violet flex items-center justify-center font-black text-white text-lg tracking-wider shadow-lg shadow-accent-blue/20 group-hover:scale-105 transition-transform">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wide text-white flex items-center gap-1.5">
                GIANT
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-blue/15 text-accent-blue border border-accent-blue/30">
                  INTELLIGENCE
                </span>
              </span>
            </div>
          </Link>

          {currentIndustry && (
            <div className="flex items-center space-x-2 text-xs sm:text-sm">
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <button
                onClick={() => navigate('/industries')}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700 hover:border-accent-blue/50 text-slate-200 transition-colors"
                title="Switch selected industry"
              >
                {getIndustryIcon()}
                <span className="font-medium">{industryName || currentIndustry.toUpperCase()}</span>
                <span className="text-[11px] text-accent-blue underline ml-1">Switch</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Controls & Real-Time Indicators */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Data Freshness Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-900/90 border border-navy-800 text-xs text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Feed Freshness:</span>
            <span className="font-mono text-slate-100 font-medium">
              {formatSyncTime(lastSyncTime)}
            </span>
          </div>

          {/* Power BI Page 3.1 Link */}
          {currentIndustry && (
            <Link
              to={`/industry/${currentIndustry}/news-bi`}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-800/80 hover:bg-navy-700/80 border border-accent-violet/30 hover:border-accent-violet text-xs font-semibold text-purple-300 transition-all shadow-sm shadow-purple-500/10"
            >
              <BarChart3 className="w-3.5 h-3.5 text-accent-violet" />
              <span className="hidden sm:inline">Power BI View</span>
            </Link>
          )}

          {/* Manual Refresh Trigger */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-accent-blue hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium transition-all shadow-md shadow-accent-blue/20"
              title="Poll latest RSS and official feeds now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
