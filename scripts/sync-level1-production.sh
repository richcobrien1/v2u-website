#!/bin/bash
# Sync Level 1 configs (Rumble & Spotify) to production Vercel KV

API_URL="https://www.v2u.us/api/admin/level1-config"

echo "🚀 Syncing Level 1 configurations to production..."
echo ""

# Rumble
echo "📹 Updating Rumble configuration..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "rumble",
    "config": {
      "enabled": true,
      "configured": true,
      "credentials": {
        "channelUrl": "https://rumble.com/c/c-7188913",
        "channelName": "V2U Now"
      }
    }
  }'
echo ""
echo ""

# Spotify
echo "🎧 Updating Spotify configuration..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "spotify",
    "config": {
      "enabled": true,
      "configured": true,
      "credentials": {
        "showId": "1NSlm2dueS2O2FFmW3rSZ3",
        "showName": "AI-Now with Alex and Jessica"
      }
    }
  }'
echo ""
echo ""

echo "✅ Sync complete! Verifying..."
echo ""

# Verify
curl -s "$API_URL" | grep -o '"rumble":\|"spotify":\|"configured":true' | head -10

echo ""
echo "🎯 Level 1 sources should now include Rumble and Spotify"
echo "⏰ Next hourly cron will check all three sources"
