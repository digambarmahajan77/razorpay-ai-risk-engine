import React from 'react';
import { ShieldCheck, Activity, BarChart3, Search, Settings, AlertOctagon, Cpu, Play } from 'lucide-react';
import { getIsMockEngineActive } from '../services/api';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectDemoTx: (txId: string) => void;
  backendHealthy: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSelectDemoTx,
  backendHealthy,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: Search },
    { id: 'risk-analysis', label: 'Risk Analysis', icon: Cpu },
    { id: 'model-performance', label: 'Model Performance', icon: Activity },
    { id: 'fraud-trends', label: 'Fraud Trends', icon: AlertOctagon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  Raksha<span className="text-cyan-400">Pay</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Defense-only AI Risk Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">AI-powered payment risk intelligence</p>
            </div>
          </div>

          {/* Quick Demo Scenarios Dropdown */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span className="text-xs text-slate-300 font-medium">Quick Demo Preset:</span>
            <select
              className="bg-slate-900 text-xs text-cyan-300 font-medium rounded border border-slate-700 px-2 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
              onChange={(e) => {
                if (e.target.value) {
                  onSelectDemoTx(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>-- Select Demo Tx --</option>
              <option value="DEMO-TXN-001">Tx A: ₹850 (Low Risk - Score 12)</option>
              <option value="DEMO-TXN-002">Tx B: ₹4,200 (Med Risk - Score 54)</option>
              <option value="DEMO-TXN-003">Tx C: ₹48,500 (High Risk - Score 91)</option>
              <option value="DEMO-TXN-004">Tx D: ₹72,000 (High Risk - Score 96)</option>
              <option value="DEMO-TXN-005">Tx E: ₹1,200 (Low Risk - Score 18)</option>
            </select>
          </div>

          {/* Backend Status Pill */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  backendHealthy
                    ? getIsMockEngineActive()
                      ? 'bg-cyan-400 animate-pulse'
                      : 'bg-emerald-400 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              {backendHealthy
                ? getIsMockEngineActive()
                  ? 'AI Engine (Demo Preview)'
                  : 'Live API Connected'
                : 'Backend Offline'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
