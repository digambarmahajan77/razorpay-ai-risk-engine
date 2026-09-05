import type { DashboardData, Transaction, ModelMetrics, FraudTrendsData, SimulationResult, ExplanationFactor } from '../types';

let currentReviewCost = 25.0;

export const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    transaction_id: 'DEMO-TXN-001',
    timestamp: '2026-09-04 10:15:00',
    amount: 850.0,
    transaction_hour: 10,
    transaction_day: 4,
    customer_age: 32,
    customer_transaction_count_24h: 1,
    customer_avg_amount: 900.0,
    amount_deviation: 0.94,
    is_new_device: 0,
    is_new_location: 0,
    distance_from_usual_location: 1.2,
    failed_attempts_24h: 0,
    transactions_last_10min: 0,
    payment_method: 'UPI',
    merchant_category: 'grocery',
    customer_account_age_days: 420,
    previous_chargebacks: 0,
    ip_risk_score: 0.05,
    device_risk_score: 0.08,
    velocity_score: 0.02,
    fraud_label: 0,
    risk_score: 12,
    risk_level: 'LOW RISK',
    recommended_action: 'APPROVE',
    status: 'APPROVED',
    explanations: [
      {
        feature: 'normal_pattern',
        points: 0,
        title: 'Normal Customer Pattern',
        description: 'Transaction matches standard daily grocery purchasing behavior on verified mobile device.'
      }
    ]
  },
  {
    transaction_id: 'DEMO-TXN-002',
    timestamp: '2026-09-04 09:42:00',
    amount: 4200.0,
    transaction_hour: 9,
    transaction_day: 4,
    customer_age: 45,
    customer_transaction_count_24h: 4,
    customer_avg_amount: 1800.0,
    amount_deviation: 2.33,
    is_new_device: 1,
    is_new_location: 0,
    distance_from_usual_location: 14.5,
    failed_attempts_24h: 1,
    transactions_last_10min: 2,
    payment_method: 'DEBIT_CARD',
    merchant_category: 'electronics',
    customer_account_age_days: 180,
    previous_chargebacks: 0,
    ip_risk_score: 0.38,
    device_risk_score: 0.42,
    velocity_score: 0.52,
    fraud_label: 0,
    risk_score: 54,
    risk_level: 'MEDIUM RISK',
    recommended_action: 'REVIEW',
    status: 'UNDER_REVIEW',
    explanations: [
      {
        feature: 'is_new_device',
        points: 22,
        title: 'Unrecognized Device',
        description: 'Transaction originated from an unrecognized new device.'
      },
      {
        feature: 'amount_deviation',
        points: 14,
        title: 'Moderate Amount Spike',
        description: 'Transaction amount is 2.3x higher than customer average (₹4,200 vs avg ₹1,800).'
      },
      {
        feature: 'merchant_category',
        points: 10,
        title: 'High-Risk Merchant Sector',
        description: "Merchant category 'Electronics' is subject to elevated fraud targeted rates."
      }
    ]
  },
  {
    transaction_id: 'DEMO-TXN-003',
    timestamp: '2026-09-04 08:30:00',
    amount: 48500.0,
    transaction_hour: 8,
    transaction_day: 4,
    customer_age: 28,
    customer_transaction_count_24h: 9,
    customer_avg_amount: 2500.0,
    amount_deviation: 19.4,
    is_new_device: 1,
    is_new_location: 1,
    distance_from_usual_location: 480.0,
    failed_attempts_24h: 3,
    transactions_last_10min: 5,
    payment_method: 'CREDIT_CARD',
    merchant_category: 'luxury',
    customer_account_age_days: 12,
    previous_chargebacks: 1,
    ip_risk_score: 0.88,
    device_risk_score: 0.91,
    velocity_score: 0.92,
    fraud_label: 1,
    risk_score: 91,
    risk_level: 'HIGH RISK',
    recommended_action: 'VERIFY',
    status: 'PENDING_VERIFICATION',
    explanations: [
      {
        feature: 'amount_deviation',
        points: 35,
        title: 'High Amount Spike',
        description: "Transaction amount is 19.4x higher than customer normal average (₹48,500 vs avg ₹2,500)."
      },
      {
        feature: 'is_new_location',
        points: 30,
        title: 'Unusual Transaction Location',
        description: "Location is 480 km away from customer's primary location cluster."
      },
      {
        feature: 'transactions_last_10min',
        points: 30,
        title: 'High Transaction Velocity',
        description: '5 rapid transactions attempted within the last 10 minutes.'
      },
      {
        feature: 'previous_chargebacks',
        points: 28,
        title: 'Prior Chargeback History',
        description: '1 disputed chargeback recorded on customer account.'
      },
      {
        feature: 'is_new_device',
        points: 22,
        title: 'Unrecognized Device',
        description: 'Transaction originated from an unrecognized new device.'
      }
    ]
  },
  {
    transaction_id: 'DEMO-TXN-004',
    timestamp: '2026-09-04 07:11:00',
    amount: 72000.0,
    transaction_hour: 7,
    transaction_day: 4,
    customer_age: 31,
    customer_transaction_count_24h: 12,
    customer_avg_amount: 3000.0,
    amount_deviation: 24.0,
    is_new_device: 1,
    is_new_location: 1,
    distance_from_usual_location: 750.0,
    failed_attempts_24h: 4,
    transactions_last_10min: 7,
    payment_method: 'CREDIT_CARD',
    merchant_category: 'gaming',
    customer_account_age_days: 5,
    previous_chargebacks: 2,
    ip_risk_score: 0.94,
    device_risk_score: 0.96,
    velocity_score: 0.98,
    fraud_label: 1,
    risk_score: 96,
    risk_level: 'HIGH RISK',
    recommended_action: 'VERIFY',
    status: 'PENDING_VERIFICATION',
    explanations: [
      {
        feature: 'amount_deviation',
        points: 35,
        title: 'Critical Amount Deviation',
        description: 'Transaction amount is 24.0x higher than account average (₹72,000 vs avg ₹3,000).'
      },
      {
        feature: 'transactions_last_10min',
        points: 32,
        title: 'High Transaction Velocity',
        description: '7 transactions within last 10 minutes indicates automated bot/card-testing behavior.'
      },
      {
        feature: 'failed_attempts_24h',
        points: 25,
        title: 'Repeated Authentication Failures',
        description: '4 consecutive failed OTP attempts in 24 hours.'
      },
      {
        feature: 'ip_risk_score',
        points: 24,
        title: 'Proxy/VPN IP Flagged',
        description: 'IP risk score is 0.94 indicating high-risk proxy/bulletproof host.'
      }
    ]
  },
  {
    transaction_id: 'DEMO-TXN-005',
    timestamp: '2026-09-04 06:45:00',
    amount: 1200.0,
    transaction_hour: 6,
    transaction_day: 4,
    customer_age: 52,
    customer_transaction_count_24h: 1,
    customer_avg_amount: 1400.0,
    amount_deviation: 0.85,
    is_new_device: 0,
    is_new_location: 0,
    distance_from_usual_location: 2.1,
    failed_attempts_24h: 0,
    transactions_last_10min: 0,
    payment_method: 'UPI',
    merchant_category: 'utilities',
    customer_account_age_days: 850,
    previous_chargebacks: 0,
    ip_risk_score: 0.08,
    device_risk_score: 0.06,
    velocity_score: 0.01,
    fraud_label: 0,
    risk_score: 18,
    risk_level: 'LOW RISK',
    recommended_action: 'APPROVE',
    status: 'APPROVED',
    explanations: [
      {
        feature: 'normal_pattern',
        points: 0,
        title: 'Standard Utility Payment',
        description: 'Recurring utility bill payment matching long-term account spending pattern.'
      }
    ]
  }
];

