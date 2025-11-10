# Instagram R2 Quick Start

## ✅ What's Ready

All code is implemented and deployed:
- ✅ Image generation (1080x1080 SVG with episode title)
- ✅ R2 upload function (S3-compatible SDK)
- ✅ Instagram Graph API posting
- ✅ Test endpoint for verification

## ⏳ What You Need to Do (2 minutes)

### Step 1: Enable Public Access on R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Click on the **`promos`** bucket
3. Go to **Settings** tab
4. Under **Public Access**, click **Allow Access**
5. Done! ✅

This will make the bucket publicly accessible at:
```
https://promos.d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com
```

### Step 2: Test R2 Configuration

```bash
# Test R2 upload
curl https://v2u.ai/api/automation/test-r2

# Expected response:
{
  "success": true,
  "testImageUrl": "https://promos.d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com/instagram/test-123456.png",
  "message": "✅ R2 configuration verified"
}
```

Open the `testImageUrl` in your browser to verify public access.

### Step 3: Test Instagram Posting

In the Admin Panel:
1. Go to **Automation Config**
2. Click **Validate** on Instagram credentials (re-validate to refresh)
3. Click **Post Latest Now**

Or via API:
```bash
curl -X POST https://v2u.ai/api/automation/post-latest \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

## 📊 What Happens When You Post

1. ✅ Fetch latest episode metadata from KV
2. ✅ Generate 1080x1080 episode image (SVG → PNG)
3. ✅ Upload to R2 → `instagram/episode-{timestamp}.png`
4. ✅ Get public URL → `https://promos.{account}.r2.cloudflarestorage.com/instagram/...`
5. ✅ Create Instagram media container with image URL
6. ✅ Publish Instagram post with image + caption
7. 🎉 Done! Post appears on Instagram feed

## 🎯 Expected Results

### Success Response
```json
{
  "success": true,
  "results": {
    "instagram": {
      "success": true,
      "postId": "17841234567890123",
      "platform": "Instagram"
    }
  }
}
```

### Check Your Instagram
- Open Instagram Business Account
- See new post with generated episode image
- Caption includes episode title + YouTube link

## 🔧 Optional: Custom Domain (Better for Production)

Instead of using the long R2 URL, set up a custom domain:

1. In Cloudflare Dashboard → R2 → `promos` bucket
2. Go to **Settings** → **Custom Domains**
3. Click **Connect Domain**
4. Enter subdomain: `cdn.v2u.ai` (or `media.v2u.ai`)
5. Cloudflare auto-configures DNS
6. Add to Vercel environment:
   ```
   R2_PUBLIC_DOMAIN=https://cdn.v2u.ai
   ```

Images will now use: `https://cdn.v2u.ai/instagram/episode-123.png` ✨

## 📋 Environment Variables (Already Set)

Your `.env` already has:
```bash
R2_ACCESS_KEY="fdccf4f202e438ed9500c212e108ae65"
R2_SECRET_KEY="b0ecb04650aab8c48adbaae57dcbf5ba16f5564996c6bb3f3bb22bead200a30d"
R2_ENDPOINT="https://d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com"
R2_BUCKET_PROMOS="promos"
R2_REGION="auto"
```

These are automatically deployed to Vercel. ✅

## 🐛 Troubleshooting

### Error: "Access Denied" when opening image URL
- **Cause**: Bucket not set to public access
- **Fix**: Complete Step 1 above

### Error: "Cannot determine R2 account ID"
- **Cause**: R2_ENDPOINT format issue
- **Fix**: Check that endpoint matches: `https://{account_id}.r2.cloudflarestorage.com`

### Error: "Failed to upload image to R2"
- **Cause**: Invalid credentials or bucket doesn't exist
- **Fix**: Verify credentials in Cloudflare Dashboard

### Instagram Error: "Invalid image URL"
- **Cause**: Instagram cannot fetch the image (not public)
- **Fix**: Verify image URL opens in browser without authentication

## 💰 Cost

Cloudflare R2 costs for daily podcast posting:
- **Storage**: ~18MB/year = $0.00027/year
- **Operations**: 365 uploads/year = $0.00164/year
- **Egress**: FREE (unlimited)
- **Total**: < $0.01/year 🎉

## 📚 Full Documentation

See `docs/instagram-r2-setup.md` for complete setup guide with:
- Detailed configuration steps
- Custom domain setup
- Testing instructions
- Comprehensive troubleshooting
- Image specifications

## 🚀 Summary

**Time to complete**: 2 minutes
**Steps**: 
1. Enable public access on R2 bucket (1 min)
2. Test configuration (30 sec)
3. Test Instagram posting (30 sec)

**Result**: Fully automated Instagram posting with branded episode images! 🎨✨

## Next Steps

After Instagram works:
1. ✅ Re-validate all Level 2 credentials
2. ✅ Test full automation with "Post Latest Now"
3. ✅ Verify 5/10 platforms posting automatically
4. ✅ Check email for TikTok/Odysee/Vimeo notifications
5. 🎉 Celebrate 80% effective automation!
