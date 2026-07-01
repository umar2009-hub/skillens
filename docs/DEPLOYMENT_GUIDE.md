# 🚀 SkillLens Deployment Guide

This guide provides the exact steps required to deploy the SkillLens ecosystem to production using **Vercel** for the frontend and **Koyeb** for the backend. (These are 100% free, do NOT require a credit card, and Koyeb does NOT put your app to sleep).

---

## 1. Prerequisites
Before deploying, ensure you have active accounts for:
- [Vercel](https://vercel.com) (Frontend hosting)
- [Koyeb](https://www.koyeb.com/) (Backend hosting - No CC required, Always On)
- [Supabase](https://supabase.com) (Database, Auth, Storage)
- [Google AI Studio](https://aistudio.google.com/) (Gemini API)

---

## 2. Backend Deployment (Koyeb.com)

1. Go to [Koyeb.com](https://www.koyeb.com/) and create a free account.
2. Click **Create Web Service**.
3. Select **GitHub** and connect your `skillens` repository.
4. **Configure the Service:**
   - **Builder:** Select **Buildpack**
   - **Run Command:** `npm start`
   - **Work Directory:** `/backend` (This is crucial so it finds the backend package.json)
   - **Instance Type:** Select **Eco** (Free)
   - **Exposed Ports:** Set port to `5000` (Path `/`)
   - **App & Service Name:** `skillens-backend`
5. **Environment Variables:** Click "Add Variable" and add:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `FRONTEND_URL` = (Wait to set this until Vercel is deployed, then paste the Vercel URL here).
   - `SUPABASE_URL` = Your Supabase Project URL
   - `SUPABASE_ANON_KEY` = Your Supabase Anon Key
   - `GEMINI_API_KEY` = Your Gemini Key
6. **Deploy!** 
   - Click **Deploy**. 
   - Once deployed, Koyeb will provide a public URL (e.g., `https://skillens-backend-yourname.koyeb.app`). Copy this URL.

*(Note: Koyeb's Eco tier is "Always On" and will not go to sleep like Render, making it perfect for a fast, responsive hackathon demo).*

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
   - `VITE_API_URL` = Paste the Koyeb URL you copied earlier (e.g., `https://skillens-backend.koyeb.app/api/v1`)
   - `VITE_SUPABASE_URL` = Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase Anon Key
5. **Deploy!**
   - Vercel will automatically read the `vercel.json` file we configured to ensure SPA routing works flawlessly.
   - Copy the Vercel production URL.

---

## 4. Final Security Hookup

1. Go back to **Koyeb.com**.
2. Go to your Web Service -> Settings -> Environment Variables.
3. Update the `FRONTEND_URL` environment variable with your new Vercel URL (e.g., `https://skillens.vercel.app`).
4. Click **Save Changes** (Koyeb will automatically restart the server).
5. **Result:** Your backend CORS policy is now strictly locked down to only accept requests from your Vercel frontend.

---

## 5. Deployment Verification Checklist

✅ Open the Vercel URL.
✅ Sign up / Log in.
✅ Upload a PDF (Validates Storage & API link).
✅ View Study Guide (Validates Gemini API link).
✅ Take a Quiz (Validates Database connection).

🎉 **SkillLens is live!**
