#!/bin/bash
# Test R2 Integration for Podcast Dashboard

echo "🧪 Testing R2 Integration for Podcast Dashboard"
echo "================================================"
echo ""

# Test 1: Check if dev server is running
echo "1️⃣ Testing development server..."
DEV_SERVER=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/")
if [ "$DEV_SERVER" = "200" ]; then
  echo "✅ Development server is running"
else
  echo "❌ Development server not accessible (HTTP $DEV_SERVER)"
  echo "   Run: npm run dev"
  exit 1
fi

# Test 2: Test episodes API endpoint  
echo ""
echo "2️⃣ Testing /api/episodes endpoint..."
EPISODES_RESPONSE=$(curl -s "http://localhost:3000/api/episodes")
EPISODES_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/episodes")

echo "📊 Response Code: $EPISODES_CODE"
echo "📄 Response Preview:"
echo "$EPISODES_RESPONSE" | head -c 300
echo "..."
echo ""

# Check if R2 is configured
if echo "$EPISODES_RESPONSE" | grep -q "R2 not configured"; then
  echo "⚠️  R2 credentials not configured - using fallback data"
  echo "   This is expected for testing without R2 credentials"
elif echo "$EPISODES_RESPONSE" | grep -q "success.*true"; then
  echo "✅ R2 integration working!"
  EPISODE_COUNT=$(echo "$EPISODES_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "📺 Found $EPISODE_COUNT episodes in R2 bucket"
else
  echo "⚠️  R2 integration has issues"
fi

# Test 3: Test podcast dashboard page
echo ""
echo "3️⃣ Testing podcast dashboard page..."
DASHBOARD_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/podcast-dashboard")
if [ "$DASHBOARD_CODE" = "200" ]; then
  echo "✅ Podcast dashboard is accessible"
else
  echo "❌ Podcast dashboard issue (HTTP $DASHBOARD_CODE)"
fi

# Test 4: Test the canonical normalization episode
echo ""
echo "4️⃣ Testing canonical episode endpoint..."
CANONICAL_EPISODE="http://localhost:3000/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4"
CANONICAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer test-token-12345" "$CANONICAL_EPISODE")

echo "🎬 Testing: $CANONICAL_EPISODE"
echo "📊 Response Code: $CANONICAL_CODE"

if [ "$CANONICAL_CODE" = "302" ] || [ "$CANONICAL_CODE" = "301" ]; then
  echo "✅ Canonical episode accessible (redirecting to signed URL)"
elif [ "$CANONICAL_CODE" = "200" ]; then
  echo "✅ Canonical episode accessible (direct access)"
elif [ "$CANONICAL_CODE" = "404" ]; then
  echo "⚠️  Canonical episode not found (may need R2 credentials)"
else
  echo "❌ Canonical episode issue"
fi

echo ""
echo "🎯 Summary:"
echo "============"
echo "Development Server: $([ "$DEV_SERVER" = "200" ] && echo "✅ OK" || echo "❌ ISSUE")"
echo "Episodes API: $([ "$EPISODES_CODE" = "200" ] && echo "✅ OK" || echo "❌ ISSUE")"
echo "Podcast Dashboard: $([ "$DASHBOARD_CODE" = "200" ] && echo "✅ OK" || echo "❌ ISSUE")"
echo "Canonical Episode: $([ "$CANONICAL_CODE" = "302" ] || [ "$CANONICAL_CODE" = "301" ] || [ "$CANONICAL_CODE" = "200" ] && echo "✅ OK" || echo "⚠️ CHECK")"

echo ""
echo "📋 Next Steps:"
echo "1. Visit: http://localhost:3000/podcast-dashboard"
echo "2. Check the data source indicator (Live R2 Data vs Demo Data)"
echo "3. Test episode playback with the ▶️ Play buttons"
echo "4. Verify the responsive grid layout (1, 3, 4 columns)"
echo "5. Confirm v2u theme colors (#dfdfdf cards, v2u blue/purple)"