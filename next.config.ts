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
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
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
  // لا نتجاهل أخطاء TypeScript في الإنتاج
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
