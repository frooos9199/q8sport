import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إعدادات الأمان للصور
  images: {
    domains: ['via.placeholder.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  // إعدادات turbopack
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
