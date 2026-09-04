import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { FraudTrendsPage } from './pages/FraudTrendsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TransactionModal } from './components/TransactionModal';
import { fetchHealth, fetchDashboard, fetchTransactionDetail } from './services/api';
import type { DashboardData, Transaction } from './types';

export function App() {
  const [inDashboardMode, setInDashboardMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendHealthy, setBackendHealthy] = useState(false);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Poll backend health and load dashboard data
  const checkHealthAndLoadData = async () => {
    try {
      const h = await fetchHealth();
      setBackendHealthy(h.status === 'healthy');

      setLoadingDashboard(true);
      const dash = await fetchDashboard();
      setDashboardData(dash);
    } catch (err) {
      setBackendHealthy(false);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    checkHealthAndLoadData();
  }, []);

  const handleSelectDemoTx = async (txId: string) => {
    try {
      const tx = await fetchTransactionDetail(txId);
      setSelectedTx(tx);
      setInDashboardMode(true);
    } catch (err) {
      alert(`Could not load transaction ${txId}`);
    }
  };

  const handleStatusUpdated = (txId: string, newStatus: string) => {
    if (selectedTx && selectedTx.transaction_id === txId) {
      setSelectedTx({ ...selectedTx, status: newStatus as any });
    }
    // Refresh dashboard data
    fetchDashboard().then(setDashboardData).catch(console.error);
  };

  if (!inDashboardMode) {
    return <LandingPage onStart={() => setInDashboardMode(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectDemoTx={handleSelectDemoTx}
        backendHealthy={backendHealthy}
      />

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'dashboard' && (
          <DashboardPage
            data={dashboardData}
            loading={loadingDashboard}
            onSelectTransaction={setSelectedTx}
            onViewAllTransactions={() => setActiveTab('transactions')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsPage onSelectTransaction={setSelectedTx} />
        )}

        {activeTab === 'risk-analysis' && (
          <RiskAnalysisPage />
        )}

        {activeTab === 'model-performance' && (
          <ModelPerformancePage />
        )}

        {activeTab === 'fraud-trends' && (
          <FraudTrendsPage />
        )}

        {activeTab === 'settings' && (
          <SettingsPage onDataRegenerated={checkHealthAndLoadData} />
        )}
      </main>

      {/* Deep-dive Transaction Modal */}
      <TransactionModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        RakshaPay Explainable AI Fraud Engine • Track 02 Defense-Only Hackathon Solution
      </footer>
    </div>
  );
}

export default App;
