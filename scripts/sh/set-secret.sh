#!/usr/bin/env bash
set -euo pipefail

OUT=.env.local
echo "Creating/updating $OUT (will preserve existing variables)."
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

# Preserve existing variables that this script doesn't manage
declare -a preserved
if [[ -f "$OUT" ]]; then
  while IFS= read -r line; do
    case "$line" in
      CLOUDFLARE_ACCOUNT_ID=*|CLOUDFLARE_KV_NAMESPACE_ID=*|CLOUDFLARE_API_TOKEN=*|ADMIN_ONBOARD_TOKEN=*|JWT_SECRET=*|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=*|STRIPE_SECRET_KEY=*) ;;
      ""|"#"*) preserved+=("$line") ;;
      *) preserved+=("$line") ;;
    esac
  done < "$OUT"
fi

# Write the file with preserved variables plus new ones
{
  for ln in "${preserved[@]}"; do
    echo "$ln"
  done
  echo "CLOUDFLARE_ACCOUNT_ID=$CF_ACCOUNT"
  echo "CLOUDFLARE_KV_NAMESPACE_ID=$CF_NS"
  echo "CLOUDFLARE_API_TOKEN=$CF_TOKEN"
  echo "ADMIN_ONBOARD_TOKEN=$ADMIN_TOKEN"
  echo "JWT_SECRET=$JWT_SECRET"
  echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUB"
  echo "STRIPE_SECRET_KEY=$STRIPE_SECRET"
} > "$OUT"

chmod 600 "$OUT" || true
echo "Wrote $OUT (permissions: $(stat -c '%a' "$OUT" 2>/dev/null || echo 'unknown'))."
echo "Don't commit .env.local to git."
