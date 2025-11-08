# Email Alerts Setup Guide

## Overview
The automation system now includes email alerts for posting failures and automatic retry logic.

## Features Added
1. **Retry Logic**: Automatically retries failed posts up to 2 times with exponential backoff (1s, 2s)
2. **Email Alerts**: Sends detailed failure reports when posts fail after retries
3. **Failure Tracking**: Collects all errors and successes for comprehensive reporting

## Setup Instructions

### 1. Get Resend API Key
1. Go to https://resend.com
2. Sign up for a free account (100 emails/day free)
3. Create an API key
4. Add it to your `.env.local`:
   ```bash
   RESEND_API_KEY="re_xxxxxxxxxxxxx"
   ```

### 2. Configure Email Addresses
Already added to `.env.local`:
```bash
ADMIN_EMAIL="rich@v2u.us"      # Where alerts are sent
FROM_EMAIL="alerts@v2u.us"      # From address
```

### 3. Verify Domain (Optional for Production)
For production, verify your domain in Resend:
1. Go to Resend Dashboard → Domains
2. Add `v2u.us`
3. Add DNS records (SPF, DKIM, DMARC)
4. Wait for verification

For testing, you can use the default `onboarding@resend.dev` sender.

### 4. Deploy to Vercel
Add environment variables in Vercel:
1. Go to Project Settings → Environment Variables
2. Add:
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `FROM_EMAIL`
3. Redeploy

## How It Works

### Retry Logic
```typescript
retryOperation(async () => {
  // Post to platform
}, 2); // Retries up to 2 times
```

- **Attempt 1**: Immediate
- **Attempt 2**: After 1 second delay
- **Attempt 3**: After 2 second delay
- **If all fail**: Records error and sends email

### Email Alert
Sent only when posts fail after all retries. Includes:
- Content details (title, URL, source)
- Failed platforms with error messages
- Successful platforms (green badges)
- Timestamp
- Link to admin dashboard

### Example Email
```
🚨 Social Media Posting Failed - "AI News Update #123"

Content Details:
- Title: AI News Update #123
- Source: YOUTUBE
- URL: https://youtube.com/watch?v=abc123
- Time: 2025-11-08 3:45 PM

Failed Platforms (2):
- linkedin: LinkedIn API error: Invalid access token
- facebook: Facebook API error: Page access token expired

Successful Posts (2):
✅ twitter  ✅ twitter-ainow
```

## Testing
To test the email system without waiting for real failures:

1. Temporarily break a credential (wrong access token)
2. Upload a test video to YouTube
3. Wait for automation to run (or trigger manually)
4. Check your email for the failure alert
5. Fix the credential

## Monitoring
- **Vercel Logs**: See retry attempts and posting status
- **Email Inbox**: Get immediate alerts for failures
- **Admin Dashboard**: View automation status at `/admin/social-posting`

## Cost
- **Resend Free Tier**: 100 emails/day, 3,000/month
- **Expected Usage**: ~1-5 emails/day (only on failures)
- **Well within free tier limits**

## Future Enhancements
Consider adding:
- Daily summary emails (even when no failures)
- Success confirmation emails
- Weekly stats reports
- SMS alerts for critical failures
- Slack/Discord webhooks
