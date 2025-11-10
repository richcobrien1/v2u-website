# Facebook Long-Lived Page Tokens & Automatic Rotation

## ✅ Implementation Complete

Implemented automatic exchange for long-lived Facebook page tokens with automatic rotation.

---

## 🔑 Token Types Explained

### 1. **Short-Lived User Access Token** (2 hours)
- What you get from Facebook Login
- Expires in 2 hours
- ❌ Not suitable for automation

### 2. **Long-Lived User Access Token** (60 days)
- Exchange short-lived token for this
- Expires in 60 days
- ⚠️ Better, but still expires

### 3. **Long-Lived Page Access Token** (Never expires)
- Get from long-lived user token
- Never expires (unless password changed or permissions revoked)
- ✅ Perfect for automation!

---

## 🎯 What Was Implemented

### 1. **Automatic Token Exchange** (During Validation)

**File**: `lib/credential-validator.ts`

When you validate Facebook credentials, the system now:

1. ✅ Verifies the token works
2. ✅ Checks if it's a user token or page token
3. ✅ If user token: Exchanges for long-lived user token (60 days)
4. ✅ Gets long-lived page token from user token (never expires)
5. ✅ Saves the long-lived page token automatically

**Flow**:
```
Short-lived User Token (2 hours)
  ↓ [Exchange via Graph API]
Long-lived User Token (60 days)
  ↓ [Get Page Token]
Long-lived Page Token (NEVER EXPIRES) ✅
```

### 2. **Automatic Token Rotation** (Cron Job)

**File**: `app/api/automation/rotate-tokens/route.ts`

Runs daily at midnight (00:00 UTC) to check all Facebook tokens:

1. ✅ Checks each Facebook platform (facebook, facebook-ainow)
2. ✅ Looks at token expiration date
3. ✅ If expires in < 7 days: Automatically rotates token
4. ✅ Saves new long-lived page token
5. ✅ Logs all actions for monitoring

**Cron Schedule**: `0 0 * * *` (daily at midnight)

### 3. **Vercel Cron Configuration**

**File**: `vercel.json`

Added automatic cron job that runs daily:
```json
{
  "path": "/api/automation/rotate-tokens",
  "schedule": "0 0 * * *"
}
```

---

## 🚀 How to Use

### Step 1: Get Your Facebook App Credentials

You need a Facebook App with these permissions:
- `pages_manage_posts` - Post to page
- `pages_read_engagement` - Read page data

**Get App Credentials**:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create or select your app
3. Copy **App ID** and **App Secret**

### Step 2: Add App Credentials to Environment

Add to your `.env` file:
```bash
# Facebook App Credentials (for token exchange)
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here

# Cron Secret (for security)
CRON_SECRET=your_random_secret_here
```

### Step 3: Get Initial Page Access Token

**Option A: Use Facebook Graph API Explorer**
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Get User Access Token with permissions: `pages_manage_posts`, `pages_read_engagement`
4. Copy the token (short-lived user token is fine!)

**Option B: Use Facebook Business Suite**
1. Go to your Facebook Page Settings
2. Navigate to "Business Integrations"
3. Generate Page Access Token
4. Copy the token

### Step 4: Validate in Admin Panel

1. Go to `https://v2u.ai/admin/social-posting`
2. Find Facebook section
3. Enter credentials:
   - **Page ID**: Your page numeric ID (e.g., `123456789`)
   - **Page Access Token**: The token from Step 3
   - **App ID**: (Optional - uses env var if not provided)
   - **App Secret**: (Optional - uses env var if not provided)
4. Click **"Validate Facebook"**

The system will automatically:
- ✅ Verify the token works
- ✅ Exchange for long-lived token
- ✅ Save the never-expiring page token
- ✅ Show "Token expires: never"

### Step 5: Verify Automatic Rotation Setup

Check rotation status:
```bash
curl https://v2u.ai/api/automation/rotate-tokens
```

Response:
```json
{
  "success": true,
  "tokenStatus": {
    "facebook": {
      "enabled": true,
      "hasToken": true,
      "expiresAt": "never",
      "needsRotation": false
    },
    "facebook-ainow": {
      "enabled": true,
      "hasToken": true,
      "expiresAt": "never",
      "needsRotation": false
    }
  }
}
```

---

## 🔄 How Automatic Rotation Works

### Daily Cron Check (00:00 UTC)

1. **For each Facebook platform**:
   - Check if token exists
   - Check expiration date
   - Calculate days until expiration

2. **If token expires in < 7 days**:
   - Exchange current token for new long-lived user token
   - Get new long-lived page token from user token
   - Save new page token (never expires)
   - Log success

3. **If token is "never"**:
   - Skip (already long-lived page token)
   - No rotation needed

4. **If rotation fails**:
   - Log error with details
   - Continue checking other platforms
   - (Future: Send alert notification)

### Rotation Example

```
Day 0: Token expires in 53 days → No action (>7 days)
Day 46: Token expires in 7 days → No action (=7 days)
Day 47: Token expires in 6 days → ✅ ROTATE!
  - Exchange for new 60-day user token
  - Get new page token (never expires)
  - Save and update credentials
Day 48: Token expires: never → No action needed forever
```

---

## 📊 Monitoring & Logs

### Check Token Status (GET)

```bash
curl https://v2u.ai/api/automation/rotate-tokens
```

Shows:
- Enabled status
- Token presence
- Expiration date
- Days until expiration
- Whether rotation is needed

### Trigger Manual Rotation (POST)

