import sqlite3
import os
import json
import pandas as pd

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "rakshapay.db")

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create transactions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id TEXT PRIMARY KEY,
        timestamp TEXT,
        amount REAL,
        transaction_hour INTEGER,
        transaction_day INTEGER,
        customer_age INTEGER,
        customer_transaction_count_24h INTEGER,
        customer_avg_amount REAL,
        amount_deviation REAL,
        is_new_device INTEGER,
        is_new_location INTEGER,
        distance_from_usual_location REAL,
        failed_attempts_24h INTEGER,
        transactions_last_10min INTEGER,
        payment_method TEXT,
        merchant_category TEXT,
        customer_account_age_days INTEGER,
        previous_chargebacks INTEGER,
        ip_risk_score REAL,
        device_risk_score REAL,
        velocity_score REAL,
        fraud_label INTEGER,
        risk_score INTEGER,
        risk_level TEXT,
        recommended_action TEXT,
        status TEXT,
        explanation_json TEXT
    )
    """)
    
    # Create settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    """)
    
    # Default settings
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('review_cost', '25')")
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('low_risk_threshold', '30')")
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('high_risk_threshold', '70')")
    
    conn.commit()
    conn.close()

def save_transactions_to_db(df, risk_scorer_func, explainer_func):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if table already populated
    cursor.execute("SELECT COUNT(*) as count FROM transactions")
    row_count = cursor.fetchone()['count']
    
    if row_count > 0:
        print(f"Database already contains {row_count} transactions. Skipping initial insert.")
        conn.close()
        return
        
    print(f"Populating SQLite database with {len(df)} transactions...")
    
    # Insert transactions batch
    for idx, row in df.iterrows():
        tx_dict = row.to_dict()
        
        # Calculate risk score & explanation
        # For simulation, probability correlates with fraud_label + noise
        if row['fraud_label'] == 1:
            raw_prob = min(0.99, float(np_random_prob(0.70, 0.98)))
        else:
            raw_prob = max(0.01, float(np_random_prob(0.02, 0.35)))
            
        score_info = risk_scorer_func(raw_prob, tx_dict)
        factors = explainer_func(tx_dict)
        
        # Action status default
        if score_info['risk_level'] == 'HIGH RISK':
            status = 'PENDING_VERIFICATION'
        elif score_info['risk_level'] == 'MEDIUM RISK':
            status = 'UNDER_REVIEW'
        else:
            status = 'APPROVED'
            
        cursor.execute("""
        INSERT INTO transactions (
            transaction_id, timestamp, amount, transaction_hour, transaction_day,
            customer_age, customer_transaction_count_24h, customer_avg_amount, amount_deviation,
            is_new_device, is_new_location, distance_from_usual_location, failed_attempts_24h,
            transactions_last_10min, payment_method, merchant_category, customer_account_age_days,
            previous_chargebacks, ip_risk_score, device_risk_score, velocity_score,
            fraud_label, risk_score, risk_level, recommended_action, status, explanation_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            row['transaction_id'], row['timestamp'], float(row['amount']), int(row['transaction_hour']), int(row['transaction_day']),
            int(row['customer_age']), int(row['customer_transaction_count_24h']), float(row['customer_avg_amount']), float(row['amount_deviation']),
            int(row['is_new_device']), int(row['is_new_location']), float(row['distance_from_usual_location']), int(row['failed_attempts_24h']),
            int(row['transactions_last_10min']), str(row['payment_method']), str(row['merchant_category']), int(row['customer_account_age_days']),
            int(row['previous_chargebacks']), float(row['ip_risk_score']), float(row['device_risk_score']), float(row['velocity_score']),
            int(row['fraud_label']), score_info['risk_score'], score_info['risk_level'], score_info['recommended_action'], status,
            json.dumps(factors)
        ))
        
    conn.commit()
    conn.close()
    print("Database population complete.")

def np_random_prob(low, high):
    import numpy as np
    return np.random.uniform(low, high)
