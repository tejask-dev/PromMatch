# 🚀 Prom Matchmaking - Supabase Enterprise Setup Guide

This guide will walk you through setting up Supabase for the Prom Matchmaking application.

---

## 📋 Prerequisites

1. A Supabase account (free at [supabase.com](https://supabase.com))
2. A Hugging Face account (free at [huggingface.co](https://huggingface.co))
3. Node.js 18+ and Python 3.10+

---

## 🗄️ Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Enter project details:
   - **Name**: `prom-matchmaking`
   - **Database Password**: (save this somewhere!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait for setup (~2 minutes)

---

## 🔑 Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings → API**
2. Copy these values:

   | Key | Description | Where to Use |
   |-----|-------------|--------------|
   | **Project URL** | `https://xxxxx.supabase.co` | Backend + Frontend |
   | **anon public** | `eyJhbGc...` | Backend + Frontend |
   | **service_role** | `eyJhbGc...` | Backend ONLY (secret!) |

---

## 🛢️ Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL Editor
5. Click **"Run"**

This creates:
- `users` table with pgvector embedding column
- `swipes` table for swipe actions
- `matches` table for mutual matches
- `find_matches()` function for vector similarity search
- Row Level Security policies
- Indexes for performance

---

## 🔐 Step 4: Enable Google Authentication

1. Go to **Authentication → Providers**
2. Click **Google**
3. Toggle **"Enable Sign in with Google"**
4. You'll need to set up OAuth in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Go to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: Add your Supabase callback URL:
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```
   - Copy **Client ID** and **Client Secret**
5. Back in Supabase, paste:
   - **Client ID**
   - **Client Secret**
6. Click **Save**

---

## 🤖 Step 5: Get Hugging Face API Key

1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click **"New token"**
3. Name: `prom-matchmaking`
4. Role: **Read**
5. Click **"Generate"**
6. Copy the token (starts with `hf_`)

---

## ⚙️ Step 6: Configure Environment Variables

### Backend (`backend/.env`)

Create `backend/.env`:
```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
HUGGINGFACE_API_KEY=hf_your_key_here
DEBUG=False
```

### Frontend (`frontend/.env`)

Create `frontend/.env`:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

⚠️ **IMPORTANT**: Never commit `.env` files to git!

---

## 🚀 Step 7: Install Dependencies & Run

### Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

Backend runs at: `http://localhost:8000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## ✅ Step 8: Verify Setup

1. Open `http://localhost:5173`
2. Click **"Continue with Google"** or sign up with email
3. Complete your profile
4. Go to swipe deck
5. If you see profiles, congratulations! 🎉

---

## 🔍 Troubleshooting

### "Invalid API key"
- Double-check your Supabase URL and keys
- Make sure you're using the correct key (anon vs service_role)

### "pgvector extension not found"
- Run the SQL schema again
- Check for errors in SQL Editor

### "Google OAuth not working"
- Verify callback URL in Google Cloud Console
- Check Supabase Auth settings

### "No profiles showing"
- Ensure you've completed your profile first
- Check browser console for API errors

---

## 🏭 Production Deployment

### Backend (Railway/Render)
1. Push to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy!

### Frontend (Vercel/Netlify)
1. Push to GitHub
2. Connect to Vercel/Netlify
3. Set environment variables
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Deploy!

### Update CORS
In `backend/app/core/config.py`, add your production URL:
```python
BACKEND_CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "https://your-app.vercel.app"  # Add this
]
```

---

## 📊 Database Management

### View Data
- Supabase Dashboard → Table Editor

### Run Queries
- Supabase Dashboard → SQL Editor

### Monitor Usage
- Supabase Dashboard → Reports

---

## 🎉 You're Ready!

Your enterprise-grade Prom Matchmaking app is now set up with:
- ✅ Supabase PostgreSQL database
- ✅ pgvector for AI-powered matching
- ✅ Google OAuth authentication
- ✅ Row Level Security
- ✅ Super Like feature
- ✅ Gender & Grade preferences

Happy matching! 💕
