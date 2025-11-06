# X (Twitter) API Setup Guide for Social Posting Automation

## 🎯 Overview
This guide will help you set up X (Twitter) API integration for automated posting of your AI-Now episodes.

## 📋 Prerequisites
- X Developer Account
- X App created with OAuth 2.0 settings
- Node.js installed

## 🔧 Current App Configuration

Based on your X app settings:

### App Info
- **Callback URI**: `http://localhost:3003/callback` ✅
- **Website URL**: `https://www.v2u.us` ✅
- **Organization**: v2u ✅

## 🚀 Step-by-Step Setup

### Step 1: Get Your OAuth 2.0 Credentials

1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app
3. Navigate to "Keys and tokens" section
4. Under **OAuth 2.0 Client ID and Client Secret**:
   - Copy your **Client ID** (this is your API Key)
   - Copy your **Client Secret** (this is your API Secret)
   - **⚠️ Important**: Save the Client Secret immediately - you won't be able to see it again!

### Step 2: Configure App Permissions

1. In your X app settings, go to "User authentication settings"
2. Click "Set up" if not already configured
3. Select **OAuth 2.0** as the authentication method
4. Enable these permissions:
   - ✅ **Read** - Required for getting user info
   - ✅ **Write** - Required for posting tweets
5. Set the **Callback URI**: `http://localhost:3003/callback`
6. Click "Save"

### Step 3: Update twitter-config.json

Navigate to the `news-collector` directory and update `twitter-config.json`:

```json
{
  "apiKey": "YOUR_OAUTH2_CLIENT_ID_HERE",
  "apiSecret": "YOUR_OAUTH2_CLIENT_SECRET_HERE"
}
```

**Replace:**
- `YOUR_OAUTH2_CLIENT_ID_HERE` with your OAuth 2.0 Client ID
- `YOUR_OAUTH2_CLIENT_SECRET_HERE` with your OAuth 2.0 Client Secret

### Step 4: Install Dependencies

```bash
cd news-collector
npm install
```

Required packages:
- `twitter-api-v2` - Official Twitter API v2 client

### Step 5: Authenticate Your Account

Run the authentication flow to get user access tokens:

**Quick Setup (Bash):**
```bash
./setup-x-auth.sh
```

**Or Manual:**
```bash
node twitter-poster.js auth
```

This will:
1. Start a local server on `http://localhost:3003`
2. Open your browser to authorize the app
3. Redirect back with an authorization code
4. Automatically exchange the code for access tokens
5. Save tokens to `twitter-tokens.json`

**⚠️ Security Note**: The `twitter-tokens.json` file contains sensitive credentials. Never commit it to git!

### Step 6: Test the Connection

```bash
node twitter-poster.js test
```

You should see:
```
✅ Twitter API connection successful!
👤 Connected as: @your_username (Your Name)
```

### Step 7: Make a Test Post

Create a test metadata file (`test-tweet.json`):

```json
{
  "title": "Test Episode - AI Now",
  "description": "Testing automated posting to X platform",
  "brand": "ai-now",
  "contentType": "free",
  "playlistId": "test-123"
}
```

Post it:

```bash
node twitter-poster.js post '{"title":"Test Episode - AI Now","description":"Testing automated posting","brand":"ai-now","contentType":"free"}'
```

## 🔐 Security Best Practices

### Files to Keep Secret (Already in .gitignore)
- ✅ `twitter-config.json` - Contains OAuth 2.0 credentials
- ✅ `twitter-tokens.json` - Contains user access tokens
- ✅ `.env.local` - Contains all API keys

### Token Refresh
OAuth 2.0 tokens expire after 2 hours. The system automatically:
- Checks token expiration before posting
- Uses refresh tokens to get new access tokens
- Updates `twitter-tokens.json` with fresh tokens

## 📝 Integration with Social Posting System

### For Website Admin Dashboard

Update `website/.env.local` with your Twitter credentials:

