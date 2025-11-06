# 🚀 Quick Start Guide - Cross-Platform Social Posting

## ✅ COMPLETED TODAY

Your AI-Now cross-platform social posting system is now ready! Here's what's been built:

### 1. **Admin Dashboard**
- 📍 Access at: `/admin/social-posting`
- Select episodes from your R2 bucket
- Choose platforms (Twitter, Facebook, LinkedIn, Threads, Instagram)
- Post immediately or schedule for later
- View post history and results

### 2. **Platform Settings**
- 📍 Access at: `/admin/social-posting/settings`
- Configure OAuth credentials
- Test platform connections
- View setup instructions

### 3. **API Endpoints**
All automated posting infrastructure is in place:
- Manual posting
- Scheduled posting
- Platform testing
- Post history tracking

## 🎯 NEXT STEPS (TO GO LIVE)

### Step 1: Configure Social Media Credentials

1. **Edit your environment file:**
   ```bash
   cd website
   # Open .env.local in your editor
   ```
   
   The file already contains placeholder credentials for all platforms. You just need to replace the placeholder values with your actual credentials.

2. **Set up each platform** (choose which ones you want):

   #### Twitter/X (Recommended - Easiest) ✅ CONFIGURED
   **Your X app is already set up!** Here's what you have:
   - ✅ Callback URI: `https://www.v2u.us/api/social-auth/twitter/callback`
   - ✅ Website: `https://www.v2u.us`
   - ✅ Organization: v2u
   
   **⚠️ IMPORTANT:** Update your X app callback URI to the production URL above!
   
   **Quick Setup (Bash):**
   ```bash
   cd news-collector
   ./setup-x-auth.sh
   ```
   
   **Manual Setup:**
   ```bash
   cd news-collector
   node twitter-poster.js auth  # Opens browser for OAuth
   # Copy auth code from callback page and paste when prompted
   node twitter-poster.js test  # Verify connection
   ```
   
   **📖 Detailed Guide:** See `news-collector/X-TWITTER-SETUP-GUIDE.md`
   
   Once authenticated, the system automatically manages your tokens!

   #### Facebook
   - Go to https://developers.facebook.com/
   - Create app with Pages permissions
   - Get Page Access Token and Page ID
   - Replace placeholders in `.env.local`:
     - `FACEBOOK_PAGE_ID`
     - `FACEBOOK_ACCESS_TOKEN`

   #### LinkedIn
   - Go to https://www.linkedin.com/developers/
   - Create app with Share permissions
   - Complete OAuth flow
   - Replace placeholders in `.env.local`:
     - `LINKEDIN_PERSON_URN`
     - `LINKEDIN_ACCESS_TOKEN`

   #### Threads
   - Uses Meta's Graph API (similar to Facebook)
   - Get access token and user ID
   - Replace placeholders in `.env.local`:
     - `THREADS_USER_ID`
     - `THREADS_ACCESS_TOKEN`

   #### Instagram
   - Requires Instagram Business Account
   - Limited link sharing (currently links in bio only)
   - Replace placeholders in `.env.local`:
     - `INSTAGRAM_BUSINESS_ACCOUNT_ID`
     - `INSTAGRAM_ACCESS_TOKEN`

### Step 2: Test Connections

1. Go to `/admin/social-posting/settings`
2. Click "Test Connection" for each configured platform
3. Verify all show ✅ success

### Step 3: Make Your First Post

1. Go to `/admin/social-posting`
2. Select an episode (will load from your R2 bucket)
3. Select platforms to post to
4. (Optional) Customize the message
5. Click "Post Now"
6. Watch the magic happen! ✨

### Step 4: Set Up Automated Posting

For scheduled posts to work automatically, set up a cron job:

**Option A: Local Cron (Development)**
```bash
# Add to crontab (run every 5 minutes)
*/5 * * * * curl -X PUT http://localhost:3000/api/social-schedule
```

**Option B: Vercel Cron (Production)**
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/social-schedule",
    "schedule": "*/5 * * * *"
  }]
}
```

## 📋 RECOMMENDED WORKFLOW

### For Manual Posts (Fastest):
1. Upload video to YouTube/Rumble/Spotify
2. Go to `/admin/social-posting`
3. Select the episode
4. Select all platforms
5. Click "Post Now"
6. Done! 🎉

### For Scheduled Posts:
1. Upload video to YouTube/Rumble/Spotify
2. Go to `/admin/social-posting`
3. Select the episode
4. Select platforms
5. Click "Schedule Post"
6. Set date/time
7. Post will go out automatically at scheduled time

### For Automated Posts (Advanced):
Set up webhooks from YouTube to automatically trigger posts when new videos are uploaded. Details in the full guide.

## 📖 FULL DOCUMENTATION

See `docs/SOCIAL-POSTING-GUIDE.md` for:
- Complete platform setup guides
- API documentation
- Troubleshooting tips
- Security best practices
- Advanced automation options

## 🔐 SECURITY REMINDERS

- ✅ Never commit `.env.local` to git (already in .gitignore)
- ✅ Keep API keys secure
- ✅ Test in development first
- ✅ Monitor API usage
- ✅ Refresh expired tokens regularly

## 🎯 WHAT EACH PLATFORM GETS

When you post, the system automatically generates optimized content for each platform:

- **Twitter**: Short, punchy, 280 chars max
- **LinkedIn**: Professional, detailed, with context
- **Facebook**: Engaging, community-focused
- **Threads**: Casual, conversational
- **Instagram**: Visual-first (link in bio)

All include:
- Episode title
- Description excerpt
- Link to full episode
- Relevant hashtags (#AINow, #AI, #Technology, etc.)

## 🧪 TESTING CHECKLIST

Before going live:

- [ ] Configure at least one platform (Twitter recommended for testing)
- [ ] Test connection shows ✅ success
- [ ] Create a test post to verify it works
- [ ] Check post appears on social media
- [ ] Test scheduling a post
- [ ] Verify scheduled post executes on time
- [ ] Review post history to confirm tracking works

## 💡 PRO TIPS

1. **Start with Twitter** - Easiest to set up and test
2. **Test with old episodes** - Use existing content for testing
3. **Customize messages** - Override auto-generation when needed
4. **Schedule strategically** - Post during peak engagement times
5. **Monitor results** - Check post history regularly
6. **Stagger posts** - Don't post to all platforms simultaneously (looks spammy)

## 🆘 NEED HELP?

1. Check `/admin/social-posting/settings` for platform-specific help
2. Read `docs/SOCIAL-POSTING-GUIDE.md` for detailed guides
3. Test connections to identify issues
4. Check browser console for error messages

## 🎉 YOU'RE READY!

The system is fully built and ready to use. Just configure your OAuth credentials and start posting!

**Estimated setup time:** 30-60 minutes (depending on how many platforms you configure)

**Recommended first platform:** Twitter/X (fastest setup)

Good luck! 🚀
