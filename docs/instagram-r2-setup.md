# Instagram R2 Setup Guide

## Overview
Instagram requires publicly accessible image URLs. This guide configures Cloudflare R2 for automatic Instagram image hosting.

## Current R2 Configuration
From your `.env`:
- **Endpoint**: `https://d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com`
- **Account ID**: `d54e57481e824e8752d0f6caa9b37ba7`
- **Bucket for Instagram**: `promos`

## Required Setup Steps

### 1. Enable Public Access on R2 Bucket

**Option A: Via Cloudflare Dashboard (Recommended)**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Click on the `promos` bucket
3. Go to **Settings** tab
4. Under **Public Access**, click **Allow Access**
5. This will generate a public bucket URL like:
   ```
   https://promos.d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com
   ```

**Option B: Use Custom Domain (Better for Production)**

1. In Cloudflare Dashboard → R2 → `promos` bucket
2. Go to **Settings** → **Custom Domains**
3. Click **Connect Domain**
4. Enter a subdomain like `cdn.v2u.ai` or `media.v2u.ai`
5. Cloudflare will automatically configure DNS
6. Add this to your `.env`:
   ```bash
   R2_PUBLIC_DOMAIN="https://cdn.v2u.ai"
   ```

### 2. Verify Environment Variables

Your `.env` should have (already configured):
```bash
R2_ACCESS_KEY="fdccf4f202e438ed9500c212e108ae65"
R2_SECRET_KEY="b0ecb04650aab8c48adbaae57dcbf5ba16f5564996c6bb3f3bb22bead200a30d"
R2_ENDPOINT="https://d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com"
R2_BUCKET_PROMOS="promos"
R2_REGION="auto"

# Optional: If you set up custom domain
R2_PUBLIC_DOMAIN="https://cdn.v2u.ai"
```

### 3. Test R2 Upload

Run this test script to verify R2 configuration:

```bash
cd website
node -e "
const { uploadImageToR2, generateInstagramFilename } = require('./lib/r2-image-upload.ts');
const testDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
uploadImageToR2(testDataUrl, 'test-' + Date.now() + '.png').then(url => {
  console.log('✅ Upload successful:', url);
  console.log('Test the URL in your browser to verify public access');
}).catch(err => console.error('❌ Upload failed:', err));
"
```

### 4. Deploy to Vercel

Add the environment variables to Vercel:

```bash
# Navigate to website directory
cd website

# Add environment variables (if not already set)
vercel env add R2_ACCESS_KEY
vercel env add R2_SECRET_KEY
vercel env add R2_ENDPOINT
vercel env add R2_BUCKET_PROMOS
vercel env add R2_REGION

# If using custom domain:
vercel env add R2_PUBLIC_DOMAIN

# Deploy
vercel --prod
```

Or add via Vercel Dashboard:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → Settings → Environment Variables
3. Add each R2 variable for Production, Preview, and Development

## Testing Instagram Posting

### 1. Verify R2 Configuration

Check that images can be uploaded and accessed:

```bash
curl https://v2u.ai/api/automation/test-r2
```

Expected response:
```json
{
  "success": true,
  "testImageUrl": "https://promos.d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com/instagram/test-123456.png",
  "message": "R2 configuration verified"
}
```

### 2. Test Instagram Posting

In the Admin Panel:
1. Go to **Automation Config**
2. Click **Validate** on Instagram credentials
3. Click **Post Latest Now**

Or via API:
```bash
curl -X POST https://v2u.ai/api/automation/post-latest \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

Expected Instagram flow:
1. ✅ Generate episode image (SVG)
2. ✅ Upload to R2 → `https://promos.{account_id}.r2.cloudflarestorage.com/instagram/episode-{timestamp}.png`
3. ✅ Create Instagram media container with image URL
4. ✅ Publish Instagram post

## Troubleshooting

### Error: "Cannot determine R2 account ID from endpoint"
- **Cause**: R2_ENDPOINT not set correctly
- **Fix**: Verify `R2_ENDPOINT` in `.env` matches format: `https://{account_id}.r2.cloudflarestorage.com`

### Error: "Access Denied" or 403 when accessing image URL
- **Cause**: Bucket not configured for public access
- **Fix**: Enable public access in Cloudflare Dashboard (see Step 1)

### Error: "Failed to upload image to R2"
- **Cause**: Invalid credentials or bucket doesn't exist
- **Fix**: 
  1. Verify R2_ACCESS_KEY and R2_SECRET_KEY in `.env`
  2. Check that `promos` bucket exists in Cloudflare R2 Dashboard
  3. Verify credentials have read/write permissions

### Instagram Error: "Invalid image URL"
- **Cause**: Instagram cannot fetch the image (not publicly accessible)
- **Fix**: 
  1. Test image URL in browser (should download/display)
  2. Enable public access on R2 bucket
  3. Check CORS settings if using custom domain

### Instagram Error: "Image aspect ratio not supported"
- **Cause**: Instagram requires specific aspect ratios (1:1, 4:5, 1.91:1)
- **Fix**: The generated SVG is 1080x1080 (1:1 square) which is supported
  - If you customize the image generator, maintain aspect ratio

## Image Specifications

The automatic image generator creates:
- **Format**: PNG (converted from SVG)
- **Size**: 1080x1080 pixels (Instagram square format)
- **Aspect Ratio**: 1:1
- **Content**: Episode title + "🎙️ New Episode" subtitle
- **Storage**: Cloudflare R2 → `promos` bucket → `instagram/` folder

## Cost Considerations

Cloudflare R2 pricing:
- **Storage**: $0.015/GB per month
- **Class A Operations** (writes): $4.50 per million
- **Class B Operations** (reads): $0.36 per million
- **Egress**: FREE (unlimited)

Estimated costs for daily podcast posting:
- 1 image/day × 365 days = 365 images/year
- ~50KB per image = ~18MB/year storage
- Storage cost: **$0.00027/year** (essentially free)
- Upload operations: **$0.00164/year**
- **Total: < $0.01/year** 🎉

## Next Steps

1. ✅ Enable public access on `promos` bucket (Step 1)
2. ✅ Optional: Set up custom domain (Step 1B)
3. ✅ Deploy to Vercel with R2 environment variables (Step 4)
4. ✅ Test Instagram posting (Step 2)
5. 🚀 Enjoy automated Instagram posts!

## Support

- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **Instagram Graph API**: https://developers.facebook.com/docs/instagram-api/
- **Issue**: If you encounter issues, check Vercel logs for detailed error messages
