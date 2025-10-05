#!/usr/bin/env bash
set -euo pipefail

# Usage:
# ./scripts/switch-stripe-mode.sh test sk_test_...
# ./scripts/switch-stripe-mode.sh live sk_live_...

MODE=${1:-}
KEY=${2:-}

if [[ -z "$MODE" || -z "$KEY" ]]; then
  echo "Usage: $0 <test|live> <secret_key>"
  exit 1
fi

if [[ "$MODE" != "test" && "$MODE" != "live" ]]; then
  echo "Mode must be 'test' or 'live'"
  exit 1
fi

ENV_FILE=".env.local"
BACKUP_FILE=".env.local.bak"

echo "Backing up existing $ENV_FILE to $BACKUP_FILE (if present)"
if [[ -f "$ENV_FILE" ]]; then
  cp "$ENV_FILE" "$BACKUP_FILE"
fi

# Preserve existing non-STRIPE_SECRET_KEY lines (like STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET)
declare -a preserved
if [[ -f "$BACKUP_FILE" ]]; then
  while IFS= read -r line; do
    case "$line" in
      STRIPE_SECRET_KEY=*) ;;
      "" ) ;;
      # Preserve other stripe lines and general env lines
      *) preserved+=("$line") ;;
    esac
  done < "$BACKUP_FILE"
fi

echo "Writing new $ENV_FILE with ${MODE} key"
{
  for ln in "${preserved[@]}"; do
    echo "$ln"
  done
  echo "STRIPE_SECRET_KEY=${KEY}"
} > "$ENV_FILE"

echo "Wrote $ENV_FILE. Restart your dev server (npm run dev) to pick up changes."
