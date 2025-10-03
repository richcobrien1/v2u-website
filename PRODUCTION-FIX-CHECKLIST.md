# 🚨 PRODUCTION VIDEO FIX - IMMEDIATE ACTION REQUIRED

## ❌ **Problem:** Videos not loading in production
## ✅ **Solution:** Add missing environment variables to Vercel

---

## 🔧 **STEP 1: Add Environment Variables to Vercel**

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these EXACT variables:**

```bash
# R2 Storage Configuration (REQUIRED)
R2_ENDPOINT=https://d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=fdccf4f202e438ed9500c212e108ae65
R2_SECRET_ACCESS_KEY=469f00dbb990566c5bd2dffb2b5e183851678154625b5a2a2231546e434a6f44
R2_BUCKET_NAME=v2u-assets

# Legacy Support (ALSO ADD THESE)
R2_ACCESS_KEY=fdccf4f202e438ed9500c212e108ae65
R2_SECRET_KEY=469f00dbb990566c5bd2dffb2b5e183851678154625b5a2a2231546e434a6f44
R2_BUCKET=v2u-assets
CLOUDFLARE_ACCOUNT_ID=d54e57481e824e8752d0f6caa9b37ba7
```

**Important:** Set Environment = "Production" for each variable

---

## 🚀 **STEP 2: Trigger Redeploy**

After adding all variables:
1. Go to Vercel Dashboard → Deployments
2. Click "Redeploy" on the latest deployment
3. Wait 2-3 minutes for completion

---

## 🧪 **STEP 3: Test Production**

Once redeployed, test these URLs:

```bash
# Test episodes API (should return real data, not mock)
https://your-domain.vercel.app/api/episodes

# Test video access (should return 307 redirect, not 404)
https://your-domain.vercel.app/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4
```

---

## ✅ **Expected Results After Fix:**

- ✅ Videos load and play in production
- ✅ Episode titles are clean (no hash codes)
- ✅ Video player opens properly
- ✅ No more spinning/loading issues

---

## 🆘 **If Still Not Working:**

Check Vercel Function Logs:
1. Vercel Dashboard → Functions → View Logs
2. Look for R2 connection errors
3. Verify all environment variables are present

**Quick Debug URL:** https://your-domain.vercel.app/api/debug
(This will show which environment variables are configured)

---

**⏰ TIMELINE: 5-10 minutes to fix production**
**🎯 PRIORITY: Critical - blocks all video functionality**