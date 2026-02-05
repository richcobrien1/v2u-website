#!/bin/bash
# Update Vercel R2 credentials for v2u-website-production
# Run from: apps/v2u-website

echo "🔄 Updating Vercel R2 credentials..."
echo ""

# Remove old credentials (non-interactive)
echo "Removing old R2_ACCESS_KEY..."
vercel env rm R2_ACCESS_KEY production --yes 2>/dev/null || echo "  Already removed or doesn't exist"

echo "Removing old R2_SECRET_KEY..."
vercel env rm R2_SECRET_KEY production --yes 2>/dev/null || echo "  Already removed or doesn't exist"

echo "Removing old R2_ENDPOINT..."
vercel env rm R2_ENDPOINT production --yes 2>/dev/null || echo "  Already removed or doesn't exist"

echo ""
echo "Adding new credentials..."

# Add new credentials
echo "f9effd25af9e7067a58671b436fd8308" | vercel env add R2_ACCESS_KEY production
echo "702172032a0eeed20fc1d1f3e7321b255f509350df3b7652dea4f5160d786fc1" | vercel env add R2_SECRET_KEY production
echo "https://d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com" | vercel env add R2_ENDPOINT production

echo ""
echo "✅ Vercel R2 credentials updated!"
echo ""
echo "Next steps:"
echo "  1. Vercel will auto-redeploy with new credentials"
echo "  2. Monitor: https://vercel.com/v2u/v2u-website/deployments"
echo "  3. Test: https://www.v2u.us/podcast-dashboard"
