import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Q8 MAZAD SPORT | مزادات السيارات الرياضية الكويت",
  description: "موقع مزادات قطع غيار السيارات الرياضية للفورد موستنق وF-150 والشفروليه كورفيت وكامارو في الكويت",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
