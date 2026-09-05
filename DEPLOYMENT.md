# 🚀 RakshaPay Deployment Guide

Deploy **RakshaPay AI Fraud Risk & Verification Engine** — FastAPI backend on **Render** and React frontend on **Vercel**.

---

## 📋 Architecture Overview

```
┌──────────────────────────┐       ┌──────────────────────────┐
│     Vercel (Frontend)    │       │    Render (Backend)      │
│  React + Vite + TailwindCSS  │◄──►│  FastAPI + XGBoost ML    │
│  Autonomous Demo Mode    │       │  SQLite + Risk Scoring   │
│  rakshapay.vercel.app    │       │  rakshapay-api.onrender.com │
└──────────────────────────┘       └──────────────────────────┘
```

---

## 🐍 Step 1: Deploy Backend on Render (Free Tier)

### Option A: One-Click Blueprint Deploy (Recommended)

1. Go to [render.com](https://render.com) and sign up / log in.
2. Click **New +** → **Blueprint** → Connect your GitHub repo `razorpay-ai-risk-engine`.
3. Render auto-detects `render.yaml` and creates the service.
4. Click **Apply** → Your backend deploys automatically!

### Option B: Manual Web Service Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository: `digambarmahajan77/razorpay-ai-risk-engine`
4. Configure settings:

| Setting | Value |
|---------|-------|
| **Name** | `rakshapay-api` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | Free |

5. Under **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.9` |

6. Click **Create Web Service** → Wait 3–5 minutes for the first build.

### Verify Backend is Running

Once deployed, visit:
```
https://rakshapay-api.onrender.com/
```

You should see:
```json
{
  "status": "online",
  "service": "RakshaPay AI Fraud Risk & Verification Engine",
  "docs": "/docs",
  "health": "/api/health"
}
```

Also check health endpoint:
```
https://rakshapay-api.onrender.com/api/health
```

Interactive API docs:
```
https://rakshapay-api.onrender.com/docs
```

> ⚠️ **Note**: Render free tier services spin down after 15 minutes of inactivity. The first request after sleep takes ~30-60 seconds to cold-start. This is normal.

---

## ⚡ Step 2: Deploy Frontend on Vercel

### Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** → **"Project"**.
3. Import your GitHub repo: `razorpay-ai-risk-engine`.
4. Vercel auto-detects settings from `vercel.json`:
   - **Framework**: Vite
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
5. Before clicking Deploy, go to **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://rakshapay-api.onrender.com/api` |

> Replace `rakshapay-api` with your actual Render service name.

6. Click **Deploy** → Live in ~45 seconds!

### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from project root
vercel --prod
```

---

## 🔗 Step 3: Connect Frontend to Backend

After both are deployed:

1. Copy your Render backend URL (e.g., `https://rakshapay-api.onrender.com`)
2. In the **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
3. Add or update:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://rakshapay-api.onrender.com/api` (add `/api` at the end!)
4. Go to **Deployments** tab → Click **⋮** on latest → **Redeploy**
5. Your frontend now talks to the live ML backend!

---

## 🔄 Autonomous Demo Mode

If `VITE_API_BASE_URL` is not set, or the backend is unreachable, RakshaPay automatically activates **Autonomous Demo Mode**:

- ✅ Full interactive dashboard with mock transaction data
- ✅ Risk scoring simulation with 0–100 score + explainable AI factors
- ✅ Fraud trend analysis with anomaly spike detection
- ✅ Model performance metrics display
- ✅ Transaction filtering, search, and status management

This means your Vercel deployment works immediately even without a backend!

---

## 🛠 Troubleshooting

### Backend won't start on Render

1. **Check Root Directory**: Must be set to `backend` (not the repo root).
2. **Check Python Version**: Set `PYTHON_VERSION=3.11.9` in environment variables.
3. **Check Logs**: Render Dashboard → Your Service → **Logs** tab.
4. **Memory Issues**: XGBoost + Pandas + NumPy can be memory-intensive. If you hit limits on the free tier, try reducing `n_samples` in the training pipeline.

### Frontend can't reach backend

1. Verify the backend URL ends with `/api` (e.g., `https://rakshapay-api.onrender.com/api`).
2. Check CORS — the backend allows all origins (`allow_origins=["*"]`).
3. Ensure `VITE_API_BASE_URL` is set correctly in Vercel and you've **redeployed** after adding it.
4. Free-tier Render services sleep after 15 min — first request after sleep takes ~30-60 seconds.

### Build fails on Vercel

1. Ensure `vercel.json` exists at root with `"framework": "vite"`.
2. The build command should be: `cd frontend && npm install && npm run build`.
3. Output directory should be: `frontend/dist`.

---

## 📂 Configuration Files

| File | Purpose |
|------|---------|
| `vercel.json` | Root Vercel build & SPA rewrite config |
| `frontend/vercel.json` | Frontend-only SPA fallback config |
| `render.yaml` | Render infrastructure-as-code blueprint |
| `package.json` | Root monorepo script runner |
| `.env.example` | Environment variables template |
| `backend/requirements.txt` | Python dependencies for Render |

---

## 🚀 Quick Reference Commands

```bash
# Local development - Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Local development - Frontend
cd frontend
npm install
npm run dev

# Build frontend for production
cd frontend
npm run build
```
