# V2U Project - Master Context Document

> **Last Updated**: November 8, 2025  
> **Maintained by**: Rich O'Brien + GitHub Copilot

---

## 📖 Project Overview

**What is V2U?**
[TODO: Fill in 2-3 sentences about what V2U does - your business, products, services]

**Main Business Goal:**
[TODO: Primary objective - revenue, audience growth, content distribution, etc.]

**Target Audience:**
[TODO: Who are your customers/viewers?]

---

## 🏗️ Architecture Map

```
v2u-workspace/                    [THIS REPO - Monorepo]
├── website/                      → Next.js 15.5.2 app (SEPARATE git: v2u-website)
│   ├── app/                      → Next.js App Router
│   │   ├── admin/               → Admin dashboard
│   │   └── api/                 → API routes (automation, auth, stripe)
│   ├── lib/                     → Utilities, KV storage, social platforms
│   ├── components/              → React components
│   └── docs/                    → 📚 ALL DOCUMENTATION HERE
│
├── news-collector/              → Social media automation scripts (Node.js)
│   ├── facebook-poster.js       → Meta Graph API posting
│   ├── linkedin-poster.js       → LinkedIn UGC Posts API
│   ├── twitter-poster.cjs       → Twitter/X OAuth 1.0a posting
│   └── youtube-upload.js        → YouTube Data API
│
├── cloudflare-r2/              → CDN/Storage Cloudflare Workers
│   └── src/                    → R2 bucket management
│
└── server-api/                 → Backend API (if applicable)
```

**Key Separation:**
- `website/` has its own git repository (`v2u-website`) - NOT tracked in v2u-workspace
- `website/` is in `.gitignore` of v2u-workspace to prevent conflicts

---

## ⚙️ Key Systems & Current Status

### ✅ Completed & Working
- **Social Media Automation System**
  - Vercel Cron: Hourly checks for new content
  - YouTube → Twitter (V2U + AI_Now) + LinkedIn
  - Platform routing: Landscape (YouTube/Rumble) vs Portrait (Spotify)
  - Credentials stored in Cloudflare KV + environment variables
  
- **Email Alert System**
  - Resend integration for failure notifications
  - Automatic retry logic (2 retries with exponential backoff)
  - Detailed failure reports with successes/failures

- **Admin Dashboard**
  - `/admin/social-posting` - Configure Level 1 (sources) & Level 2 (targets)
  - Toggle automation on/off
  - Real-time status tracking

- **Platform Integrations**
  - Level 1 (Content Sources): YouTube ✅, Rumble ⏳, Spotify ⏳
  - Level 2 (Distribution): Twitter x2 ✅, LinkedIn ✅, Facebook x2 ✅, Instagram ✅, Threads ✅, TikTok 📝, Odysee 📝, Vimeo 📝

### ⏳ In Progress / TODO
- [ ] Spotify episode checking (RSS feed or Spotify API)
- [ ] Rumble video checking (no API - needs scraping)
- [ ] Test automation end-to-end with real content
- [ ] Get Resend API key → enable email alerts
- [ ] Add Threads posting function
- [ ] Domain verification for Resend (v2u.us)

### 🎯 Current Focus
**Email alerts + Retry logic** - Just deployed, needs Resend API key configuration

---

## 🔑 Critical Decisions Made

### Architecture Decisions
1. **Website has separate git repo** - Don't track website/ in v2u-workspace (causes conflicts)
2. **Monorepo structure** - Related projects in one workspace for easier development
3. **Cloudflare KV for credentials** - Encrypted storage, accessible from Vercel Edge
4. **Vercel for hosting** - Automatic deployments from GitHub, cron jobs

### Social Media Strategy
1. **Platform routing by content type**
   - Desktop/Landscape (YouTube, Rumble) → Twitter + LinkedIn
   - Mobile/Portrait (Spotify) → Twitter + Facebook + Threads
2. **Dual accounts** - V2U and AI_Now for both Twitter and Facebook
3. **Always save credentials** - Even if validation fails (warn instead of block)
4. **6-hour check window** - Only post about videos published in last 6 hours

### API Integrations
1. **LinkedIn OAuth scopes** - `r_liteprofile`, `r_emailaddress`, `w_member_social` (Share on LinkedIn product)
2. **Meta Graph API v21.0** - For Facebook, Instagram, Threads
3. **Twitter OAuth 1.0a** - Using twitter-api-v2 library
4. **Retry logic** - 2 retries with exponential backoff (1s, 2s)

### Development Workflow
1. **Docs-first approach** - All documentation in `website/docs/`
2. **Environment variables** - Synced between root `.env` and `website/.env.local`
3. **No localhost testing** - Production environment on Vercel

---

## 📦 Active Repositories

### v2u-workspace (This Repo)
- **GitHub**: `richcobrien1/v2u-workspace`
- **Branch**: `master`
- **Remote**: `readonly/master` (read-only mirror)
- **Contains**: news-collector, cloudflare-r2, server-api
- **Ignores**: `website/` directory

