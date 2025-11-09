# Credential Age Tracking

## Overview

The admin panel now tracks when credentials were last successfully validated and displays color-coded warnings to help you proactively monitor credential expiration.

## Features Implemented

### 1. Backend Tracking (lib/kv-storage.ts)
- **validatedAt field**: Timestamp stored in ISO format when credentials are successfully validated
- **validated flag**: Boolean indicating if credentials have been tested and confirmed working
- Automatically set when credentials pass validation during save

### 2. Admin Panel Display (app/admin/social-posting/page.tsx)
- **Last validated** timestamp shown below credential fields
- **Color-coded warnings**:
  - 🟢 **Green** (text-green-600): < 30 days old - credentials are fresh
  - 🟡 **Yellow** (text-yellow-600): 30-60 days old - consider regenerating soon
  - 🔴 **Red** (text-red-600): > 60 days old - regenerate immediately

### 3. Validation Rules
- Green checkmark (✓) only appears when `validated: true` in storage
- Saving credentials triggers platform-specific validation:
  - Twitter: Tests OAuth 1.0a with v2.me() endpoint
  - LinkedIn: Tests UGC Posts API access
  - Facebook: Tests Graph API page access
- Failed validation returns 400 error and credentials are NOT saved

## How It Works

### When You Save Credentials:

1. **User fills in credential fields** → clicks Save button
2. **System validates credentials** → tests actual API connection
3. **If validation succeeds**:
   - Credentials saved to Cloudflare KV
   - `validated: true` flag set
   - `validatedAt: "2024-01-15T10:30:00.000Z"` timestamp stored
   - Green checkmark (✓) appears
   - "Last validated: Today" displayed in green

4. **If validation fails**:
   - Returns 400 error with specific error message
   - Credentials NOT saved
   - Red X (✗) remains
   - No timestamp displayed

### Credential Age Calculation:

```typescript
const getCredentialAge = (validatedAt?: string) => {
  if (!validatedAt) return null
  
  const validated = new Date(validatedAt)
  const now = new Date()
  const daysSince = Math.floor((now.getTime() - validated.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysSince === 0) return { text: 'Today', color: 'text-green-600' }
  if (daysSince === 1) return { text: '1 day ago', color: 'text-green-600' }
  if (daysSince < 30) return { text: `${daysSince} days ago`, color: 'text-green-600' }
  if (daysSince < 60) return { text: `${daysSince} days ago`, color: 'text-yellow-600' }
  return { text: `${daysSince} days ago`, color: 'text-red-600' }
}
```

## Current Status: Twitter Tokens Expired

### Problem Discovered:
All Twitter credentials are showing **Error 89: "Invalid or expired token"**

Tested credentials:
- App Key: `yJgeMEuWZ2ZrJBjGi5ACMRAnx` ✅ Valid
- Access Token: `1952426895381016576-LtgJabwj4iZj99J4H6MsrNbf39Ocd7` ❌ EXPIRED

### Solution Required:

You need to regenerate Twitter access tokens in the Twitter Developer Portal:

1. **Go to Twitter Developer Portal**:
   - URL: https://developer.twitter.com/en/portal/projects-and-apps
   - Your app: AI_Now (ID: 1976634787231363072)

2. **Regenerate Access Tokens**:
   - Click on AI_Now app
   - Go to "Keys and tokens" tab
   - Under "Access Token and Secret" → Click "Regenerate"
   - ⚠️ **WARNING**: Copy both tokens immediately - they won't be shown again!

3. **Update Credentials in Admin Panel**:
   - Go to: https://www.v2u.us/admin/social-posting
   - Find "X (Twitter) @AI_Now_v2u" platform
   - Click "Edit" button
   - Paste new Access Token and Access Secret
   - Click "Save"
   - System will validate tokens and show green checkmark if valid
   - "Last validated: Today" will appear in green

## Usage Instructions

### Weekly Monitoring:
1. Visit https://www.v2u.us/admin/social-posting
2. Check credential age timestamps on each platform
3. Regenerate any credentials showing yellow (30-60 days) or red (>60 days)

### Proactive Regeneration:
- **Best practice**: Regenerate tokens every 30 days
- **Set calendar reminder**: Monthly token rotation schedule
- **Monitor for yellow/red warnings**: Act immediately when color changes

