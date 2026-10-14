import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface LiveClockProps {
  className?: string;
  showIcon?: boolean;
}

export const LiveClock: React.FC<LiveClockProps> = ({ className = '', showIcon = true }) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full glass-pill text-xs text-slate-300 ${className}`}>
      {showIcon && <Clock className="w-3.5 h-3.5 text-accent-blue flex-shrink-0" />}
      <span className="hidden sm:inline font-medium whitespace-nowrap">{date}</span>
      <span className="hidden sm:inline text-slate-500">•</span>
      <span className="font-mono tabular-nums font-semibold text-white whitespace-nowrap">{time}</span>
    </div>
  );
};
