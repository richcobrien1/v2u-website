/**
 * Platform Workarounds Documentation
 * Solutions for Instagram, TikTok, Odysee, and Vimeo posting limitations
 */

# Platform Posting Workarounds

## Overview
Some platforms don't provide public APIs for text/link posting. This document outlines creative solutions.

---

## Instagram

### Problem
- Instagram Graph API requires media (image/video)
- Can't post text-only or link-only posts
- Links in captions aren't clickable

### Solution: Auto-Generated Images
**Implementation**: `lib/image-generator.ts`

1. **Generate Episode Thumbnail**
   - Create 1080x1080 image with episode title
   - Use branded colors and V2U logo
   - Include "Listen Now" call-to-action

2. **Post as Instagram Feed Image**
   ```typescript
   postToInstagramWithImage(accessToken, userId, imageUrl, caption)
   ```

3. **Caption Format**
   ```
   🎙️ New Episode: [TITLE]
   
   Listen on:
   🎥 YouTube: [link in bio]
   🎵 Spotify: [link in bio]
   📺 Rumble: [link in bio]
   
   #podcast #ainow #v2u
   ```

4. **Link in Bio**
   - Update Instagram bio link to latest episode
   - Or use Linktree/similar service

**Status**: ✅ Ready to implement
**Success Rate**: High (works with existing Graph API credentials)

---

## TikTok

### Problem
- No public API for posting
- TikTok for Developers requires business verification
- Content API only for reading, not posting

### Solution 1: Email/SMS Notifications
**Implementation**: `lib/notification-service.ts`

1. **Send Notification on New Episode**
   - Email with ready-to-post content
   - SMS for immediate alerts
   - Takes 30 seconds to copy-paste

2. **Notification Contains**
   ```
   📱 TikTok Post Ready!
   
   COPY THIS:
   🎙️ New Episode: [TITLE]
   
   Listen:
   🎥 [YouTube Short URL]
   🎵 [Spotify Link]
   
   #podcast #ainow
   ```

**Status**: ✅ Ready to implement
**Manual Effort**: 30 seconds per episode
**Success Rate**: 100% (with manual action)

### Solution 2: TikTok Creator Tools Integration
**Future Enhancement**:
- Research TikTok Creator Marketplace API
- May require business account verification
- Potential for automated posting with approval

**Status**: ⏳ Research needed
**Timeline**: 1-2 weeks investigation

---

## Odysee

### Problem
- Odysee is video-first platform (built on LBRY protocol)
- Text posts not primary use case
- LBRY SDK available but complex

### Solution 1: LBRY SDK Integration
**Research**: Use LBRY SDK to publish text "claims"

```bash
# LBRY CLI commands
lbry publish --name="episode-title" --bid=0.01 --file_path="post.txt"
```

**Potential Approach**:
1. Install LBRY SDK on server
2. Create wallet and fund with minimal LBC
3. Publish text claims programmatically
4. Each post costs ~$0.01 in LBC

**Status**: ⏳ Research needed
**Complexity**: High (requires LBRY wallet setup)
**Timeline**: 2-3 weeks for full implementation

### Solution 2: Video Thumbnail Posts
- Upload 1-second video with episode thumbnail
- Description contains links
- Workaround that fits platform better

**Status**: ⏳ Alternative approach
**Requires**: Video generation (ffmpeg)

### Solution 3: Notification System
Same as TikTok - email/SMS with content to post manually

**Status**: ✅ Ready to implement (fallback)
**Manual Effort**: 1 minute per episode

---

## Vimeo

### Problem
- Vimeo is video-only platform
- No text posts or community posts
- API only supports video upload/management

### Solution 1: Update Existing Video Descriptions
**Implementation**: Update descriptions of existing videos

```typescript
async function updateVimeoVideoDescription(
  videoId: string,
  accessToken: string,
  newDescription: string
) {
  await fetch(`https://api.vimeo.com/videos/${videoId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ description: newDescription })
  });
}
```

**Use Case**:
- Maintain a "Latest Episodes" video
- Update description with new episode links weekly

**Status**: ⏳ Requires Vimeo video ID
**Feasibility**: High (API supports this)

### Solution 2: Weekly Compilation Videos
- Generate 1-minute video with episode highlights
- Upload as new video with links in description
- Requires video generation pipeline

**Status**: ⏳ Requires video pipeline
**Complexity**: High

### Solution 3: Notification System
Same as TikTok - email/SMS notification

**Status**: ✅ Ready to implement (fallback)

---

## Implementation Priority

### Phase 1: Quick Wins (This Week)
1. ✅ **Instagram** - Implement image generation + posting
2. ✅ **Email Notifications** - TikTok, Odysee, Vimeo fallback
3. ✅ **SMS Notifications** - Optional for immediate alerts

### Phase 2: Research & Experimentation (2 weeks)
1. ⏳ **LBRY SDK** - Test Odysee text claims
2. ⏳ **TikTok Business API** - Investigate requirements
3. ⏳ **Vimeo Video Updates** - Test description updates

### Phase 3: Advanced Solutions (1 month)
1. ⏳ **Video Generation** - Auto-create promotional clips
2. ⏳ **Link Management** - Update Instagram bio automatically
3. ⏳ **Analytics** - Track which notifications lead to manual posts

---

## Configuration

### Notification Settings
Add to `app/api/automation/config/route.ts`:

```typescript
interface NotificationConfig {
  email?: string;      // Email for notifications
  phone?: string;      // SMS for urgent alerts
  platforms: string[]; // Which platforms to notify for
}
```

### Admin UI
Add to social posting page:
- Email/phone configuration
- Toggle notifications per platform
- View pending manual posts
- Mark as posted manually

---

## Success Metrics

### Instagram
- **Target**: 100% automated posting with images
- **Fallback**: None needed (API fully supported)

### TikTok
- **Target**: Email sent within 1 minute of episode publish
- **Fallback**: SMS if email fails
- **Manual Time**: 30 seconds to post

### Odysee
- **Target**: LBRY SDK automation (future)
- **Current**: Email notification
- **Manual Time**: 1 minute to post

### Vimeo
- **Target**: Auto-update video descriptions (future)
- **Current**: Email notification
- **Manual Time**: 1 minute to update

---

## Cost Analysis

### Free Solutions
- Instagram image posting: ✅ Free
- Email notifications: ✅ Free (100 emails/day on free tier)
- SMS notifications: 💰 ~$0.01 per SMS (optional)

### Paid Solutions
- LBRY SDK: 💰 ~$0.01 per post (LBC transaction fees)
- TikTok Business API: 💰 Requires business verification
- Video generation: ✅ Free (ffmpeg on server)

**Total Cost**: ~$0.01-0.05 per episode (if using SMS + LBRY)

---

## Next Steps

1. **Implement Instagram image posting** - lib/image-generator.ts
2. **Implement notification service** - lib/notification-service.ts
3. **Update post-latest route** - Use new functions
4. **Add notification UI** - Admin settings page
5. **Test with real episode** - Verify all workarounds

**Timeline**: 2-4 hours for Phase 1 implementation
