# Security Hardening Implementation Guide

This document explains the three security enhancements implemented after the March 2026 security incident.

## 🛡️ Security Features Implemented

### 1. Pre-Commit Hook (Credential Prevention) ✅
### 2. Rate Limiting (Brute Force Protection) ✅ 
### 3. Clerk Authentication (Modern SSO) ✅

---

## 1️⃣ Pre-Commit Hook Setup

**Status:** ✅ Configured and ready

**What it does:**
- Scans code for hardcoded passwords, API keys, tokens before every commit
- Blocks commits containing dangerous patterns from the security incident
- Prevents credential leaks like the October 2025 exposure

**Files created:**
- `.husky/pre-commit` - Main security scanner
- `.husky/commit-msg` - Commit message validator
- `.commitlintrc.json` - Commit message standards

**Installation:**

```bash
cd /c/Users/richc/Projects/v2u/apps/v2u-website

# Install dependencies (if not already done)
npm install --save-dev husky lint-staged @commitlint/config-conventional @commitlint/cli

# Initialize husky
npx husky init

# Make hooks executable (Git Bash on Windows)
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

# Test the hook
git add .
git commit -m "test: verify pre-commit hook"
```

**What it blocks:**
- ✅ Hardcoded passwords (e.g., `password = "1Topgun123"`)
- ✅ API keys (e.g., `apiKey = "BulQVrhLBcpue87jiRzjWF3Qn"`)
- ✅ Weak JWT secrets (e.g., `your-jwt-secret`)
- ✅ Email + password patterns
- ✅ Access tokens and secrets

**Bypassing (emergency only):**
```bash
git commit --no-verify -m "emergency: bypassing hook"
```

---

## 2️⃣ Rate Limiting Setup

**Status:** ✅ Code ready, requires Upstash account

**What it does:**
- Limits authentication attempts: **3 tries per 5 minutes** per IP
- Prevents brute force attacks on `/api/admin-login`
- Tracks requests across distributed servers
- Returns 429 "Too Many Requests" when limit exceeded

**Files created:**
- `lib/ratelimit.ts` - Rate limiting utility
- Updated: `app/api/admin-login/route.ts` - Protected with rate limiting

**Setup Instructions:**

### Step 1: Create Upstash Account

1. Go to: https://console.upstash.com/
2. Sign up (free tier available)
3. Click "Create Database"
4. Choose region closest to your users (e.g., us-east-1)
5. Name it: `v2u-ratelimit`

### Step 2: Get Credentials

1. Click on your database
2. Go to "REST API" tab
3. Copy:
   - `UPSTASH_REDIS_REST_URL` (e.g., `https://us1-calm-firefly-12345.upstash.io`)
   - `UPSTASH_REDIS_REST_TOKEN` (long string starting with `AX...`)

### Step 3: Configure Environment

Add to `.env.local`:

```bash
# Upstash Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYourTokenHere
```

Add to Vercel (Production):

```bash
vercel env add UPSTASH_REDIS_REST_URL production
# Paste your URL when prompted

vercel env add UPSTASH_REDIS_REST_TOKEN production
# Paste your token when prompted
```

### Step 4: Install Packages

```bash
cd /c/Users/richc/Projects/v2u/apps/v2u-website
npm install @upstash/ratelimit @upstash/redis
```

### Step 5: Test Rate Limiting

```bash
# Start dev server
npm run dev

# Try logging in 4 times rapidly - 4th attempt should be blocked
curl -X POST http://localhost:3000/api/admin-login \
  -H "Content-Type: application/json" \
  -d '{"adminId":"test","secret":"wrong"}'
```

**Rate Limits Configured:**

| Type | Limit | Window | Usage |
|------|-------|--------|-------|
| `strict` | 3 requests | 5 minutes | `/api/admin-login` |
| `auth` | 5 requests | 1 hour | General auth endpoints |
| `api` | 100 requests | 1 minute | Public API routes |

**Fallback Behavior:**
- If Upstash not configured: Requests allowed (warning logged)
- Local development: In-memory fallback available
- Production: **Must configure Upstash** for security

---

## 3️⃣ Clerk Authentication Setup

**Status:** ✅ Code ready, requires Clerk configuration

**What it does:**
- Replaces insecure legacy JWT authentication
- Provides enterprise-grade SSO (Google, GitHub, email)
- Built-in 2FA support
- User management dashboard
- Webhook for syncing user data

**Files created:**
- `lib/clerk.ts` - Authentication helpers
- `app/sign-in/[[...sign-in]]/page.tsx` - Sign-in page
- `app/sign-up/[[...sign-up]]/page.tsx` - Sign-up page
- Updated: `middleware.ts` - Clerk protection enabled

**Setup Instructions:**

### Step 1: Create Clerk Application

1. Go to: https://dashboard.clerk.com/
2. Sign up / Sign in
3. Click "Create Application"
4. Name: `V2U Website`
5. Enable sign-in methods:
   - ✅ Email
   - ✅ Google
   - ✅ GitHub
   - ✅ Email verification

### Step 2: Get API Keys

1. In Clerk Dashboard, go to: **API Keys**
2. Copy both keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_`)

### Step 3: Configure Environment

Add to `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

