import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Q8 Sport Car | سيارات السبورت في الكويت",
    template: "%s | Q8 Sport Car",
  },
  description: "منصة بيع وشراء سيارات السبورت وقطع الغيار في الكويت. Porsche, Ferrari, Lamborghini, McLaren, BMW, Mercedes والمزيد. تواصل مباشر عبر الواتساب.",
  keywords: [
    "سيارات سبورت الكويت", "بيع سيارات الكويت", "قطع غيار سبورت",
    "sport cars Kuwait", "buy cars Kuwait", "Porsche Kuwait", "Ferrari Kuwait",
    "Lamborghini Kuwait", "McLaren Kuwait", "BMW M Kuwait", "Mercedes AMG Kuwait",
    "GT-R Kuwait", "سيارات رياضية", "q8sportcar", "Q8 Sport Car",
    "سيارات فخمة الكويت", "supercar Kuwait",
  ],
  authors: [{ name: "Q8 Sport Car" }],
  creator: "Q8 Sport Car",
  publisher: "Q8 Sport Car",
  metadataBase: new URL("https://www.q8sportcar.com"),
  alternates: {
    canonical: "/",
    languages: { "ar": "/ar", "en": "/en" },
  },
  openGraph: {
    type: "website",
    locale: "ar_KW",
    alternateLocale: "en_US",
    url: "https://www.q8sportcar.com",
    siteName: "Q8 Sport Car",
    title: "Q8 Sport Car | سيارات السبورت في الكويت",
    description: "منصة بيع وشراء سيارات السبورت وقطع الغيار في الكويت. تواصل مباشر عبر الواتساب.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Q8 Sport Car | سيارات السبورت في الكويت",
    description: "منصة بيع وشراء سيارات السبورت وقطع الغيار في الكويت",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
