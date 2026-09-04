import React from 'react';
import { ShieldCheck, Cpu, ArrowRight, Activity, PieChart, ShieldAlert } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">
            Raksha<span className="text-cyan-400">Pay</span>
          </span>
        </div>
        <span className="text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Track 02: AI Risk Manager
        </span>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center z-10 my-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-6">
          <ShieldAlert className="w-4 h-4" />
          <span>Defense-only AI Fraud Risk & Verification Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
          Detect risk before it <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            becomes loss.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          RakshaPay equips merchants with explainable AI transaction risk scores, multi-factor anomaly root causes, and business false-positive cost optimization.
        </p>

        {/* Call to Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-base rounded-xl transition shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>Open Risk Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Explainable AI Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every high-risk transaction includes transparent factor breakdowns (+32 Risk → New Device, +21 Risk → Location Spike).
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">False-Positive Cost Model</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quantifies exact financial friction costs (legitimate transactions falsely flagged × ₹25 review cost) to protect profit margins.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Actionable Verification Workflows</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated routing recommendations (APPROVE, REVIEW, VERIFY) with interactive merchant review actions.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
        <span>RakshaPay AI Risk Engine • Razorpay Hackathon Prototype</span>
        <span>Strictly Defense-Only Architecture</span>
      </footer>
    </div>
  );
};
