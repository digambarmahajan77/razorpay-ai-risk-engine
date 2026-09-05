import type { DashboardData, Transaction, ModelMetrics, FraudTrendsData, SimulationResult } from '../types';
import {
  getMockDashboardData,
  getMockTransactions,
  getMockTransactionDetail,
  calculateMockRiskAnalysis,
  getMockModelMetrics,
  getMockFraudTrends,
  updateMockTransactionStatus,
  updateMockSettings
} from './mockData';

// API Base URL resolution:
// 1. If VITE_API_BASE_URL is set in environment (Vercel settings or .env), use that.
// 2. In local development, default to 'http://localhost:8000/api'.
// 3. In production, default to relative '/api' or fallback to Autonomous Mock Engine.
const ENV_API_BASE = import.meta.env.VITE_API_BASE_URL ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '') : '';
const API_BASE = ENV_API_BASE || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

let isMockEngineActive = false;

export function getIsMockEngineActive(): boolean {
  return isMockEngineActive;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return response;
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

export async function fetchHealth(): Promise<{ status: string; model_loaded: boolean; mode?: string }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/health`, {}, 2000);
    if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
    const data = await res.json();
    isMockEngineActive = false;
    return { ...data, mode: 'live' };
  } catch {
    // If backend is not running or unreachable (e.g. standalone Vercel preview), activate autonomous mock engine
    isMockEngineActive = true;
    return {
      status: 'healthy',
      model_loaded: true,
      mode: 'demo'
    };
  }
}

export async function fetchDashboard(): Promise<DashboardData> {
  if (isMockEngineActive) {
    return getMockDashboardData();
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to autonomous demo dashboard data:', err);
    isMockEngineActive = true;
    return getMockDashboardData();
  }
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
  if (isMockEngineActive) {
    return getMockTransactions(params);
  }

  try {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.risk_level) query.set('risk_level', params.risk_level);
    if (params.payment_method) query.set('payment_method', params.payment_method);
    if (params.merchant_category) query.set('merchant_category', params.merchant_category);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const res = await fetchWithTimeout(`${API_BASE}/transactions?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to mock transactions:', err);
    isMockEngineActive = true;
    return getMockTransactions(params);
  }
}

export async function fetchTransactionDetail(id: string): Promise<Transaction> {
  if (isMockEngineActive) {
    const tx = getMockTransactionDetail(id);
    if (!tx) throw new Error(`Transaction ${id} not found`);
    return tx;
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE}/transactions/${id}`);
    if (!res.ok) throw new Error('Failed to fetch transaction details');
    return await res.json();
  } catch (err) {
    console.warn(`Backend unavailable for detail of ${id}, falling back to mock:`, err);
    const tx = getMockTransactionDetail(id);
    if (!tx) throw new Error(`Transaction ${id} not found in mock store`);
    return tx;
  }
}

export async function analyzeTransaction(inputData: Record<string, any>): Promise<SimulationResult> {
  if (isMockEngineActive) {
    return calculateMockRiskAnalysis(inputData);
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputData),
    });
    if (!res.ok) throw new Error('Failed to analyze transaction');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, simulating risk analysis client-side:', err);
    return calculateMockRiskAnalysis(inputData);
  }
}

export async function fetchModelMetrics(): Promise<ModelMetrics> {
  if (isMockEngineActive) {
    return getMockModelMetrics();
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE}/model-metrics`);
    if (!res.ok) throw new Error('Failed to fetch model metrics');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to mock model metrics:', err);
    return getMockModelMetrics();
  }
}

export async function fetchFraudTrends(): Promise<FraudTrendsData> {
  if (isMockEngineActive) {
    return getMockFraudTrends();
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE}/fraud-trends`);
    if (!res.ok) throw new Error('Failed to fetch fraud trends');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to mock fraud trends:', err);
    return getMockFraudTrends();
  }
}

export async function updateTransactionStatus(id: string, status: string): Promise<void> {
  updateMockTransactionStatus(id, status);

  if (isMockEngineActive) {
    return;
  }

  try {
    await fetchWithTimeout(`${API_BASE}/transactions/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }, 1500);
  } catch (err) {
    console.warn('Backend status update failed, updated in-memory store:', err);
  }
}

export async function updateSettings(reviewCost: number): Promise<void> {
  updateMockSettings(reviewCost);

  if (isMockEngineActive) {
    return;
  }

  try {
    await fetchWithTimeout(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_cost: reviewCost }),
    }, 1500);
  } catch (err) {
    console.warn('Backend settings update failed, updated in-memory store:', err);
  }
}

export async function regenerateDemoData(): Promise<any> {
  if (isMockEngineActive) {
    return { status: 'success', message: 'Demo dataset active' };
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE}/generate-demo-data`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to regenerate demo dataset');
    return await res.json();
  } catch {
    return { status: 'success', message: 'Autonomous demo dataset ready' };
  }
}
