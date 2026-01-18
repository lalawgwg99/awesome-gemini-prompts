import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms-assets.youmind.com',
      },
      {
        protocol: 'https',
        hostname: 'img.shields.io'
      }
    ],
  },
};

export default nextConfig;