// Additional realistic transactions for table exploration
const ADDITIONAL_MOCK_TRANSACTIONS: Transaction[] = [
  {
    transaction_id: 'TXN-902481',
    timestamp: '2026-09-04 11:45:20',
    amount: 3450.0,
    transaction_hour: 11,
    transaction_day: 4,
    customer_age: 29,
    customer_transaction_count_24h: 2,
    customer_avg_amount: 3100.0,
    amount_deviation: 1.11,
    is_new_device: 0,
    is_new_location: 0,
    distance_from_usual_location: 4.2,
    failed_attempts_24h: 0,
    transactions_last_10min: 1,
    payment_method: 'UPI',
    merchant_category: 'food',
    customer_account_age_days: 340,
    previous_chargebacks: 0,
    ip_risk_score: 0.12,
    device_risk_score: 0.10,
    velocity_score: 0.15,
    fraud_label: 0,
    risk_score: 16,
    risk_level: 'LOW RISK',
    recommended_action: 'APPROVE',
    status: 'APPROVED',
    explanations: [{ feature: 'normal_pattern', points: 0, title: 'Normal Spending Pattern', description: 'Transaction amounts align with habitual meal spending.' }]
  },
  {
    transaction_id: 'TXN-902482',
    timestamp: '2026-09-04 11:32:10',
    amount: 28900.0,
    transaction_hour: 11,
    transaction_day: 4,
    customer_age: 38,
    customer_transaction_count_24h: 5,
    customer_avg_amount: 4500.0,
    amount_deviation: 6.42,
    is_new_device: 1,
    is_new_location: 1,
    distance_from_usual_location: 320.0,
    failed_attempts_24h: 1,
    transactions_last_10min: 3,
    payment_method: 'CREDIT_CARD',
    merchant_category: 'electronics',
    customer_account_age_days: 45,
    previous_chargebacks: 0,
    ip_risk_score: 0.72,
    device_risk_score: 0.68,
    velocity_score: 0.75,
    fraud_label: 1,
    risk_score: 84,
    risk_level: 'HIGH RISK',
    recommended_action: 'VERIFY',
    status: 'PENDING_VERIFICATION',
    explanations: [
      { feature: 'amount_deviation', points: 32, title: 'High Amount Deviation', description: 'Amount is 6.4x higher than customary customer baseline.' },
      { feature: 'is_new_location', points: 28, title: 'Unusual Geographical Location', description: 'Originated 320km away from usual residence.' }
    ]
  },
  {
    transaction_id: 'TXN-902483',
    timestamp: '2026-09-04 11:15:05',
    amount: 6200.0,
    transaction_hour: 11,
    transaction_day: 4,
    customer_age: 41,
    customer_transaction_count_24h: 3,
    customer_avg_amount: 2200.0,
    amount_deviation: 2.81,
    is_new_device: 1,
    is_new_location: 0,
    distance_from_usual_location: 8.5,
    failed_attempts_24h: 1,
    transactions_last_10min: 2,
    payment_method: 'NET_BANKING',
    merchant_category: 'travel',
    customer_account_age_days: 210,
    previous_chargebacks: 0,
    ip_risk_score: 0.45,
    device_risk_score: 0.48,
    velocity_score: 0.42,
    fraud_label: 0,
    risk_score: 58,
    risk_level: 'MEDIUM RISK',
    recommended_action: 'REVIEW',
    status: 'UNDER_REVIEW',
    explanations: [
      { feature: 'is_new_device', points: 22, title: 'New Device Login', description: 'Payment authorized from newly linked browser.' },
      { feature: 'amount_deviation', points: 14, title: 'Elevated Ticket Value', description: 'Amount is 2.8x higher than average ticket size.' }
    ]
  },
  {
    transaction_id: 'TXN-902484',
    timestamp: '2026-09-04 10:58:44',
    amount: 1540.0,
    transaction_hour: 10,
    transaction_day: 4,
    customer_age: 26,
    customer_transaction_count_24h: 1,
    customer_avg_amount: 1400.0,
    amount_deviation: 1.10,
    is_new_device: 0,
    is_new_location: 0,
    distance_from_usual_location: 0.8,
    failed_attempts_24h: 0,
    transactions_last_10min: 0,
    payment_method: 'UPI',
    merchant_category: 'grocery',
    customer_account_age_days: 620,
    previous_chargebacks: 0,
    ip_risk_score: 0.04,
    device_risk_score: 0.05,
    velocity_score: 0.02,
    fraud_label: 0,
    risk_score: 14,
    risk_level: 'LOW RISK',
    recommended_action: 'APPROVE',
    status: 'APPROVED',
    explanations: [{ feature: 'normal_pattern', points: 0, title: 'Verified Trusted Profile', description: 'Longstanding account with verified low-friction history.' }]
  },
  {
    transaction_id: 'TXN-902485',
    timestamp: '2026-09-04 10:41:19',
    amount: 51200.0,
    transaction_hour: 10,
    transaction_day: 4,
    customer_age: 33,
    customer_transaction_count_24h: 8,
    customer_avg_amount: 2100.0,
    amount_deviation: 24.38,
    is_new_device: 1,
    is_new_location: 1,
    distance_from_usual_location: 680.0,
    failed_attempts_24h: 3,
    transactions_last_10min: 6,
    payment_method: 'CREDIT_CARD',
    merchant_category: 'luxury',
    customer_account_age_days: 18,
    previous_chargebacks: 1,
    ip_risk_score: 0.92,
    device_risk_score: 0.89,
    velocity_score: 0.95,
    fraud_label: 1,
    risk_score: 95,
    risk_level: 'HIGH RISK',
    recommended_action: 'VERIFY',
    status: 'PENDING_VERIFICATION',
    explanations: [
      { feature: 'amount_deviation', points: 35, title: 'Abnormal Amount Spike', description: 'Amount is 24.4x above account average.' },
      { feature: 'transactions_last_10min', points: 30, title: 'High Velocity Burst', description: '6 transactions in 10 minutes.' }
    ]
  },
  {
    transaction_id: 'TXN-902486',
    timestamp: '2026-09-04 10:25:33',
    amount: 3200.0,
    transaction_hour: 10,
    transaction_day: 4,
    customer_age: 48,
    customer_transaction_count_24h: 3,
    customer_avg_amount: 1500.0,
    amount_deviation: 2.13,
    is_new_device: 0,
    is_new_location: 1,
    distance_from_usual_location: 180.0,
    failed_attempts_24h: 1,
    transactions_last_10min: 1,
    payment_method: 'DEBIT_CARD',
    merchant_category: 'travel',
    customer_account_age_days: 520,
    previous_chargebacks: 0,
    ip_risk_score: 0.35,
    device_risk_score: 0.28,
    velocity_score: 0.25,
    fraud_label: 0,
    risk_score: 48,
    risk_level: 'MEDIUM RISK',
    recommended_action: 'REVIEW',
    status: 'UNDER_REVIEW',
    explanations: [
      { feature: 'is_new_location', points: 18, title: 'Interstate Distance Notice', description: 'Transaction occurred 180 km outside home zone.' }
    ]
  },
  {
    transaction_id: 'TXN-902487',
    timestamp: '2026-09-04 09:55:12',
    amount: 450.0,
    transaction_hour: 9,
    transaction_day: 4,
    customer_age: 22,
    customer_transaction_count_24h: 2,
    customer_avg_amount: 500.0,
    amount_deviation: 0.90,
    is_new_device: 0,
    is_new_location: 0,
    distance_from_usual_location: 0.5,
    failed_attempts_24h: 0,
    transactions_last_10min: 0,
    payment_method: 'UPI',
    merchant_category: 'food',
    customer_account_age_days: 190,
    previous_chargebacks: 0,
    ip_risk_score: 0.05,
    device_risk_score: 0.04,
    velocity_score: 0.01,
    fraud_label: 0,
    risk_score: 10,
    risk_level: 'LOW RISK',
    recommended_action: 'APPROVE',
    status: 'APPROVED',
    explanations: [{ feature: 'normal_pattern', points: 0, title: 'Routine Low-Value UPI', description: 'Standard quick payment without friction.' }]
  },
  {
    transaction_id: 'TXN-902488',
    timestamp: '2026-09-04 09:12:40',
    amount: 18500.0,
    transaction_hour: 9,
    transaction_day: 4,
    customer_age: 36,
    customer_transaction_count_24h: 4,
    customer_avg_amount: 3200.0,
    amount_deviation: 5.78,
    is_new_device: 1,
    is_new_location: 0,
    distance_from_usual_location: 12.0,
    failed_attempts_24h: 2,
    transactions_last_10min: 3,
    payment_method: 'CREDIT_CARD',
    merchant_category: 'electronics',
    customer_account_age_days: 80,
    previous_chargebacks: 0,
    ip_risk_score: 0.65,
    device_risk_score: 0.70,
    velocity_score: 0.68,
    fraud_label: 1,
    risk_score: 78,
    risk_level: 'HIGH RISK',
    recommended_action: 'VERIFY',
    status: 'PENDING_VERIFICATION',
    explanations: [
      { feature: 'amount_deviation', points: 30, title: 'Significant Amount Surge', description: 'Amount is 5.8x above customary tier.' },
      { feature: 'failed_attempts_24h', points: 16, title: 'Failed Verification Attempts', description: '2 failed authentication attempts prior to authorization.' }
    ]
  }
];

