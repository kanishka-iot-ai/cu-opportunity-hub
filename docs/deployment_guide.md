# CU OPPORTUNITY HUB – Vercel & Production Deployment Guide
**Institution:** Chandigarh University  
**Platform:** Vercel (Frontend & Serverless Python Backend) / Container Alternatives  

---

## 🚀 Option 1: Deploying Directly on Vercel (Recommended)

CU Opportunity Hub is configured out-of-the-box for **Full-Stack Vercel Deployment** using `@vercel/python` for backend REST APIs and `@vercel/static-build` for the React frontend.

### Method A: Deploy via GitHub (Zero-Configuration)
1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete CU Opportunity Hub production release"
   git remote add origin https://github.com/<your-username>/cu-opportunity-hub.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `cu-opportunity-hub` GitHub repository.
4. **Environment Variables:**
   * `SECRET_KEY`: (Optional) e.g. `cu-hub-super-secret-key-2026-cuchd`
   * `JWT_SECRET_KEY`: (Optional) e.g. `cu-jwt-secret-key-chandigarh-univ-2026`
   * `DATABASE_URL`: (Optional) Your cloud MySQL or PostgreSQL connection string (e.g. from Supabase, Neon, TiDB, or Railway). If omitted, the app automatically initializes an in-memory/ephemeral SQLite database in `/tmp/cu_opportunity_hub.db` and auto-seeds all demonstration opportunities and accounts on cold start!
5. Click **"Deploy"**. Vercel will build the React frontend and deploy the Python serverless function at `/api/*`.

### Method B: Deploy via Vercel CLI
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to preview
vercel

# 4. Deploy to production
vercel --prod
```

---

## 🛠️ Option 2: Deploying Frontend & Backend Separately

If you prefer hosting the Python Flask API on Render, Railway, or Fly.io:

1. **Deploy Backend (e.g. on Render / Railway):**
   * Build Command: `pip install -r requirements.txt && python backend/seed.py`
   * Start Command: `gunicorn -w 4 -b 0.0.0.0:$PORT "backend.app:create_app()"`
   * Note down your backend URL: e.g. `https://cu-hub-api.onrender.com`.

2. **Deploy Frontend on Vercel:**
   * Root Directory: `frontend`
   * Framework Preset: `Vite`
   * Environment Variable:
     * `VITE_API_URL` = `https://cu-hub-api.onrender.com`
   * Click **"Deploy"**. The React frontend will communicate directly with your hosted Flask API.

---

## ⚙️ Environment Variables Summary

| Variable | Required? | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `SECRET_KEY` | Optional | `cu-hub-super-secret-key-2026-cuchd` | Flask session signature |
| `JWT_SECRET_KEY` | Optional | `cu-jwt-secret-key-chandigarh-univ-2026` | JWT token signature |
| `DATABASE_URL` | Optional | `sqlite:///...` or Cloud MySQL/Postgres | Database connection |
| `VITE_API_URL` | Optional | `/api` | Base API URL for frontend |
