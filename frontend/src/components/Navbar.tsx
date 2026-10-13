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
  Smartphone,
  AlertTriangle,
  Clock,
  Play,
  Pause
} from 'lucide-react';

interface NavbarProps {
  currentIndustry?: string;
  industryName?: string;
  lastSyncTime?: string | null;
  nextCheckTime?: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  autoRefreshEnabled?: boolean;
  onToggleAutoRefresh?: () => void;
  hasStaleSource?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentIndustry,
  industryName,
  lastSyncTime,
  nextCheckTime,
  onRefresh,
  isRefreshing = false,
  autoRefreshEnabled = true,
  onToggleAutoRefresh,
  hasStaleSource = false,
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

  const formatTimeOnly = (timestamp?: string | null) => {
    if (!timestamp) return 'No sync recorded';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-navy-950/90 backdrop-blur-md border-b border-navy-800">
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

        {/* Action Controls & Timestamps */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Stale Warning Indicator */}
          {hasStaleSource && (
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Source Degraded (Showing Last-Good)</span>
            </div>
          )}

          {/* Separate Timestamps: Last Sync & Next Scheduled Check */}
          <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-navy-900/90 border border-navy-800 text-xs text-slate-300">
            <div className="flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-slate-400">Last Sync:</span>
              <span className="font-mono text-slate-100 font-medium">
                {formatTimeOnly(lastSyncTime)}
              </span>
            </div>
            {nextCheckTime && (
              <>
                <span className="text-slate-600">•</span>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent-blue" />
                  <span className="text-slate-400">Next Check:</span>
                  <span className="font-mono text-slate-200 font-medium">
                    {formatTimeOnly(nextCheckTime)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Auto Refresh Toggle Button */}
          {onToggleAutoRefresh && (
            <button
              onClick={onToggleAutoRefresh}
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                autoRefreshEnabled 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' 
                  : 'bg-navy-900 border-navy-700 text-slate-400 hover:text-white'
              }`}
              title={autoRefreshEnabled ? 'Auto-refresh active (polls every 30s)' : 'Auto-refresh paused'}
            >
              {autoRefreshEnabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="text-[11px]">{autoRefreshEnabled ? 'Auto (30s)' : 'Paused'}</span>
            </button>
          )}

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

          {/* Manual Refresh Trigger connected to Scheduler */}
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
