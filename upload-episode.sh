#!/bin/bash
# Quick upload script for v2u episodes
# Usage: ./upload-episode.sh [filename] [type]
# Types: landscape, portrait, premium

FILENAME="$1"
TYPE="$2"

if [ -z "$FILENAME" ]; then
    echo "Usage: ./upload-episode.sh [filename] [type]"
    echo "Types: landscape, portrait, premium"
    echo "Example: ./upload-episode.sh my-episode.mp4 landscape"
    exit 1
fi

if [ ! -f "$FILENAME" ]; then
    echo "❌ File not found: $FILENAME"
    exit 1
fi

# Set the R2 path based on type
case "$TYPE" in
    "landscape")
        R2_PATH="public/daily/landscape/2025/10/$FILENAME"
        echo "📺 Uploading landscape episode to: $R2_PATH"
        ;;
    "portrait")
        R2_PATH="public/daily/portrait/2025/10/$FILENAME"
        echo "📱 Uploading portrait episode to: $R2_PATH"
        ;;
    "premium")
        R2_PATH="private/educate/advanced/$FILENAME"
        echo "👑 Uploading premium episode to: $R2_PATH"
        ;;
    *)
        R2_PATH="$FILENAME"
        echo "📁 Uploading to root: $R2_PATH"
        ;;
esac

echo "🚀 Starting upload..."
echo "Local file: $FILENAME"
echo "R2 path: $R2_PATH"
echo ""

# Use the TypeScript upload script
npx tsx -e "
import { uploadMP4 } from './uploadToR2.ts';
uploadMP4('$FILENAME', '$R2_PATH').then(() => {
  console.log('✅ Upload complete!');
  console.log('🔗 Test at: http://localhost:3000/r2-test');
  console.log('📝 Update episode path in podcast-dashboard to: /api/r2/private/$R2_PATH');
}).catch(console.error);
"