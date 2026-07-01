# 🚀 SkillLens Deployment Guide

This guide provides the exact steps required to deploy the SkillLens ecosystem to production using **Vercel** for the frontend and **Northflank** for the backend.

---

## 1. Prerequisites
Before deploying, ensure you have active accounts for:
- [Vercel](https://vercel.com) (Frontend hosting)
- [Northflank](https://northflank.com) (Backend hosting)
- [Supabase](https://supabase.com) (Database, Auth, Storage)
- [Google AI Studio](https://aistudio.google.com/) (Gemini API)

---

## 2. Backend Deployment (Northflank)

1. **Create a new Project** in Northflank.
2. **Create a new Service** -> **Combined Service** (Build & Deploy).
3. Connect your GitHub repository (`skillens`).
4. **Build Details:**
   - Framework: `Node.js`
   - Build Type: `Dockerfile` (or buildpacks if preferred). Note: If using buildpacks, Northflank automatically detects `package.json` in the `/backend` directory.
   - Set the Root Directory to `/backend`.
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Environment Variables & Secrets:** Add the following to your Northflank service:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `FRONTEND_URL` (Wait to set this until Vercel is deployed, then paste the Vercel URL here).
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
6. **Health Check:**
   - Set the health check path to `/health` or `/`.
7. **Deploy!** 
   - Once deployed, Northflank will provide a public URL (e.g., `https://skillens-backend-123.northflank.app`). Copy this URL.

---

## 3. Frontend Deployment (Vercel)

1. Go to your **Vercel Dashboard** and click **Add New Project**.
2. Import the `skillens` GitHub repository.
3. **Configure Project:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables:**
   - `VITE_API_URL` = Paste the Northflank URL you copied earlier (e.g., `https://skillens-backend-123.northflank.app/api/v1`)
   - `VITE_SUPABASE_URL` = Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase Anon Key
5. **Deploy!**
   - Vercel will automatically read the `vercel.json` file we configured to ensure SPA routing works flawlessly.
   - Copy the Vercel production URL.

---

## 4. Final Security Hookup

1. Go back to **Northflank**.
2. Update the `FRONTEND_URL` environment variable with your new Vercel URL (e.g., `https://skillens.vercel.app`).
3. Restart the Northflank service.
4. **Result:** Your backend CORS policy is now strictly locked down to only accept requests from your Vercel frontend.

---

## 5. Deployment Verification Checklist

✅ Open the Vercel URL.
✅ Sign up / Log in.
✅ Upload a PDF (Validates Storage & API link).
✅ View Study Guide (Validates Gemini API link).
✅ Take a Quiz (Validates Database connection).

🎉 **SkillLens is live!**
