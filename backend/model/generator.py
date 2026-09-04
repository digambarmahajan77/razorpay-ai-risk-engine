import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random

def generate_synthetic_transactions(n_samples=10000, random_state=42):
    """
    Generates realistic synthetic payment transaction dataset for RakshaPay.
    Includes multi-feature interactions for fraud risk modeling.
    """
    np.random.seed(random_state)
    random.seed(random_state)
    
    start_date = datetime.now() - timedelta(days=30)
    
    payment_methods = ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'WALLET']
    payment_weights = [0.45, 0.25, 0.15, 0.10, 0.05]
    
    merchant_categories = ['ecommerce', 'electronics', 'travel', 'gaming', 'grocery', 'utilities', 'luxury']
    merchant_weights = [0.30, 0.15, 0.12, 0.10, 0.18, 0.10, 0.05]
    
    data = []
    
    for i in range(1, n_samples + 1):
        txn_id = f"TXN{100000 + i}"
        
        # Time aspects
        random_days = np.random.uniform(0, 30)
        txn_time = start_date + timedelta(days=random_days)
        txn_hour = txn_time.hour
        txn_day = txn_time.weekday()
        
        # Customer Profile
        customer_age = int(np.random.normal(36, 12))
        customer_age = max(18, min(75, customer_age))
        
        account_age_days = int(np.random.exponential(scale=300)) + 1
        account_age_days = min(1800, account_age_days)
        
        customer_avg_amount = float(np.random.lognormal(mean=7.5, sigma=0.8)) # ~ ₹1,800 baseline avg
        customer_avg_amount = round(max(150.0, min(50000.0, customer_avg_amount)), 2)
        
        # Base transaction parameters
        # Most transactions are near avg amount, but some spike
        amount_multiplier = np.random.lognormal(mean=0.0, sigma=0.6)
        amount = round(customer_avg_amount * amount_multiplier, 2)
        amount = max(20.0, min(250000.0, amount))
        
        amount_deviation = round(amount / customer_avg_amount, 2)
        
        # Risk indicators
        is_new_device = int(np.random.choice([0, 1], p=[0.85, 0.15]))
        is_new_location = int(np.random.choice([0, 1], p=[0.88, 0.12]))
        
        if is_new_location:
            distance_from_usual = round(float(np.random.exponential(scale=180.0) + 15.0), 1)
        else:
            distance_from_usual = round(float(np.random.uniform(0.0, 12.0)), 1)
            
        failed_attempts_24h = int(np.random.choice([0, 1, 2, 3, 4, 5], p=[0.82, 0.10, 0.04, 0.02, 0.01, 0.01]))
        txns_last_10min = int(np.random.choice([0, 1, 2, 3, 5, 8], p=[0.75, 0.15, 0.05, 0.03, 0.01, 0.01]))
        txn_count_24h = txns_last_10min + int(np.random.poisson(lam=2.5))
        
        payment_method = np.random.choice(payment_methods, p=payment_weights)
        merchant_category = np.random.choice(merchant_categories, p=merchant_weights)
        
        previous_chargebacks = int(np.random.choice([0, 1, 2, 3], p=[0.94, 0.04, 0.015, 0.005]))
        
        ip_risk_score = round(float(np.random.beta(a=1.5, b=6.0)), 3)
        device_risk_score = round(float(np.random.beta(a=1.5, b=6.0)), 3)
        velocity_score = round(min(1.0, (txns_last_10min * 0.2) + (txn_count_24h * 0.03)), 3)
        
        # Calculate realistic ground truth fraud probability using weighted composite risk score
        risk_signals = 0.0
        
        if amount_deviation > 4.0:
            risk_signals += 0.40
        elif amount_deviation > 2.5:
            risk_signals += 0.20
            
        if is_new_device and is_new_location:
            risk_signals += 0.35
        elif is_new_device:
            risk_signals += 0.15
        elif is_new_location:
            risk_signals += 0.12
            
        if txns_last_10min >= 4:
            risk_signals += 0.40
        elif txns_last_10min >= 2:
            risk_signals += 0.18
            
        if previous_chargebacks > 0:
            risk_signals += 0.35 * previous_chargebacks
            
        if failed_attempts_24h >= 2:
            risk_signals += 0.30
            
        if ip_risk_score > 0.65 or device_risk_score > 0.65:
            risk_signals += 0.30
            
        if distance_from_usual > 250:
            risk_signals += 0.20
            
        if merchant_category in ['gaming', 'electronics', 'luxury']:
            risk_signals += 0.12
            
        if account_age_days < 14:
            risk_signals += 0.18

        # Clear sigmoid separation: high multi-factor risk_signals lead to high fraud prob
        raw_prob = 1.0 / (1.0 + np.exp(-(risk_signals - 0.70) * 8.0))
        fraud_label = 1 if (np.random.rand() < raw_prob) else 0
        
        data.append({
            'transaction_id': txn_id,
            'timestamp': txn_time.strftime('%Y-%m-%d %H:%M:%S'),
            'amount': amount,
            'transaction_hour': txn_hour,
            'transaction_day': txn_day,
            'customer_age': customer_age,
            'customer_transaction_count_24h': txn_count_24h,
            'customer_avg_amount': customer_avg_amount,
            'amount_deviation': amount_deviation,
            'is_new_device': is_new_device,
            'is_new_location': is_new_location,
            'distance_from_usual_location': distance_from_usual,
            'failed_attempts_24h': failed_attempts_24h,
            'transactions_last_10min': txns_last_10min,
            'payment_method': payment_method,
            'merchant_category': merchant_category,
            'customer_account_age_days': account_age_days,
            'previous_chargebacks': previous_chargebacks,
            'ip_risk_score': ip_risk_score,
            'device_risk_score': device_risk_score,
            'velocity_score': velocity_score,
            'fraud_label': fraud_label
        })
        
    df = pd.DataFrame(data)
    return df

if __name__ == '__main__':
    df = generate_synthetic_transactions(10000)
    print(f"Generated {len(df)} transactions.")
    print(f"Fraud count: {df['fraud_label'].sum()} ({df['fraud_label'].mean()*100:.2f}%)")
