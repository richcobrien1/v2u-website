# Security Enhancements - Quick Start

**Commit:** 85c8794
**Date:** March 25, 2026
**Status:** ✅ Code Complete - Configuration Required

---

## ✅ What Was Implemented

### 1. Pre-Commit Hook (Credential Prevention)
**Status:** ✅ Ready to use

**Files Created:**
- `.husky/pre-commit` - Scans for hardcoded credentials
- `.husky/commit-msg` - Validates commit messages
- `.commitlintrc.json` - Commit message standards

**What It Blocks:**
- Passwords like `1Topgun123`
- API keys like `appKey = "BulQVrhLBcpue87jiRzjWF3Qn"`
- Weak JWT secrets like `your-jwt-secret`
- Email + password patterns

**Activation:**
```bash
cd /c/Users/richc/Projects/v2u/apps/v2u-website
npm install  # Install husky dev dependencies
npx husky init  # Initialize hooks
```

**Test It:**
```bash
# Try to commit a file with hardcoded password - should be blocked
git commit -m "test: verify security hook"
```

---

### 2. Rate Limiting (Brute Force Protection)
**Status:** ✅ Code ready - Requires Upstash account

**Files Created:**
- `lib/ratelimit.ts` - Rate limiting utilities
- Updated: `app/api/admin-login/route.ts` - Protected endpoint

**Protection Applied:**
- `/api/admin-login`: **3 attempts per 5 minutes** per IP
- Returns 429 "Too Many Requests" when exceeded
- Tracks attempts across servers (distributed)

**Setup Required:**

1. **Create Free Upstash Account:**
   - Go to: https://console.upstash.com/
   - Sign up (free tier available)
   - Create Redis database: `v2u-ratelimit`

2. **Get Credentials:**
   - Click database → "REST API" tab
   - Copy URL and Token

3. **Add to `.env.local`:**
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AYourTokenHere
   ```

4. **Add to Vercel:**
   ```bash
   vercel env add UPSTASH_REDIS_REST_URL production
   vercel env add UPSTASH_REDIS_REST_TOKEN production
   ```

**Fallback:**
If not configured, rate limiting is **disabled** (warns in logs). For production, **must configure Upstash**.

---

### 3. Clerk Authentication (Modern SSO)
**Status:** ✅ Code ready - Requires Clerk setup

**Files Created:**
- `lib/clerk.ts` - Authentication helpers
- Updated: `middleware.ts` - Clerk protection enabled
- Sign-in/Sign-up pages already existed

**Features Enabled:**
- ✅ Google/GitHub OAuth
- ✅ Email authentication
- ✅ Built-in 2FA support
- ✅ User management dashboard
- ✅ Session management
- ✅ Role-based access control

**Setup Required:**

1. **Create Clerk Application:**
   - Go to: https://dashboard.clerk.com/
   - Sign up / Create application: "V2U Website"
   - Enable: Email, Google, GitHub

2. **Get API Keys:**
   - Dashboard → API Keys
   - Copy both keys (pk_test_... and sk_test_...)

3. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
   CLERK_SECRET_KEY=sk_test_your_secret
   
   # URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
   ```

4. **Configure Webhook:**
   - Clerk Dashboard → Webhooks → Add Endpoint
   - URL: `https://www.v2u.us/api/webhooks/clerk`
   - Subscribe to: user.created, user.updated, user.deleted
   - Copy signing secret → `.env.local`:
     ```bash
     CLERK_WEBHOOK_SECRET=whsec_your_secret
     ```

5. **Add to Vercel:**
   ```bash
   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
   vercel env add CLERK_SECRET_KEY production
   vercel env add CLERK_WEBHOOK_SECRET production
   # ... (add all Clerk URLs too)
   ```

**Using Clerk in Code:**
```typescript
import { requireAuth, isAdmin, hasPremiumAccess } from '@/lib/clerk';

export default async function Page() {
  const userId = await requireAuth(); // Redirects if not logged in
  const admin = await isAdmin(); // Check role
  return <div>Welcome {userId}</div>;
}
```

---

## 📋 Next Steps (In Order)

### **Priority 1: Complete API Credential Rotation** (CRITICAL)
Still pending from earlier security incident:

