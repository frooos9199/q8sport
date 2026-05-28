import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/site";
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

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-metal-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-brand">Q8</span>
          <span className="text-sm font-bold tracking-widest text-foreground">SPORT CAR</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-sand md:flex">
          <Link href="/market" className="transition hover:text-foreground">السوق</Link>
          <Link href="/cars" className="transition hover:text-foreground">السيارات</Link>
          <Link href="/parts" className="transition hover:text-foreground">قطع الغيار</Link>
          <Link href="/wanted" className="transition hover:text-foreground">المطلوب</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/sell" className="hidden rounded-xl bg-metal px-4 py-2.5 text-sm font-bold text-foreground border border-metal-border transition hover:bg-panel-soft sm:block">
            انشر إعلان
          </Link>
          <Link href="/login" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-metal-border bg-panel">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-brand">Q8</span>
            <span className="text-xs font-bold tracking-widest text-foreground">SPORT CAR</span>
          </div>
          <p className="mt-2 text-sm text-sand">منصة كويتية لسيارات السبورت وقطع الغيار</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-sand">
          <Link href="/market" className="transition hover:text-foreground">السوق</Link>
          <Link href="/sell" className="transition hover:text-foreground">انشر إعلان</Link>
          <Link href="/privacy-policy" className="transition hover:text-foreground">الخصوصية</Link>
        </div>
      </div>
    </footer>
  );
}
