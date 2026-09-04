import React, { useState, useEffect } from 'react';
import type { FraudTrendsData } from '../types';
import { fetchFraudTrends } from '../services/api';
import { SpikeAlertBanner } from '../components/SpikeAlertBanner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { AlertOctagon, TrendingUp, IndianRupee } from 'lucide-react';

export const FraudTrendsPage: React.FC = () => {
  const [data, setData] = useState<FraudTrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFraudTrends()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-cyan-400 font-semibold text-sm">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Analyzing Fraud Trends & Anomaly Signals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Defensive Fraud Spike Detector Banner */}
      {data.spike_detection.spike_detected && (
        <SpikeAlertBanner
          message={data.spike_detection.message}
          multiplier={data.spike_detection.multiplier}
        />
      )}

      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Pattern Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Fraud Trends & Anomaly Analytics</h2>
          <p className="text-xs text-slate-400 mt-1">Defensive temporal, sectoral, and value velocity monitoring across payment ecosystem.</p>
        </div>

        <div className="hidden sm:flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[11px] text-slate-400">Avg Fraud Amount</span>
            <div className="text-base font-bold text-rose-400 font-mono">₹{data.avg_fraud_amount.toLocaleString()}</div>
          </div>
          <div className="text-right border-l border-slate-800 pl-4">
            <span className="text-[11px] text-slate-400">Avg Legit Amount</span>
            <div className="text-base font-bold text-emerald-400 font-mono">₹{data.avg_legit_amount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Fraud Rate Trend Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Fraud Rate by Hour of Day</span>
            </h3>
            <span className="text-[11px] text-slate-400">% Fraud per Hour</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="fraud_rate" name="Fraud Rate (%)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorFraud)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Fraud Rate & Avg Fraud Ticket Size */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              <span>Fraud Rate by Sector</span>
            </h3>
            <span className="text-[11px] text-slate-400">Sectoral Vulnerability</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.category_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="fraud_rate" name="Fraud Rate (%)" fill="#fb7185" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
