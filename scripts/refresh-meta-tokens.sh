#!/bin/bash

# Meta Token Refresh Script
# Run this manually anytime to refresh Facebook/Instagram tokens

echo "🔄 Refreshing Meta Platform Tokens..."
echo ""

# Get the cron secret from .env.local
CRON_SECRET=$(grep CRON_SECRET .env.local | cut -d '=' -f2 | tr -d '"')

if [ -z "$CRON_SECRET" ]; then
  echo "❌ Error: CRON_SECRET not found in .env.local"
  exit 1
fi

# Call the refresh endpoint
response=$(curl -s -X POST "http://localhost:3000/api/meta/refresh-tokens" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")

echo "$response" | jq '.'

echo ""
echo "📋 Instructions:"
echo "1. Copy the new tokens from above"
echo "2. Update your .env.local file"
echo "3. Update Vercel environment variables"
echo "4. Redeploy if needed"
echo ""
echo "Next refresh recommended: $(date -d '+30 days' '+%Y-%m-%d')"
