# Twitter/X OAuth Debugging Guide

## 🎯 Enhanced Debugging Implemented

Added comprehensive debug logging to diagnose Twitter "Unauthorized" errors.

---

## 📊 What Was Added

### 1. **Enhanced Twitter OAuth Debug Logging**
**File**: `lib/twitter-oauth.ts`

Now logs:
- ✅ Full credential check (lengths, previews)
- ✅ OAuth signature generation details
- ✅ Authorization header preview
- ✅ Raw API response (text + JSON)
- ✅ Response headers
- ✅ Detailed error analysis for 401 Unauthorized
- ✅ Possible causes for each error type

### 2. **Twitter Test Endpoint**
**File**: `app/api/automation/test-twitter/route.ts`

New endpoint to test Twitter posting independently:
- `GET /api/automation/test-twitter` - Check credential status
- `POST /api/automation/test-twitter` - Test posting with debug info

### 3. **Enhanced Post-Latest Response**
**File**: `app/api/automation/post-latest/route.ts`

Now includes:
- ✅ Full debug info in response
- ✅ Detailed logging of OAuth process
- ✅ Error details exposed in API response

---

## 🔍 How to Diagnose Twitter Issues

### Step 1: Check Credential Status

```bash
curl https://v2u.ai/api/automation/test-twitter
```

**Expected Response**:
```json
{
  "success": true,
  "platforms": {
    "twitter": {
      "enabled": true,
      "validated": true,
      "hasAppKey": true,
      "hasAppSecret": true,
      "hasAccessToken": true,
      "hasAccessSecret": true,
      "appKeyPreview": "abcd1234...",
      "accessTokenPreview": "1234567890..."
    }
  }
}
```

**Check**:
- All credentials present (all `true`)
- Preview values look correct (not empty or PLACEHOLDER)

---

### Step 2: Test Twitter Posting with Full Debug

```bash
curl -X POST https://v2u.ai/api/automation/test-twitter \
  -H "Content-Type: application/json" \
  -d '{
    "platformId": "twitter",
    "text": "Test tweet from V2U - debugging OAuth"
  }'
```

**Success Response**:
```json
{
  "success": true,
  "tweetId": "1234567890",
  "tweetUrl": "https://twitter.com/i/web/status/1234567890",
  "debugInfo": {
    "credentials": { "consumerKeyLength": 25, ... },
    "responseStatus": 201,
    "success": true
  }
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "Unauthorized",
  "debugInfo": {
    "responseStatus": 401,
    "rawResponse": "{\"title\":\"Unauthorized\",\"type\":\"about:blank\",\"status\":401,\"detail\":\"Unauthorized\"}",
    "parsedResponse": {
      "title": "Unauthorized",
      "status": 401,
      "detail": "Unauthorized"
    },
    "possibleCauses": [
      "OAuth signature mismatch",
      "Invalid consumer key or access token",
      "Tokens from different app",
      "Tokens revoked or expired",
      "Insufficient app permissions (need Read+Write)"
    ]
  }
}
```

---

### Step 3: Check Vercel Logs

The enhanced logging outputs to Vercel console:

```
[Twitter OAuth] Starting post request
[Twitter OAuth] Tweet text: Test tweet...
[Twitter OAuth] Credentials present: {
  hasConsumerKey: true,
  hasConsumerSecret: true,
  hasAccessToken: true,
  hasAccessSecret: true,
  consumerKeyLength: 25,
  consumerSecretLength: 50,
  accessTokenLength: 50,
  accessSecretLength: 45,
  consumerKeyPreview: "abcd12345...",
  accessTokenPreview: "1234567890..."
}
[Twitter OAuth] Authorization header (first 100 chars): OAuth oauth_consumer_key="abc", oauth_nonce="xyz"...
[Twitter OAuth] Making POST request to: https://api.twitter.com/2/tweets
[Twitter OAuth] Response status: 401
[Twitter OAuth] Response headers: { ... }
[Twitter OAuth] Raw response body: {"title":"Unauthorized","type":"about:blank","status":401,"detail":"Unauthorized"}
[Twitter OAuth] Parsed JSON response: { "title": "Unauthorized", ... }
[Twitter OAuth] ❌ Error Response: { status: 401, title: "Unauthorized", ... }
[Twitter OAuth] 401 Unauthorized - Possible causes:
  1. OAuth signature mismatch (check timestamp, nonce, signature generation)
  2. Invalid consumer key or access token
  3. Tokens from different app than consumer key
  4. Tokens revoked or expired
  5. App permissions insufficient (need Read+Write)
```

---

## 🔧 Common Twitter/X OAuth Issues & Fixes

### Issue 1: "Unauthorized" with Generic Error

**Symptom**: 
```json
{
  "title": "Unauthorized",
  "status": 401,
  "detail": "Unauthorized"
}
```

**Possible Causes**:

#### A) **OAuth Signature Mismatch**
The most common cause. Check:
- ✅ Timestamp is current (not old or future)
- ✅ Nonce is unique for each request
- ✅ Signature base string is correct
- ✅ HMAC-SHA1 signature generation is correct
- ✅ Percent encoding follows RFC 3986

**How to verify**: Compare generated signature with Twitter's OAuth tool

#### B) **Wrong App Keys**
- Consumer Key (API Key) and Consumer Secret must be from same Twitter app
- Access Token and Access Secret must be from same Twitter app
- All 4 credentials must be from the SAME app

**Fix**: Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
1. Find your app
2. Copy **API Key** (Consumer Key)
3. Copy **API Secret** (Consumer Secret)
4. Generate new **Access Token & Secret**
5. Re-validate in admin panel with ALL 4 credentials

