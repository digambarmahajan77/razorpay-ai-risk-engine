# 🛡️ RakshaPay – Explainable AI Fraud Risk & Verification Engine

> **Track 02 – AI Risk Manager | Razorpay Hackathon Solution**  
> *"Detect risk before it becomes loss."*

RakshaPay is a **defense-only AI system** designed to protect digital payment platforms and online merchants from fraudulent transactions, chargeback abuse, and account takeover loss. It analyzes incoming payment telemetry in real time, assigns a calibrated **0–100 Fraud Risk Score**, explains the exact root-cause risk factors behind every alert, and recommends appropriate verification actions (**APPROVE**, **REVIEW**, **VERIFY**).

---

## 🎯 Track Goal & Core Objective

**Goal:** Stop merchants from losing money to fraud, chargebacks, and payment abuse without creating unnecessary payment friction for legitimate customers.

**Defense-Only Statement:** RakshaPay is strictly designed for risk detection and merchant defense. It contains **no mechanisms** for evading detection, bypassing 2FA/OTP, or exploiting payment protocols.

---

## 🌟 Key Features

1. **Calibrated 0–100 Risk Score & Level Classification**:
   - `0–30`: **LOW RISK** → Recommended Action: `APPROVE`
   - `31–70`: **MEDIUM RISK** → Recommended Action: `REVIEW`
   - `71–100`: **HIGH RISK** → Recommended Action: `VERIFY` (Step-up 2FA/OTP or agent verification)

2. **Explainable AI (Ranked Risk Factors)**:
   - Provides clear human-interpretable reasoning for flagged transactions:
     - `+35 Risk` → Transaction amount is 19.4x higher than customer's normal average
     - `+30 Risk` → High transaction velocity (5 txns in last 10 minutes)
     - `+22 Risk` → Unrecognized new device hardware signature
     - `+30 Risk` → Unusual transaction location (480 km from primary cluster)
     - `+28 Risk` → Prior chargeback history recorded on account

3. **Financial False-Positive Cost Engine**:
   - Quantifies the business friction cost of incorrectly flagging legitimate customers:
   - $\text{False Positive Cost} = \text{Legitimate Txns Incorrectly Flagged} \times \text{Review Cost (\u20b925/review)}$
   - Allows merchants to configure custom review costs and visualize profit protection metrics.

4. **Interactive Risk Simulator**:
   - Test custom transaction payloads live or trigger 5 preloaded demo scenarios (Tx A: ₹850, Tx B: ₹4,200, Tx C: ₹48,500, Tx D: ₹72,000, Tx E: ₹1,200).

5. **Defensive Anomaly / Fraud Spike Detector**:
   - Monitors payment patterns in real time and raises automated defense warnings (e.g. *"⚠ Fraud Spike Detected: Late-night fraud rate increased 2.4× compared with baseline"*).

6. **Interactive Merchant Verification Workflow**:
   - Real-time status update buttons ([Approve], [Reject], [Send for Review]) that directly update backend SQLite database state.

---

## 🏗️ System Architecture & Tech Stack

```
                              ┌───────────────────────────────────┐
                              │     React + TypeScript Frontend   │
                              │ (Tailwind CSS, Recharts, Lucide)  │
                              └─────────────────┬─────────────────┘
                                                │ REST API (JSON)
                                                ▼
                              ┌───────────────────────────────────┐
                              │      FastAPI Python Backend       │
                              └───────┬───────────────────┬───────┘
                                      │                   │
                                      ▼                   ▼
                      ┌──────────────────────┐    ┌─────────────────────┐
                      │  XGBoost ML Model    │    │  SQLite Database    │
                      │  & SHAP Explainer    │    │  (rakshapay.db)     │
                      └──────────────────────┘    └─────────────────────┘
```

### Tech Stack:
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React Icons
- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLite3
- **Machine Learning**: Scikit-Learn, XGBoost Classifier, SHAP / TreeExplainer
- **Dataset**: 10,000 realistic synthetic transactions with multi-feature correlation

---

## 📊 Dataset & Machine Learning Pipeline

### Synthetic Dataset Features (10,000 Rows):
- `transaction_id`, `timestamp`, `amount`, `transaction_hour`, `transaction_day`
- `customer_age`, `customer_transaction_count_24h`, `customer_avg_amount`, `amount_deviation`
- `is_new_device`, `is_new_location`, `distance_from_usual_location`
- `failed_attempts_24h`, `transactions_last_10min`, `payment_method`, `merchant_category`
- `customer_account_age_days`, `previous_chargebacks`, `ip_risk_score`, `device_risk_score`, `velocity_score`
- `fraud_label` (Ground Truth target)