### Platform-Specific Notes:

**Twitter/X:**
- Tokens can expire or be revoked
- App keys remain valid, access tokens expire
- Regenerate in Developer Portal → Keys and tokens

**Facebook:**
- Page Access Tokens can expire based on app settings
- Short-lived tokens: 1 hour
- Long-lived tokens: 60 days
- Exchange tokens through Graph API or regenerate in Meta Business Suite

**LinkedIn:**
- Access tokens expire after 60 days
- Must reauthorize through OAuth 2.0 flow
- Regenerate via LinkedIn Developer Portal

## Files Modified

### Backend:
- `lib/kv-storage.ts`:
  - Added `validated?: boolean` field to credential types
  - Added `validatedAt?: string` field to credential types
  - Modified `saveCredentials()` to accept validated parameter
  - Store ISO timestamp when validated=true

### API:
- `app/api/automation/config/route.ts`:
  - GET: Returns `configured: true` only when `validated: true` in KV
  - PUT: Validates credentials before saving, returns 400 on failure
  - Passes `validatedAt` timestamp to frontend

### Admin Panel:
- `app/admin/social-posting/page.tsx`:
  - Added `validatedAt?: string` to Level1Platform and Level2Platform interfaces
  - Implemented `getCredentialAge()` helper function with color logic
  - Updated all level1 and level2 platform configs to receive validatedAt from API
  - Added "Last validated: X days ago" display below credential fields
  - Color-coded text based on age (green/yellow/red)

## Git Commits

1. **87dac71**: "Add validation status tracking - green check only when validated"
   - Backend validation flag implementation
   - API endpoint validation logic
   - Prevents false positive green checks

2. **8fcf097**: "Add credential age tracking to admin panel - show when credentials were last validated with color-coded warnings"
   - Frontend age calculation and display
   - Color-coded warning system
   - UI updates for all platforms

## Next Steps

### Immediate (BLOCKING):
1. ✅ **Regenerate Twitter access tokens** (see instructions above)
2. Test posting with new validated credentials
3. Verify green checkmark and "Today" timestamp appear

### Optional:
1. **V2U Twitter Account**:
   - Currently no app visible in Developer Portal
   - Options:
     - Log into @V2U_now account and create separate app
     - Disable V2U platform in admin panel (uncheck "Enabled")
     - Use same AI_Now app for both accounts
   - Recommended: Disable for now, focus on AI_Now working

2. **LinkedIn Credentials**:
   - Currently showing 403 error
   - May also be expired
   - Regenerate after Twitter is working

3. **Set Up Monitoring**:
   - Add weekly admin panel check to calendar
   - Proactively regenerate tokens before 60 days
   - Monitor automated posting success rates

## Testing Checklist

After regenerating Twitter tokens:
- [ ] Save new credentials in admin panel
- [ ] Verify green checkmark appears
- [ ] Verify "Last validated: Today" shows in green
- [ ] Test manual post via admin panel
- [ ] Verify post URL is clickable and shows on Twitter
- [ ] Enable automated posting for AI_Now
- [ ] Monitor for 24 hours to confirm automation works
- [ ] Check credential age weekly for other platforms

## Troubleshooting

### Green checkmark not appearing after save:
- Check browser console for error messages
- Verify credentials are correct (copy-paste carefully)
- Try regenerating tokens again in Developer Portal
- Check if token permissions are correct (Read and Write)

### "Last validated" not showing:
- Credentials may have been saved before this feature was implemented
- Click "Edit" and "Save" again to trigger validation and timestamp

### Yellow/Red warning appearing:
- Credentials are old and should be regenerated soon
- Follow regeneration instructions for that platform
- Don't wait for credentials to fail during posting

### 401/403 errors during validation:
- Tokens are expired or invalid
- Regenerate new tokens in respective platform's Developer Portal
- Double-check API permissions and app settings

## Additional Resources

- **Twitter Developer Portal**: https://developer.twitter.com/en/portal/projects-and-apps
- **Facebook Business Suite**: https://business.facebook.com/
- **LinkedIn Developer Portal**: https://www.linkedin.com/developers/
- **POST-VERIFICATION.md**: Guide for verifying posts with clickable URLs
