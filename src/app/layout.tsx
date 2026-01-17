import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import GoogleAdSenseScript from "@/components/ads/GoogleAdSenseScript";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Q8 Sport Car | بيع سيارات رياضية وقطع غيار - الكويت",
  description: "Q8 Sport Car - موقع بيع السيارات الرياضية الأمريكية وقطع الغيار الأصلية - فورد موستنق، F-150، شفروليه كورفيت، كامارو في الكويت",
  other: {
    'charset': 'utf-8',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <GoogleAdSenseScript 
          publisherId={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || "ca-pub-XXXXXXXXXXXXXXXX"} 
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <AuthProvider>
          <div className="min-h-screen bg-black">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
