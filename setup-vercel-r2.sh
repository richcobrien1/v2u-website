#!/bin/bash
# Auto-setup R2 environment variables in Vercel

echo "🚀 Setting up R2 credentials in Vercel..."

# R2 Configuration
R2_ENDPOINT="https://d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com"
R2_ACCESS_KEY="da519ce673a361db49baf547c5560596"
R2_SECRET_KEY="d2be4804ef907f847509f0e57b79c76e4765781ab05167927b3e9a05b8814737"
R2_BUCKET="public"
R2_BUCKET_PUBLIC="public"
R2_BUCKET_PRIVATE="private"
R2_BUCKET_SOURCES="sources"
R2_BUCKET_PROMOS="promos"
R2_REGION="auto"

# Add environment variables to Vercel (production, preview, development)
echo "$R2_ENDPOINT" | vercel env add R2_ENDPOINT production preview development
echo "$R2_ACCESS_KEY" | vercel env add R2_ACCESS_KEY production preview development
echo "$R2_SECRET_KEY" | vercel env add R2_SECRET_KEY production preview development
echo "$R2_BUCKET" | vercel env add R2_BUCKET production preview development
echo "$R2_BUCKET_PUBLIC" | vercel env add R2_BUCKET_PUBLIC production preview development
echo "$R2_BUCKET_PRIVATE" | vercel env add R2_BUCKET_PRIVATE production preview development
echo "$R2_BUCKET_SOURCES" | vercel env add R2_BUCKET_SOURCES production preview development
echo "$R2_BUCKET_PROMOS" | vercel env add R2_BUCKET_PROMOS production preview development
echo "$R2_REGION" | vercel env add R2_REGION production preview development

echo "✅ R2 credentials added to Vercel!"
echo "🔄 Redeploying to apply changes..."
vercel --prod
