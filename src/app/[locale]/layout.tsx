import { Locale } from "@/types";
import { LocaleProvider } from "@/hooks/useLocale";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = (params.locale === "en" ? "en" : "ar") as Locale;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontClass = locale === "ar" ? "font-arabic" : "font-english";

  return (
    <html lang={locale} dir={dir}>
      <body className={`${fontClass} bg-dark text-white min-h-screen`}>
        <LocaleProvider locale={locale}>
          <AuthProvider>
            <Navbar />
            <main className="pt-[68px] min-h-screen">{children}</main>
            <Footer />
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
