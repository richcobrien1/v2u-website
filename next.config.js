/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable static page generation for error pages to avoid context issues
    staticPageGenerationTimeout: 90,
  },
  // Skip static generation for error pages
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // Force all pages to be dynamic during development
  output: 'standalone',
}

export default nextConfig
