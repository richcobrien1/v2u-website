#!/bin/bash
# Canonical normalization bridge script for landscape episodes
# Combines up-m.sh proven upload with structured directory organization

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: ./up-landscape.sh <source-file-path> [episode-type]"
  echo "Episode types: landscape, portrait, premium"
  echo "Example: ./up-landscape.sh 'path/to/video.mp4' landscape"
  exit 1
fi

SOURCE_PATH="$1"
EPISODE_TYPE="${2:-landscape}"

echo "🎬 V2U Canonical Upload Bridge"
echo "📁 Source: $SOURCE_PATH"
echo "🎯 Type: $EPISODE_TYPE"
echo ""

# Verify source file exists
if [ ! -f "$SOURCE_PATH" ]; then
  echo "❌ Source file not found: $SOURCE_PATH"
  exit 1
fi

echo "⚡ Using proven up-m.sh normalization..."

# Source environment variables
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
  echo "✅ Loaded environment variables from .env.local"
else
  echo "❌ .env.local not found!"
  exit 1
fi

# Use existing up-m.sh for proven upload and normalization
UPLOAD_RESULT=$(./up-m.sh "$SOURCE_PATH")

if [ $? -ne 0 ]; then
  echo "❌ Upload failed!"
  echo "$UPLOAD_RESULT"
  exit 1
fi

echo "📊 Upload completed, processing result..."
echo "$UPLOAD_RESULT"
echo ""

# Extract values from JSON result
BUCKET=$(echo "$UPLOAD_RESULT" | grep -o '"bucket": "[^"]*"' | cut -d'"' -f4)
ORIGINAL_KEY=$(echo "$UPLOAD_RESULT" | grep -o '"key": "[^"]*"' | cut -d'"' -f4)
PUBLIC_URL=$(echo "$UPLOAD_RESULT" | grep -o '"url": "[^"]*"' | cut -d'"' -f4)
FILENAME=$(echo "$UPLOAD_RESULT" | grep -o '"filename": "[^"]*"' | cut -d'"' -f4)

echo "🔍 Extracted from upload:"
echo "   Bucket: $BUCKET"
echo "   Original Key: $ORIGINAL_KEY"
echo "   Filename: $FILENAME"
echo ""

# Transform to our structured directory system
case "$EPISODE_TYPE" in
  "landscape")
    # Extract date parts from the up-m.sh generated path (YYYY/MM/DD/filename)
    DATE_PART=$(echo "$ORIGINAL_KEY" | cut -d'/' -f1-3)
    FILE_PART=$(echo "$ORIGINAL_KEY" | cut -d'/' -f4-)
    STRUCTURED_KEY="public/daily/landscape/$DATE_PART/$FILE_PART"
    API_PATH="/api/r2/public/daily/landscape/$DATE_PART/$FILE_PART"
    ;;
  "portrait")
    DATE_PART=$(echo "$ORIGINAL_KEY" | cut -d'/' -f1-3)
    FILE_PART=$(echo "$ORIGINAL_KEY" | cut -d'/' -f4-)
    STRUCTURED_KEY="public/daily/portrait/$DATE_PART/$FILE_PART"
    API_PATH="/api/r2/public/daily/portrait/$DATE_PART/$FILE_PART"
    ;;
  "premium")
    DATE_PART=$(echo "$ORIGINAL_KEY" | cut -d'/' -f1-3)
    FILE_PART=$(echo "$ORIGINAL_KEY" | cut -d'/' -f4-)
    STRUCTURED_KEY="private/educate/advanced/$DATE_PART/$FILE_PART"
    API_PATH="/api/r2/private/educate/advanced/$DATE_PART/$FILE_PART"
    ;;
  *)
    # Default: use original structure
    STRUCTURED_KEY="$ORIGINAL_KEY"
    API_PATH="/api/r2/public/$STRUCTURED_KEY"
    ;;
esac

echo "🏗️  Structured organization:"
echo "   Original: $ORIGINAL_KEY"
echo "   Structured: $STRUCTURED_KEY"
echo "   API Path: $API_PATH"
echo ""

# Generate comprehensive result JSON
cat <<EOF
{
  "success": true,
  "canonical": {
    "originalKey": "$ORIGINAL_KEY",
    "structuredKey": "$STRUCTURED_KEY",
    "bucket": "$BUCKET",
    "filename": "$FILENAME"
  },
  "integration": {
    "apiPath": "$API_PATH",
    "testUrl": "http://localhost:3000/r2-test?path=$(echo "$STRUCTURED_KEY" | sed 's/public\///g' | sed 's/private\///g')",
    "publicUrl": "$PUBLIC_URL",
    "podcastDashboardPath": "$API_PATH"
  },
  "instructions": {
    "nextSteps": [
      "1. Update podcast-dashboard episode audioUrl to: $API_PATH",
      "2. Test access at: http://localhost:3000/r2-test",
      "3. Verify playback in: http://localhost:3000/podcast-dashboard"
    ]
  },
  "uploadedAt": "$(date -Iseconds)"
}
EOF

echo ""
echo "✅ Canonical normalization bridge complete!"
echo "🔗 Ready for podcast dashboard integration"
echo "🧪 Test the upload at: http://localhost:3000/r2-test"