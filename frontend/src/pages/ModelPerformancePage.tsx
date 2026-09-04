import React, { useState, useEffect } from 'react';
import type { ModelMetrics } from '../types';
import { fetchModelMetrics, updateSettings } from '../services/api';
import { Activity, Target, HelpCircle, IndianRupee, Cpu } from 'lucide-react';

export const ModelPerformancePage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewCostInput, setReviewCostInput] = useState(25);

  const loadMetrics = async () => {
    try {
      const data = await fetchModelMetrics();
      setMetrics(data);
      setReviewCostInput(data.review_cost_per_tx || 25);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleReviewCostChange = async (newVal: number) => {
    setReviewCostInput(newVal);
    try {
      await updateSettings(newVal);
      loadMetrics();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-cyan-400 font-semibold text-sm">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Evaluating Held-Out Test Set Metrics...</span>
        </div>
      </div>
    );
  }

  const { confusion_matrix } = metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Held-Out 20% Test Evaluation</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Machine Learning Model Performance</h2>
          <p className="text-xs text-slate-400 mt-1">
            Model: <strong className="text-cyan-300">{metrics.model_type}</strong> • Trained on {metrics.train_size} samples • Evaluated on {metrics.test_size} held-out test samples.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Stratified Split: 80% Train / 20% Test</span>
        </div>
      </div>

      {/* Top 5 Evaluation Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Recall</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{(metrics.recall * 100).toFixed(1)}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Fraud Catch Rate</p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Precision</span>
          <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">{(metrics.precision * 100).toFixed(1)}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Accuracy of Flags</p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">F1-Score</span>
          <div className="text-2xl font-black text-teal-400 mt-1 font-mono">{(metrics.f1_score * 100).toFixed(1)}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Harmonic Balance</p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">ROC-AUC</span>
          <div className="text-2xl font-black text-indigo-400 mt-1 font-mono">{metrics.roc_auc.toFixed(4)}</div>
          <p className="text-[11px] text-slate-400 mt-1">Discrimination Power</p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Accuracy</span>
          <div className="text-2xl font-black text-purple-400 mt-1 font-mono">{(metrics.accuracy * 100).toFixed(1)}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Overall Correctness</p>
        </div>
      </div>

      {/* Main Grid: Confusion Matrix & Financial Cost Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Visualizer */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <span>Held-Out Confusion Matrix ({metrics.test_size} Samples)</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">True Positive (TP)</span>
              <div className="text-3xl font-black text-emerald-300 font-mono mt-1">{confusion_matrix.true_positive}</div>
              <p className="text-[11px] text-slate-400 mt-1">Fraud Correctly Flagged</p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">True Negative (TN)</span>
              <div className="text-3xl font-black text-indigo-300 font-mono mt-1">{confusion_matrix.true_negative}</div>
              <p className="text-[11px] text-slate-400 mt-1">Legitimate Correctly Cleared</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">False Positive (FP)</span>
              <div className="text-3xl font-black text-amber-300 font-mono mt-1">{confusion_matrix.false_positive}</div>
              <p className="text-[11px] text-slate-400 mt-1">Legitimate Flagged (Adds Cost)</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">False Negative (FN)</span>
              <div className="text-3xl font-black text-rose-300 font-mono mt-1">{confusion_matrix.false_negative}</div>
              <p className="text-[11px] text-slate-400 mt-1">Fraud Missed (Direct Loss)</p>
            </div>
          </div>

          {/* Why Recall Matters Explanation Box */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start space-x-3 text-xs">
            <HelpCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-cyan-300">Why Recall Matters in Payment Fraud Detection</h4>
              <p className="text-slate-300 mt-1 leading-relaxed">
                In payment fraud detection, missing a fraudulent transaction (False Negative) causes direct financial chargeback losses. Therefore, RakshaPay prioritizes high <strong>Recall</strong> to stop bad actors while actively managing False Positive operational review costs.
              </p>
            </div>
          </div>
        </div>

        {/* Business False-Positive Cost Model */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
              <span>Financial False-Positive Cost Model</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              Track Requirement
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Demonstrates business impact by quantifying the operational cost of review friction when legitimate transactions are flagged.
          </p>

          <div className="space-y-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Configurable Review Cost (per tx):</span>
              <div className="flex items-center space-x-1 font-mono">
                <span className="text-slate-400">₹</span>
                <input
                  type="number"
                  value={reviewCostInput}
                  onChange={(e) => handleReviewCostChange(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-emerald-400 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Legitimate Transactions Incorrectly Flagged (Test Set):</span>
                <strong className="text-amber-400 font-mono">{metrics.false_positive_count_test}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Estimated Review Cost (Test Set):</span>
                <strong className="text-emerald-400 font-mono text-sm">₹{metrics.false_positive_cost_test.toLocaleString()}</strong>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-slate-300 font-semibold">Total Projected FP Cost (10k Transactions):</span>
                <strong className="text-cyan-400 font-mono text-base">₹{metrics.total_fp_cost_projected.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            <strong>Formula:</strong> False Positive Cost = Legitimate Transactions Incorrectly Flagged × Review/Verification Cost (₹{reviewCostInput})
          </div>
        </div>
      </div>
    </div>
  );
};