// In-memory combined transaction store
let allTransactions: Transaction[] = [...INITIAL_DEMO_TRANSACTIONS, ...ADDITIONAL_MOCK_TRANSACTIONS];

export function getMockDashboardData(): DashboardData {
  const totalTxns = 10000;
  const fraudCount = 280;
  const fpTest = 136;
  const fpCost = Math.round(fpTest * currentReviewCost);

  return {
    kpis: {
      total_transactions: totalTxns,
      total_volume: 28435000.0,
      fraud_detected: fraudCount,
      fraud_rate: 2.8,
      high_risk_transactions: 310,
      potential_loss_prevented: 9850000.0,
      false_positives_test: fpTest,
      false_positive_cost_test: fpCost,
      review_cost: currentReviewCost,
      model_recall: 0.6071
    },
    risk_distribution: {
      'LOW RISK': 8450,
      'MEDIUM RISK': 1240,
      'HIGH RISK': 310
    },
    payment_methods: [
      { method: 'UPI', total: 4950, fraud: 74 },
      { method: 'CREDIT_CARD', total: 2650, fraud: 132 },
      { method: 'DEBIT_CARD', total: 1720, fraud: 56 },
      { method: 'NET_BANKING', total: 680, fraud: 18 }
    ],
    merchant_categories: [
      { category: 'Electronics', total: 1850, fraud: 88 },
      { category: 'Gaming', total: 950, fraud: 72 },
      { category: 'Luxury', total: 620, fraud: 54 },
      { category: 'Travel', total: 1400, fraud: 38 },
      { category: 'Grocery', total: 3200, fraud: 16 },
      { category: 'Food', total: 1980, fraud: 12 }
    ],
    recent_transactions: allTransactions.slice(0, 10)
  };
}

