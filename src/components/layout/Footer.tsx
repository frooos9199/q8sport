"use client";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";

export default function Footer() {
  const { locale, t } = useLocale();

  return (
    <footer className="bg-dark-card border-t border-metal mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary text-2xl font-black font-english">Q8</span>
              <span className="text-white text-lg font-bold font-english">SPORT CAR</span>
            </div>
            <p className="text-silver/70 text-sm">{t.common.siteDesc}</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold mb-4">{t.common.siteName}</h3>
            <div className="flex flex-col gap-2">
              <Link href={`/${locale}/cars`} className="text-silver/70 hover:text-primary text-sm transition-colors">{t.common.cars}</Link>
              <Link href={`/${locale}/parts`} className="text-silver/70 hover:text-primary text-sm transition-colors">{t.common.parts}</Link>
              <Link href={`/${locale}/requests`} className="text-silver/70 hover:text-primary text-sm transition-colors">{t.common.requests}</Link>
              <Link href={`/${locale}/gallery`} className="text-silver/70 hover:text-primary text-sm transition-colors">{t.common.gallery}</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Kuwait 🇰🇼</h3>
            <p className="text-silver/70 text-sm">www.q8sportcar.com</p>
          </div>
        </div>

        <div className="border-t border-metal mt-8 pt-8 text-center">
          <p className="text-silver/50 text-sm">
            © {new Date().getFullYear()} Q8 Sport Car. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
