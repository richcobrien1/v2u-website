# Weekly Email Digest System

Automated weekly email digest system for AI-Now subscribers. Sends a curated email every Monday morning featuring the latest podcast episodes from the past week.

## 📋 Overview

- **Frequency**: Every Monday at 9:00 AM UTC (4:00 AM EST / 1:00 AM PST)
- **Automation**: GitHub Actions cron job
- **Email Service**: Resend API
- **Recipient Management**: Cloudflare KV storage
- **Content**: Latest 5 episodes published in the last 7 days

## 🏗️ Architecture

```
GitHub Actions Workflow (weekly-digest.yml)
           ↓
POST /api/send-weekly-digest
           ↓
    ┌──────┴──────┐
    ↓             ↓
KV Storage    R2 Episodes
(subscribers) (latest content)
    ↓             ↓
    └──────┬──────┘
           ↓
    Resend API
    (batch send)
           ↓
    📧 Subscribers
```

## 📁 Files Created

### API Endpoints

1. **`/app/api/send-weekly-digest/route.ts`**
   - Main endpoint for sending the weekly digest
   - Requires `Authorization: Bearer <ADMIN_SECRET>` header
   - Fetches subscribers from KV storage
   - Gets latest episodes from R2
   - Sends batch emails via Resend API
   - Logs results to KV storage

2. **`/app/api/digest-logs/route.ts`**
   - Retrieves digest send history
   - Used by admin interface to display logs

### Admin Interface

3. **`/app/admin/send-digest/page.tsx`**
   - Manual trigger interface for testing
   - Shows send history and statistics
   - Displays success/failure details
   - Real-time send progress

### Automation

4. **`.github/workflows/weekly-digest.yml`**
   - GitHub Actions workflow
   - Runs every Monday at 9 AM UTC
   - Can be manually triggered for testing
   - Calls the API endpoint with admin authorization

## 🔧 Setup Instructions

### 1. Add Admin Secret to Environment

Add to `website/.env.local`:

```bash
ADMIN_SECRET="your-secure-random-string-here"
```

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Add Secret to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `ADMIN_SECRET`
5. Value: Same value from `.env.local`
6. Click **Add secret**

### 3. Verify Resend Configuration

Ensure these are in `.env.local`:

```bash
RESEND_API_KEY="re_ht32YycE_P814QwQMyBhnaZAEqtY3uU1x"
EMAIL_FROM="Alex & Jessica <alex@v2u.us>"
```

### 4. Test the System

#### Option A: Manual Test via Admin Interface

1. Navigate to `http://localhost:3000/admin/send-digest`
2. Click "📧 Send Weekly Digest"
3. Enter your `ADMIN_SECRET` when prompted
4. Confirm the send
5. Review results and logs

#### Option B: Test via API

```bash
curl -X POST http://localhost:3000/api/send-weekly-digest \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json"
```

#### Option C: Test GitHub Actions Workflow

1. Go to **Actions** tab in GitHub
2. Select "Send Weekly Digest" workflow
3. Click "Run workflow" → "Run workflow"
4. Monitor the execution

## 📧 Email Content

The digest email includes:

- **Header**: AI-Now Weekly Digest branding
- **Intro**: Personal greeting from Alex and Jessica
- **Episodes**: Up to 5 latest episodes with:
  - Title
  - Publication date
  - Description
  - "Watch Now" button
- **Footer CTA**: Visit v2u.ai for more content
- **Unsubscribe info**: Contact details

## 🔐 Security

- **API Protection**: Requires `ADMIN_SECRET` bearer token
- **Rate Limiting**: Batches of 50 emails with 1s delay between batches
- **Error Handling**: Continues on individual failures, logs all errors
- **Authorization**: Only authorized GitHub Actions or admin users can trigger

## 📊 Monitoring

### View Send Logs

```typescript
GET /api/digest-logs

Response:
{
  "success": true,
  "logs": [
    {
      "timestamp": "2026-01-13T09:00:00.000Z",
      "sent": 245,
      "failed": 2,
      "total": 247
    }
  ]
}
```

### Check Subscriber Count

The system automatically pulls from `subscribers:list` in KV storage. Subscribers are added via:

- `/api/subscribe` (signup modal)
- Manual KV additions

## 🐛 Troubleshooting

### Digest Not Sending

1. **Check GitHub Actions**:
   - Go to Actions tab
   - Look for failed workflow runs
   - Check error messages

2. **Verify Secrets**:
   ```bash
   # In GitHub repo settings
   Settings → Secrets → Actions → ADMIN_SECRET
   ```

3. **Check Resend API**:
   - Log into [Resend Dashboard](https://resend.com/dashboard)
   - Verify API key is active
   - Check daily send limits

### No Episodes in Digest

The system requires episodes published in the last 7 days. If no recent episodes:

- Digest still sends but with message "No recent episodes"
- Check R2 bucket for episode files
- Verify episode metadata dates

### Emails Not Delivered

1. **Check Resend Dashboard** for delivery status
2. **Verify sender domain**: `alex@v2u.us` must be verified
3. **Check spam folders** for test emails
4. **Review error logs** in admin interface

## 🎯 Production Checklist

- [x] API endpoint created
- [x] Admin interface built
- [x] GitHub Actions workflow configured
- [ ] `ADMIN_SECRET` added to `.env.local`
- [ ] `ADMIN_SECRET` added to GitHub Secrets
- [ ] Test send completed successfully
- [ ] Resend domain verified
- [ ] First production send scheduled

## 🔄 Future Enhancements

- [ ] A/B testing for subject lines
- [ ] Personalized content based on user preferences
- [ ] Click tracking and analytics
- [ ] Unsubscribe link automation
- [ ] Email template variations
- [ ] Subscriber segmentation (free vs premium)
- [ ] Send time optimization per timezone

## 📝 Related Documentation

- [Email Subscription System](../../INSTAGRAM_WORKFLOW.md)
- [Resend API Documentation](https://resend.com/docs)
- [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)
- [GitHub Actions Scheduling](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)

## 💡 Tips

- **Test First**: Always use manual trigger before relying on cron
- **Monitor Logs**: Check admin interface weekly for failures
- **Batch Size**: Adjust `batchSize` in route.ts if hitting rate limits
- **Email Design**: Modify HTML template in `generateWeeklyDigestHtml()`
- **Frequency**: Edit cron schedule in `weekly-digest.yml` to change timing

---

**Last Updated**: January 10, 2026  
**Status**: ✅ Ready for deployment
