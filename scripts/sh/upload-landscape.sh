#!/bin/bash
# Simple R2 upload script for your landscape episode
# Usage: ./upload-landscape.sh

echo "🎬 Uploading AI-Now Landscape Episode..."

# Your episode path
EPISODE_PATH="C:\Users\richc\OneDrive\Work\V2U\Assets\Education\Standard\AI-Now\Desktop\October 2, 2025, AI-Now - Practical AI, Advanced Robotics - Deep Dive with Alex and Jessica.mp4"

# R2 configuration (using your actual .env.local)
source .env.local

# Clean filename for R2
R2_FILENAME="ai-now-2025-10-02-practical-ai-advanced-robotics-landscape.mp4"
R2_PATH="public/daily/landscape/2025/10/$R2_FILENAME"

echo "📁 Local file: $EPISODE_PATH"
echo "☁️  R2 path: $R2_PATH"
echo "🔧 Bucket: v2u-assets (from .env.local)"

# Upload using AWS CLI with R2 endpoint
aws s3 cp "$EPISODE_PATH" "s3://v2u-assets/$R2_PATH" \
  --endpoint-url="$R2_ENDPOINT" \
  --region=auto \
  --content-type="video/mp4"

if [ $? -eq 0 ]; then
  echo "✅ Upload successful!"
  echo "🔗 File path: $R2_PATH"
  echo "🧪 Test at: http://localhost:3000/r2-test"
  echo ""
  echo "📝 Update your podcast dashboard with:"
  echo "audioUrl: '/api/r2/public/$R2_PATH'"
else
  echo "❌ Upload failed!"
fi