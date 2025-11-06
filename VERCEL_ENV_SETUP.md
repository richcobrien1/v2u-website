# Vercel Environment Variables Setup Guide

This guide explains how to configure environment variables in Vercel for the v2u website deployment.

## Quick Start

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `v2u-website` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable from `.env.example`

## 🚀 Automated Setup (Recommended)

### Using Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project (run from website directory)
cd website
vercel link

# Pull current environment variables (optional - to see what's configured)
vercel env pull

# Add environment variables from .env.local
vercel env add
```

### Using the Vercel CLI to Bulk Import

```bash
# From the website directory with .env.local file
# This will read your .env.local and let you select which vars to import

npx vercel env add TWITTER_API_KEY production
npx vercel env add TWITTER_API_SECRET production
# ... repeat for each variable
```

## 📝 Manual Setup (Step-by-Step)

### 1. Access Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on your `v2u-website` project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### 2. Add Each Environment Variable

For each variable in `.env.example`, do the following:

**Variable Name:** `KEY_NAME`
**Value:** `your_actual_value`
**Environments:** 
- ✅ Production
- ✅ Preview (optional - use test values)
- ✅ Development (optional - for `vercel dev`)

Click **Save**

## 🔐 Required Variables for Production

### Critical (Must Have) ⚠️

These are **required** for the site to work:

```bash
# Cloudflare R2 (for episode storage)
R2_ENDPOINT
R2_ACCESS_KEY
R2_SECRET_KEY
R2_BUCKET
R2_PUBLIC_URL

# Cloudflare KV (for subscribers)
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_KV_NAMESPACE_ID
CLOUDFLARE_API_TOKEN

# Stripe (for payments)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PUBLISHABLE_KEY

# Security
JWT_SECRET
SESSION_SECRET

# App URL
NEXT_PUBLIC_APP_URL=https://www.v2u.us
```

### Important (Recommended) ⭐

These enable key features:

```bash
# Social Media Posting
TWITTER_API_KEY
TWITTER_API_SECRET
TWITTER_ACCESS_TOKEN
TWITTER_ACCESS_SECRET

LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
LINKEDIN_ACCESS_TOKEN

# AI Content Generation
OPENAI_API_KEY
```

### Optional (Nice to Have) ✨

These enhance functionality:

```bash
# Facebook/Threads
FACEBOOK_PAGE_ACCESS_TOKEN
FACEBOOK_PAGE_ID
THREADS_ACCESS_TOKEN

# Email
EMAIL_FROM
SENDGRID_API_KEY

# Analytics
NEXT_PUBLIC_GA_ID
```

## 🔄 Syncing Changes

### When You Add a New Variable Locally

1. Add it to `.env.local` (your local file)
2. Add it to `.env.example` (template for others)
3. Add it to Vercel:

```bash
# Option A: Using Vercel CLI
vercel env add YOUR_NEW_VAR production

# Option B: Using Vercel Dashboard
# Go to Settings → Environment Variables → Add
```

4. Redeploy (or it will auto-deploy on next push)

### When Someone Else Adds a Variable

1. Pull the updated `.env.example` from git:
```bash
git pull
```

2. Check what variables are missing in your `.env.local`

3. Add them to your local `.env.local`

4. If you have Vercel access, verify they're in Vercel:
```bash
vercel env pull
```

## ⚡ Testing Environment Variables

### Test Locally

```bash
# Create .env.local with your values
cp .env.example .env.local

# Edit .env.local with real values
# Then run dev server
npm run dev
```

### Test in Vercel Preview

1. Create a new branch:
```bash
git checkout -b test-env-vars
```

2. Push the branch:
```bash
git push origin test-env-vars
```

3. Vercel will create a preview deployment

4. Check the preview deployment logs for any missing env var errors

### Verify All Variables Are Set

Create a simple API route to check (development only!):

```typescript
// app/api/debug/env-check/route.ts
export async function GET() {
  const requiredVars = [
    'R2_ENDPOINT',
    'R2_ACCESS_KEY',
    'STRIPE_SECRET_KEY',
    // ... add others
  ];

  const missing = requiredVars.filter(v => !process.env[v]);
  const configured = requiredVars.filter(v => !!process.env[v]);

  return Response.json({
    configured: configured.length,
    missing: missing.length,
    missingVars: missing,
  });
}
```

**⚠️ IMPORTANT:** Delete this route before deploying to production!

## 🔒 Security Best Practices

### DO ✅

- Use different values for Development vs Production
- Rotate secrets regularly (every 90 days)
- Use Vercel's encrypted environment variables
- Keep `.env.local` in `.gitignore`
- Share `.env.example` (without real values)
- Use strong, random values for secrets:
  ```bash
  # Generate secure random secrets
  openssl rand -base64 32
  ```

### DON'T ❌

- Commit `.env.local` or `.env.production` to git
- Share secrets in chat/email/Slack
- Use the same secrets across multiple projects
- Put secrets in client-side code (`NEXT_PUBLIC_*` vars are exposed!)
- Hard-code API keys in source code

## 🐛 Troubleshooting

### Variable Not Available in Production

1. **Check it's added to Vercel:**
   - Dashboard → Settings → Environment Variables
   - Make sure "Production" is checked

2. **Redeploy:**
   ```bash
   # Trigger a new deployment
   git commit --allow-empty -m "Redeploy for env vars"
   git push
   ```

3. **Check build logs:**
   - Go to Deployments tab
   - Click on latest deployment
   - Check logs for any env-related errors

### Variable Works Locally But Not in Vercel

- Vercel environment variables are separate from local `.env.local`
- You must add them to Vercel Dashboard or use `vercel env add`

### "Missing required environment variable" Error

1. Add the variable to Vercel
2. Redeploy
3. Check spelling (they're case-sensitive!)

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## 🔄 Keeping .env.example Updated

Whenever you add a new environment variable:

1. Add it to your `.env.local`
2. **Also add it to `.env.example`** with a placeholder value
3. Document what it's for
4. Add it to Vercel
5. Commit `.env.example` to git:
   ```bash
   git add .env.example
   git commit -m "docs: add NEW_VAR environment variable"
   git push
   ```

This ensures everyone on the team knows what variables are needed!

---

## Quick Reference: Copy-Paste Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# See current environment variables
vercel env ls

# Add a new variable
vercel env add VARIABLE_NAME production

# Pull variables to local .env file
vercel env pull

# Remove a variable
vercel env rm VARIABLE_NAME production

# Force redeploy
git commit --allow-empty -m "Trigger redeploy"
git push
```
