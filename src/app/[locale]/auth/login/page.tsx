"use client";
import { useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { locale, t } = useLocale();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push(`/${locale}/dashboard`);
    } catch {
      setError(locale === "ar" ? "البريد أو كلمة المرور غير صحيحة" : "Invalid email or password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">{t.auth.loginTitle}</h1>

        {error && <div className="bg-primary/10 border border-primary/30 text-primary text-sm rounded-lg p-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-silver text-sm mb-1 block">{t.auth.email}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="text-silver text-sm mb-1 block">{t.auth.password}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? t.common.loading : t.auth.loginTitle}
          </button>
        </form>

        <p className="text-center text-silver/60 text-sm mt-6">
          {t.auth.noAccount}{" "}
          <Link href={`/${locale}/auth/register`} className="text-primary hover:underline">{t.auth.registerTitle}</Link>
        </p>
      </div>
    </div>
  );
}
