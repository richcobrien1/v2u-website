# Facebook Token Setup - Quick Start

## 🎯 3-Minute Setup

### Step 1: Add App Credentials to Environment (1 min)

```bash
# In Vercel Dashboard → Project Settings → Environment Variables
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
CRON_SECRET=any_random_secret_here
```

**Get App Credentials**:
- Go to [developers.facebook.com](https://developers.facebook.com/)
- Select your app (or create one)
- Copy **App ID** and **App Secret** from Settings → Basic

---

### Step 2: Get Page Access Token (1 min)

**Quick Method - Graph API Explorer**:

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your Facebook App
3. Click "Generate Access Token"
4. Select permissions:
   - ✅ `pages_manage_posts`
   - ✅ `pages_read_engagement`
5. Copy the token (can be short-lived, system will exchange it!)

---

### Step 3: Validate in Admin Panel (1 min)

1. Go to `https://v2u.ai/admin/social-posting`
2. Scroll to Facebook section
3. Enter:
   - **Page ID**: Your page ID (find in Page Settings → About)
   - **Page Access Token**: Paste token from Step 2
4. Click **"Validate Facebook"**

**The system will automatically**:
- ✅ Verify token works
- ✅ Exchange for long-lived page token (never expires!)
- ✅ Save credentials
- ✅ Show success with "Token expires: never"

---

### Step 4: Test It! (30 sec)

1. Click **"Post Latest Now"**
2. Check Facebook - post should appear! ✅

---

## ✨ What Happens Automatically

### During Validation
```
Your Token (any type)
  ↓ [System exchanges]
Long-Lived Page Token (NEVER EXPIRES)
  ↓ [Saved automatically]
Ready to post forever!
```

### Daily at Midnight (Automatic)
```
Cron job runs → Checks all Facebook tokens
If token expires in < 7 days → Rotates automatically
Else → No action (tokens already long-lived)
```

---

## 🔍 Verify It's Working

### Check Token Status
```bash
curl https://v2u.ai/api/automation/rotate-tokens
```

Should show:
```json
{
  "facebook": {
    "expiresAt": "never",
    "needsRotation": false
  }
}
```

---

## 🎉 Done!

Your Facebook tokens now:
- ✅ Never expire (unless you revoke them)
- ✅ Automatically rotate if needed
- ✅ Work forever without manual intervention

**Total time**: 3 minutes
**Manual work after setup**: None!

---

## 📚 Need Help?

See full documentation: `docs/facebook-token-rotation.md`

Common issues:
- **"Missing app credentials"** → Add to Vercel environment variables
- **"Token expired"** → Re-validate in admin panel (system will exchange)
- **"Permission denied"** → Ensure you're page admin when generating token
