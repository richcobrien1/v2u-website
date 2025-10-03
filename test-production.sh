#!/bin/bash
# Post-deployment testing script for canonical normalization system

DOMAIN="${1:-your-domain.vercel.app}"
echo "🚀 Post-Deployment Testing for: $DOMAIN"
echo "📅 $(date)"
echo ""

# Test 1: Basic site accessibility
echo "🌐 Testing basic site accessibility..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Main site is accessible (HTTP $HTTP_CODE)"
else
  echo "❌ Main site issue (HTTP $HTTP_CODE)"
fi

# Test 2: Podcast dashboard
echo "📺 Testing podcast dashboard..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/podcast-dashboard")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Podcast dashboard is accessible (HTTP $HTTP_CODE)"
else
  echo "❌ Podcast dashboard issue (HTTP $HTTP_CODE)"
fi

# Test 3: R2 test interface
echo "🧪 Testing R2 test interface..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/r2-test")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ R2 test interface is accessible (HTTP $HTTP_CODE)"
else
  echo "❌ R2 test interface issue (HTTP $HTTP_CODE)"
fi

# Test 4: API health check
echo "⚙️  Testing API endpoints..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/api/debug")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ API endpoints are responsive (HTTP $HTTP_CODE)"
else
  echo "❌ API endpoints issue (HTTP $HTTP_CODE)"
fi

# Test 5: Canonical normalization endpoint
echo "🎬 Testing canonical normalization endpoint..."
TEST_TOKEN="test-token-production-$(date +%s)"
CANONICAL_ENDPOINT="https://$DOMAIN/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4"

echo "🔗 Testing: $CANONICAL_ENDPOINT"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  "$CANONICAL_ENDPOINT")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "📊 Canonical endpoint response: HTTP $HTTP_CODE"
if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "301" ]; then
  echo "✅ Canonical normalization working (redirecting to signed URL)"
elif [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Canonical normalization working (direct access)"
elif [ "$HTTP_CODE" = "404" ]; then
  echo "⚠️  File not found - may need environment variables in production"
  echo "   Response: $(echo "$BODY" | head -c 200)..."
else
  echo "❌ Canonical normalization issue"
  echo "   Response: $(echo "$BODY" | head -c 200)..."
fi

echo ""
echo "🎯 Testing Summary:"
echo "================================"
echo "Main Site: $([ $(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/") = "200" ] && echo "✅ OK" || echo "❌ ISSUE")"
echo "Podcast Dashboard: $([ $(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/podcast-dashboard") = "200" ] && echo "✅ OK" || echo "❌ ISSUE")"
echo "R2 Test Interface: $([ $(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/r2-test") = "200" ] && echo "✅ OK" || echo "❌ ISSUE")"
echo "API Health: $([ $(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/api/debug") = "200" ] && echo "✅ OK" || echo "❌ ISSUE")"
echo "Canonical Endpoint: $([ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "200" ] && echo "✅ OK" || echo "❌ ISSUE")"
echo ""

if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "🎉 Canonical normalization system is LIVE!"
  echo "🔗 Ready to proceed with secure access portal testing"
  echo ""
  echo "🎬 Your uploaded episode is accessible at:"
  echo "   Dashboard: https://$DOMAIN/podcast-dashboard"
  echo "   Direct API: $CANONICAL_ENDPOINT"
else
  echo "⚠️  Some issues detected - check environment variables in Vercel"
  echo "   Make sure R2 credentials are configured in production"
fi

echo ""
echo "📋 Next steps:"
echo "1. Visit https://$DOMAIN/podcast-dashboard to see your episode"
echo "2. Test episode playback in the dashboard"  
echo "3. Use https://$DOMAIN/r2-test for direct file testing"
echo "4. Begin secure access portal testing once verified"