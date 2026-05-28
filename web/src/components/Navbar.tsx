"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebasePublicConfig } from "@/lib/runtime-config";

const firebaseConfig = getFirebasePublicConfig();
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const ADMIN_EMAILS = ["admin@q8sportcar.com"];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--metal-border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-[var(--brand)]">Q8</span>
          <span className="text-sm font-bold tracking-widest text-[var(--foreground)]">SPORT CAR</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[var(--sand)] md:flex">
          <Link href="/market" className="transition hover:text-[var(--foreground)]">السوق</Link>
          <Link href="/cars" className="transition hover:text-[var(--foreground)]">السيارات</Link>
          <Link href="/parts" className="transition hover:text-[var(--foreground)]">قطع الغيار</Link>
          <Link href="/wanted" className="transition hover:text-[var(--foreground)]">المطلوب</Link>
          {isAdmin && <Link href="/admin" className="text-[var(--brand)] transition hover:opacity-80">الإدارة</Link>}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/sell" className="rounded-xl bg-[var(--metal)] px-4 py-2.5 text-sm font-bold text-[var(--foreground)] border border-[var(--metal-border)] transition hover:bg-[var(--panel-soft)]">
            انشر إعلان
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href={isAdmin ? "/admin" : "/sell"} className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-black text-white">
                {user.email?.[0]?.toUpperCase() || "U"}
              </Link>
              <button onClick={handleLogout} className="rounded-xl border border-[var(--metal-border)] bg-[var(--metal)] px-4 py-2.5 text-sm font-bold text-[var(--sand)] transition hover:text-[var(--foreground)]">
                خروج
              </button>
            </div>
          ) : (
            <Link href="/login" className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)]">
              تسجيل الدخول
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--metal-border)] bg-[var(--metal)] md:hidden">
          <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-[var(--metal-border)] bg-[var(--panel)] px-5 py-6 md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-semibold">
            <Link href="/market" onClick={() => setMenuOpen(false)} className="text-[var(--foreground)]">السوق</Link>
            <Link href="/cars" onClick={() => setMenuOpen(false)} className="text-[var(--foreground)]">السيارات</Link>
            <Link href="/parts" onClick={() => setMenuOpen(false)} className="text-[var(--foreground)]">قطع الغيار</Link>
            <Link href="/wanted" onClick={() => setMenuOpen(false)} className="text-[var(--foreground)]">المطلوب</Link>
            <Link href="/sell" onClick={() => setMenuOpen(false)} className="text-[var(--foreground)]">انشر إعلان</Link>
            {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-[var(--brand)]">الإدارة</Link>}
            <div className="mt-2 border-t border-[var(--metal-border)] pt-4">
              {user ? (
                <button onClick={handleLogout} className="w-full rounded-xl border border-[var(--metal-border)] bg-[var(--metal)] py-3 text-sm font-bold text-[var(--sand)]">
                  تسجيل خروج
                </button>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block w-full rounded-xl bg-[var(--brand)] py-3 text-center text-sm font-bold text-white">
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
