import React from 'react';
import { AlertOctagon, ShieldCheck } from 'lucide-react';

interface SpikeAlertBannerProps {
  message: string;
  multiplier: number;
}

export const SpikeAlertBanner: React.FC<SpikeAlertBannerProps> = ({ message, multiplier }) => {
  return (
    <div className="bg-gradient-to-r from-rose-950/80 via-amber-950/60 to-slate-900 border border-rose-500/40 rounded-xl p-4 mb-6 shadow-lg flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Defense Alert</span>
            <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
              {multiplier}x Baseline Spike
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-100 mt-0.5">{message}</p>
        </div>
      </div>
      <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-400 font-medium px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30">
        <ShieldCheck className="w-4 h-4" />
        <span>Step-Up 2FA Enforced</span>
      </div>
    </div>
  );
};
