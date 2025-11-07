#!/bin/bash

# Test the automation check endpoint
echo "Testing automation check endpoint..."
echo ""

# Get the CRON_SECRET from .env.local
source .env.local 2>/dev/null || true

echo "1. Testing without auth:"
curl -s "https://www.v2u.us/api/automation/check" | head -c 200
echo -e "\n"

echo "2. Testing with CRON_SECRET:"
if [ -n "$CRON_SECRET" ]; then
  echo "Using CRON_SECRET: ${CRON_SECRET:0:20}..."
  curl -s -H "Authorization: Bearer $CRON_SECRET" "https://www.v2u.us/api/automation/check"
  echo ""
else
  echo "CRON_SECRET not found in .env.local"
fi

echo ""
echo "3. Current automation status:"
curl -s "https://www.v2u.us/api/automation/status" | python3 -m json.tool 2>/dev/null || curl -s "https://www.v2u.us/api/automation/status"
echo ""

echo ""
echo "4. Testing toggle endpoint (starting automation):"
curl -s -X POST "https://www.v2u.us/api/automation/toggle" \
  -H "Content-Type: application/json" \
  -d '{"running":true}'
echo ""

echo ""
echo "5. Status after toggle:"
curl -s "https://www.v2u.us/api/automation/status"
echo ""
