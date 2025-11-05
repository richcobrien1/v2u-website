# AI-Now Cross-Platform Social Media Posting System

Automated system for posting AI-Now podcast episodes from Level 1 platforms (YouTube, Rumble, Spotify) to Level 2 social media platforms (Twitter/X, Facebook, LinkedIn, Instagram, Threads).

## Features

- ✅ **Manual Posting**: Select episodes and post to multiple platforms instantly
- ⏰ **Scheduled Posting**: Schedule posts for future dates/times
- 🔗 **Link Sharing**: Share episode links from YouTube, Rumble, or Spotify
- 📊 **Post History**: Track all posts with success/failure status
- ⚙️ **Platform Management**: Configure and test OAuth credentials
- 🎨 **Custom Messages**: Override auto-generated content with custom text
- 🔐 **Secure Credentials**: Environment variable-based credential management

## Supported Platforms

### Level 1 (Source Platforms)
- YouTube
- Rumble
- Spotify

### Level 2 (Target Platforms)
- **Twitter/X** ✅ Fully Implemented
- **Facebook** ✅ Fully Implemented
- **LinkedIn** ✅ Fully Implemented
- **Threads** ✅ Fully Implemented
- **Instagram** ⚠️ Requires manual setup (API limitations)

## Quick Start

### 1. Install Dependencies

```bash
cd website
npm install twitter-api-v2
```

### 2. Set Up Credentials

Edit `.env.local` and replace the placeholder values with your actual API credentials for each platform you want to use.

### 3. Configure Each Platform

Visit the Admin Dashboard: `/admin/social-posting/settings`

For each platform:
1. Click "Developer Portal" to create an app
2. Follow the setup instructions
3. Add credentials to `.env.local`
4. Click "Test Connection" to verify

### 4. Start Posting

Go to `/admin/social-posting` to:
- Select an episode
- Choose platforms
- Customize message (optional)
- Post immediately or schedule for later

## API Endpoints

### POST /api/social-post
Post to social media platforms immediately.

**Request:**
```json
{
  "platforms": ["twitter", "facebook", "linkedin"],
  "episode": {
    "title": "AI-Now Episode Title",
    "description": "Episode description",
    "youtubeUrl": "https://youtube.com/watch?v=xxx",
    "rumbleUrl": "https://rumble.com/xxx",
    "spotifyUrl": "https://open.spotify.com/episode/xxx",
    "category": "ai-now",
    "publishDate": "2025-11-05"
  },
  "customMessage": "Optional custom message"
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "twitter": {
      "success": true,
      "postId": "123456789",
      "url": "https://twitter.com/i/web/status/123456789"
    },
    "facebook": {
      "success": true,
      "postId": "page_123_post_456"
    }
  },
  "summary": {
    "total": 3,
    "succeeded": 2,
    "failed": 1
  }
}
```

### GET /api/social-post
Get available platforms and their configuration status.

### GET /api/social-post/test?platform=twitter
Test connection to a specific platform.

### POST /api/social-schedule
Schedule a post for later.

**Request:**
```json
{
  "episodeId": "episode-123",
  "episodeTitle": "AI-Now Episode",
  "platforms": ["twitter", "linkedin"],
  "customMessage": "Check this out!",
  "scheduledTime": "2025-11-06T10:00:00Z"
}
```

### GET /api/social-schedule
Get all scheduled posts and history.

### DELETE /api/social-schedule?id=xxx
Cancel a scheduled post.

### PUT /api/social-schedule
Execute due scheduled posts (called by cron job).

## Platform Setup Guides

### Twitter/X

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a new Project and App
3. Enable OAuth 1.0a User Authentication
4. Set permissions to "Read and Write"
5. Generate API Key & Secret
6. Generate Access Token & Secret
7. Replace placeholders in `.env.local`:
   ```
   TWITTER_API_KEY=your_actual_key
   TWITTER_API_SECRET=your_actual_secret
   TWITTER_ACCESS_TOKEN=your_actual_token
   TWITTER_ACCESS_TOKEN_SECRET=your_actual_token_secret
   ```

### Facebook

1. Go to https://developers.facebook.com/
2. Create a new app
3. Add "Facebook Login" product
4. Get your Facebook Page ID from Page Settings
5. Use Graph API Explorer to generate Page Access Token with these permissions:
   - pages_manage_posts
   - pages_read_engagement
   - pages_show_list