### v2u-website (Separate Repo)
- **GitHub**: `richcobrien1/v2u-website`
- **Branch**: `master`
- **Deployment**: Vercel (auto-deploy from master)
- **Location**: `c:\Users\richc\Projects\v2u\website\`

---

## 🎯 Next Priorities

### Immediate (This Week)
1. [ ] Get Resend API key from https://resend.com
2. [ ] Add `RESEND_API_KEY` to Vercel environment variables
3. [ ] Test email alerts with intentional failure
4. [ ] Enable automation via Start button
5. [ ] Monitor first automated posting cycle

### Short Term (Next 2 Weeks)
1. [ ] Implement Spotify episode checking
2. [ ] Implement Rumble video checking (scraping)
3. [ ] Add Threads posting function
4. [ ] Test platform routing with real content
5. [ ] Verify all credentials are working

### Medium Term (Next Month)
1. [ ] Domain verification for email (v2u.us → Resend)
2. [ ] Daily summary email reports
3. [ ] Admin dashboard error log viewer
4. [ ] Automated token refresh for LinkedIn
5. [ ] Analytics dashboard for posting stats

---

## ⚠️ Known Issues & Gotchas

### GitHub / Git
- **Never track `website/` in v2u-workspace** - Has its own repo, causes conflicts
- **Two separate git repos** - Be aware which directory you're in
- **Push protection** - GitHub blocks commits with secrets (LinkedIn client secret incident)

### API & Credentials
- **LinkedIn access token expires** - No refresh token, needs manual re-authentication
- **Meta tokens refresh monthly** - Vercel cron job handles this automatically
- **Twitter OAuth 1.0a** - More complex than OAuth 2.0, requires 4 credentials per account
- **Credential validation** - Always saves even if validation fails (200 with warning, not 400 error)

### Platform Limitations
- **Rumble has no API** - Must scrape website or use RSS feed
- **TikTok, Odysee, Vimeo** - Only profile URLs, no posting APIs configured yet
- **LinkedIn organization scope** - Not approved, organization fetching is optional (try/catch)

### Development Workflow
- **No local dev server** - Production environment on Vercel
- **Environment variable sync** - Must update both root `.env` and `website/.env.local`
- **Vercel redeployment** - Required after env var changes

---

## 🔐 Credentials & Services

### Cloud Platforms
- **Cloudflare**: Account ID `d54e57481e824e8752d0f6caa9b37ba7`
  - KV Namespace: `3c40aed9e67b479eb28a271c547e43d4`
  - R2 Buckets: public, private, promos
- **Vercel**: Hosting + Cron Jobs + Edge Functions
- **Supabase**: PostgreSQL database

### Social Media Platforms
- **YouTube**: API Key + Channel ID (configured ✅)
- **Twitter**: OAuth 1.0a - V2U (@V2U_now) + AI_Now (@AI_Now_v2u) (configured ✅)
- **LinkedIn**: Client ID, Secret, Access Token (configured ✅)
- **Facebook**: Page Access Tokens - V2U + AI_Now (configured ✅)
- **Instagram**: Access Token (configured ✅)
- **Threads**: Access Token (configured ✅)
- **Spotify**: Client ID, Secret, Show ID, RSS Feed (configured ✅)
- **Rumble**: URL only (no API)
- **TikTok**: URL only - https://www.tiktok.com/@user1394852812476
- **Odysee**: URL only
- **Vimeo**: URL + Access Token

### Email & Notifications
- **Resend**: Email service (need API key)
- **Admin Email**: rich@v2u.us
- **From Email**: alerts@v2u.us

---

## 📚 Documentation Index

All docs are in `website/docs/`:

### Setup Guides
- `EMAIL-ALERTS-SETUP.md` - Resend integration, retry logic
- `QUICK-START-SOCIAL-POSTING.md` - Getting started with automation
- `SOCIAL-POSTING-GUIDE.md` - Complete platform setup
- `START-HERE-X-SETUP.md` - Twitter/X initial setup
- `X-TWITTER-SETUP-GUIDE.md` - Detailed Twitter OAuth guide

### Platform-Specific
- `META_CREDENTIALS.md` - Facebook/Instagram/Threads setup
- `META_FINAL.md` - Meta integration completion
- `META_SETUP.md` - Meta platform configuration

### Architecture & Config
- `SOCIAL-AUTOMATION.md` - Platform routing, content flow
- `VERCEL_ENV_SETUP.md` - Environment variables
- `X-PRODUCTION-URL-UPDATE.md` - Production URL changes
- `X-SETUP-COMPLETE.md` - X/Twitter completion checklist

---

## 🔄 Regular Maintenance

### Monthly
- [ ] Verify Meta (Facebook/Instagram/Threads) tokens are refreshing via cron
- [ ] Check LinkedIn access token expiration
- [ ] Review automation logs in Vercel
- [ ] Check email alert statistics

### As Needed
- [ ] Update this document when priorities change
- [ ] Add new platforms to documentation
- [ ] Document new API integrations
- [ ] Update credential status

---

## 💡 Tips for AI Assistant

1. **Always check `docs/` folder first** - Most answers are documented there
2. **Two separate git repos** - Check directory before git commands
3. **Never commit to website/ in v2u-workspace** - It's ignored for a reason
4. **Environment variables** - Changes need sync between root and website
5. **Ask before breaking changes** - Especially with git/credentials

---

## 📝 Notes & Context

### Session History Template
```
Date: [DATE]
Focus: [What was worked on]
Completed:
- [x] Item 1
- [x] Item 2
Issues Encountered:
- [Issue description + resolution]
Next Steps:
- [ ] Next priority
```

### Recent Sessions
**November 8, 2025**
- ✅ Created Facebook and LinkedIn posting functions
- ✅ Added platform-specific routing (landscape vs portrait)
- ✅ Implemented email alerts with Resend
- ✅ Added retry logic (2 retries, exponential backoff)
- ✅ Organized all docs into docs/ folder
- ⏳ Need Resend API key to complete email alerts

---

**END OF MASTER CONTEXT DOCUMENT**

> 💡 **Keep this updated!** Add session notes, update status, mark completed items.  
> This is your single source of truth for the entire project.
