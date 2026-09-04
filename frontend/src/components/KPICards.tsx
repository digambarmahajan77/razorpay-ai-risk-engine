import React from 'react';
import type { KPIMetrics } from '../types';
import { CreditCard, ShieldAlert, ShieldCheck, IndianRupee, AlertTriangle, Target } from 'lucide-react';

interface KPICardsProps {
  kpis: KPIMetrics;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const cards = [
    {
      title: 'Total Transactions',
      value: kpis.total_transactions.toLocaleString(),
      subtext: `Vol: ₹${(kpis.total_volume / 100000).toFixed(2)} Lakhs`,
      icon: CreditCard,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Fraud Detected',
      value: `${kpis.fraud_detected.toLocaleString()} txns`,
      subtext: `Fraud Rate: ${kpis.fraud_rate}%`,
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'High Risk Transactions',
      value: kpis.high_risk_transactions.toLocaleString(),
      subtext: 'Flagged for 2FA / Verification',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Potential Loss Prevented',
      value: `₹${(kpis.potential_loss_prevented / 100000).toFixed(2)} Lakhs`,
      subtext: 'Protected merchant revenue',
      icon: IndianRupee,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'False Positive Cost',
      value: `₹${kpis.false_positive_cost_test.toLocaleString()}`,
      subtext: `${kpis.false_positives_test} txns @ ₹${kpis.review_cost}/review`,
      icon: ShieldCheck,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Model Recall',
      value: `${(kpis.model_recall * 100).toFixed(1)}%`,
      subtext: 'Held-out test set accuracy',
      icon: Target,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-card glass-card-hover rounded-xl p-4 border flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{card.title}</span>
              <div className={`p-2 rounded-lg border ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-white tracking-tight">{card.value}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">{card.subtext}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