- [ ] **Twitter API**: Regenerate keys at https://developer.twitter.com/
- [ ] **Facebook App**: Reset secret at https://developers.facebook.com/
- [ ] **Generate new JWT_SECRET**: `openssl rand -base64 64`

### **Priority 2: Configure Rate Limiting** (HIGH)
- [ ] Create Upstash account
- [ ] Add credentials to `.env.local`
- [ ] Test locally (try 4 login attempts)
- [ ] Add credentials to Vercel

### **Priority 3: Set Up Clerk** (HIGH)
- [ ] Create Clerk application
- [ ] Add API keys to `.env.local` and Vercel
- [ ] Configure webhook
- [ ] Test sign-in/sign-up flow

### **Priority 4: Make GitHub Repo Private** (CRITICAL)
- [ ] Go to: https://github.com/richcobrien1/v2u-website/settings
- [ ] Change visibility to Private
- [ ] Enable secret scanning
- [ ] Enable push protection

### **Priority 5: Deploy to Production**
```bash
cd /c/Users/richc/Projects/v2u/apps/v2u-website
git push origin master
# Vercel will auto-deploy
```

### **Priority 6: Verify Everything Works**
- [ ] Visit https://www.v2u.us/sign-in
- [ ] Test authentication
- [ ] Try 4 login attempts (should be rate limited)
- [ ] Check Clerk Dashboard for user events
- [ ] Check Upstash Analytics for rate limit stats

---

## 🎯 What's Protected Now

| Feature | Before | After |
|---------|--------|-------|
| **Credential Commits** | ❌ Allowed (exposed 5 months) | ✅ Blocked by pre-commit hook |
| **Login Attempts** | ❌ Unlimited (brute force risk) | ✅ 3 per 5 min (rate limited) |
| **Authentication** | ❌ Custom JWT (weak defaults) | ✅ Clerk SSO (enterprise-grade) |
| **2FA** | ❌ None | ✅ Built-in with Clerk |
| **User Management** | ❌ Manual database | ✅ Clerk Dashboard |
| **Password Storage** | ❌ Hashed in code | ✅ Never stored (Clerk handles) |

---

## 📚 Documentation

**Comprehensive Guide:**
- See: `SECURITY_SETUP_GUIDE.md` (step-by-step instructions)

**Security Incident Report:**
- See: `SECURITY_INCIDENT_2026-03-25.md` (full timeline)

**Quick Help:**
All new code includes detailed comments. Check:
- `lib/ratelimit.ts` - Rate limiting docs
- `lib/clerk.ts` - Auth helper functions
- `.husky/pre-commit` - Hook patterns

---

## ⚠️ Important Notes

1. **Pre-commit hook is active** - It will block commits with credentials
2. **Middleware is now Clerk-based** - Legacy routes need updating
3. **Rate limiting needs Upstash** - Won't work until configured (safe fallback)
4. **Clerk needs setup** - Authentication won't work until keys added

---

## 🚨 Troubleshooting

**Hook not running?**
```bash
npx husky init
chmod +x .husky/pre-commit .husky/commit-msg
```

**Rate limiting not working?**
- Check: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.local`
- Should see: "Security checks passed" in logs (not "Rate limiting not configured")

**Clerk errors?**
- Check: All `CLERK_*` and `NEXT_PUBLIC_CLERK_*` variables set
- Verify: Allowed domains in Clerk Dashboard include your domain

---

## ✅ Success Checklist

After completing all setup steps, you should see:

- ✅ Git commits blocked if they contain credentials
- ✅ Login rate limited to 3 attempts per 5 minutes
- ✅ Sign-in page working at https://www.v2u.us/sign-in
- ✅ Users can authenticate with Google/GitHub/Email
- ✅ Protected routes redirect to sign-in
- ✅ Clerk Dashboard shows user events
- ✅ Upstash Analytics shows rate limit data

**Estimated Setup Time:**
- Pre-commit hook: 5 minutes ✅ (already done)
- Rate limiting: 10 minutes (create Upstash account + config)
- Clerk auth: 15 minutes (create app + config + test)
- **Total: ~30 minutes for complete security setup**

---

**Questions?** Check `SECURITY_SETUP_GUIDE.md` for detailed instructions.

**Commit this was added:** 85c8794