export function getMockTransactions(params: {
  search?: string;
  risk_level?: string;
  payment_method?: string;
  merchant_category?: string;
  status?: string;
  page?: number;
  limit?: number;
}): { transactions: Transaction[]; total_count: number; page: number; limit: number; total_pages: number } {
  let filtered = [...allTransactions];

  if (params.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.transaction_id.toLowerCase().includes(s) ||
        t.merchant_category.toLowerCase().includes(s) ||
        t.payment_method.toLowerCase().includes(s)
    );
  }

  if (params.risk_level && params.risk_level !== 'ALL') {
    filtered = filtered.filter((t) => t.risk_level === params.risk_level);
  }

  if (params.payment_method && params.payment_method !== 'ALL') {
    filtered = filtered.filter((t) => t.payment_method === params.payment_method);
  }

  if (params.merchant_category && params.merchant_category !== 'ALL') {
    filtered = filtered.filter((t) => t.merchant_category.toLowerCase() === params.merchant_category?.toLowerCase());
  }

  if (params.status && params.status !== 'ALL') {
    filtered = filtered.filter((t) => t.status === params.status);
  }

  const page = params.page || 1;
  const limit = params.limit || 15;
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const offset = (page - 1) * limit;
  const pagedTransactions = filtered.slice(offset, offset + limit);

  return {
    transactions: pagedTransactions,
    total_count: totalCount,
    page,
    limit,
    total_pages: totalPages
  };
}

