import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/site";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  keywords: siteConfig.keywords,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    type: 'website', locale: 'ar_KW', url: siteConfig.url,
    title: siteConfig.name, siteName: siteConfig.name, description: siteConfig.description,
    images: [{ url: absoluteUrl(siteConfig.ogImage), width: 512, height: 512, alt: siteConfig.name }],
  },
  twitter: { card: 'summary_large_image', title: siteConfig.name, description: siteConfig.description, images: [absoluteUrl(siteConfig.ogImage)] },
  category: 'automotive',
  appleWebApp: { capable: true, title: siteConfig.shortName, statusBarStyle: 'black-translucent' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--metal-border)] bg-[var(--panel)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[var(--brand)]">Q8</span>
            <span className="text-xs font-bold tracking-widest text-[var(--foreground)]">SPORT CAR</span>
          </div>
          <p className="mt-2 text-sm text-[var(--sand)]">منصة كويتية لسيارات السبورت وقطع الغيار</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-[var(--sand)]">
          <Link href="/market" className="transition hover:text-[var(--foreground)]">السوق</Link>
          <Link href="/sell" className="transition hover:text-[var(--foreground)]">انشر إعلان</Link>
          <Link href="/privacy-policy" className="transition hover:text-[var(--foreground)]">الخصوصية</Link>
        </div>
      </div>
    </footer>
  );
}
