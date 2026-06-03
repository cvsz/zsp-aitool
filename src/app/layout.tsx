import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | ZSP AI Studio",
    default: "ZSP AI Studio - Thai-first Shopee Affiliate Content Workspace",
  },
  description:
    "แพลตฟอร์ม AI ผู้ช่วยอัจฉริยะสำหรับนักทำ Affiliate ชาวไทย จัดการคลังสินค้า สร้างแคปชั่นอัตโนมัติ รองรับ Facebook, TikTok, X, Threads และ Instagram",
  keywords: ["Shopee Affiliate", "AI Content", "Social Media", "Thai Affiliate", "Content Generator", "ZSP AI"],
  authors: [{ name: "Zeaz Dev", url: "https://studio.zeaz.dev" }],
  creator: "Zeaz Dev",
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://studio.zeaz.dev",
    title: "ZSP AI Studio - Thai-first Shopee Affiliate Content Workspace",
    description:
      "แพลตฟอร์ม AI ผู้ช่วยอัจฉริยะสำหรับนักทำ Affiliate ชาวไทย จัดการคลังสินค้า สร้างแคปชั่นอัตโนมัติด้วย AI",
    siteName: "ZSP AI Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZSP AI Studio - Thai-first Shopee Affiliate Content Workspace",
    description: "แพลตฟอร์ม AI ผู้ช่วยอัจฉริยะสำหรับนักทำ Affiliate ชาวไทย",
    creator: "@zeazdev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="antialiased text-slate-900 bg-slate-50 min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
