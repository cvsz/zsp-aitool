import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "zsp-aitool",
  description: "Thai-first AI affiliate content workspace for product collection, OCR, prompt templates, and multi-platform content generation."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
