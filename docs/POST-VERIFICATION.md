# Post Verification - View Your Posts on Social Media

## Overview

The manual-post API now returns **clickable URLs** to all successfully posted content. This lets you immediately verify that posts appeared on social media platforms.

## New Response Format

### Before (Old Format)
```json
{
  "success": true,
  "results": {
    "posted": ["twitter:1234567890", "linkedin:abc123"],
    "errors": []
  }
}
```

### After (New Format)
```json
{
  "success": true,
  "results": {
    "posted": [
      {
        "platform": "twitter",
        "postId": "1234567890",
        "url": "https://twitter.com/V2U_now/status/1234567890"
      },
      {
        "platform": "linkedin",
        "postId": "abc123",
        "url": "https://www.linkedin.com/feed/update/urn:li:share:abc123/"
      }
    ],
    "errors": []
  }
}
```

## How to Use

### 1. Test Manual Post

```bash
curl -X POST https://www.v2u.us/api/automation/manual-post \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "eZCYQSrQeUI",
    "title": "AI Now: Race for AI Supremacy - November 7, 2025",
    "url": "https://youtu.be/eZCYQSrQeUI",
    "source": "youtube",
    "skipDuplicateCheck": true
  }'
```

### 2. Check Response

Look for the `posted` array with clickable URLs:

```json
{
  "success": true,
  "results": {
    "posted": [
      {
        "platform": "twitter",
        "postId": "1987333660060619057",
        "url": "https://twitter.com/V2U_now/status/1987333660060619057"
      },
      {
        "platform": "twitter-ainow",
        "postId": "1987333660123456789",
        "url": "https://twitter.com/AI_Now/status/1987333660123456789"
      },
      {
        "platform": "linkedin",
        "postId": "7234567890",
        "url": "https://www.linkedin.com/feed/update/urn:li:share:7234567890/"
      }
    ],
    "errors": []
  },
  "successCount": 3,
  "failureCount": 0
}
```

### 3. Click URLs to Verify

Simply **click or copy the URLs** from the response to view your posts:

- **Twitter**: `https://twitter.com/V2U_now/status/{tweetId}`
- **LinkedIn**: `https://www.linkedin.com/feed/update/{postUrn}/`
- **Facebook**: `https://www.facebook.com/{pageId}/posts/{postId}`

## Platform-Specific URLs

### Twitter/X
- **V2U Account**: `https://twitter.com/V2U_now/status/{tweetId}`
- **AI Now Account**: `https://twitter.com/AI_Now/status/{tweetId}`

### LinkedIn
- Format: `https://www.linkedin.com/feed/update/{urn:li:share:postId}/`
- Example: `https://www.linkedin.com/feed/update/urn:li:share:7234567890/`

### Facebook
- Format: `https://www.facebook.com/{pageId}/posts/{postId}`
- Example: `https://www.facebook.com/123456789/posts/987654321`

## Benefits

✅ **Instant Verification** - Click URLs right from the API response
✅ **No Guessing** - Know exactly which posts succeeded
✅ **Debugging** - See exactly what was posted to each platform
✅ **Confidence** - Verify content before enabling automation

## Next Steps

1. **Update Vercel Environment Variables**
   - Fix Twitter V2U credentials (see `FIX-TWITTER-LINKEDIN-CREDENTIALS.md`)
   - Ensure all tokens are current

2. **Test Each Platform**
   - Run manual-post tests for each platform
   - Click URLs to verify posts appear correctly
   - Check post formatting and links

3. **Enable Automation**
   - Once all tests pass, enable hourly automation
   - Monitor Vercel logs for first automated run
   - Verify Monday content posts successfully

## Troubleshooting

### Post URL Returns 404
- Post may not be published yet (wait a few seconds)
- Check if credentials are valid
- Verify account/page IDs are correct

### Missing URLs in Response
- Check for errors in the `errors` array
- Verify platform credentials in Vercel environment variables
- Review Vercel function logs for detailed error messages

### LinkedIn URL Format
LinkedIn uses URN format: `urn:li:share:1234567890`
The full URL includes this URN: `https://www.linkedin.com/feed/update/urn:li:share:1234567890/`

## Related Documentation

- `PROJECT-CONTEXT.md` - Full project overview
- `FIX-TWITTER-LINKEDIN-CREDENTIALS.md` - Credential troubleshooting
- `AUTOMATION-SETUP.md` - Initial automation setup