6. Convert to long-lived token (60 days)
7. Replace placeholders in `.env.local`:
   ```
   FACEBOOK_PAGE_ID=your_actual_page_id
   FACEBOOK_ACCESS_TOKEN=your_actual_token
   ```

### LinkedIn

1. Go to https://www.linkedin.com/developers/
2. Create a new app
3. Add "Share on LinkedIn" product
4. Request "w_member_social" permission
5. Complete OAuth 2.0 flow to get access token
6. Get your Person URN from `/v2/me` API
7. Replace placeholders in `.env.local`:
   ```
   LINKEDIN_PERSON_URN=urn:li:person:your_actual_id
   LINKEDIN_ACCESS_TOKEN=your_actual_token
   ```

### Threads

1. Threads uses Meta's Graph API
2. Follow Facebook setup steps above
3. Enable Threads permissions in your app
4. Get Threads User ID from Graph API
5. Replace placeholders in `.env.local`:
   ```
   THREADS_USER_ID=your_actual_user_id
   THREADS_ACCESS_TOKEN=your_actual_token
   ```

### Instagram

Instagram requires an Instagram Business Account and has limitations:
- Cannot post direct links in posts
- Must use Instagram Stories for link stickers (10k+ followers required)
- Or use "Link in Bio" approach

This requires custom implementation based on your use case.

## Automation

### Setting Up Cron Jobs

To automatically execute scheduled posts, set up a cron job to call the scheduler API:

```bash
# Run every 5 minutes
*/5 * * * * curl -X PUT http://localhost:3000/api/social-schedule
```

Or use Vercel Cron Jobs (in production):

```json
// vercel.json
{
  "crons": [{
    "path": "/api/social-schedule",
    "schedule": "*/5 * * * *"
  }]
}
```

### Auto-Posting After YouTube Upload

To automatically post when new YouTube videos are uploaded:

1. Set up YouTube webhook notifications
2. Create a webhook endpoint that calls `/api/social-post`
3. Or use the existing `news-collector` scripts to monitor and trigger posts

## Content Customization

### Auto-Generated Content

The system automatically generates platform-optimized content:

- **Twitter**: Short, punchy (280 chars max)
- **LinkedIn**: Professional, detailed (3000 chars)
- **Facebook**: Engaging, moderate length
- **Threads**: Casual, conversational
- **Instagram**: Visual-first, hashtag-focused

### Custom Messages

You can override auto-generated content by providing a `customMessage` in the request.

## Best Practices

1. **Test First**: Always test platform connections before posting
2. **Schedule Wisely**: Post during peak engagement hours
3. **Vary Content**: Customize messages for different platforms
4. **Monitor Results**: Check post history regularly
5. **Refresh Tokens**: Some tokens expire and need refreshing
6. **Rate Limits**: Respect platform API rate limits
7. **Backup Credentials**: Keep credentials secure and backed up

## Troubleshooting

### "Platform not configured" error
- Check that all required environment variables are set
- Verify credentials are valid
- Test connection in Settings page

### "Token expired" error
- Refresh OAuth tokens
- Some platforms require periodic token renewal
- Long-lived tokens typically last 60-90 days

### Posts not appearing
- Check API rate limits
- Verify account permissions
- Review post content for policy violations
- Check platform status pages

### Scheduled posts not executing
- Verify cron job is running
- Check `/api/social-schedule` endpoint is accessible
- Review server logs for errors

## Security

- Never commit `.env.local` to git
- Keep API keys and tokens secure
- Use environment variables only
- Regularly rotate credentials
- Monitor API usage for anomalies
- Revoke tokens when no longer needed

## Support

For issues or questions:
1. Check the Settings page for platform-specific guidance
2. Test connections to identify configuration issues
3. Review API documentation for each platform
4. Check server logs for detailed error messages

## Future Enhancements

- [ ] Instagram direct posting support
- [ ] TikTok integration
- [ ] Analytics dashboard
- [ ] A/B testing for post content
- [ ] Bulk scheduling
- [ ] Content calendar view
- [ ] Automated hashtag suggestions
- [ ] Image/video thumbnail extraction
- [ ] Multi-account support per platform
