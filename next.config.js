/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  output: 'standalone',
  generateBuildId: async () => {
    return 'v2u-build-' + Date.now()
  },
  reactStrictMode: true,
}

export default nextConfig
