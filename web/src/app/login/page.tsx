"use client";

import { useState } from "react";
import Link from "next/link";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirebasePublicConfig } from "@/lib/runtime-config";

const firebaseConfig = getFirebasePublicConfig();
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const ADMIN_EMAILS = ["admin@q8sportcar.com", "summit_kw@hotmail.com"];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (ADMIN_EMAILS.includes(cred.user.email || "")) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("البريد أو كلمة المرور غير صحيحة");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-5xl font-black text-[var(--brand)]">Q8</span>
          <p className="mt-1 text-sm font-bold tracking-widest text-[var(--foreground)]">SPORT CAR</p>
          <div className="mx-auto mt-3 h-0.5 w-10 rounded-full bg-[var(--brand)]" />
        </div>

        <div className="rounded-3xl border border-[var(--metal-border)] bg-[var(--panel)] p-8 shadow-2xl">
          <h1 className="text-center text-xl font-bold text-[var(--foreground)]">تسجيل الدخول</h1>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-[var(--metal-border)] bg-[var(--metal)] px-4">
              <span className="text-base">📧</span>
              <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--sand)]/50 outline-none" autoComplete="email" />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[var(--metal-border)] bg-[var(--metal)] px-4">
              <span className="text-base">🔒</span>
              <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--sand)]/50 outline-none" autoComplete="current-password" />
            </div>

            {error && (
              <p className="rounded-xl bg-[var(--brand)]/10 border border-[var(--brand)]/20 px-4 py-3 text-center text-sm font-bold text-[var(--brand)]">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gradient-to-l from-[var(--brand)] to-[var(--brand-dark)] py-4 text-center text-sm font-black text-white transition hover:opacity-90 disabled:opacity-50">
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--sand)]">
            ما عندك حساب؟{" "}
            <Link href="/register" className="font-bold text-[var(--brand)] hover:underline">إنشاء حساب</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
