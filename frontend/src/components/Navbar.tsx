import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Radio, 
  RefreshCw, 
  Layers, 
  ChevronRight,
  Building2,
  Zap,
  Smartphone,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { LiveClock } from './LiveClock';

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
  hasStaleSource = false,
}) => {
  const navigate = useNavigate();

  const getIndustryIcon = () => {
    switch (currentIndustry) {
      case 'telecom':
        return <Smartphone className="w-3.5 h-3.5 text-accent-blue" />;
      case 'fintech':
        return <Zap className="w-3.5 h-3.5 text-accent-green" />;
      case 'ev':
        return <Building2 className="w-3.5 h-3.5 text-accent-purple" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-400" />;
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
    <div className="sticky top-3 z-50 px-3 sm:px-6 max-w-7xl mx-auto w-full mb-6">
      <header className="glass-raised rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all">
        
        {/* Brand & Industry Breadcrumb */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-blue via-indigo-500 to-accent-purple flex items-center justify-center font-black text-white text-base tracking-wider shadow-md shadow-accent-blue/25 group-hover:scale-105 transition-transform">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5">
                GIANT
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent-blue/15 text-accent-blue border border-accent-blue/30 uppercase tracking-wider">
                  RADAR
                </span>
              </span>
            </div>
          </Link>

          {currentIndustry && (
            <div className="flex items-center space-x-1.5 text-xs">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => navigate('/industries')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full glass-pill text-slate-800 dark:text-slate-100 font-semibold"
                title="Switch selected industry"
              >
                {getIndustryIcon()}
                <span>{industryName || currentIndustry.toUpperCase()}</span>
                <span className="text-[10px] text-accent-blue font-bold uppercase ml-1">Switch</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Controls & Timestamps */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          
          {/* Live Date and Time */}
          <LiveClock />

          {/* Stale Warning Indicator */}
          {hasStaleSource && (
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-medium text-amber-500 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Source Degraded (Showing Last-Good)</span>
            </div>
          )}

          {/* Separate Timestamps: Last Sync & Next Scheduled Check */}
          <div className="hidden lg:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full glass-base text-xs">
            <div className="flex items-center space-x-1.5">
              <Radio className="w-3 h-3 text-accent-green animate-pulse motion-reduce:animate-none" />
              <span className="text-slate-500 dark:text-slate-400">Last Sync:</span>
              <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold tabular-nums">
                {formatTimeOnly(lastSyncTime)}
              </span>
            </div>
            {nextCheckTime && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3 h-3 text-accent-blue" />
                  <span className="text-slate-500 dark:text-slate-400">Next Check:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold tabular-nums">
                    {formatTimeOnly(nextCheckTime)}
                  </span>
                </div>
              </>
            )}
          </div>


          {/* Manual Refresh Trigger connected to Scheduler */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh latest RSS and official data feeds"
              className="ios-btn-primary flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
              title="Poll latest RSS and official feeds now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          )}

        </div>

      </header>
    </div>
  );
};
