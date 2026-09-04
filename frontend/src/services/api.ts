import type { DashboardData, Transaction, ModelMetrics, FraudTrendsData, SimulationResult } from '../types';

const API_BASE = 'http://localhost:8000/api';

export async function fetchHealth(): Promise<{ status: string; model_loaded: boolean }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function fetchTransactions(params: {
  search?: string;
  risk_level?: string;
  payment_method?: string;
  merchant_category?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ transactions: Transaction[]; total_count: number; page: number; limit: number; total_pages: number }> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.risk_level) query.set('risk_level', params.risk_level);
  if (params.payment_method) query.set('payment_method', params.payment_method);
  if (params.merchant_category) query.set('merchant_category', params.merchant_category);
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());

  const res = await fetch(`${API_BASE}/transactions?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function fetchTransactionDetail(id: string): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/transactions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch transaction details');
  return res.json();
}

export async function analyzeTransaction(inputData: Record<string, any>): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputData),
  });
  if (!res.ok) throw new Error('Failed to analyze transaction');
  return res.json();
}

export async function fetchModelMetrics(): Promise<ModelMetrics> {
  const res = await fetch(`${API_BASE}/model-metrics`);
  if (!res.ok) throw new Error('Failed to fetch model metrics');
  return res.json();
}

export async function fetchFraudTrends(): Promise<FraudTrendsData> {
  const res = await fetch(`${API_BASE}/fraud-trends`);
  if (!res.ok) throw new Error('Failed to fetch fraud trends');
  return res.json();
}

export async function updateTransactionStatus(id: string, status: string): Promise<void> {
  const res = await fetch(`${API_BASE}/transactions/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update transaction status');
}

export async function updateSettings(reviewCost: number): Promise<void> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review_cost: reviewCost }),
  });
  if (!res.ok) throw new Error('Failed to update settings');
}

export async function regenerateDemoData(): Promise<any> {
  const res = await fetch(`${API_BASE}/generate-demo-data`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to regenerate demo dataset');
  return res.json();
}
