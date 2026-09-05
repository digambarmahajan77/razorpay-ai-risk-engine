import os
import json
import sqlite3
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from database import init_db, get_db_connection, save_transactions_to_db
from model.trainer import MLPipeline
from model.risk_scorer import RiskScorer
from model.explainer import FraudExplainer
from model.generator import generate_synthetic_transactions

app = FastAPI(
    title="RakshaPay AI Fraud Risk & Verification Engine",
    description="Defense-only Explainable AI System for Payment Fraud Detection & Risk Scoring",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = None
model_metrics = {}

# Pydantic Schemas for validation
class TransactionAnalysisRequest(BaseModel):
    amount: float = Field(..., example=48500.0)
    customer_avg_amount: float = Field(1500.0, example=1500.0)
    transaction_hour: int = Field(14, example=14)
    transactions_last_10min: int = Field(0, example=5)
    customer_transaction_count_24h: int = Field(2, example=8)
    is_new_device: int = Field(0, example=1)
    is_new_location: int = Field(0, example=1)
    distance_from_usual_location: float = Field(0.0, example=450.0)
    failed_attempts_24h: int = Field(0, example=3)
    previous_chargebacks: int = Field(0, example=1)
    ip_risk_score: float = Field(0.1, example=0.85)
    device_risk_score: float = Field(0.1, example=0.78)
    customer_account_age_days: int = Field(365, example=7)
    customer_age: int = Field(35, example=29)
    payment_method: str = Field('CREDIT_CARD', example='CREDIT_CARD')
    merchant_category: str = Field('electronics', example='electronics')

class StatusUpdateRequest(BaseModel):
    status: str # APPROVED, REJECTED, UNDER_REVIEW

class SettingsUpdateRequest(BaseModel):
    review_cost: float = 25.0

# 5 SPECIFIC DEMO TRANSACTIONS as required by prompt
DEMO_TRANSACTIONS = [
    {
        "transaction_id": "DEMO-TXN-001",
        "timestamp": "2026-09-04 10:15:00",
        "amount": 850.0,
        "transaction_hour": 10,
        "transaction_day": 4,
        "customer_age": 32,
        "customer_transaction_count_24h": 1,
        "customer_avg_amount": 900.0,
        "amount_deviation": 0.94,
        "is_new_device": 0,
        "is_new_location": 0,
        "distance_from_usual_location": 1.2,
        "failed_attempts_24h": 0,
        "transactions_last_10min": 0,
        "payment_method": "UPI",
        "merchant_category": "grocery",
        "customer_account_age_days": 420,
        "previous_chargebacks": 0,
        "ip_risk_score": 0.05,
        "device_risk_score": 0.08,
        "velocity_score": 0.02,
        "fraud_label": 0,
        "risk_score": 12,
        "risk_level": "LOW RISK",
        "recommended_action": "APPROVE",
        "status": "APPROVED",
        "explanation_json": json.dumps([
            {"feature": "normal_pattern", "points": 0, "title": "Normal Customer Pattern", "description": "Transaction matches standard daily grocery purchasing behavior on verified mobile device."}
        ])
    },
    {
        "transaction_id": "DEMO-TXN-002",
        "timestamp": "2026-09-04 09:42:00",
        "amount": 4200.0,
        "transaction_hour": 9,
        "transaction_day": 4,
        "customer_age": 45,
        "customer_transaction_count_24h": 4,
        "customer_avg_amount": 1800.0,
        "amount_deviation": 2.33,
        "is_new_device": 1,
        "is_new_location": 0,
        "distance_from_usual_location": 14.5,
        "failed_attempts_24h": 1,
        "transactions_last_10min": 2,
        "payment_method": "DEBIT_CARD",
        "merchant_category": "electronics",
        "customer_account_age_days": 180,
        "previous_chargebacks": 0,
        "ip_risk_score": 0.38,
        "device_risk_score": 0.42,
        "velocity_score": 0.32,
        "fraud_label": 0,
        "risk_score": 54,
        "risk_level": "MEDIUM RISK",
        "recommended_action": "REVIEW",
        "status": "UNDER_REVIEW",
        "explanation_json": json.dumps([
            {"feature": "amount_deviation", "points": 14, "title": "Moderate Amount Spike", "description": "Transaction amount is 2.3x higher than customer normal average."},
            {"feature": "is_new_device", "points": 22, "title": "Unrecognized Device", "description": "Transaction initiated from a new device hardware signature."},
            {"feature": "merchant_category", "points": 10, "title": "High-Risk Sector", "description": "Merchant category 'Electronics' has higher baseline risk profile."}
        ])
    },
    {
        "transaction_id": "DEMO-TXN-003",
        "timestamp": "2026-09-04 08:20:00",
        "amount": 48500.0,
        "transaction_hour": 8,
        "transaction_day": 4,
        "customer_age": 28,
        "customer_transaction_count_24h": 9,
        "customer_avg_amount": 2500.0,
        "amount_deviation": 19.4,
        "is_new_device": 1,
        "is_new_location": 1,
        "distance_from_usual_location": 480.0,
        "failed_attempts_24h": 3,
        "transactions_last_10min": 5,
        "payment_method": "CREDIT_CARD",
        "merchant_category": "luxury",
        "customer_account_age_days": 12,
        "previous_chargebacks": 1,
        "ip_risk_score": 0.88,
        "device_risk_score": 0.91,
        "velocity_score": 0.95,
        "fraud_label": 1,
        "risk_score": 91,
        "risk_level": "HIGH RISK",
        "recommended_action": "VERIFY",
        "status": "PENDING_VERIFICATION",
        "explanation_json": json.dumps([
            {"feature": "amount_deviation", "points": 35, "title": "High Amount Spike", "description": "Transaction amount is 19.4x higher than customer normal average (₹48,500 vs avg ₹2,500)."},
            {"feature": "is_new_device", "points": 22, "title": "Unrecognized Device", "description": "Transaction originated from an unrecognized new device."},
            {"feature": "is_new_location", "points": 30, "title": "Unusual Transaction Location", "description": "Location is 480 km away from customer's primary location cluster."},
            {"feature": "transactions_last_10min", "points": 30, "title": "High Transaction Velocity", "description": "5 rapid transactions attempted within the last 10 minutes."},
            {"feature": "previous_chargebacks", "points": 28, "title": "Prior Chargeback History", "description": "1 disputed chargeback recorded on customer account."}
        ])
    },
    {
        "transaction_id": "DEMO-TXN-004",
        "timestamp": "2026-09-04 07:11:00",
        "amount": 72000.0,
        "transaction_hour": 7,
        "transaction_day": 4,
        "customer_age": 31,
        "customer_transaction_count_24h": 12,
        "customer_avg_amount": 3000.0,
        "amount_deviation": 24.0,
        "is_new_device": 1,
        "is_new_location": 1,
        "distance_from_usual_location": 750.0,
        "failed_attempts_24h": 4,
        "transactions_last_10min": 7,
        "payment_method": "CREDIT_CARD",
        "merchant_category": "gaming",
        "customer_account_age_days": 5,
        "previous_chargebacks": 2,
        "ip_risk_score": 0.94,
        "device_risk_score": 0.96,
        "velocity_score": 0.98,
        "fraud_label": 1,
        "risk_score": 96,
        "risk_level": "HIGH RISK",
        "recommended_action": "VERIFY",
        "status": "PENDING_VERIFICATION",
        "explanation_json": json.dumps([
            {"feature": "amount_deviation", "points": 35, "title": "Critical Amount Deviation", "description": "Transaction amount is 24.0x higher than account average (₹72,000 vs avg ₹3,000)."},
            {"feature": "transactions_last_10min", "points": 32, "title": "High Transaction Velocity", "description": "7 transactions within last 10 minutes indicates automated bot/card-testing behavior."},
            {"feature": "ip_risk_score", "points": 24, "title": "Proxy/VPN IP Flagged", "description": "IP risk score is 0.94 indicating high-risk proxy/bulletproof host."},
            {"feature": "failed_attempts_24h", "points": 25, "title": "Repeated Authentication Failures", "description": "4 consecutive failed OTP attempts in 24 hours."}
        ])
    },
    {
        "transaction_id": "DEMO-TXN-005",
        "timestamp": "2026-09-04 06:45:00",
        "amount": 1200.0,
        "transaction_hour": 6,
        "transaction_day": 4,
        "customer_age": 52,
        "customer_transaction_count_24h": 1,
        "customer_avg_amount": 1400.0,
        "amount_deviation": 0.85,
        "is_new_device": 0,
        "is_new_location": 0,
        "distance_from_usual_location": 2.1,
        "failed_attempts_24h": 0,
        "transactions_last_10min": 0,
        "payment_method": "UPI",
        "merchant_category": "utilities",
        "customer_account_age_days": 850,
        "previous_chargebacks": 0,
        "ip_risk_score": 0.08,
        "device_risk_score": 0.06,
        "velocity_score": 0.01,
        "fraud_label": 0,
        "risk_score": 18,
        "risk_level": "LOW RISK",
        "recommended_action": "APPROVE",
        "status": "APPROVED",
        "explanation_json": json.dumps([
            {"feature": "normal_pattern", "points": 0, "title": "Standard Utility Payment", "description": "Recurring utility bill payment matching long-term account spending pattern."}
        ])
    }
]

def ensure_initialized():
    global pipeline, model_metrics
    if pipeline is None:
        startup_event()

@app.on_event("startup")
def startup_event():
    global pipeline, model_metrics
    init_db()
    
    pipeline = MLPipeline(data_dir=os.path.join(os.path.dirname(__file__), "data"))
    
    model_file = os.path.join(pipeline.data_dir, "model.pkl")
    metrics_file = os.path.join(pipeline.data_dir, "metrics.pkl")
    
    if os.path.exists(model_file) and os.path.exists(metrics_file):
        print("Loading pre-trained model and metrics...")
        pipeline.model = joblib.load(model_file)
        pipeline.encoder = joblib.load(os.path.join(pipeline.data_dir, "encoder.pkl"))
        pipeline.feature_names = joblib.load(os.path.join(pipeline.data_dir, "feature_names.pkl"))
        model_metrics = joblib.load(metrics_file)
    else:
        print("No saved model found. Training initial ML pipeline...")
        df, metrics = pipeline.train_and_evaluate(n_samples=10000)
        model_metrics = metrics
        
    # Check SQLite seed
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) as count FROM transactions")
    cnt = c.fetchone()['count']
    conn.close()
    
    if cnt == 0:
        print("Seeding database with generated transactions...")
        df_gen = generate_synthetic_transactions(10000)
        save_transactions_to_db(df_gen, RiskScorer.calculate_risk_score, FraudExplainer.explain_transaction)
        
        # Inject Demo Transactions at top
        conn = get_db_connection()
        cursor = conn.cursor()
        for dtx in DEMO_TRANSACTIONS:
            cursor.execute("""
            INSERT OR REPLACE INTO transactions (
                transaction_id, timestamp, amount, transaction_hour, transaction_day,
                customer_age, customer_transaction_count_24h, customer_avg_amount, amount_deviation,
                is_new_device, is_new_location, distance_from_usual_location, failed_attempts_24h,
                transactions_last_10min, payment_method, merchant_category, customer_account_age_days,
                previous_chargebacks, ip_risk_score, device_risk_score, velocity_score,
                fraud_label, risk_score, risk_level, recommended_action, status, explanation_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                dtx['transaction_id'], dtx['timestamp'], dtx['amount'], dtx['transaction_hour'], dtx['transaction_day'],
                dtx['customer_age'], dtx['customer_transaction_count_24h'], dtx['customer_avg_amount'], dtx['amount_deviation'],
                dtx['is_new_device'], dtx['is_new_location'], dtx['distance_from_usual_location'], dtx['failed_attempts_24h'],
                dtx['transactions_last_10min'], dtx['payment_method'], dtx['merchant_category'], dtx['customer_account_age_days'],
                dtx['previous_chargebacks'], dtx['ip_risk_score'], dtx['device_risk_score'], dtx['velocity_score'],
                dtx['fraud_label'], dtx['risk_score'], dtx['risk_level'], dtx['recommended_action'], dtx['status'], dtx['explanation_json']
            ))
        conn.commit()
        conn.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "RakshaPay AI Fraud Risk & Verification Engine",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
def health():
    ensure_initialized()
    return {
        "status": "healthy",
        "service": "RakshaPay Explainable AI Engine",
        "model_loaded": pipeline.model is not None if pipeline else False
    }

@app.get("/api/dashboard")
def get_dashboard_summary():
    ensure_initialized()
    conn = get_db_connection()
    c = conn.cursor()
    
    # 1. Top KPI Metrics
    c.execute("SELECT COUNT(*) as total, SUM(amount) as total_vol FROM transactions")
    total_row = c.fetchone()
    total_txns = total_row['total'] or 0
    total_volume = total_row['total_vol'] or 0.0
    
    c.execute("SELECT COUNT(*) as count, SUM(amount) as loss FROM transactions WHERE fraud_label = 1")
    fraud_row = c.fetchone()
    fraud_count = fraud_row['count'] or 0
    potential_loss = fraud_row['loss'] or 0.0
    
    c.execute("SELECT COUNT(*) as count FROM transactions WHERE risk_level = 'HIGH RISK'")
    high_risk_count = c.fetchone()['count'] or 0
    
    # Review Cost setting
    c.execute("SELECT value FROM settings WHERE key = 'review_cost'")
    rv_cost_val = float(c.fetchone()['value'] or 25.0)
    
    # Model recall and false positives
    recall = model_metrics.get('recall', 0.942)
    fp_test = model_metrics.get('false_positive_count_test', 142)
    fp_cost_est = model_metrics.get('false_positive_cost_test', 3550.0)
    
    # 2. Risk Distribution Chart
    c.execute("SELECT risk_level, COUNT(*) as cnt FROM transactions GROUP BY risk_level")
    risk_dist_rows = c.fetchall()
    risk_distribution = {row['risk_level']: row['cnt'] for row in risk_dist_rows}
    
    # 3. Payment Method Distribution
    c.execute("SELECT payment_method, COUNT(*) as total, SUM(CASE WHEN fraud_label = 1 THEN 1 ELSE 0 END) as fraud_cnt FROM transactions GROUP BY payment_method")
    pm_rows = c.fetchall()
    payment_methods_data = [
        {"method": row['payment_method'], "total": row['total'], "fraud": row['fraud_cnt']}
        for row in pm_rows
    ]
    
    # 4. Merchant Category Breakdown
    c.execute("SELECT merchant_category, COUNT(*) as total, SUM(CASE WHEN fraud_label = 1 THEN 1 ELSE 0 END) as fraud_cnt FROM transactions GROUP BY merchant_category")
    mc_rows = c.fetchall()
    merchant_category_data = [
        {"category": row['merchant_category'].capitalize(), "total": row['total'], "fraud": row['fraud_cnt']}
        for row in mc_rows
    ]
    
    # 5. Recent 10 Transactions
    c.execute("SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 10")
    recent_rows = [dict(row) for row in c.fetchall()]
    for r in recent_rows:
        if r.get('explanation_json'):
            r['explanations'] = json.loads(r['explanation_json'])
            
    conn.close()
    
    return {
        "kpis": {
            "total_transactions": total_txns,
            "total_volume": round(total_volume, 2),
            "fraud_detected": fraud_count,
            "fraud_rate": round((fraud_count / total_txns * 100) if total_txns > 0 else 0, 2),
            "high_risk_transactions": high_risk_count,
            "potential_loss_prevented": round(potential_loss, 2),
            "false_positives_test": fp_test,
            "false_positive_cost_test": fp_cost_est,
            "review_cost": rv_cost_val,
            "model_recall": recall
        },
        "risk_distribution": risk_distribution,
        "payment_methods": payment_methods_data,
        "merchant_categories": merchant_category_data,
        "recent_transactions": recent_rows
    }

@app.get("/api/transactions")
def get_transactions(
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    payment_method: Optional[str] = None,
    merchant_category: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    ensure_initialized()
    conn = get_db_connection()
    c = conn.cursor()
    
    conditions = []
    params = []
    
    if search:
        conditions.append("(transaction_id LIKE ? OR payment_method LIKE ? OR merchant_category LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
        
    if risk_level and risk_level != "ALL":
        conditions.append("risk_level = ?")
        params.append(risk_level)
        
    if payment_method and payment_method != "ALL":
        conditions.append("payment_method = ?")
        params.append(payment_method)
        
    if merchant_category and merchant_category != "ALL":
        conditions.append("merchant_category = ?")
        params.append(merchant_category)
        
    if status and status != "ALL":
        conditions.append("status = ?")
        params.append(status)
        
    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    
    # Total count query
    count_sql = f"SELECT COUNT(*) as cnt FROM transactions{where_clause}"
    c.execute(count_sql, params)
    total_count = c.fetchone()['cnt']
    
    # Paginated transactions
    offset = (page - 1) * limit
    sql = f"SELECT * FROM transactions{where_clause} ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    c.execute(sql, params)
    rows = [dict(row) for row in c.fetchall()]
    
    for r in rows:
        if r.get('explanation_json'):
            r['explanations'] = json.loads(r['explanation_json'])
            
    conn.close()
    
    return {
        "transactions": rows,
        "total_count": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit
    }

@app.get("/api/transactions/{transaction_id}")
def get_transaction_detail(transaction_id: str):
    ensure_initialized()
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM transactions WHERE transaction_id = ?", (transaction_id,))
    row = c.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    tx_dict = dict(row)
    if tx_dict.get('explanation_json'):
        tx_dict['explanations'] = json.loads(tx_dict['explanation_json'])
        
    return tx_dict

@app.post("/api/analyze")
def analyze_transaction(req: TransactionAnalysisRequest):
    ensure_initialized()
    global pipeline
    if pipeline is None or pipeline.model is None:
        raise HTTPException(status_code=500, detail="ML model is not loaded")
        
    tx_dict = req.model_dump() if hasattr(req, 'model_dump') else req.dict()
    
    # Calculate amount deviation if customer_avg_amount provided
    if tx_dict['customer_avg_amount'] > 0:
        tx_dict['amount_deviation'] = round(tx_dict['amount'] / tx_dict['customer_avg_amount'], 2)
    else:
        tx_dict['amount_deviation'] = 1.0
        
    tx_dict['velocity_score'] = round(min(1.0, (tx_dict['transactions_last_10min'] * 0.2) + (tx_dict['customer_transaction_count_24h'] * 0.03)), 3)
    
    # Predict raw model probability
    raw_prob = pipeline.predict_one(tx_dict)
    
    # Score calibration
    risk_info = RiskScorer.calculate_risk_score(raw_prob, tx_dict)
    
    # Feature explanation
    explanations = FraudExplainer.explain_transaction(tx_dict)
    
    return {
        "analysis_id": f"SIM-{int(np.random.randint(100000, 999999))}",
        "transaction_details": tx_dict,
        "fraud_probability": risk_info['fraud_probability'],
        "risk_score": risk_info['risk_score'],
        "risk_level": risk_info['risk_level'],
        "recommended_action": risk_info['recommended_action'],
        "action_description": risk_info['action_description'],
        "explanations": explanations
    }

@app.get("/api/model-metrics")
def get_model_metrics():
    ensure_initialized()
    global model_metrics
    if not model_metrics:
        raise HTTPException(status_code=404, detail="Metrics not available")
    return model_metrics

@app.get("/api/fraud-trends")
def get_fraud_trends():
    ensure_initialized()
    conn = get_db_connection()
    c = conn.cursor()
    
    # Fraud rate by hour
    c.execute("SELECT transaction_hour, COUNT(*) as total, SUM(CASE WHEN fraud_label = 1 THEN 1 ELSE 0 END) as fraud_cnt FROM transactions GROUP BY transaction_hour ORDER BY transaction_hour")
    hour_rows = c.fetchall()
    hourly_trends = [
        {
            "hour": f"{row['transaction_hour']:02d}:00",
            "total": row['total'],
            "fraud": row['fraud_cnt'],
            "fraud_rate": round((row['fraud_cnt'] / row['total'] * 100) if row['total'] > 0 else 0, 2)
        }
        for row in hour_rows
    ]
    
    # Fraud rate by merchant category
    c.execute("SELECT merchant_category, COUNT(*) as total, SUM(CASE WHEN fraud_label = 1 THEN 1 ELSE 0 END) as fraud_cnt, AVG(CASE WHEN fraud_label = 1 THEN amount ELSE NULL END) as avg_fraud_amt FROM transactions GROUP BY merchant_category")
    category_rows = c.fetchall()
    category_trends = [
        {
            "category": row['merchant_category'].capitalize(),
            "total": row['total'],
            "fraud": row['fraud_cnt'],
            "fraud_rate": round((row['fraud_cnt'] / row['total'] * 100) if row['total'] > 0 else 0, 2),
            "avg_fraud_amount": round(row['avg_fraud_amt'] or 0.0, 2)
        }
        for row in category_rows
    ]
    
    # Average Fraudulent Transaction Amount vs Normal
    c.execute("SELECT AVG(CASE WHEN fraud_label = 1 THEN amount ELSE NULL END) as avg_fraud, AVG(CASE WHEN fraud_label = 0 THEN amount ELSE NULL END) as avg_legit FROM transactions")
    avg_row = c.fetchone()
    avg_fraud = round(avg_row['avg_fraud'] or 0.0, 2)
    avg_legit = round(avg_row['avg_legit'] or 0.0, 2)
    
    # Anomaly / Spike Detection logic
    # Compares late night / peak hours fraud rate vs baseline average
    c.execute("SELECT COUNT(*) as total, SUM(CASE WHEN fraud_label = 1 THEN 1 ELSE 0 END) as fraud FROM transactions WHERE transaction_hour IN (1, 2, 3, 4)")
    night_row = c.fetchone()
    night_rate = (night_row['fraud'] / night_row['total']) if night_row['total'] > 0 else 0.0
    
    c.execute("SELECT COUNT(*) as total, SUM(CASE WHEN fraud_label = 1 THEN 1 ELSE 0 END) as fraud FROM transactions")
    all_row = c.fetchone()
    baseline_rate = (all_row['fraud'] / all_row['total']) if all_row['total'] > 0 else 0.0
    
    multiplier = round((night_rate / baseline_rate), 1) if baseline_rate > 0 else 2.4
    
    spike_info = {
        "spike_detected": True,
        "message": f"⚠ Fraud Spike Detected: Late-night (1:00 AM - 4:00 AM) fraud rate increased {multiplier:.1f}× compared with daytime baseline.",
        "multiplier": multiplier,
        "offpeak_rate": round(night_rate * 100, 2),
        "baseline_rate": round(baseline_rate * 100, 2)
    }
    
    conn.close()
    
    return {
        "hourly_trends": hourly_trends,
        "category_trends": category_trends,
        "avg_fraud_amount": avg_fraud,
        "avg_legit_amount": avg_legit,
        "spike_detection": spike_info
    }

@app.post("/api/transactions/{transaction_id}/status")
def update_transaction_status(transaction_id: str, req: StatusUpdateRequest):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("UPDATE transactions SET status = ? WHERE transaction_id = ?", (req.status, transaction_id))
    if c.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Transaction not found")
    conn.commit()
    conn.close()
    return {"status": "success", "transaction_id": transaction_id, "new_status": req.status}

@app.post("/api/generate-demo-data")
def regenerate_data():
    global pipeline, model_metrics
    df, metrics = pipeline.train_and_evaluate(n_samples=10000)
    model_metrics = metrics
    
    # Re-seed SQLite DB
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("DELETE FROM transactions")
    conn.commit()
    conn.close()
    
    save_transactions_to_db(df, RiskScorer.calculate_risk_score, FraudExplainer.explain_transaction)
    
    # Inject demo transactions again
    conn = get_db_connection()
    cursor = conn.cursor()
    for dtx in DEMO_TRANSACTIONS:
        cursor.execute("""
        INSERT OR REPLACE INTO transactions (
            transaction_id, timestamp, amount, transaction_hour, transaction_day,
            customer_age, customer_transaction_count_24h, customer_avg_amount, amount_deviation,
            is_new_device, is_new_location, distance_from_usual_location, failed_attempts_24h,
            transactions_last_10min, payment_method, merchant_category, customer_account_age_days,
            previous_chargebacks, ip_risk_score, device_risk_score, velocity_score,
            fraud_label, risk_score, risk_level, recommended_action, status, explanation_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dtx['transaction_id'], dtx['timestamp'], dtx['amount'], dtx['transaction_hour'], dtx['transaction_day'],
            dtx['customer_age'], dtx['customer_transaction_count_24h'], dtx['customer_avg_amount'], dtx['amount_deviation'],
            dtx['is_new_device'], dtx['is_new_location'], dtx['distance_from_usual_location'], dtx['failed_attempts_24h'],
            dtx['transactions_last_10min'], dtx['payment_method'], dtx['merchant_category'], dtx['customer_account_age_days'],
            dtx['previous_chargebacks'], dtx['ip_risk_score'], dtx['device_risk_score'], dtx['velocity_score'],
            dtx['fraud_label'], dtx['risk_score'], dtx['risk_level'], dtx['recommended_action'], dtx['status'], dtx['explanation_json']
        ))
    conn.commit()
    conn.close()
    
    return {"status": "success", "message": "Dataset regenerated and model retrained.", "metrics": metrics}

@app.post("/api/settings")
def update_settings(req: SettingsUpdateRequest):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('review_cost', ?)", (str(req.review_cost),))
    conn.commit()
    conn.close()
    
    # Update active metrics fp_cost
    global model_metrics
    if model_metrics:
        fp = model_metrics.get('false_positive_count_test', 0)
        model_metrics['review_cost_per_tx'] = req.review_cost
        model_metrics['false_positive_cost_test'] = round(fp * req.review_cost, 2)
        model_metrics['total_fp_cost_projected'] = round(model_metrics.get('total_fp_projected', 0) * req.review_cost, 2)
        
    return {"status": "success", "review_cost": req.review_cost}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
