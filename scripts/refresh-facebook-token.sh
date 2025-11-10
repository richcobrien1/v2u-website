#!/bin/bash
# Facebook Token Refresh Script

APP_ID="1385433963019785"
APP_SECRET="8495b40412e90e4e136c048c9ff15519"

# Short-lived token from Graph API Explorer
SHORT_TOKEN="$1"

if [ -z "$SHORT_TOKEN" ]; then
  echo "Usage: ./refresh-facebook-token.sh <short-lived-token>"
  echo ""
  echo "Steps:"
  echo "1. Go to https://developers.facebook.com/tools/explorer/"
  echo "2. Select app 'AI-Now' (1385433963019785)"
  echo "3. Click 'Get Page Access Token'"
  echo "4. Select page and permissions (pages_manage_posts, pages_read_engagement)"
  echo "5. Copy the generated token"
  echo "6. Run: ./refresh-facebook-token.sh <token>"
  exit 1
fi

echo "🔄 Exchanging for long-lived token..."
RESPONSE=$(curl -s "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=$APP_ID&client_secret=$APP_SECRET&fb_exchange_token=$SHORT_TOKEN")

LONG_TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -z "$LONG_TOKEN" ]; then
  echo "❌ Failed to get long-lived token"
  echo "$RESPONSE"
  exit 1
fi

echo "✅ Long-lived token generated!"
echo ""
echo "Add to Vercel:"
echo "FACEBOOK_ACCESS_TOKEN_V2U=\"$LONG_TOKEN\""
echo ""
echo "Token expires in ~60 days"