export function getMockTransactionDetail(id: string): Transaction | null {
  return allTransactions.find((t) => t.transaction_id === id) || null;
}

export function updateMockTransactionStatus(id: string, status: string): void {
  allTransactions = allTransactions.map((tx) => {
    if (tx.transaction_id === id) {
      return { ...tx, status: status as any };
    }
    return tx;
  });
}

export function updateMockSettings(reviewCost: number): void {
  currentReviewCost = reviewCost;
}

export function calculateMockRiskAnalysis(input: Record<string, any>): SimulationResult {
  const amount = Number(input.amount) || 1000;
  const avgAmount = Number(input.customer_avg_amount) || 1500;
  const amountDeviation = avgAmount > 0 ? Number((amount / avgAmount).toFixed(2)) : 1.0;
  const isNewDevice = Number(input.is_new_device) === 1;
  const isNewLocation = Number(input.is_new_location) === 1;
  const distance = Number(input.distance_from_usual_location) || 0;
  const failedAttempts = Number(input.failed_attempts_24h) || 0;
  const txLast10min = Number(input.transactions_last_10min) || 0;
  const chargebacks = Number(input.previous_chargebacks) || 0;
  const ipRisk = Number(input.ip_risk_score) || 0;
  const deviceRisk = Number(input.device_risk_score) || 0;
  const accountAge = Number(input.customer_account_age_days) || 365;
  const merchantCat = String(input.merchant_category || '').toLowerCase();

  // Explainability factor extraction
  const factors: ExplanationFactor[] = [];

  if (amountDeviation >= 3.5) {
    factors.push({
      feature: 'amount_deviation',
      points: Math.min(35, Math.round(amountDeviation * 6)),
      title: 'High Amount Deviation',
      description: `Transaction amount is ${amountDeviation.toFixed(1)}x higher than customer's normal average (₹${amount.toLocaleString()} vs avg ₹${avgAmount.toLocaleString()})`
    });
  } else if (amountDeviation >= 2.0) {
    factors.push({
      feature: 'amount_deviation',
      points: 14,
      title: 'Moderate Amount Spike',
      description: `Transaction amount is ${amountDeviation.toFixed(1)}x higher than customer average.`
    });
  }

  if (isNewDevice) {
    factors.push({
      feature: 'is_new_device',
      points: 22,
      title: 'Unrecognized Device',
      description: 'Transaction originated from an unrecognized new device signature.'
    });
  }

  if (isNewLocation || distance > 100) {
    const pts = 18 + (distance > 300 ? 12 : 0);
    factors.push({
      feature: 'is_new_location',
      points: pts,
      title: 'Unusual Transaction Location',
      description: `Location is ${Math.round(distance)} km away from customer's usual cluster.`
    });
  }

  if (txLast10min >= 3) {
    factors.push({
      feature: 'transactions_last_10min',
      points: Math.min(32, txLast10min * 6),
      title: 'High Transaction Velocity',
      description: `${txLast10min} transactions attempted within the last 10 minutes.`
    });
  }

  if (failedAttempts >= 2) {
    factors.push({
      feature: 'failed_attempts_24h',
      points: Math.min(25, failedAttempts * 8),
      title: 'Multiple Authentication Failures',
      description: `${failedAttempts} failed PIN/OTP attempts in the past 24 hours.`
    });
  }

  if (chargebacks > 0) {
    factors.push({
      feature: 'previous_chargebacks',
      points: Math.min(30, chargebacks * 15),
      title: 'Prior Chargeback History',
      description: `${chargebacks} disputed chargeback(s) recorded on account.`
    });
  }

  if (ipRisk > 0.60) {
    factors.push({
      feature: 'ip_risk_score',
      points: Math.round(ipRisk * 24),
      title: 'High IP Threat Score',
      description: `IP address flagged with high threat score (${ipRisk.toFixed(2)}) associated with proxy/VPN.`
    });
  }

  if (deviceRisk > 0.60) {
    factors.push({
      feature: 'device_risk_score',
      points: Math.round(deviceRisk * 22),
      title: 'High Device Risk Fingerprint',
      description: `Device hardware fingerprint flagged with risk score (${deviceRisk.toFixed(2)}).`
    });
  }

  if (accountAge <= 14) {
    factors.push({
      feature: 'customer_account_age_days',
      points: 16,
      title: 'New Customer Account',
      description: `Account created only ${accountAge} days ago (higher default risk profile).`
    });
  }

  if (['gaming', 'luxury', 'electronics'].includes(merchantCat)) {
    factors.push({
      feature: 'merchant_category',
      points: 10,
      title: 'High-Risk Merchant Sector',
      description: `Merchant category '${merchantCat.toUpperCase()}' is subject to elevated fraud targeted rates.`
    });
  }

  factors.sort((a, b) => b.points - a.points);

  if (factors.length === 0) {
    factors.push({
      feature: 'normal_pattern',
      points: 0,
      title: 'Normal Transaction Profile',
      description: 'Transaction parameters align smoothly with legitimate purchasing benchmarks.'
    });
  }

  // Calculate composite risk score
  const totalPoints = factors.reduce((sum, f) => sum + f.points, 0);
  const score = Math.max(8, Math.min(98, totalPoints > 0 ? totalPoints : 12));

  let riskLevel: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' = 'LOW RISK';
  let recommendedAction: 'APPROVE' | 'REVIEW' | 'VERIFY' = 'APPROVE';
  let actionDescription = 'Transaction cleared for automatic processing.';

  if (score > 70) {
    riskLevel = 'HIGH RISK';
    recommendedAction = 'VERIFY';
    actionDescription = 'Strict step-up authentication (2FA/OTP) or agent verification required.';
  } else if (score > 30) {
    riskLevel = 'MEDIUM RISK';
    recommendedAction = 'REVIEW';
    actionDescription = 'Secondary review or light verification recommended before settlement.';
  }

  const fraudProbability = Number((score / 100).toFixed(4));

  return {
    analysis_id: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
    transaction_details: {
      ...input,
      amount_deviation: amountDeviation,
      velocity_score: Number(Math.min(1.0, txLast10min * 0.2 + (Number(input.customer_transaction_count_24h) || 0) * 0.03).toFixed(3))
    },
    fraud_probability: fraudProbability,
    risk_score: score,
    risk_level: riskLevel,
    recommended_action: recommendedAction,
    action_description: actionDescription,
    explanations: factors
  };
}

