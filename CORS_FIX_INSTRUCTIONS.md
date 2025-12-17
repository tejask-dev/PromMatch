# 🔧 CORS Fix Instructions

## Problem
Your frontend at `https://prom-match.vercel.app` is being blocked by CORS when trying to access the backend at `https://prommatch.onrender.com`.

## Solution: Add Frontend URL to Render Environment Variables

### Step 1: Go to Render Dashboard
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service (`prommatch`)

### Step 2: Add Environment Variable
1. Click on **"Environment"** tab (or **"Environment Variables"**)
2. Click **"Add Environment Variable"**
3. Set:
   - **Key**: `BACKEND_CORS_ORIGINS`
   - **Value**: `["https://prom-match.vercel.app","http://localhost:5173","http://localhost:3000"]`

   **OR** use comma-separated format:
   - **Value**: `https://prom-match.vercel.app,http://localhost:5173,http://localhost:3000`

### Step 3: Save and Redeploy
1. Click **"Save Changes"**
2. Render will automatically redeploy your service
3. Wait 2-3 minutes for deployment to complete

### Step 4: Verify
1. Check Render logs to see: `🌐 CORS Origins: ['https://prom-match.vercel.app', ...]`
2. Test your frontend - CORS errors should be gone!

## Alternative: Quick Fix via Render Dashboard

If you prefer, you can also:
1. Go to your service → **Settings** → **Environment Variables**
2. Find or add `BACKEND_CORS_ORIGINS`
3. Set value to: `https://prom-match.vercel.app,http://localhost:5173,http://localhost:3000`
4. Save and wait for redeploy

## Testing

After redeploy, open your frontend and check the browser console. The CORS errors should be gone!

If you still see errors:
- Make sure the URL matches exactly (including `https://` and no trailing slash)
- Check Render logs for the CORS origins being used
- Verify the backend service is running

