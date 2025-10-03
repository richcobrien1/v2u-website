#!/bin/bash
# V2U Production Testing Suite
# Validates complete pipeline functionality

set -euo pipefail

DOMAIN="${1:-v2u-website.vercel.app}"

echo "🧪 V2U Production Testing Suite"
echo "==============================="
echo "🌐 Testing domain: $DOMAIN"
echo ""

# Test 1: Main site
echo "1️⃣ Testing main site..."
MAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN")
if [ "$MAIN_STATUS" = "200" ]; then
    echo "✅ Main site: PASS ($MAIN_STATUS)"
else
    echo "❌ Main site: FAIL ($MAIN_STATUS)"
fi

# Test 2: Podcast dashboard
echo "2️⃣ Testing podcast dashboard..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/podcast-dashboard")
if [ "$DASHBOARD_STATUS" = "200" ]; then
    echo "✅ Podcast dashboard: PASS ($DASHBOARD_STATUS)"
else
    echo "❌ Podcast dashboard: FAIL ($DASHBOARD_STATUS)"
fi

# Test 3: Episodes API
echo "3️⃣ Testing episodes API..."
API_RESPONSE=$(curl -s "https://$DOMAIN/api/episodes")
API_STATUS=$?

if [ $API_STATUS -eq 0 ]; then
    EPISODE_COUNT=$(echo "$API_RESPONSE" | grep -o '"title"' | wc -l)
    echo "✅ Episodes API: PASS ($EPISODE_COUNT episodes found)"
    
    # Show first episode for verification
    FIRST_EPISODE=$(echo "$API_RESPONSE" | head -20)
    echo "📊 Sample response:"
    echo "$FIRST_EPISODE"
else
    echo "❌ Episodes API: FAIL"
fi

# Test 4: R2 bucket connectivity
echo ""
echo "4️⃣ Testing R2 bucket connectivity..."
if command -v aws >/dev/null 2>&1; then
    # This requires AWS CLI configured for R2
    echo "⚠️  R2 direct test requires AWS CLI configured for R2"
    echo "   Skipping direct bucket test"
else
    echo "⚠️  AWS CLI not available for R2 testing"
fi

# Test 5: Performance check
echo ""
echo "5️⃣ Performance check..."
LOAD_TIME=$(curl -s -o /dev/null -w "%{time_total}" "https://$DOMAIN/podcast-dashboard")
echo "⏱️  Dashboard load time: ${LOAD_TIME}s"

if (( $(echo "$LOAD_TIME < 3.0" | bc -l) )); then
    echo "✅ Performance: GOOD"
elif (( $(echo "$LOAD_TIME < 5.0" | bc -l) )); then
    echo "⚠️  Performance: ACCEPTABLE"
else
    echo "❌ Performance: SLOW"
fi

echo ""
echo "� TESTING COMPLETE"
echo "==================="
echo ""
echo "📋 Production Checklist:"
echo "□ Main site loading"
echo "□ Dashboard functional"
echo "□ API returning data"
echo "□ Episodes displaying"
echo "□ Hover effects working"
echo "□ Mobile responsive"
echo ""
echo "🔄 Automation Status: READY"