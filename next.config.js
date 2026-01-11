/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staticPageGenerationTimeout: 90,
  },
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  output: 'standalone',
  // Disable static optimization for error pages
  generateBuildId: async () => {
    return 'v2u-build-' + Date.now()
  },
}

export default nextConfig
