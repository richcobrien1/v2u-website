import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',  // Temporarily disabled for API route testing
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
