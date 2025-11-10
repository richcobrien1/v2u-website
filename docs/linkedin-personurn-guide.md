# How to Get LinkedIn personUrn

## ✅ FIXED! Automatic Fetching Implemented

The system now automatically fetches your LinkedIn `personUrn` during credential validation.

---

## 📖 What is personUrn?

The `personUrn` is your unique LinkedIn identifier in the format:
```
urn:li:person:XXXXXXX
```

LinkedIn requires this URN when posting to identify who is making the post.

---

## 🔧 How It Works Now (Automatic)

### 1. **API Endpoint Used**
```
GET https://api.linkedin.com/v2/userinfo
Authorization: Bearer {accessToken}
```

### 2. **Response Format**
```json
{
  "sub": "urn:li:person:XXXXXXX",  ← This is your personUrn!
  "name": "Your Name",
  "email": "your-email@example.com"
}
```

### 3. **Implementation**
- File: `lib/credential-validator.ts`
- Function: `validateLinkedInCredentials()`
- During validation, the function:
  1. Validates token format
  2. Calls `/v2/userinfo` endpoint
  3. Extracts the `sub` field (personUrn)
  4. Returns it with validation result
- File: `app/api/automation/config/route.ts`
- Saves the personUrn to credentials automatically

---

## 🎯 What You Need To Do

### Step 1: Re-Authorize LinkedIn (IMPORTANT!)

Your current LinkedIn token needs **OpenID Connect** scopes to access `/v2/userinfo`.

**Required Scopes**:
- `openid` - Access to OpenID Connect
- `profile` - Access to profile data (for personUrn)
- `email` - Access to email (for verification)
- `w_member_social` - Post to LinkedIn (you already have this)

**How to Get New Token**:

1. Go to [LinkedIn OAuth 2.0 Tools](https://www.linkedin.com/developers/tools/oauth)

2. Use this authorization URL:
```
https://www.linkedin.com/oauth/v2/authorization?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=openid%20profile%20email%20w_member_social
```

3. After user authorizes, exchange code for token:
```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=YOUR_REDIRECT_URI"
```

4. You'll get a new access token with OpenID scopes

### Step 2: Re-Validate in Admin Panel

1. Go to: `https://v2u.ai/admin/social-posting`
2. Find LinkedIn section
3. Enter your new credentials:
   - Client ID: `86n4g462pt6dix` (same as before)
   - Client Secret: (your secret)
   - Access Token: (NEW token with OpenID scopes)
4. Click **"Validate LinkedIn"**

The system will now:
- ✅ Validate your token
- ✅ Call `/v2/userinfo` endpoint
- ✅ Extract your personUrn automatically
- ✅ Save it to credentials
- ✅ Display success message

### Step 3: Test Posting

1. Click **"Post Latest Now"**
2. LinkedIn should now post successfully!

---

## 🔍 Troubleshooting

### Error: "Access token lacks r_liteprofile permission"

**Cause**: Your token doesn't have OpenID Connect scopes

**Solution**: Re-authorize with `openid profile email w_member_social` scopes (see Step 1 above)

### Error: "Could not retrieve personUrn from LinkedIn API"

**Cause**: API response missing `sub` field

**Solution**: 
1. Check your LinkedIn app has OpenID Connect enabled
2. Verify token is valid (not expired)
3. Re-authorize if needed

### Error: "Failed to fetch user info: 403"

**Cause**: Token lacks required permissions

**Solution**: Re-authorize with proper scopes (see Step 1)

---

## 📝 Alternative: Manual personUrn

If you can't get OpenID Connect working, you can find your personUrn manually:

### Method 1: From LinkedIn Profile URL
Your profile URL is like: `https://www.linkedin.com/in/yourname/`

But you need the numeric ID, not the vanity name.

### Method 2: Using LinkedIn API Inspector

1. Go to: https://www.linkedin.com/developers/tools/api-explorer
2. Call `/v2/me` with your token
3. Look for your ID in the response

### Method 3: From Previous Posts

If you've successfully posted before:
1. Look at a previous post's API response
2. Find the `author` field
3. Copy the `urn:li:person:XXXXXXX` value

Then manually add it in admin panel when validating credentials.

---

## ✨ What Changed

### Before
```typescript
// Only validated token format
// Never fetched personUrn
return { valid: true };
```

### After
```typescript
// Validates token AND fetches personUrn
const response = await fetch('https://api.linkedin.com/v2/userinfo', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
const userInfo = await response.json();
return { 
  valid: true, 
  personUrn: userInfo.sub  // ← Automatically fetched!
};
```

### Config Route Enhancement
```typescript
case 'linkedin': {
  const result = await validateLinkedInCredentials(...);
  if (result.valid && result.personUrn) {
    credentials.personUrn = result.personUrn;  // ← Auto-saved!
  }
}
```

---

## 🎉 Expected Results

After re-authorizing with OpenID scopes:

**Before**:
```json
{
  "linkedin": {
    "configured": false,  // ← Not configured
    "credentials": {
      "accessToken": "...",
      // personUrn: MISSING!
    }
  }
}
```

**After**:
```json
{
  "linkedin": {
    "configured": true,  // ← Now configured!
    "validated": true,
    "credentials": {
      "accessToken": "...",
      "personUrn": "urn:li:person:ABC123XYZ"  // ← Automatically fetched!
    }
  }
}
```

**Posting Result**:
```
✅ LinkedIn post successful!
Post ID: urn:li:share:7890...
```

---

## 📚 References

- [LinkedIn OAuth 2.0](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn OpenID Connect](https://docs.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
- [LinkedIn User Info Endpoint](https://docs.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2#api-request-to-retreive-member-details)

---

## 🚀 Next Steps

1. ✅ Get new LinkedIn token with OpenID scopes
2. ✅ Re-validate in admin panel
3. ✅ System automatically fetches personUrn
4. ✅ Test posting - should work!

That's it! The system now handles everything automatically once you have the right token scopes. 🎊
