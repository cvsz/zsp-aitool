import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "zsp-aitool",
  description: "Thai-first AI affiliate content workspace for product collection, OCR, prompt templates, and multi-platform content generation."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
