import React from 'react';
import type { DashboardData, Transaction } from '../types';
import { KPICards } from '../components/KPICards';
import { RiskBadge } from '../components/RiskBadge';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Eye, ArrowUpRight } from 'lucide-react';

interface DashboardPageProps {
  data: DashboardData | null;
  loading: boolean;
  onSelectTransaction: (tx: Transaction) => void;
  onViewAllTransactions: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  data,
  loading,
  onSelectTransaction,
  onViewAllTransactions,
}) => {
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-cyan-400 font-semibold text-sm">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading RakshaPay AI Dashboard...</span>
        </div>
      </div>
    );
  }

  const COLORS = {
    'LOW RISK': '#10b981',
    'MEDIUM RISK': '#f59e0b',
    'HIGH RISK': '#ef4444',
  };

  const riskPieData = Object.entries(data.risk_distribution).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name as keyof typeof COLORS] || '#64748b',
  }));

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <KPICards kpis={data.kpis} />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Level Distribution Pie Chart */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Risk Distribution</h3>
            <span className="text-[11px] text-slate-400">0-100 Score Segmentation</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs mt-2">
            {riskPieData.map((item, i) => (
              <div key={i} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Fraud by Merchant Category Bar Chart */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Fraud by Merchant Category</h3>
            <span className="text-[11px] text-slate-400">Total vs Fraudulent Transactions</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.merchant_categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="total" name="Total Txns" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fraud" name="Fraud Flagged" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time payment risk evaluations</p>
          </div>
          <button
            onClick={onViewAllTransactions}
            className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
          >
            <span>View All Transactions</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Transaction ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3">Merchant Category</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.recent_transactions.map((tx) => (
                <tr
                  key={tx.transaction_id}
                  onClick={() => onSelectTransaction(tx)}
                  className="hover:bg-slate-800/50 transition cursor-pointer group"
                >
                  <td className="p-3 font-mono font-bold text-cyan-300 group-hover:text-cyan-200">
                    {tx.transaction_id}
                  </td>
                  <td className="p-3 text-slate-400">{tx.timestamp}</td>
                  <td className="p-3 font-bold text-white font-mono">₹{tx.amount.toLocaleString()}</td>
                  <td className="p-3 font-medium text-slate-300">{tx.payment_method}</td>
                  <td className="p-3 capitalize text-slate-300">{tx.merchant_category}</td>
                  <td className="p-3">
                    <RiskBadge level={tx.risk_level} score={tx.risk_score} size="sm" />
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      tx.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-cyan-600 transition">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
