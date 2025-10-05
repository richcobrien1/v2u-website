#!/bin/bash
# V2U Podcast Production Workflow
# Automates the complete episode upload and deployment process

set -euo pipefail

echo "🎬 V2U Podcast Production Workflow"
echo "=================================="
echo ""

# Check if episode path provided
if [ $# -lt 1 ]; then
    echo "Usage: ./production-workflow.sh <episode-path> [type] [title]"
    echo ""
    echo "Types: landscape, portrait, premium"
    echo "Example: ./production-workflow.sh 'episode.mp4' landscape 'AI-Now Daily Episode'"
    exit 1
fi

EPISODE_PATH="$1"
EPISODE_TYPE="${2:-landscape}"
EPISODE_TITLE="${3:-Auto-generated}"

echo "📁 Episode: $EPISODE_PATH"
echo "🎯 Type: $EPISODE_TYPE"
echo "📝 Title: $EPISODE_TITLE"
echo ""

# Step 1: Validate environment
echo "1️⃣ Validating environment..."
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "   Create .env.local with R2 credentials"
    exit 1
fi

if [ ! -f "$EPISODE_PATH" ]; then
    echo "❌ Episode file not found: $EPISODE_PATH"
    exit 1
fi

echo "✅ Environment validated"

# Step 2: Upload with canonical normalization
echo ""
echo "2️⃣ Uploading with canonical normalization..."
UPLOAD_RESULT=$(./up-landscape.sh "$EPISODE_PATH" "$EPISODE_TYPE")

if [ $? -ne 0 ]; then
    echo "❌ Upload failed!"
    echo "$UPLOAD_RESULT"
    exit 1
fi

echo "✅ Upload successful"
echo "$UPLOAD_RESULT"

# Extract API path from upload result
API_PATH=$(echo "$UPLOAD_RESULT" | grep -o '"podcastDashboardPath": "[^"]*"' | cut -d'"' -f4)
echo ""
echo "🔗 API Path: $API_PATH"

# Step 3: Test local integration
echo ""
echo "3️⃣ Testing local integration..."
if command -v curl >/dev/null 2>&1; then
    LOCAL_TEST=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/episodes")
    if [ "$LOCAL_TEST" = "200" ]; then
        echo "✅ Local API responding"
    else
        echo "⚠️  Local server not running (HTTP $LOCAL_TEST)"
        echo "   Start with: npm run dev"
    fi
else
    echo "⚠️  curl not available for testing"
fi

# Step 4: Build for production
echo ""
echo "4️⃣ Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful"

# Step 5: Git commit and push
echo ""
echo "5️⃣ Committing to git..."
git add .

# Generate commit message
COMMIT_MSG="Add episode: $EPISODE_TITLE

- Type: $EPISODE_TYPE
- API Path: $API_PATH
- Canonical normalization applied
- Production ready"

git commit -m "$COMMIT_MSG"

echo "✅ Changes committed"

echo ""
echo "6️⃣ Pushing to trigger deployment..."
git push

echo "✅ Pushed to main branch"

# Step 6: Deployment monitoring
echo ""
echo "🚀 PRODUCTION WORKFLOW COMPLETE!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo "1. Monitor Vercel deployment"
echo "2. Test production endpoint when deployed"
echo "3. Verify episode appears in podcast dashboard"
echo ""
echo "🧪 Testing Commands:"
echo "Local:      http://localhost:3000/podcast-dashboard"
echo "Production: ./test-production.sh your-domain.vercel.app"
echo ""
echo "📊 Episode Details:"
echo "API Path:   $API_PATH"
echo "Type:       $EPISODE_TYPE"
echo "Status:     Ready for production"