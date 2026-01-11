/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staticPageGenerationTimeout: 90,
  },
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  output: 'standalone',
  // Force dynamic rendering for all pages
  generateBuildId: async () => {
    return 'v2u-build-' + Date.now()
  },
  // Disable static optimization completely
  reactStrictMode: true,
  swcMinify: true,
}

export default nextConfig
