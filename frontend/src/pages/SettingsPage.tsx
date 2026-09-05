import React, { useState } from 'react';
import { updateSettings, regenerateDemoData } from '../services/api';
import { Settings, RefreshCw, CheckCircle2, IndianRupee, Shield } from 'lucide-react';

interface SettingsPageProps {
  onDataRegenerated: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onDataRegenerated }) => {
  const [reviewCost, setReviewCost] = useState(25);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateSettings(reviewCost);
      setMessage('Settings updated successfully!');
    } catch {
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateData = async () => {
    if (!confirm('Regenerate 10,000 synthetic transactions and retrain XGBoost ML model?')) return;
    setRegenerating(true);
    setMessage('');
    try {
      await regenerateDemoData();
      setMessage('10,000 transactions regenerated & model retrained on held-out test split!');
      onDataRegenerated();
    } catch {
      alert('Failed to regenerate data');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>System Configuration</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">RakshaPay Risk Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Configure business review parameters and trigger ML dataset re-training.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Review Cost Form */}
      <form onSubmit={handleSaveSettings} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <IndianRupee className="w-4 h-4 text-emerald-400" />
          <span>Business False-Positive Cost Parameter</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Review Cost per Transaction (₹)</label>
          <p className="text-[11px] text-slate-400 mb-2">Cost incurred when a legitimate transaction is routed for manual review or 2FA step-up verification.</p>
          <input
            type="number"
            value={reviewCost}
            onChange={(e) => setReviewCost(parseFloat(e.target.value) || 0)}
            className="w-full sm:w-48 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition shadow-md"
        >
          {saving ? 'Saving...' : 'Save Review Cost Setting'}
        </button>
      </form>

      {/* Re-generate Data & Retrain Model */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Dataset & ML Pipeline Operations</span>
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed">
          Regenerate 10,000 realistic synthetic transactions, re-run stratified 80/20 train/test split, train XGBoost model, and re-populate SQLite database.
        </p>

        <button
          onClick={handleRegenerateData}
          disabled={regenerating}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs rounded-xl transition flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          <span>{regenerating ? 'Retraining XGBoost Pipeline...' : 'Regenerate 10k Transactions & Retrain Model'}</span>
        </button>
      </div>

      {/* Safety Statement */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Defense-Only Safety Statement:</strong>
          <p className="mt-0.5 leading-relaxed">
            RakshaPay is built solely for merchant protection and risk verification. It does not provide mechanisms to bypass authentication, spoof payment instruments, or facilitate unauthorized transactions.
          </p>
        </div>
      </div>
    </div>
  );
};
