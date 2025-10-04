#!/usr/bin/env bash

# Quick test script to add a test subscriber
# Usage: ./test-subscriber.sh [grant|revoke|check] [customer-id] [subscription-id]

set -euo pipefail

ACTION=${1:-"grant"}
CUSTOMER_ID=${2:-"test-customer-alex"}
SUBSCRIPTION_ID=${3:-"sub_test_premium_alex"}

BASE_URL="http://localhost:3000"

case $ACTION in
  "grant")
    echo "🔑 Granting access for customer: $CUSTOMER_ID"
    curl -X POST "$BASE_URL/api/subscriber-access" \
      -H "Content-Type: application/json" \
      -d "{
        \"action\": \"grant\",
        \"customerId\": \"$CUSTOMER_ID\",
        \"subscriptionId\": \"$SUBSCRIPTION_ID\"
      }" | jq
    ;;
  
  "revoke")
    echo "🚫 Revoking access for customer: $CUSTOMER_ID"
    curl -X POST "$BASE_URL/api/subscriber-access" \
      -H "Content-Type: application/json" \
      -d "{
        \"action\": \"revoke\",
        \"customerId\": \"$CUSTOMER_ID\"
      }" | jq
    ;;
  
  "check")
    echo "🔍 Checking access for customer: $CUSTOMER_ID"
    curl -X GET "$BASE_URL/api/subscriber-access?customerId=$CUSTOMER_ID" | jq
    ;;
  
  *)
    echo "Usage: ./test-subscriber.sh [grant|revoke|check] [customer-id] [subscription-id]"
    echo "Examples:"
    echo "  ./test-subscriber.sh grant test-customer-alex sub_test_premium"
    echo "  ./test-subscriber.sh check test-customer-alex"
    echo "  ./test-subscriber.sh revoke test-customer-alex"
    exit 1
    ;;
esac