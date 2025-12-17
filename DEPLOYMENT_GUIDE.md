# 🚀 Deployment Guide - PromMatch

Complete guide to deploy your Prom Matchmaking app to production.

---

## 📋 Pre-Deployment Checklist

- [ ] Supabase project created and database schema executed
- [ ] Hugging Face API key obtained
- [ ] Google OAuth configured in Supabase
- [ ] All environment variables ready
- [ ] Domain names ready (optional)

---

## 🎯 Recommended Deployment Strategy

**Frontend**: Vercel or Netlify (Free, easy, fast)  
**Backend**: Railway or Render (Free tier available, Python support)

---

## 🌐 Option 1: Vercel (Frontend) + Railway (Backend)

### **Step 1: Deploy Backend to Railway**

1. **Sign up/Login** to [Railway.app](https://railway.app)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `PromMatch` repository
   - Select "Backend" folder or configure root directory

3. **Configure Build Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Python Version**: 3.10+

4. **Set Environment Variables** in Railway:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_role_key
   HUGGINGFACE_API_KEY=hf_your_key_here
   DEBUG=False
   BACKEND_CORS_ORIGINS=["https://your-frontend-domain.vercel.app"]
   ```

5. **Deploy**:
   - Railway will automatically deploy
   - Note your backend URL (e.g., `https://your-app.railway.app`)

---

### **Step 2: Deploy Frontend to Vercel**

1. **Sign up/Login** to [Vercel.com](https://vercel.com)

2. **Import Project**:
   - Click "Add New Project"
   - Import from GitHub
   - Select your `PromMatch` repository

3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Set Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_API_BASE_URL=https://your-backend.railway.app
   ```

5. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Note your frontend URL (e.g., `https://prommatch.vercel.app`)

6. **Update Backend CORS**:
   - Go back to Railway
   - Update `BACKEND_CORS_ORIGINS` to include your Vercel URL:
     ```
     BACKEND_CORS_ORIGINS=["https://prommatch.vercel.app"]
     ```
   - Redeploy backend

---

## 🌐 Option 2: Netlify (Frontend) + Render (Backend)

### **Step 1: Deploy Backend to Render**

1. **Sign up/Login** to [Render.com](https://render.com)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**:
   - **Name**: `prommatch-backend`
   - **Environment**: Python 3
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_role_key
   HUGGINGFACE_API_KEY=hf_your_key_here
   DEBUG=False
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Note your backend URL (e.g., `https://prommatch-backend.onrender.com`)

---

### **Step 2: Deploy Frontend to Netlify**

1. **Sign up/Login** to [Netlify.com](https://netlify.com)

2. **Add New Site**:
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository

3. **Configure Build**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **Set Environment Variables**:
   - Go to Site settings → Environment variables
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_API_BASE_URL=https://prommatch-backend.onrender.com
   ```

5. **Deploy**:
   - Click "Deploy site"
   - Note your frontend URL (e.g., `https://prommatch.netlify.app`)

6. **Update Backend CORS**:
   - Go to Render dashboard
   - Update environment variable:
     ```
     BACKEND_CORS_ORIGINS=["https://prommatch.netlify.app"]
     ```
   - Redeploy

---

## 🐳 Option 3: Docker Deployment (Advanced)

### **Deploy to Any Docker Host (DigitalOcean, AWS, etc.)**

1. **Update docker-compose.yml**:
   ```yaml
   version: '3.8'
   
   services:
     backend:
       build:
         context: .
         dockerfile: Dockerfile.backend
       ports:
         - "8000:8000"
       environment:
         - SUPABASE_URL=${SUPABASE_URL}
         - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
         - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
         - HUGGINGFACE_API_KEY=${HUGGINGFACE_API_KEY}
         - BACKEND_CORS_ORIGINS=["https://your-frontend-domain.com"]
       restart: unless-stopped
   
     frontend:
       build:
         context: .
         dockerfile: Dockerfile.frontend
       ports:
         - "80:80"
       depends_on:
         - backend
       restart: unless-stopped
   ```

2. **Build and Run**:
   ```bash
   docker-compose up -d --build
   ```

---

## 🔧 Environment Variables Reference

### **Backend (.env)**
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Hugging Face
HUGGINGFACE_API_KEY=hf_your_key_here

# CORS (Update with your frontend URL)
BACKEND_CORS_ORIGINS=["https://your-frontend-domain.com"]

# Debug Mode
DEBUG=False
```

### **Frontend (.env)**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Backend API URL (if different from default)
VITE_API_BASE_URL=https://your-backend-url.com
```

---

## 🔄 Update CORS Configuration

After deploying, update your backend CORS to allow your frontend domain:

**In Railway/Render Environment Variables**:
```
BACKEND_CORS_ORIGINS=["https://your-frontend-domain.vercel.app","https://your-frontend-domain.netlify.app"]
```

**Or update `backend/app/core/config.py`**:
```python
BACKEND_CORS_ORIGINS: List[str] = [
    "https://your-frontend-domain.vercel.app",
    "https://your-frontend-domain.netlify.app",
    # Add more domains as needed
]
```

---

## 🔐 Supabase Configuration

### **1. Update Supabase Auth Settings**

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your frontend URL to **Site URL**:
   ```
   https://your-frontend-domain.vercel.app
   ```
3. Add to **Redirect URLs**:
   ```
   https://your-frontend-domain.vercel.app/**
   ```

### **2. Enable Google OAuth (Optional)**

1. Go to Authentication → Providers → Google
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add redirect URL:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

---

## 📱 Update Frontend API URL

If your backend is on a different domain, update the frontend API base URL:

**Option 1: Environment Variable** (Recommended)
```env
VITE_API_BASE_URL=https://your-backend.railway.app
```

**Option 2: Update in code** (`frontend/src/pages/*.jsx`):
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-backend.railway.app';
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] API health check works: `https://your-backend.com/health`
- [ ] Frontend can connect to backend
- [ ] Supabase Auth working (test signup/login)
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Google OAuth configured (if using)
- [ ] Test full user flow: Signup → Profile → Swipe → Match

---

## 🐛 Troubleshooting

### **Backend Issues**

**Problem**: Backend not starting
- Check environment variables are set correctly
- Verify Python version (3.10+)
- Check build logs for errors

**Problem**: CORS errors
- Verify `BACKEND_CORS_ORIGINS` includes your frontend URL
- Check exact URL (with/without trailing slash)
- Redeploy backend after CORS changes

**Problem**: Database connection errors
- Verify Supabase credentials
- Check Supabase project is active
- Verify database schema is executed

### **Frontend Issues**

**Problem**: Can't connect to backend
- Verify `VITE_API_BASE_URL` is set correctly
- Check backend is running and accessible
- Verify CORS is configured

**Problem**: Supabase Auth not working
- Check Supabase URL and keys
- Verify redirect URLs in Supabase dashboard
- Check browser console for errors

---

## 🚀 Quick Deploy Commands

### **Railway (Backend)**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

### **Vercel (Frontend)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

### **Netlify (Frontend)**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod
```

---

## 📊 Monitoring & Analytics

### **Recommended Tools**:
- **Sentry**: Error tracking
- **Vercel Analytics**: Frontend analytics
- **Railway Metrics**: Backend monitoring
- **Supabase Dashboard**: Database monitoring

---

## 🎉 You're Deployed!

Your Prom Matchmaking app is now live! Share it with your school! 💕

**Next Steps**:
1. Test all features thoroughly
2. Set up custom domain (optional)
3. Configure error monitoring
4. Set up database backups
5. Monitor performance

---

## 📞 Need Help?

- Check deployment platform documentation
- Review error logs in platform dashboards
- Verify all environment variables
- Test API endpoints with Postman/curl
- Check Supabase dashboard for database issues