```bash
curl -X POST https://v2u.ai/api/automation/rotate-tokens \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Returns:
- Number of tokens checked
- Number rotated
- Number skipped
- Number of errors
- Detailed logs

### View Logs

All rotation activity is logged to console:
```
[Token Rotation] [SUCCESS] [facebook] Token expires in 45 days - no rotation needed
[Token Rotation] [SUCCESS] [facebook-ainow] Token expires in 5 days - attempting rotation
[Token Rotation] [SUCCESS] [facebook-ainow] Got long-lived user token (expires in 5184000s)
[Token Rotation] [SUCCESS] [facebook-ainow] ✅ Token successfully rotated and saved (never expires)
[Token Rotation] [SUCCESS] [system] Token rotation complete: 2 checked, 1 rotated, 1 skipped, 0 errors
```

---

## 🔐 Security

### Cron Secret

The rotation endpoint requires authorization to prevent unauthorized token rotation:

```typescript
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return 401 Unauthorized;
}
```

**Setup**:
1. Generate a random secret: `openssl rand -base64 32`
2. Add to `.env`: `CRON_SECRET=your_random_secret`
3. Vercel Cron automatically includes the secret in headers

### App Secret Protection

Facebook App Secret is stored in environment variables, never in code or client-side:
- ✅ `process.env.FACEBOOK_APP_SECRET`
- ❌ Never logged or exposed in responses

---

## 🎛️ Configuration

### Rotation Timing

**Default**: Check tokens with < 7 days until expiration

**Change threshold** in `app/api/automation/rotate-tokens/route.ts`:
```typescript
// Rotate if token expires in less than 7 days
if (daysUntilExpiration > 7) {
  // Change 7 to your preferred threshold (e.g., 14 for 2 weeks)
}
```

### Cron Schedule

**Default**: Daily at midnight UTC (`0 0 * * *`)

**Change schedule** in `vercel.json`:
```json
{
  "path": "/api/automation/rotate-tokens",
  "schedule": "0 0 * * *"  // Cron expression
}
```

**Examples**:
- `0 */12 * * *` - Every 12 hours
- `0 0 * * 0` - Weekly (Sundays at midnight)
- `0 0 1 * *` - Monthly (1st of month)

---

## 🐛 Troubleshooting

### Error: "Missing app credentials - cannot rotate token automatically"

**Cause**: No Facebook App ID or App Secret configured

**Solution**:
```bash
# Add to .env
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

### Error: "Token exchange failed"

**Causes**:
1. Invalid App ID or App Secret
2. Token was manually revoked
3. User changed password
4. Permissions were removed

**Solution**:
1. Verify App ID and App Secret are correct
2. Generate new token in Facebook Business Suite
3. Re-validate in admin panel

### Error: "Page token fetch failed"

**Cause**: User token doesn't have access to the page

**Solution**:
- Ensure the user who generated the token is an admin of the page
- Re-generate token with correct page permissions

### Token Still Expires After Rotation

**Cause**: Got user token instead of page token

**Solution**: System should automatically get page token - check logs for errors

### Cron Not Running

**Causes**:
1. Vercel Cron not enabled (requires Pro plan for some regions)
2. `vercel.json` not deployed
3. Invalid cron expression

**Solution**:
1. Check Vercel Dashboard → Project → Cron Jobs
2. Verify cron is listed and enabled
3. Check recent execution logs

**Alternative**: Use external cron service:
```bash
# Add to crontab or external service (e.g., cron-job.org)
0 0 * * * curl -X POST https://v2u.ai/api/automation/rotate-tokens \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📈 Expected Results

### Before Implementation
```json
{
  "facebook": {
    "credentials": {
      "pageAccessToken": "short_token_here",
      "tokenExpiresAt": "2025-11-09T15:00:00.000Z"  // 4 hours!
    }
  },
  "lastPostResult": {
    "error": "Session has expired on Sunday, 09-Nov-25 15:00:00 PST"
  }
}
```

### After Initial Validation
```json
{
  "facebook": {
    "credentials": {
      "pageAccessToken": "long_lived_page_token_here",
      "tokenExpiresAt": "never",
      "tokenRefreshedAt": "2025-11-10T10:30:00.000Z"
    }
  }
}
```

### After Automatic Rotation (if needed)
```json
{
  "facebook": {
    "credentials": {
      "pageAccessToken": "new_long_lived_page_token",
      "tokenExpiresAt": "never",
      "tokenRefreshedAt": "2025-11-17T00:00:15.000Z"  // Auto-refreshed by cron
    }
  }
}
```

---

## 🎉 Benefits

1. **Never Expires**: Long-lived page tokens don't expire (unless manually revoked)
2. **Automatic Rotation**: Daily checks ensure tokens stay fresh
3. **No Manual Work**: Set it and forget it
4. **Proactive Monitoring**: Rotates 7 days before expiration
5. **Detailed Logging**: All actions logged for debugging
6. **Secure**: Cron endpoint requires authorization
7. **Multiple Pages**: Handles both facebook and facebook-ainow

---

## 📝 Summary

### What You Need To Do

1. ✅ Add Facebook App credentials to `.env`:
   ```bash
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   CRON_SECRET=random_secret
   ```

2. ✅ Get initial Page Access Token from Facebook

3. ✅ Validate in admin panel (system auto-exchanges for long-lived token)

4. ✅ Done! Automatic rotation handles the rest

### What The System Does Automatically

1. ✅ Exchanges short-lived token for long-lived page token
2. ✅ Saves token with expiration date
3. ✅ Checks tokens daily at midnight
4. ✅ Rotates tokens before they expire (< 7 days)
5. ✅ Logs all rotation activity
6. ✅ Never interrupts your posting automation

---

## 🔗 References

- [Facebook Access Tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)
- [Facebook Page Access Tokens](https://developers.facebook.com/docs/pages/access-tokens)
- [Extending Access Tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

**Status**: ✅ Fully implemented and deployed

Your Facebook tokens will now never expire, and rotation happens automatically! 🚀
