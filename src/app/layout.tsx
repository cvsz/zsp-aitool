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
    template: "%s | Zeaz Platform",
    default: "zDash | Zeaz Platform Operations Center",
  },
  description:
    "Zeaz Platform - The ultimate Cloudflare operator and AI operations platform. Featuring zDash, Risk Guardian, and AI command center.",
  keywords: ["Zeaz Platform", "zDash", "Cloudflare Operator", "AI Operations", "Terraform", "Risk Guardian"],
  authors: [{ name: "Zeaz Dev", url: "https://zeaz.dev" }],
  creator: "Zeaz Dev",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zeaz.dev",
    title: "zDash | Zeaz Platform Operations Center",
    description:
      "Zeaz Platform - The ultimate Cloudflare operator and AI operations platform.",
    siteName: "Zeaz Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "zDash | Zeaz Platform Operations Center",
    description: "The ultimate Cloudflare operator and AI operations platform.",
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
