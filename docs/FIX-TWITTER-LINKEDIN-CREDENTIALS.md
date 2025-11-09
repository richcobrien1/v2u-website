# Fix Twitter & LinkedIn Credentials

## Issue Summary

**Test Results from Manual Post:**
- ✅ Twitter AI_Now - Working perfectly
- ❌ Twitter V2U - 401 Unauthorized (expired token)
- ❌ LinkedIn - 403 Access Denied (wrong API endpoint)

---

## 🔧 Fix #1: Twitter V2U (5 minutes)

### The Problem
The access token for the V2U Twitter account has expired or was revoked.

### The Solution
Regenerate the access token from Twitter Developer Portal.

### Steps:

1. **Go to Twitter Developer Portal**
   - Visit: https://developer.twitter.com/en/portal/dashboard
   - Sign in with your V2U Twitter account

2. **Find Your App**
   - Look for your V2U app in the dashboard
   - Click on the app name

3. **Regenerate Tokens**
   - Go to "Keys and tokens" tab
   - Under "Authentication Tokens"
   - Click "Regenerate" for Access Token & Secret
   - ⚠️ **IMPORTANT**: Copy both the token and secret immediately!

4. **Update Environment Variables**
   
   Update in **`c:\Users\richc\Projects\v2u\.env`**:
   ```bash
   TWITTER_ACCESS_TOKEN_V2U="your-new-access-token-here"
   TWITTER_ACCESS_SECRET_V2U="your-new-access-secret-here"
   ```
   
   Update in **`c:\Users\richc\Projects\v2u\website\.env.local`**:
   ```bash
   TWITTER_ACCESS_TOKEN_V2U="your-new-access-token-here"
   TWITTER_ACCESS_SECRET_V2U="your-new-access-secret-here"
   ```

5. **Update Vercel**
   - Go to: https://vercel.com/richcobrien1/v2u-website/settings/environment-variables
   - Update `TWITTER_ACCESS_TOKEN_V2U` and `TWITTER_ACCESS_SECRET_V2U`
   - Redeploy the site

6. **Test It**
   ```bash
   curl -X POST https://www.v2u.us/api/automation/manual-post \
     -H "Content-Type: application/json" \
     -d '{"videoId":"test-123","title":"Test","url":"https://youtu.be/eZCYQSrQeUI","source":"youtube","skipDuplicateCheck":true}'
   ```

---

## 🔧 Fix #2: LinkedIn (Already Fixed!)

### The Problem
Was using OpenID Connect `/userinfo` endpoint which requires OpenID scope we don't have.

### The Solution
✅ **Already fixed!** Changed to use `/v2/me` endpoint which works with `r_liteprofile` scope.

### Next Steps:
Just commit and deploy the fix:

```bash
cd /c/Users/richc/Projects/v2u/website
git add lib/social-platforms/linkedin-poster.ts
git commit -m "Fix LinkedIn API endpoint to use v2/me instead of userinfo"
git push
```

Vercel will auto-deploy and LinkedIn should work on next test!

---

## ✅ After Both Fixes

Run the test again:

```bash
curl -X POST https://www.v2u.us/api/automation/manual-post \
  -H "Content-Type: application/json" \
  -d '{"videoId":"test-final","title":"AI Now: Race for AI Supremacy - November 7, 2025","url":"https://youtu.be/eZCYQSrQeUI","thumbnailUrl":"","source":"youtube","skipDuplicateCheck":true}'
```

**Expected Result:**
- ✅ Twitter V2U: Posted successfully
- ✅ Twitter AI_Now: Posted successfully  
- ✅ LinkedIn: Posted successfully

All 3 platforms working! 🎉

---

## 📝 Notes

- Twitter tokens don't expire often, but can be revoked if security issues detected
- LinkedIn access token expires after 60 days (will need refresh flow later)
- AI_Now Twitter is already working - no action needed there
- Remember to update tokens in BOTH .env files and Vercel
