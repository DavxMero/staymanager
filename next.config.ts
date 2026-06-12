
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  turbopack: {},

  images: {
    
    
    
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
    
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
