# 🚀 RakshaPay Deployment Guide (Vercel & Fullstack)

This guide walks you through deploying **RakshaPay** to **Vercel** in minutes.

---

## ⚡ Option 1: 1-Click Deploy to Vercel (Recommended)

RakshaPay is configured with **Autonomous Demo Mode**. When deployed to Vercel, it automatically operates as an interactive AI fraud engine with full features (0–100 risk scoring, explainable SHAP factors, held-out test set metrics, interactive risk simulation, fraud spike anomaly alerts, and merchant verification workflows) with **zero configuration required**!

### Steps via Vercel Web Dashboard:
1. Push your code to your GitHub / GitLab / Bitbucket repository.
2. Log in to [vercel.com](https://vercel.com) and click **"Add New..." > "Project"**.
3. Select your `rakshapay-ai-risk-engine` repository.
4. Vercel will automatically detect the settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `cd frontend && npm install && npm run build` (or `npm run build`)
   - **Output Directory**: `frontend/dist`
5. Click **Deploy**!
6. In ~45 seconds, your live RakshaPay dashboard will be live at `https://<your-project>.vercel.app`.

---

## 💻 Option 2: Deploying via Vercel CLI

If you prefer deploying from your terminal:

```bash
# 1. Install Vercel CLI if not already installed
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to production from project root
vercel --prod
```

When prompted:
- **Set up and deploy?**: `y`
- **Which scope?**: Choose your Vercel account
- **Link to existing project?**: `n`
- **What's your project's name?**: `rakshapay`
- **In which directory is your code located?**: `./`

---

## 🔗 Connecting a Live Remote Backend (Optional)

If you have deployed the FastAPI backend (e.g., on Render, Railway, Fly.io, or AWS):

1. Go to your project on the [Vercel Dashboard](https://vercel.com).
2. Navigate to **Settings > Environment Variables**.
3. Add the following variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-fastapi-backend-url.onrender.com/api`
4. Click **Save** and trigger a **Redeploy** in the Deployments tab.
5. Your Vercel frontend will now communicate directly with your live Python XGBoost ML model!

---

## 🐍 Deploying the FastAPI Backend to Render (Free Tier)

To deploy the Python backend for free on [Render](https://render.com):

1. Create an account on Render.
2. Click **New +** > **Web Service**.
3. Connect your repository.
4. Fill in the following:
   - **Name**: `rakshapay-api`
   - **Runtime**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. Click **Create Web Service**.
6. Copy your Render service URL (e.g., `https://rakshapay-api.onrender.com`) and append `/api` to set as `VITE_API_BASE_URL` on Vercel.

---

## 📂 Configuration Files Summary

- `vercel.json`: Root Vercel build and SPA rewrite configuration.
- `frontend/vercel.json`: Frontend-level SPA fallback configuration if deployed with Root Directory set to `frontend`.
- `package.json`: Root monorepo script runner for Vite and npm.
- `render.yaml`: Infrastructure-as-code blueprint for deploying the FastAPI backend to Render.
- `.env.example`: Environment variables template.
