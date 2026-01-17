import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إعدادات الأمان للصور
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'q8sport.tk',
      },
      {
        protocol: 'https',
        hostname: 'q8sportcar.com',
      },
      {
        protocol: 'https',
        hostname: 'www.q8sportcar.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
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
  // تعطيل TypeScript errors للبناء السريع (فقط للتطوير)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
