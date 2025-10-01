#!/bin/bash
# Test script for v2u secure access system
# Usage: ./test-access.sh [your-domain]

DOMAIN=${1:-"localhost:3000"}
BASE_URL="http://$DOMAIN"

echo "🔒 Testing v2u Secure Access System"
echo "Domain: $DOMAIN"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="$3"
  
  echo -n "Testing $name... "
  
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $status)"
  else
    echo -e "${RED}❌ FAIL${NC} (Expected HTTP $expected_status, got $status)"
  fi
}

echo -e "${YELLOW}1. Testing API Endpoints${NC}"
test_endpoint "Stripe Webhook" "$BASE_URL/api/stripe-webhook" "405"  # POST only
test_endpoint "Verify Session (no params)" "$BASE_URL/api/verify-session" "400"  # Missing session_id
test_endpoint "Auth (no token)" "$BASE_URL/api/auth" "401"  # Missing Authorization

echo ""
echo -e "${YELLOW}2. Testing Pages${NC}"
test_endpoint "Main Page" "$BASE_URL/" "200"
test_endpoint "Subscribe Page" "$BASE_URL/subscribe" "200"
test_endpoint "Private Store" "$BASE_URL/private" "200"
test_endpoint "SafeShipping" "$BASE_URL/safeshipping" "200"

echo ""
echo -e "${YELLOW}3. Manual Test Instructions${NC}"
echo "To test the full subscription flow:"
echo ""
echo "📋 Step 1: Start your development server"
echo "   npm run dev"
echo ""
echo "📋 Step 2: Set up Stripe CLI (if testing locally)"
echo "   stripe listen --forward-to localhost:3000/api/stripe-webhook"
echo ""
echo "📋 Step 3: Create a test subscription"
echo "   1. Go to $BASE_URL/subscribe"
echo "   2. Click the Stripe buy button"
echo "   3. Use test card: 4242 4242 4242 4242"
echo "   4. Complete the checkout"
echo ""
echo "📋 Step 4: Verify access"
echo "   - You should be redirected to /thank-you?session_id=..."
echo "   - Visit: $BASE_URL/private?session_id=YOUR_SESSION_ID"
echo "   - Should show ✅ Access Granted"
echo ""
echo "📋 Step 5: Test webhook events"
echo "   stripe trigger invoice.paid"
echo "   stripe trigger customer.subscription.deleted"
echo ""
echo -e "${GREEN}✅ Access system testing complete!${NC}"
echo ""
echo "🔗 Useful URLs:"
echo "   Main site: $BASE_URL"
echo "   Subscribe: $BASE_URL/subscribe"
echo "   Private store: $BASE_URL/private"
echo "   API docs: See test-private-access.md"