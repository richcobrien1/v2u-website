import path from 'path';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',  // Temporarily disabled for API route testing
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  // When a monorepo or multiple lockfiles are present, Next can infer the wrong
  // workspace root. Previously this was set to the parent directory which
  // produced duplicated paths on some CI providers (eg. /vercel/path0/path0).
  // Use the project directory itself to keep tracing relative to this repo.
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
