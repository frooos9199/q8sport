import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Q8 Sport Car | سيارات السبورت في الكويت",
  description: "منصة بيع وشراء سيارات السبورت وقطع الغيار في الكويت",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
