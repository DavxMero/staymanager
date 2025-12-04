// Force rebuild: 1
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},

  experimental: {
    // Server actions configuration
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;