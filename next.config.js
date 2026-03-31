/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  output: 'standalone',
  generateBuildId: async () => {
    return 'v2u-build-' + Date.now()
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://clerk.v2u.us https://*.clerk.accounts.dev https://challenges.cloudflare.com;
              style-src 'self' 'unsafe-inline' https://clerk.v2u.us https://*.clerk.accounts.dev;
              img-src 'self' data: https: blob:;
              font-src 'self' data: https://clerk.v2u.us https://*.clerk.accounts.dev;
              connect-src 'self' https://js.stripe.com https://api.stripe.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.facebook.com https://*.facebook.net https://*.r2.cloudflarestorage.com https://clerk.v2u.us https://*.clerk.accounts.dev https://api.clerk.com https://*.clerkstage.dev;
              frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com https://clerk.v2u.us https://*.clerk.accounts.dev https://challenges.cloudflare.com https://open.spotify.com;
              worker-src 'self' blob:;
              media-src 'self' blob: data: https:;
              object-src 'none';
              base-uri 'self';
              form-action 'self' https://clerk.v2u.us https://*.clerk.accounts.dev;
              frame-ancestors 'self';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  }
}

export default nextConfig
