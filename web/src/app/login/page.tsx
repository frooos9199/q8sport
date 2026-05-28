"use client";

import { useState } from "react";
import Link from "next/link";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirebasePublicConfig } from "@/lib/runtime-config";

const firebaseConfig = getFirebasePublicConfig();
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

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
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/";
    } catch {
      setError("البريد أو كلمة المرور غير صحيحة");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-5xl font-black text-brand">Q8</span>
          <p className="mt-1 text-sm font-bold tracking-widest text-foreground">SPORT CAR</p>
          <div className="mx-auto mt-3 h-0.5 w-10 rounded-full bg-brand" />
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-metal-border bg-panel p-8 shadow-2xl">
          <h1 className="text-center text-xl font-bold text-foreground">تسجيل الدخول</h1>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-metal-border bg-metal px-4">
              <span className="text-base">📧</span>
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-4 text-sm text-foreground placeholder:text-sand/50 outline-none"
                autoComplete="email"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-metal-border bg-metal px-4">
              <span className="text-base">🔒</span>
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-4 text-sm text-foreground placeholder:text-sand/50 outline-none"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-brand/10 border border-brand/20 px-4 py-3 text-center text-sm font-bold text-brand">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-l from-brand to-brand-dark py-4 text-center text-sm font-black text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-sand">
            ما عندك حساب؟{" "}
            <Link href="/register" className="font-bold text-brand hover:underline">إنشاء حساب</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
