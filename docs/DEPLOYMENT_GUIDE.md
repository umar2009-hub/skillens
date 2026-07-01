# 🚀 SkillLens Deployment Guide

This guide provides the exact steps required to deploy the SkillLens ecosystem to production using **Vercel** for the frontend and **Render** for the backend. (These are 100% free and do NOT require a credit card).

---

## 1. Prerequisites
Before deploying, ensure you have active accounts for:
- [Vercel](https://vercel.com) (Frontend hosting)
- [Render](https://render.com) (Backend hosting - No CC required)
- [Supabase](https://supabase.com) (Database, Auth, Storage)
- [Google AI Studio](https://aistudio.google.com/) (Gemini API)

---

## 2. Backend Deployment (Render.com)

1. Go to [Render.com](https://render.com) and create a free account.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`skillens`).
4. **Configure the Service:**
   - Name: `skillens-backend`
   - Region: Choose the closest one to you
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free** ($0/month)
5. **Environment Variables:** Scroll down to Advanced -> Environment Variables and add:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `FRONTEND_URL` = (Wait to set this until Vercel is deployed, then paste the Vercel URL here).
   - `SUPABASE_URL` = Your Supabase Project URL
   - `SUPABASE_ANON_KEY` = Your Supabase Anon Key
   - `GEMINI_API_KEY` = Your Gemini Key
6. **Deploy!** 
   - Click **Create Web Service**. 
   - Once deployed, Render will provide a public URL (e.g., `https://skillens-backend.onrender.com`). Copy this URL.

*(Note: Render's free tier goes to sleep after 15 minutes of inactivity. When you open the app again, the first request might take 30-50 seconds to wake up the server).*

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
   - `VITE_API_URL` = Paste the Render URL you copied earlier (e.g., `https://skillens-backend.onrender.com/api/v1`)
   - `VITE_SUPABASE_URL` = Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase Anon Key
5. **Deploy!**
   - Vercel will automatically read the `vercel.json` file we configured to ensure SPA routing works flawlessly.
   - Copy the Vercel production URL.

---

## 4. Final Security Hookup

1. Go back to **Render.com**.
2. Go to your Web Service -> Environment.
3. Update the `FRONTEND_URL` environment variable with your new Vercel URL (e.g., `https://skillens.vercel.app`).
4. Click **Save Changes** (Render will automatically restart the server).
5. **Result:** Your backend CORS policy is now strictly locked down to only accept requests from your Vercel frontend.

---

## 5. Deployment Verification Checklist

✅ Open the Vercel URL.
✅ Sign up / Log in.
✅ Upload a PDF (Validates Storage & API link).
✅ View Study Guide (Validates Gemini API link).
✅ Take a Quiz (Validates Database connection).

🎉 **SkillLens is live!**
