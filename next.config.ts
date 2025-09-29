import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إعدادات الأمان للصور
  images: {
    domains: ['via.placeholder.com', 'localhost', 'q8sport.tk'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'q8sport.tk',
      },
    ],
  },
  // إعدادات turbopack
  turbopack: {
    root: process.cwd(),
  },
  // إعدادات الـ output للـ static export إذا احتجناه
  output: 'standalone',
  // إعدادات إضافية للـ production
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
};

export default nextConfig;
