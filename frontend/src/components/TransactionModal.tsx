import React, { useState } from 'react';
import type { Transaction } from '../types';
import { RiskBadge } from './RiskBadge';
import { X, CheckCircle2, XCircle, Clock, ShieldAlert, Cpu, Smartphone, MapPin, User, History, Zap } from 'lucide-react';
import { updateTransactionStatus } from '../services/api';

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onStatusUpdated: (txId: string, newStatus: string) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  onClose,
  onStatusUpdated,
}) => {
  const [updating, setUpdating] = useState(false);

  if (!transaction) return null;

  const handleAction = async (newStatus: string) => {
    try {
      setUpdating(true);
      await updateTransactionStatus(transaction.transaction_id, newStatus);
      onStatusUpdated(transaction.transaction_id, newStatus);
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  let explanations = transaction.explanations || [];
  if (explanations.length === 0 && transaction.explanation_json) {
    try {
      explanations = JSON.parse(transaction.explanation_json);
    } catch {
      explanations = [];
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white font-mono">{transaction.transaction_id}</h3>
                <RiskBadge level={transaction.risk_level} score={transaction.risk_score} size="md" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{transaction.timestamp} • Merchant: <span className="text-slate-200 capitalize">{transaction.merchant_category}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Risk Score & Recommendation Card */}
          <div className={`rounded-xl p-5 border flex flex-col md:flex-row items-center justify-between gap-4 ${
            transaction.risk_level === 'HIGH RISK' ? 'risk-gradient-high' :
            transaction.risk_level === 'MEDIUM RISK' ? 'risk-gradient-med' : 'risk-gradient-low'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-950/80 border-2 border-slate-700">
                <span className="text-2xl font-black font-mono text-white">{transaction.risk_score}</span>
                <span className="text-[10px] text-slate-400 absolute -bottom-1">/100</span>
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Risk Evaluation</span>
                <h4 className="text-xl font-bold text-white tracking-wide">{transaction.risk_level}</h4>
                <p className="text-xs text-slate-300 mt-1">Recommended Action: <strong className="text-cyan-400 uppercase">{transaction.recommended_action}</strong></p>
              </div>
            </div>

            {/* Current Status & Interactive Verification Action Buttons */}
            <div className="flex flex-col items-end space-y-2 w-full md:w-auto">
              <span className="text-xs text-slate-400">Status: <strong className="text-white uppercase">{transaction.status}</strong></span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={updating}
                  onClick={() => handleAction('APPROVED')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-emerald-950/40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>

                {transaction.risk_level !== 'LOW RISK' && (
                  <button
                    disabled={updating}
                    onClick={() => handleAction('UNDER_REVIEW')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-amber-950/40"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Send for Review</span>
                  </button>
                )}

                <button
                  disabled={updating}
                  onClick={() => handleAction('REJECTED')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-rose-950/40"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Risk Explanation Section */}
          <div className="glass-card rounded-xl p-5 border border-slate-800">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <h4 className="text-base font-bold text-white">AI Risk Explanation (Ranked Factors)</h4>
            </div>

            <div className="space-y-3">
              {explanations.map((factor: any, i: number) => (
                <div
                  key={i}
                  className="flex items-start justify-between p-3 rounded-lg bg-slate-850/80 border border-slate-800"
                >
                  <div className="flex items-start space-x-3">
                    {factor.points > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-xs font-bold whitespace-nowrap">
                        +{factor.points} Risk
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold whitespace-nowrap">
                        0 Risk
                      </span>
                    )}
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200">{factor.title}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">{factor.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="glass-card p-3 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Amount & Deviation</span>
              </div>
              <p className="text-sm font-bold text-white font-mono">₹{transaction.amount.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{transaction.amount_deviation}x vs Customer Avg (₹{transaction.customer_avg_amount.toLocaleString()})</p>
            </div>

            <div className="glass-card p-3 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Device Signature</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">{transaction.is_new_device ? 'Unrecognized New Device' : 'Known Device'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Device Risk Score: {transaction.device_risk_score}</p>
            </div>

            <div className="glass-card p-3 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Location Profile</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">{transaction.is_new_location ? 'Unusual Location' : 'Usual Location'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{transaction.distance_from_usual_location} km from cluster</p>
            </div>

            <div className="glass-card p-3 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Velocity (10 min)</span>
              </div>
              <p className="text-sm font-bold text-white font-mono">{transaction.transactions_last_10min} txns</p>
              <p className="text-[11px] text-slate-400 mt-0.5">24h Count: {transaction.customer_transaction_count_24h}</p>
            </div>

            <div className="glass-card p-3 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Previous Chargebacks</span>
              </div>
              <p className="text-sm font-bold text-white font-mono">{transaction.previous_chargebacks}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Account Age: {transaction.customer_account_age_days} days</p>
            </div>

            <div className="glass-card p-3 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                <span>Payment Method</span>
              </div>
              <p className="text-sm font-bold text-white font-mono">{transaction.payment_method}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">IP Risk Score: {transaction.ip_risk_score}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
