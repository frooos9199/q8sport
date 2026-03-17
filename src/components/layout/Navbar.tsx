"use client";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useAuth } from "@/hooks/useAuth";
import { Locale } from "@/types";
import SearchBar from "@/components/ui/SearchBar";

export default function Navbar() {
  const { locale, t } = useLocale();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";

  const navLinks = [
    { href: `/${locale}`, label: t.common.home },
    { href: `/${locale}/cars`, label: t.common.cars },
    { href: `/${locale}/parts`, label: t.common.parts },
    { href: `/${locale}/requests`, label: t.common.requests },
    { href: `/${locale}/gallery`, label: t.common.gallery },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-metal">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <span className="text-primary text-2xl font-black tracking-tight font-english group-hover:scale-110 transition-transform">Q8</span>
            <span className="text-white text-lg font-bold font-english">SPORT CAR</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-silver hover:text-primary transition-colors text-sm font-medium racing-line pb-1"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <SearchBar />

            <Link
              href={`/${otherLocale}`}
              className="text-silver hover:text-white text-sm border border-metal px-3 py-1.5 rounded-lg hover:border-primary/50 transition-all"
            >
              {locale === "ar" ? "EN" : "عربي"}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link href={`/${locale}/dashboard`} className="btn-primary text-sm !py-2 !px-4">
                  {t.common.myAccount}
                </Link>
                <button onClick={logout} className="text-silver hover:text-primary text-sm transition-colors">
                  {t.common.logout}
                </button>
              </div>
            ) : (
              <Link href={`/${locale}/auth/login`} className="btn-primary text-sm !py-2 !px-4">
                {t.common.login}
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <SearchBar />
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-metal mt-2 pt-4 animate-fadeInUp">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-silver hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-metal">
              <Link href={`/${otherLocale}`} className="text-silver hover:text-white text-sm border border-metal px-3 py-1.5 rounded-lg">
                {locale === "ar" ? "EN" : "عربي"}
              </Link>
              {user ? (
                <>
                  <Link href={`/${locale}/dashboard`} className="btn-primary text-sm !py-2 !px-4" onClick={() => setMenuOpen(false)}>
                    {t.common.myAccount}
                  </Link>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="text-silver hover:text-primary text-sm">
                    {t.common.logout}
                  </button>
                </>
              ) : (
                <Link href={`/${locale}/auth/login`} className="btn-primary text-sm !py-2 !px-4" onClick={() => setMenuOpen(false)}>
                  {t.common.login}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="racing-stripe" />
    </nav>
  );
}
