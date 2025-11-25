#!/bin/bash
# Fix Rumble and Spotify configurations in production KV
# Uses the working GET endpoint to confirm they're updated

API_URL="https://www.v2u.us/api/admin/level1-config"

echo "🔧 Fixing Level 1 configurations..."
echo ""

# Update Rumble with correct channelUrl
echo "📹 Updating Rumble configuration..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"platform":"rumble","config":{"enabled":true,"configured":true,"credentials":{"channelUrl":"https://rumble.com/c/c-7188913","channelName":"V2U Now"}}}'
echo ""
echo ""

# Update Spotify with correct showId
echo "🎧 Updating Spotify configuration..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"platform":"spotify","config":{"enabled":true,"configured":true,"credentials":{"showId":"1NSlm2dueS2O2FFmW3rSZ3","showName":"AI-Now with Alex and Jessica"}}}'
echo ""
echo ""

echo "✅ Verifying updated configs..."
curl -s "$API_URL" | grep -o '"rumble":{[^}]*}' | head -1
echo ""
curl -s "$API_URL" | grep -o '"spotify":{[^}]*}' | head -1
echo ""
echo ""
echo "🎯 Configs updated! Next cron run will check all 3 sources."
