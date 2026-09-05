import React, { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { fetchTransactions } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface TransactionsPageProps {
  onSelectTransaction: (tx: Transaction) => void;
  initialTxId?: string;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [paymentMethod, setPaymentMethod] = useState('ALL');
  const [merchantCategory, setMerchantCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    const execute = async () => {
      setLoading(true);
      try {
        const res = await fetchTransactions({
          search,
          risk_level: riskLevel,
          payment_method: paymentMethod,
          merchant_category: merchantCategory,
          status,
          page,
          limit: 15,
        });
        if (!isMounted) return;
        setTransactions(res.transactions);
        setTotalCount(res.total_count);
        setTotalPages(res.total_pages);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    execute();
    return () => {
      isMounted = false;
    };
  }, [search, riskLevel, paymentMethod, merchantCategory, status, page]);

  return (
    <div className="space-y-6">
      {/* Search & Filters Bar */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Transaction ID, Payment Method, Merchant..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filters ({totalCount} txns found)</span>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Risk Level</label>
            <select
              value={riskLevel}
              onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW RISK">LOW RISK (0-30)</option>
              <option value="MEDIUM RISK">MEDIUM RISK (31-70)</option>
              <option value="HIGH RISK">HIGH RISK (71-100)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="WALLET">Wallet</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Merchant Category</label>
            <select
              value={merchantCategory}
              onChange={(e) => { setMerchantCategory(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 capitalize"
            >
              <option value="ALL">All Categories</option>
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
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        {loading ? (
          <div className="p-12 text-center text-xs text-cyan-400 font-semibold">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No transactions match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Transaction ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
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
        )}

        {/* Pagination Controls */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing Page {page} of {totalPages} ({totalCount} items)</span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
