import path from 'path';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',  // Temporarily disabled for API route testing
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // When a monorepo or multiple lockfiles are present, Next can infer the wrong
  // workspace root. Setting this avoids the warning and ensures output tracing
  // is calculated relative to the repository root.
  outputFileTracingRoot: path.resolve(__dirname, '..'),
};

export default nextConfig;
