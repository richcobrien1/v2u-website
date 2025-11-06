# Social Media Cross-Platform Automation

## Overview
Automated workflow for posting content from Level 1 platforms (content hosts) to Level 2 platforms (promotion/social).

## Platform Mapping

### Desktop/Landscape Content
**Level 1:** YouTube, Rumble  
**Level 2:** X (Twitter), LinkedIn  
**Target Audience:** Tech professionals, decision-makers, business users

### Mobile/Portrait Content
**Level 1:** Spotify, TikTok, Instagram Reels  
**Level 2:** X (Twitter), Facebook, Threads  
**Target Audience:** Mobile-first users, younger demographics, casual learners

## Current Status

### ✅ Automated
- **YouTube → X + LinkedIn**: Fully automated on upload
  - Auto-posts YouTube URL to X and LinkedIn after upload completes

### 🔗 Wired (Manual Trigger)
- **Rumble → X + LinkedIn**: Post Rumble URL after manual upload
- **Spotify → X + Facebook**: Post Spotify URL after manual upload  

### ⏳ Not Yet Implemented
- Rumble automated upload
- Spotify automated upload
- TikTok upload + posting
- Instagram Reels posting
- Threads posting

## API Endpoints

### Social Post API
**Endpoint:** `POST /api/social-post`

**Request:**
```json
{
  "platforms": ["twitter", "linkedin"],
  "episode": {
    "title": "Episode Title",
    "description": "Episode description",
    "youtubeUrl": "https://youtube.com/watch?v=...",
    "rumbleUrl": "https://rumble.com/...",
    "spotifyUrl": "https://open.spotify.com/episode/...",
    "category": "ai-now",
    "publishDate": "2025-11-06"
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "twitter": {
      "success": true,
      "postId": "1986508507001065729",
      "platform": "twitter",
      "url": "https://twitter.com/i/web/status/1986508507001065729",
      "postedAt": "2025-11-06T18:58:30.401Z"
    },
    "linkedin": {
      "success": false,
      "platform": "linkedin",
      "error": "LinkedIn credentials not configured",
      "postedAt": "2025-11-06T18:58:30.401Z"
    }
  },
  "summary": {
    "total": 2,
    "succeeded": 1,
    "failed": 1
  }
}
```

## Credentials Required

### Twitter/X (Configured ✅)
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_SECRET`

### LinkedIn (Not Configured)
- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_PERSON_URN`

### Facebook (Not Configured)
- `FACEBOOK_PAGE_ACCESS_TOKEN`
- `FACEBOOK_PAGE_ID`

### Threads (Not Configured)
- `THREADS_ACCESS_TOKEN`
- `THREADS_USER_ID`

## Admin Pages

### Social Posting
**URL:** `/admin/social-posting`
- Select episode
- Choose Level 1 platform (YouTube, Rumble, Spotify)
- Auto-generates content
- Recommends Level 2 platforms
- Cross-post to selected platforms

### Platform Settings
**URL:** `/admin/social-posting/settings`
- View platform configuration status
- Test connections
- Access developer portals

### Episodes Management
**URL:** `/admin/episodes`
- Add/edit platform URLs for episodes
- View episode details
- Manage Level 1 platform links

## Architecture

```
Level 1 (Content Platforms)
    ↓
[YouTube/Rumble/Spotify] - Content hosted here
    ↓
/api/social-post
    ↓
Level 2 (Promotion Platforms)
[X/LinkedIn/Facebook] - Links shared here
```

## Troubleshooting

### 401 Errors
- Invalid or missing credentials
- Check: `npx vercel env ls production`
- Ensure no trailing newlines in credentials

### 403 Errors
- Insufficient permissions
- Check app permissions in developer portal

### Empty Response
- Syntax errors in API route
- Check Vercel deployment logs

### Connection Test Fails
- Credentials not propagated to production
- Redeploy: `npx vercel deploy --prod --force`
