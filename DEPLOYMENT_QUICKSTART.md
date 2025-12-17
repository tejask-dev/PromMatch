# ⚡ Quick Deployment Guide

## 🎯 Fastest Way: Vercel + Railway (Recommended)

### **Backend (Railway) - 5 minutes**

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `PromMatch` repository
4. **Settings**:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables** (Settings → Variables):
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_KEY=your_key
   HUGGINGFACE_API_KEY=hf_your_key
   BACKEND_CORS_ORIGINS=["https://your-app.vercel.app"]
   ```
6. Deploy! Copy your backend URL (e.g., `https://prommatch.railway.app`)

---

### **Frontend (Vercel) - 3 minutes**

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click "Add New Project" → Import `PromMatch`
3. **Settings**:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_key
   VITE_API_BASE_URL=https://prommatch.railway.app
   ```
5. Deploy! Copy your frontend URL (e.g., `https://prommatch.vercel.app`)

---

### **Final Step: Update CORS**

1. Go back to Railway
2. Update `BACKEND_CORS_ORIGINS`:
   ```
   BACKEND_CORS_ORIGINS=["https://prommatch.vercel.app"]
   ```
3. Redeploy backend

---

### **Supabase Configuration**

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. **Site URL**: `https://prommatch.vercel.app`
3. **Redirect URLs**: `https://prommatch.vercel.app/**`

---

## ✅ Done!

Your app is live at: `https://prommatch.vercel.app` 🎉

---

## 🆘 Troubleshooting

**CORS Error?**
- Make sure `BACKEND_CORS_ORIGINS` includes your exact Vercel URL
- Redeploy backend after updating CORS

**Can't connect to backend?**
- Check `VITE_API_BASE_URL` matches your Railway URL
- Verify backend is running (check Railway logs)

**Auth not working?**
- Verify Supabase redirect URLs are set
- Check Supabase keys in environment variables

