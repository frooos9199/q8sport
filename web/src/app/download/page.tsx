import type { Metadata } from "next";
import { headers } from "next/headers";

import DownloadClient from "./DownloadClient";

// روابط المتاجر — عدّلها حسب تطبيقك
const APP_STORE_URL = "https://apps.apple.com/us/app/q8sportapp/id6757956229";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.q8sportcar.app";

export const metadata: Metadata = {
  title: "Download | Q8 Sport",
  description: "تحميل تطبيق Q8 Sport للأندرويد والآيفون",
};

function detectDevice(userAgent: string): "ios" | "android" | "desktop" {
  const ua = (userAgent || "").toLowerCase();

  const isAndroid = ua.includes("android");
  if (isAndroid) return "android";

  const isiPhone = ua.includes("iphone");
  const isiPad = ua.includes("ipad");
  const isiPod = ua.includes("ipod");

  // iPadOS 13+ قد يظهر كـ Macintosh مع كلمة Mobile
  const isIPadOSDesktopUA = ua.includes("macintosh") && ua.includes("mobile");

  if (isiPhone || isiPad || isiPod || isIPadOSDesktopUA) return "ios";

  return "desktop";
}

export default async function DownloadPage() {
  const userAgent = (await headers()).get("user-agent") || "";
  const device = detectDevice(userAgent);

  return (
    <DownloadClient
      device={device}
      appStoreUrl={APP_STORE_URL}
      playStoreUrl={PLAY_STORE_URL}
    />
  );
}
