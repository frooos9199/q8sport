"use client";

import { useState } from "react";
import Link from "next/link";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, serverTimestamp } from "firebase/database";
import { getFirebasePublicConfig } from "@/lib/runtime-config";

const firebaseConfig = getFirebasePublicConfig();
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) return;
    if (password.length < 6) { setError("كلمة المرور لازم 6 أحرف على الأقل"); return; }
    setLoading(true);
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, `users/${cred.user.uid}`), {
        uid: cred.user.uid, name, email, phone, whatsapp: phone, createdAt: serverTimestamp(),
      });
      window.location.href = "/";
    } catch {
      setError("حدث خطأ، حاول مرة ثانية");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="text-4xl font-black text-brand">Q8</span>
          <p className="mt-1 text-xs font-bold tracking-widest text-foreground">SPORT CAR</p>
        </div>

        <div className="rounded-3xl border border-metal-border bg-panel p-8 shadow-2xl">
          <h1 className="text-center text-xl font-bold text-foreground">إنشاء حساب</h1>

          <form onSubmit={handleRegister} className="mt-8 space-y-3">
            <InputField icon="👤" placeholder="الاسم" value={name} onChange={setName} />
            <InputField icon="📧" placeholder="البريد الإلكتروني" value={email} onChange={setEmail} type="email" />
            <InputField icon="📱" placeholder="رقم الجوال / واتساب" value={phone} onChange={setPhone} type="tel" />
            <InputField icon="🔒" placeholder="كلمة المرور" value={password} onChange={setPassword} type="password" />

            {error && (
              <p className="rounded-xl bg-brand/10 border border-brand/20 px-4 py-3 text-center text-sm font-bold text-brand">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-l from-brand to-brand-dark py-4 text-center text-sm font-black text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "جاري التسجيل..." : "إنشاء حساب"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-sand">
            عندك حساب؟{" "}
            <Link href="/login" className="font-bold text-brand hover:underline">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function InputField({ icon, placeholder, value, onChange, type = "text" }: {
  icon: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-metal-border bg-metal px-4">
      <span className="text-base">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent py-4 text-sm text-foreground placeholder:text-sand/50 outline-none"
      />
    </div>
  );
}