### Stratified 80/20 Train/Test Evaluation (Held-Out Test Set):
- **Training Set**: 8,000 samples (80%)
- **Held-Out Test Set**: 2,000 samples (20%)
- **Model**: Calibrated XGBoost Classifier (`scale_pos_weight` optimized for high fraud recall)

| Metric | Score (Held-Out Test Set) |
| :--- | :--- |
| **ROC-AUC** | **0.8528** |
| **Recall (Fraud Catch Rate)** | **60.71%** |
| **Precision** | **33.33%** |
| **F1-Score** | **43.04%** |
| **False Positives (Test Set)** | **136 txns** |
| **False Positive Review Cost** | **₹3,400 @ ₹25/review** |

---

## 🚀 How to Run Locally

### Prerequisites:
- Python 3.10+
- Node.js 18+ and npm

### 1. Run Backend Server (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python run.py
```
*Backend will start at:* `http://localhost:8000`  
*Swagger API Docs available at:* `http://localhost:8000/docs`

### 2. Run Frontend Web Dashboard (React + Vite)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend dashboard will start at:* `http://localhost:5173`

---

## ☁️ Deploy to Vercel (1-Click)

RakshaPay is fully pre-configured for **Vercel** with zero setup required!

1. Import this repository into [Vercel](https://vercel.com).
2. Vercel will automatically detect `vercel.json` and build the frontend with SPA catch-all routing.
3. Click **Deploy** – the autonomous demo engine provides full interactivity, real-time risk scoring, explainable SHAP factors, and metrics right out of the box!
4. *(Optional)* If you host the FastAPI backend (e.g., on Render or Railway), add `VITE_API_BASE_URL=https://your-backend.onrender.com/api` in Vercel project environment variables.

See [DEPLOYMENT.md](file:///c:/Users/Digamber/Desktop/Razarpay/DEPLOYMENT.md) for full instructions.

---

## 🎬 3-Minute Live Hackathon Demo Script

1. **0:00 – Landing Screen & Vision**:
   - Open `http://localhost:5173`.
   - Point out brand **RakshaPay** ("Detect risk before it becomes loss") and the **Defense-only AI Risk Engine** badge.
   - Click **"Open Risk Dashboard"**.

2. **0:30 – Executive Dashboard Overview**:
   - Highlight top KPI Cards: Total Transactions (10,000), Fraud Rate, Potential Loss Saved (₹ Lakhs), False Positive Cost (₹3,400), Model Recall.
   - Show interactive Recharts (Risk Level Distribution Pie Chart and Fraud by Merchant Category Bar Chart).

3. **1:00 – Deep-Dive High Risk Transaction & Explainable AI**:
   - Click on Demo Scenario **Tx C (DEMO-TXN-003: ₹48,500 - Score 91 High Risk)** from the top Quick Demo dropdown or recent transactions table.
   - Show the **0–100 Calibrated Risk Score (91/100)** and **VERIFY** recommendation.
   - Walk through the **AI Risk Explanation (Ranked Factors)**:
     - `+35 Risk` → Amount deviation 19.4x
     - `+30 Risk` → Location 480 km away
     - `+30 Risk` → 5 transactions in last 10 minutes
   - Click **[Send for Review]** or **[Approve]** to demonstrate live status persistence.

4. **1:45 – Live Interactive Risk Simulator**:
   - Navigate to **Risk Analysis** tab.
   - Click Quick Preset **Tx D (₹72,000)** or enter custom parameters and click **"Analyze Transaction"**.
   - Show real-time XGBoost inference with animated scanning state and instant score generation.

5. **2:15 – Model Performance & False-Positive Cost Calculator**:
   - Navigate to **Model Performance** tab.
   - Highlight the **Stratified Held-Out Test Set (2,000 samples)** confusion matrix (TP, TN, FP, FN) and ROC-AUC metric (`0.8528`).
   - Read the *"Why recall matters"* explanation.
   - Demonstrate the **False Positive Cost Simulator** by changing the review cost slider to ₹35/review and showing immediate cost re-calculation.

6. **2:45 – Fraud Trends & Anomaly Spike Detection**:
   - Navigate to **Fraud Trends** tab.
   - Show the **⚠ Fraud Spike Detector Banner**: *"Late-night (1:00 AM - 4:00 AM) fraud rate increased 2.4× compared with baseline"*.
   - Conclude presentation emphasizing Track 02 business impact and merchant protection.

---

## 🔮 Future Improvements

1. Integration with real-time WebSockets / Server-Sent Events (SSE) for live stream transaction ingestion.
2. Device fingerprinting SDK integration for browser & mobile app telemetry.
3. Graph Neural Network (GNN) entity link analysis for detecting coordinated syndicate fraud rings.
