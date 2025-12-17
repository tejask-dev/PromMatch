# 🚀 Deployment: Render (Backend) + Vercel (Frontend)

Step-by-step guide for deploying PromMatch with Render and Vercel.

---

## ✅ Why This Combo?

- **Render**: Free tier available, easy Python deployment, good for backend APIs
- **Vercel**: Best-in-class frontend hosting, instant deployments, excellent DX
- **Both**: Free tiers are generous, perfect for getting started

---

## 🔧 Step 1: Deploy Backend to Render

### 1.1 Sign Up & Create Service

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your **`PromMatch`** repository

### 1.2 Configure Backend Service

Fill in the following settings:

- **Name**: `prommatch-backend` (or any name you prefer)
- **Environment**: `Python 3`
- **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Python Version**: **MUST SET TO `3.10` or `3.10.13`** (Click "Advanced" → Set Python version)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**⚠️ CRITICAL**: You MUST manually set Python version to `3.10` in Render settings! Go to "Advanced" settings and set Python version to `3.10` or `3.10.13`. The `runtime.txt` file helps, but Render may not always detect it automatically.

### 1.3 Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
HUGGINGFACE_API_KEY=hf_your_huggingface_api_key_here
DEBUG=False
```

**⚠️ Important**: 
- `BACKEND_CORS_ORIGINS` is optional - if not set, it defaults to localhost URLs
- You can set it later after frontend is deployed, or leave it empty
- If you want to set it now, use JSON format: `["https://your-frontend.vercel.app"]` or comma-separated: `https://your-frontend.vercel.app`

### 1.4 Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (usually 2-5 minutes)
4. **Copy your backend URL** (e.g., `https://prommatch-backend.onrender.com`)
   - You'll find it at the top of the service page

### 1.5 Test Backend

Open your backend URL in browser:
- Health check: `https://prommatch-backend.onrender.com/health`
- API docs: `https://prommatch-backend.onrender.com/docs`

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Sign Up & Import Project

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Add New Project"**
3. Import your **`PromMatch`** repository
4. Click **"Import"**

### 2.2 Configure Frontend Project

In the project settings:

- **Framework Preset**: `Vite` (should auto-detect)
- **Root Directory**: `frontend` (click "Edit" and set this)
- **Build Command**: `npm run build` (should be auto-filled)
- **Output Directory**: `dist` (should be auto-filled)
- **Install Command**: `npm install` (should be auto-filled)

### 2.3 Set Environment Variables

Click **"Environment Variables"** and add:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=https://prommatch-backend.onrender.com
```

**⚠️ Important**: Replace `https://prommatch-backend.onrender.com` with your actual Render backend URL!

### 2.4 Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy (usually 1-2 minutes)
3. **Copy your frontend URL** (e.g., `https://prommatch.vercel.app`)
   - You'll see it in the deployment page

---

## 🔄 Step 3: Update CORS in Render

Now that you have your frontend URL, update the backend CORS:

1. Go back to **Render Dashboard** → Your backend service
2. Go to **"Environment"** tab
3. Add new environment variable:

```env
BACKEND_CORS_ORIGINS=["https://prommatch.vercel.app"]
```

**⚠️ Important**: 
- Replace `https://prommatch.vercel.app` with your actual Vercel URL
- Use square brackets `[]` and quotes `""` exactly as shown
- If you have multiple URLs, separate with commas: `["https://prommatch.vercel.app","https://www.yourdomain.com"]`

4. Click **"Save Changes"**
5. Render will automatically redeploy with the new CORS settings

---

## 🔐 Step 4: Configure Supabase

### 4.1 Update Auth URLs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL**: `https://prommatch.vercel.app` (your Vercel URL)
5. Add to **Redirect URLs**:
   ```
   https://prommatch.vercel.app/**
   https://prommatch.vercel.app
   ```

### 4.2 Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Add your Google OAuth credentials
4. Save

---

## ✅ Step 5: Test Your Deployment

### Test Checklist:

- [ ] Frontend loads: `https://prommatch.vercel.app`
- [ ] Backend health check: `https://prommatch-backend.onrender.com/health`
- [ ] Sign up works (create test account)
- [ ] Sign in works
- [ ] Profile creation works
- [ ] Swipe functionality works
- [ ] Matches appear correctly

---

## 🐛 Troubleshooting

### **Backend Issues**

**Problem**: Backend not starting
- Check Render logs: Go to service → "Logs" tab
- Verify all environment variables are set correctly
- Check Python version (should be 3.10+)

**Problem**: CORS errors in browser console
- Verify `BACKEND_CORS_ORIGINS` includes your exact Vercel URL
- Make sure URL has no trailing slash
- Redeploy backend after updating CORS

**Problem**: Database connection errors
- Verify Supabase credentials are correct
- Check Supabase project is active
- Verify database schema is executed

### **Frontend Issues**

**Problem**: Can't connect to backend (Network Error)
- Check `VITE_API_BASE_URL` matches your Render URL exactly
- Verify backend is running (check Render dashboard)
- Check browser console for specific error

**Problem**: Supabase Auth not working
- Verify Supabase URL and keys in Vercel environment variables
- Check Supabase redirect URLs are configured
- Clear browser cache and try again

**Problem**: Environment variables not working
- In Vercel, make sure variables start with `VITE_`
- Redeploy frontend after adding/changing variables
- Check Vercel build logs for errors

### **Render-Specific Issues**

**Problem**: Service is sleeping (free tier)
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- Consider upgrading to paid plan for always-on service

**Problem**: Build fails
- Check build logs in Render dashboard
- Verify `requirements.txt` is correct
- Check Python version compatibility

---

## 💰 Pricing (Free Tier)

### **Render Free Tier:**
- ✅ 750 hours/month (enough for always-on if you want)
- ✅ 512 MB RAM
- ⚠️ Services sleep after 15 min inactivity (cold start ~30s)
- ✅ Free SSL certificate
- ✅ Custom domains

### **Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Free SSL certificate
- ✅ Custom domains
- ✅ Excellent performance

**Total Cost**: $0/month! 🎉

---

## 🚀 Going to Production

### **Recommended Upgrades:**

1. **Render Paid Plan** ($7/month):
   - Always-on service (no sleep)
   - Faster cold starts
   - More resources

2. **Custom Domain**:
   - Add custom domain in Vercel
   - Add custom domain in Render
   - Update CORS and Supabase URLs

3. **Monitoring**:
   - Set up error tracking (Sentry)
   - Monitor Render service health
   - Track Vercel analytics

---

## 📝 Quick Reference

### **Your URLs:**
- **Frontend**: `https://prommatch.vercel.app`
- **Backend**: `https://prommatch-backend.onrender.com`
- **API Docs**: `https://prommatch-backend.onrender.com/docs`

### **Environment Variables Summary:**

**Render (Backend):**
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
HUGGINGFACE_API_KEY
BACKEND_CORS_ORIGINS
DEBUG=False
```

**Vercel (Frontend):**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_BASE_URL
```

---

## 🎉 You're Deployed!

Your Prom Matchmaking app is now live! Share it with your school! 💕

**Next Steps:**
1. Test all features thoroughly
2. Set up custom domain (optional)
3. Monitor performance
4. Set up error tracking

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Check deployment logs** in both platforms
- **Verify environment variables** are set correctly
- **Test API endpoints** with Postman/curl

