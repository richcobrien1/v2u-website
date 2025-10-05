#!/usr/bin/env bash
set -euo pipefail

OUT=.env.local
echo "Creating/updating $OUT (will overwrite existing)."
echo "Press Ctrl-C to cancel."

read -p "CLOUDFLARE_ACCOUNT_ID: " CF_ACCOUNT
read -p "CLOUDFLARE_KV_NAMESPACE_ID: " CF_NS
read -s -p "CLOUDFLARE_API_TOKEN (hidden): " CF_TOKEN
echo
read -p "ADMIN_ONBOARD_TOKEN: " ADMIN_TOKEN
read -s -p "JWT_SECRET (hidden): " JWT_SECRET
echo
read -p "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: " STRIPE_PUB
read -s -p "STRIPE_SECRET_KEY (hidden): " STRIPE_SECRET
echo

cat > "$OUT" <<EOF
CLOUDFLARE_ACCOUNT_ID=$CF_ACCOUNT
CLOUDFLARE_KV_NAMESPACE_ID=$CF_NS
CLOUDFLARE_API_TOKEN=$CF_TOKEN
ADMIN_ONBOARD_TOKEN=$ADMIN_TOKEN
JWT_SECRET=$JWT_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUB
STRIPE_SECRET_KEY=$STRIPE_SECRET
EOF

chmod 600 "$OUT" || true
echo "Wrote $OUT (permissions: $(stat -c '%a' "$OUT" 2>/dev/null || echo 'unknown'))."
echo "Don't commit .env.local to git."