```bash
# Twitter/X API Credentials
TWITTER_API_KEY=your_oauth2_client_id_here
TWITTER_API_SECRET=your_oauth2_client_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

**To get Access Token & Secret:**
1. After running `node twitter-poster.js auth`, check `twitter-tokens.json`
2. Copy the `accessToken` value to `TWITTER_ACCESS_TOKEN`
3. Copy the `refreshToken` value to `TWITTER_ACCESS_TOKEN_SECRET`

### For Automated Posting

The system will automatically use these credentials when posting from:
- `/admin/social-posting` (manual posting)
- `/api/social-schedule` (scheduled posting)
- Cross-platform posting scripts

## 🎯 What Gets Posted

When posting to X, the system automatically generates optimized content:

### Free Episode Example:
```
📺 [Episode Title]

Stay updated with the latest in #ArtificialIntelligence

[Description excerpt]...

▶️ Watch now: [YouTube Link]

#AI #ArtificialIntelligence #MachineLearning #AINow #AIResearch #TechNews
```

### Premium Episode Example:
```
🔒 New Premium Episode: [Title]

Latest developments in #AI and #MachineLearning!

[Description excerpt]...

▶️ Watch now: [YouTube Link]

#AI #ArtificialIntelligence #MachineLearning #AINow #AIResearch #TechNews
```

**Character limit**: Auto-truncated to 280 characters

## 🔄 Token Management

### When Tokens Expire

Tokens expire after 2 hours. To refresh:

**Option 1: Re-authenticate**
```bash
node twitter-poster.js auth
```

**Option 2: Automatic Refresh** (Built-in)
The system checks token validity before each post and automatically refreshes if needed.

### Check Token Status

The `twitter-tokens.json` file contains:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresAt": 1730123456789
}
```

- `expiresAt` is a timestamp (milliseconds)
- If current time > `expiresAt`, re-authentication needed

## 🐛 Troubleshooting

### Error: "Twitter config not found"
- Make sure `twitter-config.json` exists in `news-collector/`
- Check the file has valid JSON syntax

### Error: "Callback URI mismatch"
- Verify `http://localhost:3003/callback` is set in your X app settings
- Make sure there are no typos or extra spaces

### Error: "Invalid authentication credentials"
- Regenerate your OAuth 2.0 Client ID and Secret
- Update `twitter-config.json` with new credentials
- Re-run `node twitter-poster.js auth`

### Error: "Token has expired"
- Run `node twitter-poster.js auth` to get fresh tokens
- The system should auto-refresh, but manual re-auth fixes issues

### Authentication page doesn't open
- Manually copy the URL from terminal and paste in browser
- Make sure port 3003 is not in use by another app

### Posts not appearing on X
- Check you have Write permissions enabled in app settings
- Verify account is not suspended or rate-limited
- Check X API status: https://api.twitterstat.us/

## 📊 Usage Examples

### Single Episode Post
```bash
node twitter-poster.js post '{"title":"AI Breakthrough 2024","description":"New developments in machine learning","brand":"ai-now","contentType":"free"}'
```

### From Cross-Platform Script
```javascript
const TwitterPoster = require('./twitter-poster');

const poster = new TwitterPoster();
await poster.initialize();
await poster.postVideoTweet({
  title: "AI Now Episode 42",
  description: "Deep dive into neural networks",
  brand: "ai-now",
  contentType: "premium"
});
```

### From News Collector Workflow
The `cross-platform-reposter.js` automatically includes Twitter when posting episodes.

## 🎉 Next Steps

1. ✅ Configure OAuth 2.0 credentials
2. ✅ Authenticate with `node twitter-poster.js auth`
3. ✅ Test connection with `node twitter-poster.js test`
4. ✅ Make test post to verify everything works
5. ✅ Integrate with admin dashboard
6. ✅ Set up automated posting workflow

## 📚 Additional Resources

- [X API Documentation](https://developer.twitter.com/en/docs)
- [OAuth 2.0 Guide](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [twitter-api-v2 Library](https://github.com/PLhery/node-twitter-api-v2)
- [Rate Limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)

## 🔑 Quick Reference

### Commands
```bash
# Authenticate
node twitter-poster.js auth

# Test connection
node twitter-poster.js test

# Post tweet
node twitter-poster.js post '<json>'
```

### Required Scopes
- `tweet.read` - Read tweets
- `tweet.write` - Post tweets
- `users.read` - Get user info

### Port Configuration
- Auth callback server: `http://localhost:3003`
- Make sure this matches your X app settings!

---

**Last Updated**: November 6, 2025
**Status**: ✅ Ready for production use