#### C) **Tokens from Different App**
**Symptom**: Consumer Key is from App A, but Access Tokens are from App B

**Fix**: Ensure all 4 credentials are from the same Twitter app

#### D) **Tokens Revoked or Expired**
**Symptom**: Credentials worked before, now fail

**Fix**: 
1. Go to Twitter Developer Portal
2. Regenerate Access Token & Secret
3. Update in admin panel

#### E) **Insufficient Permissions**
**Symptom**: App doesn't have Read+Write permissions

**Fix**: 
1. Go to Twitter Developer Portal → Your App → Settings
2. Change "App permissions" to **Read and Write**
3. Regenerate Access Token & Secret (required after permission change!)
4. Update in admin panel

---

### Issue 2: "Could not authenticate you"

**Symptom**:
```json
{
  "errors": [
    {
      "message": "Could not authenticate you",
      "code": 32
    }
  ]
}
```

**Causes**:
- Invalid credentials (typo, extra spaces, wrong encoding)
- Credentials not properly saved in KV

**Fix**:
1. Re-copy credentials from Twitter Developer Portal
2. Trim any extra spaces
3. Re-validate in admin panel

---

### Issue 3: Twitter API v2 vs v1.1

**Important**: We're using Twitter API v2 (`https://api.twitter.com/2/tweets`)

Requirements:
- ✅ OAuth 1.0a authentication (we're using this)
- ✅ App must have "Elevated" access (check in Developer Portal)
- ✅ App permissions must be "Read and Write" or "Read, Write, and Direct Messages"

**Check Access Level**:
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app
3. Check "Access Level" - should say "Elevated"
4. If says "Essential", you need to request Elevated access

---

## 🛠️ Step-by-Step Fix Guide

### For Both Twitter Accounts (@AI_Now_v2u and @ainow43)

#### Step 1: Verify App Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. For each app (AI_Now_v2u, ainow43):
   - ✅ Check "Access Level" = **Elevated**
   - ✅ Check "App permissions" = **Read and Write**
   - ✅ Check "Type of App" = Appropriate for your use case

#### Step 2: Regenerate All Credentials

**Important**: After changing permissions, you MUST regenerate tokens!

1. Go to app → Keys and tokens
2. Click **Regenerate** on API Key & Secret
3. Copy **API Key** (Consumer Key)
4. Copy **API Key Secret** (Consumer Secret)
5. Click **Regenerate** on Access Token & Secret
6. Copy **Access Token**
7. Copy **Access Token Secret**

#### Step 3: Update in Admin Panel

1. Go to `https://v2u.ai/admin/social-posting`
2. Find Twitter section for the account
3. Enter ALL 4 credentials:
   - App Key (Consumer Key): `xxxxx`
   - App Secret (Consumer Secret): `xxxxx`
   - Access Token: `xxxxx-xxxxx`
   - Access Secret: `xxxxx`
4. Click **"Validate Twitter"**

#### Step 4: Test with Debug Endpoint

```bash
# Test @AI_Now_v2u
curl -X POST https://v2u.ai/api/automation/test-twitter \
  -H "Content-Type: application/json" \
  -d '{"platformId": "twitter", "text": "Test from AI_Now"}'

# Test @ainow43
curl -X POST https://v2u.ai/api/automation/test-twitter \
  -H "Content-Type: application/json" \
  -d '{"platformId": "twitter-ainow", "text": "Test from ainow43"}'
```

#### Step 5: Check Logs

If still failing:
1. Go to Vercel Dashboard → Project → Deployments
2. Click latest deployment
3. View Function Logs
4. Look for `[Twitter OAuth]` entries
5. Check the debug output

---

## 📋 Debugging Checklist

Use this checklist when troubleshooting:

- [ ] All 4 credentials present and correct length
- [ ] App has **Elevated** access (not Essential)
- [ ] App permissions are **Read and Write** (not Read-only)
- [ ] Consumer Key and Secret are from same app
- [ ] Access Token and Secret are from same app
- [ ] All 4 credentials are from SAME Twitter app
- [ ] Credentials were regenerated AFTER permission changes
- [ ] No extra spaces or line breaks in credentials
- [ ] Credentials validated successfully in admin panel
- [ ] Test endpoint returns detailed debug info
- [ ] Vercel logs show OAuth signature generation

---

## 🎯 Expected Debug Output (Success)

When everything works, you'll see:

```
[Twitter OAuth] Starting post request
[Twitter OAuth] Tweet text: Test tweet...
[Twitter OAuth] Credentials present: { all true, correct lengths }
[Twitter OAuth] Authorization header (first 100 chars): OAuth oauth_consumer_key=...
[Twitter OAuth] Making POST request to: https://api.twitter.com/2/tweets
[Twitter OAuth] Response status: 201
[Twitter OAuth] Response headers: { content-type: "application/json", ... }
[Twitter OAuth] Raw response body: {"data":{"id":"1234567890","text":"Test tweet..."}}
[Twitter OAuth] Parsed JSON response: { data: { id: "1234567890", text: "..." } }
[Twitter OAuth] ✅ Tweet posted successfully, ID: 1234567890
```

---

## 🔗 Resources

- [Twitter OAuth 1.0a](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)
- [Twitter API v2 Tweet Creation](https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets)
- [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
- [OAuth Signature Tool](https://oauth-playground.glitch.me/) - Test signature generation

---

## 📞 Next Steps

1. ✅ Run test endpoint to get detailed debug info
2. ✅ Check Vercel logs for full OAuth flow
3. ✅ Verify app permissions in Twitter Developer Portal
4. ✅ Regenerate credentials if needed
5. ✅ Test again with new credentials

The enhanced debugging will show you EXACTLY what Twitter's API is returning and why it's failing! 🔍
