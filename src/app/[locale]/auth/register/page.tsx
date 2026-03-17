"use client";
import { useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const { locale, t } = useLocale();
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", whatsapp: "", password: "", confirmPassword: "" });
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (key === "phone" && sameAsPhone) setForm((p) => ({ ...p, whatsapp: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError(locale === "ar" ? "كلمة المرور غير متطابقة" : "Passwords don't match");
      return;
    }
    if (form.password.length < 6) {
      setError(locale === "ar" ? "كلمة المرور لازم 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        whatsapp: sameAsPhone ? form.phone : form.whatsapp,
        password: form.password,
      });
      router.push(`/${locale}/dashboard`);
    } catch {
      setError(locale === "ar" ? "حدث خطأ، حاول مرة ثانية" : "An error occurred, try again");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">{t.auth.registerTitle}</h1>

        {error && <div className="bg-primary/10 border border-primary/30 text-primary text-sm rounded-lg p-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-silver text-sm mb-1 block">{t.auth.name}</label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="text-silver text-sm mb-1 block">{t.auth.email}</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="text-silver text-sm mb-1 block">{t.auth.phone}</label>
            <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input-field" placeholder="+965" required />
          </div>
          <div>
            <label className="flex items-center gap-2 text-silver text-sm mb-1">
              <input type="checkbox" checked={sameAsPhone} onChange={(e) => setSameAsPhone(e.target.checked)} className="accent-primary" />
              {locale === "ar" ? "رقم الواتساب نفس رقم الجوال" : "WhatsApp same as phone"}
            </label>
            {!sameAsPhone && (
              <input type="tel" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} className="input-field mt-1" placeholder="+965" required />
            )}
          </div>
          <div>
            <label className="text-silver text-sm mb-1 block">{t.auth.password}</label>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="text-silver text-sm mb-1 block">{t.auth.confirmPassword}</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className="input-field" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? t.common.loading : t.auth.registerTitle}
          </button>
        </form>

        <p className="text-center text-silver/60 text-sm mt-6">
          {t.auth.hasAccount}{" "}
          <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">{t.auth.loginTitle}</Link>
        </p>
      </div>
    </div>
  );
}
