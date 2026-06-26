import type { Metadata, Viewport } from "next";
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  other: {
    // Shows the iOS Smart App Banner in Safari
    'apple-itunes-app': 'app-id=6757956229',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  keywords: siteConfig.keywords,
  openGraph: {
    type: 'website', locale: 'ar_KW', url: siteConfig.url,
    title: siteConfig.name, siteName: siteConfig.name, description: siteConfig.description,
    images: [{ url: absoluteUrl(siteConfig.ogImage), width: 512, height: 512, alt: siteConfig.name }],
  },
  twitter: { card: 'summary_large_image', title: siteConfig.name, description: siteConfig.description, images: [absoluteUrl(siteConfig.ogImage)] },
  category: 'automotive',
  appleWebApp: { capable: true, title: siteConfig.shortName, statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YGCQYT54K4" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-YGCQYT54K4');` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.q8sportcar.app';
  const APP_STORE_URL = 'https://apps.apple.com/us/app/q8sportapp/id6757956229';

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

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[var(--metal-border)] bg-[var(--metal)] px-4 py-2.5 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)]"
          >
             App Store
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[var(--metal-border)] bg-[var(--metal)] px-4 py-2.5 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)]"
          >
            ▶ Google Play
          </a>
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
