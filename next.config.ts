// Force rebuild: 2
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},

  images: {
    // Disable Next.js Image Optimization di dev karena resolver Next.js me-reject
    // NAT64 IPv6 prefix (64:ff9b::/96) yang dipakai jaringan lokal sebagai "private IP".
    // Produksi (Vercel) tetap optimize normal karena edge network resolve ke IPv4 langsung.
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ncjneagfadrmivgicszm.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  experimental: {
    // Server actions configuration
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;