# Threads User ID Auto-Fetching Guide

## ✅ Implementation Complete

Threads now automatically fetches and saves your user ID during credential validation.

---

## 🎯 What Was Implemented

### 1. **Threads Credential Validator**
**File**: `lib/credential-validator.ts`

New function: `validateThreadsCredentials(accessToken)`

- ✅ Validates access token format
- ✅ Calls Threads Graph API `/v1.0/me` endpoint
- ✅ Fetches user ID automatically
- ✅ Fetches username (for post URLs)
- ✅ Returns user data with validation result

### 2. **Config Route Enhancement**
**File**: `app/api/automation/config/route.ts`

- ✅ Imports and uses `validateThreadsCredentials`
- ✅ Automatically saves userId to credentials
- ✅ Automatically saves username to credentials
- ✅ Logs success with user details

### 3. **Post-to-Threads Optimization**
**File**: `app/api/automation/post-latest/route.ts`

- ✅ Uses saved userId (no API call needed)
- ✅ Falls back to fetching if userId missing
- ✅ Enhanced logging for debugging
- ✅ Builds proper post URLs with username

---

## 🔑 How It Works

### Validation Flow
```
User validates Threads in admin panel
  ↓
System calls: graph.threads.net/v1.0/me?fields=id,username
  ↓
API returns: { id: "123456789", username: "yourname" }
  ↓
System saves userId + username to credentials
  ↓
Ready to post!
```

### Posting Flow (Optimized)
```
Before (slow):
Post triggered → Fetch user ID from API → Create thread → Publish
(2 API calls per post)

After (fast):
Post triggered → Use saved user ID → Create thread → Publish
(1 API call per post, or 0 if userId in credentials)
```

---

## 🚀 How to Use

### Step 1: Get Threads Access Token

**Important**: Threads uses Meta's platform, so you need a Facebook/Instagram Business account.

**Option A: Use Facebook Graph API Explorer**
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Click "Generate Access Token"
4. Select permissions:
   - ✅ `threads_basic` - Basic Threads access
   - ✅ `threads_content_publish` - Post to Threads
   - ✅ `threads_manage_insights` - View analytics (optional)
5. Copy the access token

**Option B: Use Facebook Business Suite**
1. Go to your Instagram Professional account settings
2. Navigate to "Threads Settings"
3. Generate access token for your app

---

### Step 2: Validate in Admin Panel

1. Go to `https://v2u.ai/admin/social-posting`
2. Find **Threads** section
3. Enter:
   - **Access Token**: Paste token from Step 1
4. Click **"Validate Threads"**

**The system will automatically**:
- ✅ Verify token works
- ✅ Fetch your Threads user ID
- ✅ Fetch your Threads username
- ✅ Save both to credentials
- ✅ Show success message

---

### Step 3: Test Posting

1. Click **"Post Latest Now"**
2. Check Threads - post should appear! ✅

---

## 🔍 What the Validator Returns

### Success Response
```json
{
  "valid": true,
  "userId": "17841458247153387",
  "username": "yourusername"
}
```

### Saved Credentials
```json
{
  "threads": {
    "validated": true,
    "credentials": {
      "accessToken": "IGQWRQabc...",
      "userId": "17841458247153387",     // ← Auto-fetched!
      "username": "yourusername"          // ← Auto-fetched!
    }
  }
}
```

---

## 🛠️ Troubleshooting

### Error: "Missing Threads access token"
**Cause**: No token provided

**Fix**: Enter access token in admin panel

---

### Error: "Invalid or expired access token"
**Cause**: Token expired or doesn't have correct permissions

**Fix**: 
1. Generate new token with `threads_basic` and `threads_content_publish` permissions
2. Re-validate in admin panel

---

### Error: "Could not retrieve user ID from Threads API"
**Cause**: API response missing `id` field

**Fix**:
1. Verify token has `threads_basic` permission
2. Verify your Instagram account is linked to Threads
3. Verify token is not expired
4. Re-generate token and try again

---

### Error: "Failed to get user info: 403"
**Cause**: Token lacks required permissions

**Fix**: Re-generate token with correct permissions:
- ✅ `threads_basic`
- ✅ `threads_content_publish`

---

## 📊 Expected Results

### Before Implementation
```json
{
  "threads": {
    "credentials": {
      "accessToken": "IGQWRQabc..."
      // ← Missing userId!
    }
  },
  "lastPostResult": {
    "error": "Failed to get Threads user ID"
  }
}
```

### After Validation
```json
{
  "threads": {
    "validated": true,
    "credentials": {
      "accessToken": "IGQWRQabc...",
      "userId": "17841458247153387",     // ← Auto-fetched!
      "username": "yourusername"          // ← Auto-fetched!
    }
  }
}
```

### After Successful Post
```json
{
  "success": true,
  "postId": "987654321",
  "postUrl": "https://www.threads.net/@yourusername/post/987654321"
}
```

---

## 🎯 Benefits

### 1. **No Manual Entry**
- ❌ Before: Had to manually find and enter user ID
- ✅ After: System fetches it automatically

### 2. **Faster Posting**
- ❌ Before: Fetched user ID on every post (extra API call)
- ✅ After: Uses saved user ID (no extra call)

### 3. **Better URLs**
- ❌ Before: Generic post URLs
- ✅ After: Proper URLs with username

### 4. **Automatic Validation**
- ❌ Before: Token format only
- ✅ After: Verifies token works and fetches data

---

## 🔗 Threads API Details

### API Endpoints Used

**User Info** (Validation):
```
GET https://graph.threads.net/v1.0/me
  ?fields=id,username,name,threads_profile_picture_url
  &access_token={token}

Response:
{
  "id": "17841458247153387",
  "username": "yourusername",
  "name": "Your Display Name"
}
```

**Create Thread** (Posting):
```
POST https://graph.threads.net/v1.0/{user-id}/threads
Body: {
  "media_type": "TEXT",
  "text": "Your post content",
  "access_token": "{token}"
}
```

**Publish Thread** (Posting):
```
POST https://graph.threads.net/v1.0/{user-id}/threads_publish
Body: {
  "creation_id": "{media-id}",
  "access_token": "{token}"
}
```

---

## 📝 Token Requirements

### Required Permissions
- ✅ `threads_basic` - Access basic Threads profile info
- ✅ `threads_content_publish` - Create and publish threads

### Optional Permissions
- `threads_manage_insights` - View thread analytics
- `threads_manage_replies` - Manage replies to threads

### Token Type
- Long-lived access tokens recommended (60 days)
- Can be refreshed before expiration

---

## 🎉 Summary

### What You Need To Do
1. ✅ Get Threads access token with correct permissions
2. ✅ Validate in admin panel
3. ✅ System automatically fetches and saves user ID
4. ✅ Done! Ready to post

### What The System Does Automatically
1. ✅ Validates token works
2. ✅ Fetches user ID from Threads API
3. ✅ Fetches username for better URLs
4. ✅ Saves both to credentials
5. ✅ Uses saved data for fast posting

---

## 📚 References

- [Threads API Documentation](https://developers.facebook.com/docs/threads)
- [Threads Publishing API](https://developers.facebook.com/docs/threads/posts)
- [Meta for Developers](https://developers.facebook.com/)

---

**Status**: ✅ Fully implemented and deployed

Your Threads posting now has automatic user ID fetching and optimized performance! 🚀
