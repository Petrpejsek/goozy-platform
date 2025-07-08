import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Disable static generation during build
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  
  // Optimize images
  images: {
    unoptimized: true,
    domains: ['localhost', '91.99.101.179'],
  },
  
  // Skip ESLint during build for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Production optimizations
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
