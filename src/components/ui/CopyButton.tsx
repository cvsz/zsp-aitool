"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  tone?: "default" | "muted" | "info" | "success" | "warning" | "danger" | "dark";
};

export function CopyButton({ value, label = "คัดลอก", copiedLabel = "คัดลอกแล้ว", className = "", tone = "default" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button type="button" variant="secondary" tone={tone} onClick={() => void onCopy()} className={className} aria-label={copied ? copiedLabel : label}>
      {copied ? copiedLabel : label}
    </Button>
  );
}