Add to Vercel:

```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production
```

### Step 4: Configure Webhook (User Sync)

1. In Clerk Dashboard: **Webhooks** → **Add Endpoint**
2. Endpoint URL: `https://www.v2u.us/api/webhooks/clerk`
3. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
4. Copy **Signing Secret**
5. Add to `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 5: Set Up User Roles

1. Clerk Dashboard: **Users** → Select a user
2. **Public Metadata** → Add:

```json
{
  "role": "admin",
  "subscriptionTier": "pro"
}
```

### Step 6: Test Authentication

```bash
npm run dev
```

1. Visit: http://localhost:3000/sign-up
2. Create account (email or OAuth)
3. Should redirect to `/onboarding`
4. Visit: http://localhost:3000/dashboard
5. Should see protected content

**Using Clerk Helpers:**

```typescript
import { requireAuth, isAdmin, hasPremiumAccess } from '@/lib/clerk';

// In a server component
export default async function DashboardPage() {
  const userId = await requireAuth(); // Redirects if not logged in
  const admin = await isAdmin(); // Check admin role
  const premium = await hasPremiumAccess(); // Check subscription
  
  return <div>Welcome {userId}</div>;
}
```

---

## 🚀 Deployment Checklist

### Before Deploying to Production:

- [ ] **Pre-commit hooks installed**
  ```bash
  npx husky init
  chmod +x .husky/*
  ```

- [ ] **Upstash configured**
  - [ ] Database created
  - [ ] Environment variables added to Vercel
  - [ ] Packages installed: `@upstash/ratelimit` + `@upstash/redis`

- [ ] **Clerk configured**
  - [ ] Application created in Clerk Dashboard
  - [ ] API keys added to Vercel
  - [ ] Webhook configured
  - [ ] Allowed domains updated: `clerk.com` → Settings → Domains

- [ ] **Environment variables verified**
  ```bash
  vercel env ls
  ```

- [ ] **Test all features locally**
  ```bash
  npm run dev
  # Test sign-in, sign-up, rate limiting
  ```

- [ ] **Deploy to production**
  ```bash
  git add .
  git commit -m "security: enable Clerk auth, rate limiting, and pre-commit hooks"
  git push origin master
  ```

- [ ] **Verify production deployment**
  - Visit: https://www.v2u.us/sign-in
  - Test authentication flow
  - Test rate limiting (try 4 login attempts)

---

## 📊 Monitoring & Maintenance

### Check Rate Limit Analytics

```bash
# Upstash Console → Your Database → Analytics
# View requests per second, errors, top IPs
```

### Check Authentication Logs

```bash
# Clerk Dashboard → Users → Event Logs
# See sign-ins, failures, security events
```

### Review Pre-Commit Hook Blocks

```bash
# Commits that were blocked are logged locally
# Review patterns that triggered false positives
```

---

## 🆘 Troubleshooting

### Pre-Commit Hook Not Running

```bash
# Reinitialize husky
rm -rf .husky
npx husky init

# Re-create hooks (copy from this guide)
# Make executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Rate Limiting Not Working

```bash
# Check environment variables
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# Check package installation
npm list @upstash/ratelimit

# Check logs for warnings
# Should NOT see: "Rate limiting not configured"
```

### Clerk Authentication Errors

```bash
# Check environment variables
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo $CLERK_SECRET_KEY

# Verify middleware is enabled
cat middleware.ts | grep clerkMiddleware

# Check Clerk Dashboard → Logs for errors
```

### "Too Many Redirects" Error

```bash
# Check middleware.ts - ensure sign-in/sign-up are in publicRoutes
# Verify Clerk URLs in .env.local match actual routes
```

---

## 📚 Additional Resources

- **Clerk Documentation**: https://clerk.com/docs
- **Upstash Rate Limiting**: https://upstash.com/docs/redis/sdks/ratelimit/overview
- **Husky Git Hooks**: https://typicode.github.io/husky/
- **Security Incident Report**: See `SECURITY_INCIDENT_2026-03-25.md`

---

## ✅ Success Criteria

After completing this guide, you should have:

1. ✅ Pre-commit hooks blocking credential commits
2. ✅ Rate limiting protecting authentication endpoints (3 attempts / 5 min)
3. ✅ Clerk authentication replacing legacy JWT system
4. ✅ Sign-in and sign-up pages working at `/sign-in` and `/sign-up`
5. ✅ Protected routes requiring authentication
6. ✅ Webhook syncing user data from Clerk to your database
7. ✅ All environment variables configured in Vercel

**Security posture improved from:**
- ❌ Hardcoded credentials in public repo
- ❌ Unlimited login attempts
- ❌ Weak JWT secrets

**To:**
- ✅ Pre-commit scanning prevents credential leaks
- ✅ Rate limiting blocks brute force
- ✅ Enterprise-grade authentication with Clerk
- ✅ All secrets in environment variables
- ✅ Built-in 2FA support
- ✅ User management dashboard

---

**Questions?** Check the security incident report for full context:
- `SECURITY_INCIDENT_2026-03-25.md`

**Need help?** All new code includes detailed comments explaining usage.