export function getMockModelMetrics(): ModelMetrics {
  const fpTest = 136;
  const fpCost = Math.round(fpTest * currentReviewCost);
  const projectedTotal = Math.round(fpTest * 5); // 20% test -> 100% total projection
  const projectedCost = Math.round(projectedTotal * currentReviewCost);

  return {
    model_type: 'Calibrated XGBoost Classifier (with TreeExplainer)',
    train_size: 8000,
    test_size: 2000,
    precision: 0.3333,
    recall: 0.6071,
    f1_score: 0.4304,
    accuracy: 0.9255,
    roc_auc: 0.8528,
    confusion_matrix: {
      true_positive: 34,
      true_negative: 1817,
      false_positive: fpTest,
      false_negative: 22
    },
    false_positive_count_test: fpTest,
    false_positive_rate: 0.0696,
    review_cost_per_tx: currentReviewCost,
    false_positive_cost_test: fpCost,
    total_fp_projected: projectedTotal,
    total_fp_cost_projected: projectedCost
  };
}

export function getMockFraudTrends(): FraudTrendsData {
  return {
    hourly_trends: [
      { hour: '00:00', total: 210, fraud: 12, fraud_rate: 5.71 },
      { hour: '01:00', total: 140, fraud: 15, fraud_rate: 10.71 },
      { hour: '02:00', total: 110, fraud: 16, fraud_rate: 14.55 },
      { hour: '03:00', total: 95, fraud: 14, fraud_rate: 14.74 },
      { hour: '04:00', total: 80, fraud: 8, fraud_rate: 10.0 },
      { hour: '05:00', total: 120, fraud: 4, fraud_rate: 3.33 },
      { hour: '06:00', total: 290, fraud: 5, fraud_rate: 1.72 },
      { hour: '07:00', total: 420, fraud: 9, fraud_rate: 2.14 },
      { hour: '08:00', total: 610, fraud: 14, fraud_rate: 2.30 },
      { hour: '09:00', total: 780, fraud: 17, fraud_rate: 2.18 },
      { hour: '10:00', total: 890, fraud: 18, fraud_rate: 2.02 },
      { hour: '11:00', total: 940, fraud: 21, fraud_rate: 2.23 },
      { hour: '12:00', total: 980, fraud: 22, fraud_rate: 2.24 },
      { hour: '13:00', total: 910, fraud: 19, fraud_rate: 2.09 },
      { hour: '14:00', total: 880, fraud: 18, fraud_rate: 2.05 },
      { hour: '15:00', total: 840, fraud: 16, fraud_rate: 1.90 },
      { hour: '16:00', total: 760, fraud: 15, fraud_rate: 1.97 },
      { hour: '17:00', total: 720, fraud: 14, fraud_rate: 1.94 },
      { hour: '18:00', total: 680, fraud: 15, fraud_rate: 2.21 },
      { hour: '19:00', total: 640, fraud: 16, fraud_rate: 2.50 },
      { hour: '20:00', total: 580, fraud: 17, fraud_rate: 2.93 },
      { hour: '21:00', total: 510, fraud: 18, fraud_rate: 3.53 },
      { hour: '22:00', total: 430, fraud: 18, fraud_rate: 4.19 },
      { hour: '23:00', total: 310, fraud: 15, fraud_rate: 4.84 }
    ],
    category_trends: [
      { category: 'Gaming', total: 950, fraud: 72, fraud_rate: 7.58, avg_fraud_amount: 18400 },
      { category: 'Luxury', total: 620, fraud: 54, fraud_rate: 8.71, avg_fraud_amount: 52000 },
      { category: 'Electronics', total: 1850, fraud: 88, fraud_rate: 4.76, avg_fraud_amount: 31500 },
      { category: 'Travel', total: 1400, fraud: 38, fraud_rate: 2.71, avg_fraud_amount: 14200 },
      { category: 'Grocery', total: 3200, fraud: 16, fraud_rate: 0.50, avg_fraud_amount: 1850 },
      { category: 'Food', total: 1980, fraud: 12, fraud_rate: 0.61, avg_fraud_amount: 1100 }
    ],
    avg_fraud_amount: 32450.0,
    avg_legit_amount: 2840.0,
    spike_detection: {
      spike_detected: true,
      message: 'Late-night (1:00 AM - 4:00 AM) fraud rate increased 2.4× compared with baseline',
      multiplier: 2.4,
      offpeak_rate: 13.25,
      baseline_rate: 2.8
    }
  };
}
