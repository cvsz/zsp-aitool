"use client";
import { useState } from "react";
export function CopyButton({ value }: { value: string }) { const [copied, setCopied] = useState(false); return <button className="rounded-lg border px-3 py-2 text-sm" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "คัดลอกแล้ว" : "คัดลอก"}</button>; }
