#!/bin/bash
# Quick upload script for additional episodes while waiting for Vercel

echo "🎬 Quick Episode Upload (Canonical Normalization)"
echo "=================================================="
echo ""

# Check if episode path provided
if [ $# -lt 1 ]; then
    echo "Usage: ./quick-upload.sh <video-file-path> [type]"
    echo ""
    echo "Types:"
    echo "  landscape (default) - Daily landscape episodes"
    echo "  portrait           - Daily portrait episodes"  
    echo "  premium           - Premium educational content"
    echo ""
    echo "Example:"
    echo "  ./quick-upload.sh 'C:/path/to/video.mp4' landscape"
    exit 1
fi

VIDEO_PATH="$1"
EPISODE_TYPE="${2:-landscape}"

# Verify file exists
if [ ! -f "$VIDEO_PATH" ]; then
    echo "❌ File not found: $VIDEO_PATH"
    exit 1
fi

echo "📁 Video: $VIDEO_PATH"
echo "🎯 Type: $EPISODE_TYPE"
echo ""

# Quick file info
FILE_SIZE=$(du -h "$VIDEO_PATH" | cut -f1)
echo "📊 File size: $FILE_SIZE"

# Estimate upload time (rough calculation based on typical upload speeds)
echo "⏱️  Estimated upload time: ~2-5 minutes (depending on connection)"
echo ""

read -p "🚀 Ready to upload? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Starting canonical normalization upload..."
    echo ""
    
    # Source environment variables
    if [ -f .env.local ]; then
        set -a
        source .env.local
        set +a
    fi
    
    # Execute the upload
    ./up-landscape.sh "$VIDEO_PATH" "$EPISODE_TYPE"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Upload completed successfully!"
        echo ""
        echo "📋 Next steps:"
        echo "1. Update podcast dashboard episode list"
        echo "2. Test playback locally: http://localhost:3000/podcast-dashboard"
        echo "3. Test file access: http://localhost:3000/r2-test"
        echo "4. When Vercel deploys, test production endpoint"
        echo ""
        
        # Suggest podcast dashboard update
        BASENAME=$(basename "$VIDEO_PATH")
        echo "💡 To add to podcast dashboard:"
        echo "   Title suggestion: Based on '$BASENAME'"
        echo "   Category: $EPISODE_TYPE episode"
        echo "   Premium: $([ "$EPISODE_TYPE" = "premium" ] && echo "true" || echo "false")"
    else
        echo "❌ Upload failed! Check the error messages above."
    fi
else
    echo "👋 Upload cancelled."
fi