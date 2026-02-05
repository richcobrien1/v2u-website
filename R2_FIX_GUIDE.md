# R2 Configuration Fix Guide

## Issue Identified
The podcast-dashboard cannot access R2 buckets due to **NotEntitled - 403** error.

**Root Cause:** 
- R2 service may not be enabled in Cloudflare account
- OR API token doesn't have R2 Read permissions
- OR API token was revoked/expired

## Test Results
```bash
$ node scripts/test-r2-connection.cjs

❌ PUBLIC bucket error: Please enable R2 through the Cloudflare Dashboard.
   Full error: NotEntitled - 403

❌ PRIVATE bucket error: Please enable R2 through the Cloudflare Dashboard.
   Full error: NotEntitled - 403
```

## Steps to Fix

### 1. Enable R2 in Cloudflare Dashboard
1. Go to https://dash.cloudflare.com/
2. Select your account: `d54e57481e824e8752d0f6caa9b37ba7`
3. Navigate to **R2** in the left sidebar
4. If not enabled, click "Enable R2"
5. Accept any billing terms (R2 has generous free tier)

### 2. Verify/Create R2 Buckets
Ensure these buckets exist:
- `public` - for free podcast episodes
- `private` - for premium podcast episodes
- `promos` - for promotional content
- `sources` - for source files

Create any missing buckets:
1. Click "Create bucket"
2. Name: `public` (or `private`, etc.)
3. Location: Automatic
4. Click "Create bucket"

### 3. Generate New R2 API Token
1. In R2 section, click "Manage R2 API Tokens"
2. Click "Create API token"
3. **Token name:** `v2u-website-r2-access`
4. **Permissions:** 
   - ✅ Object Read & Write
   - ✅ Admin Read & Write (if needed for bucket management)
5. **TTL:** No expiry (or set custom)
6. Click "Create API token"
7. **SAVE THE CREDENTIALS** immediately:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (should be: `https://d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com`)

### 4. Update Environment Variables

**Local (.env.local):**
```bash
R2_ENDPOINT=https://d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com
R2_ACCESS_KEY=<new-access-key-from-step-3>
R2_SECRET_KEY=<new-secret-key-from-step-3>
R2_BUCKET=public
R2_BUCKET_PUBLIC=public
R2_BUCKET_PRIVATE=private
R2_BUCKET_PROMOS=promos
R2_BUCKET_SOURCES=sources
```

**Vercel (Production):**
```bash
# Update each variable
vercel env rm R2_ACCESS_KEY production
vercel env add R2_ACCESS_KEY production
# Enter new value when prompted

vercel env rm R2_SECRET_KEY production
vercel env add R2_SECRET_KEY production
# Enter new value when prompted

vercel env rm R2_ENDPOINT production
vercel env add R2_ENDPOINT production
# Enter: https://d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com
```

### 5. Test Connection
```bash
cd apps/v2u-website
node scripts/test-r2-connection.cjs
```

Expected output:
```
✅ PUBLIC bucket: X files, Y folders
✅ PRIVATE bucket: X files, Y folders
```

### 6. Verify Podcast Dashboard
```bash
npm run dev
# Visit http://localhost:3000/podcast-dashboard
# Should see episodes from both public and private buckets
```

## Current Environment

**Account ID:** `d54e57481e824e8752d0f6caa9b37ba7`
**Endpoint:** `https://d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com`

**Current Status:** 
- ❌ R2 access returning 403 NotEntitled
- ✅ Code is correctly configured to fetch from both buckets
- ✅ Podcast dashboard has proper premium/free user filtering
- ❌ Need new API credentials with R2 permissions

## After Fix
Once R2 is enabled and credentials updated:
1. Episodes will automatically appear on `/podcast-dashboard`
2. Premium users will see all episodes (public + private)
3. Free users will only see public episodes
4. No code changes needed - system is ready!
