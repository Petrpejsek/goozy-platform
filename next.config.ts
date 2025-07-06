import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Optimize images
  images: {
    unoptimized: true,
    domains: ['localhost', '91.99.101.179'],
  },
  
  // Production optimizations
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
