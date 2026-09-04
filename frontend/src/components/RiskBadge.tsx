import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' | string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showScore = true, size = 'md' }) => {
  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let icon = <ShieldCheck className="w-3.5 h-3.5 mr-1" />;

  if (level === 'LOW RISK' || (score !== undefined && score <= 30)) {
    colorClasses = 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 shadow-emerald-950/50';
    icon = <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" />;
  } else if (level === 'MEDIUM RISK' || (score !== undefined && score <= 70)) {
    colorClasses = 'bg-amber-950/80 text-amber-400 border-amber-500/40 shadow-amber-950/50';
    icon = <AlertTriangle className="w-4 h-4 mr-1 text-amber-400" />;
  } else if (level === 'HIGH RISK' || (score !== undefined && score > 70)) {
    colorClasses = 'bg-rose-950/80 text-rose-400 border-rose-500/50 shadow-rose-950/50 animate-pulse';
    icon = <ShieldAlert className="w-4 h-4 mr-1 text-rose-400" />;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border shadow-sm ${colorClasses} ${sizeClasses}`}>
      {icon}
      <span>{level}</span>
      {showScore && score !== undefined && (
        <span className="ml-1.5 px-1.5 py-0.2 rounded bg-black/40 text-white font-mono text-[11px]">
          {score}/100
        </span>
      )}
    </span>
  );
};
