# Twitter/X OAuth Debug - Quick Reference

## 🚀 Quick Test Commands

### Check Credential Status
```bash
curl https://v2u.ai/api/automation/test-twitter
```

### Test Posting (twitter account)
```bash
curl -X POST https://v2u.ai/api/automation/test-twitter \
  -H "Content-Type: application/json" \
  -d '{"platformId": "twitter", "text": "Debug test"}'
```

### Test Posting (twitter-ainow account)
```bash
curl -X POST https://v2u.ai/api/automation/test-twitter \
  -H "Content-Type: application/json" \
  -d '{"platformId": "twitter-ainow", "text": "Debug test"}'
```

---

## 🔍 What to Look For

### Success (201)
```json
{
  "success": true,
  "tweetId": "1234567890",
  "debugInfo": {
    "responseStatus": 201,
    "success": true
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": "Unauthorized",
  "debugInfo": {
    "responseStatus": 401,
    "rawResponse": "...",
    "possibleCauses": [...]
  }
}
```

---

## 🛠️ Common Fixes

### 1. "Unauthorized" Error
**Cause**: OAuth signature issue or wrong credentials

**Fix**:
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app
3. Check "App permissions" = **Read and Write**
4. **Regenerate** Access Token & Secret
5. Copy all 4 credentials (API Key, API Secret, Access Token, Access Secret)
6. Update in admin panel
7. Test again

### 2. "Could not authenticate you"
**Cause**: Invalid credentials

**Fix**: Re-copy credentials from Twitter portal (check for extra spaces)

### 3. App Permissions Issue
**Cause**: App is Read-only

**Fix**:
1. Change app to "Read and Write"
2. **MUST regenerate tokens** after permission change
3. Update credentials in admin panel

---

## 📊 Debug Info Explained

The test endpoint returns full debug info:

```json
{
  "debugInfo": {
    "credentials": {
      "consumerKeyLength": 25,      // Should be ~25
      "accessTokenLength": 50,      // Should be ~50
      "consumerKeyPreview": "abc..."  // First 10 chars
    },
    "responseStatus": 401,          // HTTP status
    "rawResponse": "...",           // Exact API response
    "parsedResponse": {...},        // JSON parsed
    "possibleCauses": [...]         // Why it might fail
  }
}
```

**Check**:
- Credential lengths look correct?
- Response status (want 201, not 401)
- Raw response for Twitter's exact error
- Possible causes for hints

---

## 🎯 Fast Diagnosis

### Run This Now:
```bash
# Check both accounts
curl https://v2u.ai/api/automation/test-twitter

# Test posting
curl -X POST https://v2u.ai/api/automation/test-twitter \
  -H "Content-Type: application/json" \
  -d '{"platformId": "twitter", "text": "Test"}'
```

### Then:
1. ✅ Check response for `"success": true/false`
2. ✅ Look at `debugInfo.responseStatus` (want 201)
3. ✅ Read `debugInfo.rawResponse` for Twitter's error
4. ✅ Check `debugInfo.possibleCauses` for hints
5. ✅ Check Vercel logs for full OAuth flow

---

## 📝 What Changed

**Before**:
```
Error: "Unauthorized"
// No details, can't diagnose
```

**After**:
```
Error: "Unauthorized"
Debug Info:
- Response status: 401
- Raw response: {"title":"Unauthorized","detail":"..."}
- OAuth header preview: "OAuth oauth_consumer_key=..."
- Credential lengths: 25, 50, 50, 45
- Possible causes: [5 specific reasons]
- Full request/response logged to Vercel
```

---

## 🎉 Next Steps

1. Run test endpoint to see exact error
2. Check debug info for root cause
3. Follow fix steps based on error
4. Re-test until success
5. Then "Post Latest Now" should work!

Full guide: `docs/twitter-oauth-debug.md`
