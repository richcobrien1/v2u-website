#!/bin/bash
# Test the canonical normalization and R2 integration

echo "🧪 Testing Canonical Normalization Integration"
echo ""

# Test 1: Check if the API endpoint responds
echo "📡 Testing R2 API endpoint..."
ENDPOINT="http://localhost:3000/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4"

echo "🔗 Endpoint: $ENDPOINT"
echo ""

# Use a test token for API access
TEST_TOKEN="test-token-canonical-normalization-12345"

echo "🔑 Using test token for API access..."

# Test the endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  "$ENDPOINT")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "📊 Response Code: $HTTP_CODE"
echo "📄 Response Body:"
echo "$BODY" | head -c 500
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ API endpoint is working!"
elif [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "301" ]; then
  echo "🔄 API endpoint redirecting (expected for R2 signed URLs)"
else
  echo "⚠️  API endpoint returned code $HTTP_CODE"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Visit http://localhost:3000/podcast-dashboard to see the episode"
echo "2. Visit http://localhost:3000/r2-test to test file access"
echo "3. Try playing the episode in the podcast dashboard"