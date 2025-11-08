# Meta Platforms Setup Guide

## Current Status
✅ Meta App Created (AI-Now)
✅ App ID & Secret obtained
⏳ Need: Page IDs, Instagram ID, Access Tokens

---

## Step 1: Generate User Access Token

1. **Go to Graph API Explorer**
   ```
   https://developers.facebook.com/tools/explorer/
   ```

2. **Select Your App**
   - Top dropdown: Select "AI-Now" (1385433963019785)

3. **Generate Token with Permissions**
   - Click "Generate Access Token"
   - Select these permissions (CHECK ALL):
     - ✅ `pages_read_engagement`
     - ✅ `pages_manage_posts`
     - ✅ `pages_show_list`
     - ✅ `instagram_basic`
     - ✅ `instagram_content_publish`
     - ✅ `instagram_manage_comments`
     - ✅ `threads_basic`
     - ✅ `threads_content_publish`
     - ✅ `threads_manage_replies`
   
4. **Copy the Token**
   - The token appears in the "Access Token" field
   - It starts with "EAATSC..." 
   - Copy it - you'll need it for Step 2

---

## Step 2: Run Helper Script

Open terminal in website folder and run:

```bash
cd /c/Users/richc/Projects/v2u/website

USER_ACCESS_TOKEN="PASTE_YOUR_TOKEN_HERE" node scripts/meta-setup-helper.js
```

This will:
- ✅ Extend your token to 60 days
- ✅ List all your Facebook Pages
- ✅ Find Instagram accounts linked to each page
- ✅ Find Threads accounts linked to each page
- ✅ Give you the IDs and tokens you need

---

## Step 3: Update .env.local

Based on the script output, update your .env.local:

```bash
# Meta App (already have this)
META_APP_ID_AI="1385433963019785"
META_APP_SECRET_AI="8495b40412e90e4e136c048c9ff15519"
META_APP_CLIENT_TOKEN_AI="81310ac9ad9081b32c49379fffac4572"

# Facebook Page
FACEBOOK_PAGE_ID="YOUR_PAGE_ID_FROM_SCRIPT"
FACEBOOK_ACCESS_TOKEN="YOUR_PAGE_ACCESS_TOKEN_FROM_SCRIPT"
FACEBOOK_URL="https://facebook.com/profile.php?id=61579036979691"

# Instagram Business Account
INSTAGRAM_USER_ID="YOUR_INSTAGRAM_ID_FROM_SCRIPT"
INSTAGRAM_ACCESS_TOKEN="YOUR_PAGE_ACCESS_TOKEN_FROM_SCRIPT"  # Same as Facebook!
INSTAGRAM_URL="https://instagram.com/v2u.us/"

# Threads Account
THREADS_USER_ID="YOUR_THREADS_ID_FROM_SCRIPT"
THREADS_ACCESS_TOKEN="YOUR_PAGE_ACCESS_TOKEN_FROM_SCRIPT"  # Same as Facebook!
THREADS_URL="https://threads.net/@v2u.us"
```

**Important:** Instagram and Threads use the SAME access token as the Facebook Page they're linked to!

---

## Step 4: Test in v2u Admin

1. Go to your admin panel: `/admin/social-posting`
2. Enter credentials for Facebook, Instagram, Threads
3. Click Save - validation will test if they work
4. Green checkmark = success! ✅

---

## Troubleshooting

### "No Instagram account linked to page"
- Your Instagram account must be a Business or Creator account
- Go to Instagram app → Settings → Account → Switch to Professional Account
- Then: Settings → Account → Linked accounts → Link to Facebook Page

### "No Threads account linked to page"
- Similar to Instagram - must link in Threads app
- Threads app → Settings → Account → Link to Facebook

### "Invalid OAuth access token"
- Token expired (happens after 1 hour if not extended)
- Re-run the helper script
- Use the LONG-LIVED token it generates

### "Permissions error"
- You didn't select all required permissions in Graph API Explorer
- Go back to Step 1 and make sure ALL permissions are checked

---

## Token Expiration

⚠️ **Page Access Tokens expire after 60 days**

Set a reminder to refresh tokens:
```bash
# Run this again before expiration
USER_ACCESS_TOKEN="new_token" node scripts/meta-setup-helper.js
```

Or we can automate token refresh - let me know if you want that!

---

## Quick Reference

**Graph API Explorer:** https://developers.facebook.com/tools/explorer/
**App Dashboard:** https://developers.facebook.com/apps/1385433963019785/dashboard/
**Access Token Debugger:** https://developers.facebook.com/tools/debug/accesstoken/

---

## Next Steps After Setup

1. ✅ Complete Meta setup (you're doing this now)
2. Test posting to Facebook, Instagram, Threads
3. Set up automation schedules
4. Monitor for token expiration
