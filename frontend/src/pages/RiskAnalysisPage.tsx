import React, { useState } from 'react';
import type { SimulationResult } from '../types';
import { analyzeTransaction } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { Cpu, Play, ShieldAlert, Zap, AlertCircle } from 'lucide-react';

export const RiskAnalysisPage: React.FC = () => {
  const [formData, setFormData] = useState({
    amount: 48500,
    customer_avg_amount: 2500,
    transaction_hour: 14,
    transactions_last_10min: 5,
    customer_transaction_count_24h: 9,
    is_new_device: 1,
    is_new_location: 1,
    distance_from_usual_location: 480,
    failed_attempts_24h: 3,
    previous_chargebacks: 1,
    ip_risk_score: 0.88,
    device_risk_score: 0.91,
    customer_account_age_days: 12,
    customer_age: 28,
    payment_method: 'CREDIT_CARD',
    merchant_category: 'luxury',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const presets = [
    {
      name: 'Tx A: ₹850 (Low Risk - Score 12)',
      data: { amount: 850, customer_avg_amount: 900, transaction_hour: 10, transactions_last_10min: 0, customer_transaction_count_24h: 1, is_new_device: 0, is_new_location: 0, distance_from_usual_location: 1.2, failed_attempts_24h: 0, previous_chargebacks: 0, ip_risk_score: 0.05, device_risk_score: 0.08, customer_account_age_days: 420, customer_age: 32, payment_method: 'UPI', merchant_category: 'grocery' }
    },
    {
      name: 'Tx B: ₹4,200 (Med Risk - Score 54)',
      data: { amount: 4200, customer_avg_amount: 1800, transaction_hour: 9, transactions_last_10min: 2, customer_transaction_count_24h: 4, is_new_device: 1, is_new_location: 0, distance_from_usual_location: 14.5, failed_attempts_24h: 1, previous_chargebacks: 0, ip_risk_score: 0.38, device_risk_score: 0.42, customer_account_age_days: 180, customer_age: 45, payment_method: 'DEBIT_CARD', merchant_category: 'electronics' }
    },
    {
      name: 'Tx C: ₹48,500 (High Risk - Score 91)',
      data: { amount: 48500, customer_avg_amount: 2500, transaction_hour: 8, transactions_last_10min: 5, customer_transaction_count_24h: 9, is_new_device: 1, is_new_location: 1, distance_from_usual_location: 480, failed_attempts_24h: 3, previous_chargebacks: 1, ip_risk_score: 0.88, device_risk_score: 0.91, customer_account_age_days: 12, customer_age: 28, payment_method: 'CREDIT_CARD', merchant_category: 'luxury' }
    },
    {
      name: 'Tx D: ₹72,000 (High Risk - Score 96)',
      data: { amount: 72000, customer_avg_amount: 3000, transaction_hour: 7, transactions_last_10min: 7, customer_transaction_count_24h: 12, is_new_device: 1, is_new_location: 1, distance_from_usual_location: 750, failed_attempts_24h: 4, previous_chargebacks: 2, ip_risk_score: 0.94, device_risk_score: 0.96, customer_account_age_days: 5, customer_age: 31, payment_method: 'CREDIT_CARD', merchant_category: 'gaming' }
    },
    {
      name: 'Tx E: ₹1,200 (Low Risk - Score 18)',
      data: { amount: 1200, customer_avg_amount: 1400, transaction_hour: 6, transactions_last_10min: 0, customer_transaction_count_24h: 1, is_new_device: 0, is_new_location: 0, distance_from_usual_location: 2.1, failed_attempts_24h: 0, previous_chargebacks: 0, ip_risk_score: 0.08, device_risk_score: 0.06, customer_account_age_days: 850, customer_age: 52, payment_method: 'UPI', merchant_category: 'utilities' }
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await analyzeTransaction(formData);
      setResult(res);
    } catch (err) {
      alert('Error running risk analysis simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Interactive AI Risk Simulator</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Manual Transaction Risk Analysis</h2>
          <p className="text-xs text-slate-400 mt-1">Input custom payment attributes to trigger real-time ML risk scoring & SHAP factor explanations.</p>
        </div>

        {/* Demo Presets Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setFormData(p.data); setResult(null); }}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
            >
              {p.name.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulator Input Form */}
        <form onSubmit={handleAnalyze} className="glass-card rounded-2xl p-6 border border-slate-800 lg:col-span-2 space-y-5">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Transaction Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Customer Avg Amount (₹)</label>
              <input
                type="number"
                name="customer_avg_amount"
                value={formData.customer_avg_amount}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Payment Method</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="UPI">UPI</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="WALLET">Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Merchant Category</label>
              <select
                name="merchant_category"
                value={formData.merchant_category}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none capitalize"
              >
                <option value="ecommerce">Ecommerce</option>
                <option value="electronics">Electronics</option>
                <option value="travel">Travel</option>
                <option value="gaming">Gaming</option>
                <option value="grocery">Grocery</option>
                <option value="utilities">Utilities</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">New Device Detected</label>
              <select
                name="is_new_device"
                value={formData.is_new_device}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value={0}>0 - Known Device</option>
                <option value={1}>1 - New Unrecognized Device</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">New Location Detected</label>
              <select
                name="is_new_location"
                value={formData.is_new_location}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value={0}>0 - Usual Location</option>
                <option value={1}>1 - Unusual Location</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Location Distance (km)</label>
              <input
                type="number"
                name="distance_from_usual_location"
                value={formData.distance_from_usual_location}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Txns in Last 10 Min</label>
              <input
                type="number"
                name="transactions_last_10min"
                value={formData.transactions_last_10min}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Failed OTP Attempts (24h)</label>
              <input
                type="number"
                name="failed_attempts_24h"
                value={formData.failed_attempts_24h}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Previous Chargebacks</label>
              <input
                type="number"
                name="previous_chargebacks"
                value={formData.previous_chargebacks}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">IP Threat Score (0-1)</label>
              <input
                type="number"
                step="0.01"
                name="ip_risk_score"
                value={formData.ip_risk_score}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Account Age (Days)</label>
              <input
                type="number"
                name="customer_account_age_days"
                value={formData.customer_account_age_days}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Running XGBoost ML Inference...</span>
              </div>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Analyze Transaction</span>
              </>
            )}
          </button>
        </form>

        {/* Live Results Panel */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>AI Evaluation Output</span>
            </h3>

            {!result ? (
              <div className="py-16 text-center text-xs text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <span>Click "Analyze Transaction" or choose a Quick Preset to view real-time AI scoring.</span>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                {/* Risk Gauge Header */}
                <div className={`p-4 rounded-xl border ${
                  result.risk_level === 'HIGH RISK' ? 'risk-gradient-high' :
                  result.risk_level === 'MEDIUM RISK' ? 'risk-gradient-med' : 'risk-gradient-low'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Calculated Score</span>
                      <div className="text-3xl font-black text-white font-mono">{result.risk_score}<span className="text-xs text-slate-400">/100</span></div>
                    </div>
                    <RiskBadge level={result.risk_level} score={result.risk_score} size="lg" />
                  </div>
                  <p className="text-xs text-slate-300 mt-2">Recommended: <strong className="text-cyan-400 uppercase">{result.recommended_action}</strong></p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{result.action_description}</p>
                </div>

                {/* Ranked Risk Factors */}
                <div>
                  <h4 className="text-xs font-bold text-white mb-2">Why was this flagged? (Top Factors)</h4>
                  <div className="space-y-2">
                    {result.explanations.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-slate-200">{item.title}</span>
                          <span className={item.points > 0 ? 'text-rose-400 font-mono font-bold' : 'text-emerald-400 font-mono font-bold'}>
                            {item.points > 0 ? `+${item.points} Risk` : '0 Risk'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
