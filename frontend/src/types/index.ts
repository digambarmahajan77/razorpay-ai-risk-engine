export interface ExplanationFactor {
  feature: string;
  points: number;
  title: string;
  description: string;
}

export interface Transaction {
  transaction_id: string;
  timestamp: string;
  amount: number;
  transaction_hour: number;
  transaction_day: number;
  customer_age: number;
  customer_transaction_count_24h: number;
  customer_avg_amount: number;
  amount_deviation: number;
  is_new_device: number;
  is_new_location: number;
  distance_from_usual_location: number;
  failed_attempts_24h: number;
  transactions_last_10min: number;
  payment_method: string;
  merchant_category: string;
  customer_account_age_days: number;
  previous_chargebacks: number;
  ip_risk_score: number;
  device_risk_score: number;
  velocity_score: number;
  fraud_label: number;
  risk_score: number;
  risk_level: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  recommended_action: 'APPROVE' | 'REVIEW' | 'VERIFY';
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'PENDING_VERIFICATION';
  explanations?: ExplanationFactor[];
  explanation_json?: string;
}

export interface KPIMetrics {
  total_transactions: number;
  total_volume: number;
  fraud_detected: number;
  fraud_rate: number;
  high_risk_transactions: number;
  potential_loss_prevented: number;
  false_positives_test: number;
  false_positive_cost_test: number;
  review_cost: number;
  model_recall: number;
}

export interface DashboardData {
  kpis: KPIMetrics;
  risk_distribution: Record<string, number>;
  payment_methods: Array<{ method: string; total: number; fraud: number }>;
  merchant_categories: Array<{ category: string; total: number; fraud: number }>;
  recent_transactions: Transaction[];
}

export interface ModelMetrics {
  model_type: string;
  train_size: number;
  test_size: number;
  precision: number;
  recall: number;
  f1_score: number;
  accuracy: number;
  roc_auc: number;
  confusion_matrix: {
    true_positive: number;
    true_negative: number;
    false_positive: number;
    false_negative: number;
  };
  false_positive_count_test: number;
  false_positive_rate: number;
  review_cost_per_tx: number;
  false_positive_cost_test: number;
  total_fp_projected: number;
  total_fp_cost_projected: number;
}

export interface FraudTrendsData {
  hourly_trends: Array<{ hour: string; total: number; fraud: number; fraud_rate: number }>;
  category_trends: Array<{ category: string; total: number; fraud: number; fraud_rate: number; avg_fraud_amount: number }>;
  avg_fraud_amount: number;
  avg_legit_amount: number;
  spike_detection: {
    spike_detected: boolean;
    message: string;
    multiplier: number;
    offpeak_rate: number;
    baseline_rate: number;
  };
}

export interface SimulationResult {
  analysis_id: string;
  transaction_details: Record<string, any>;
  fraud_probability: number;
  risk_score: number;
  risk_level: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  recommended_action: 'APPROVE' | 'REVIEW' | 'VERIFY';
  action_description: string;
  explanations: ExplanationFactor[];
}
