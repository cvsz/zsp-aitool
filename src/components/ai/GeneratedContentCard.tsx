"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function GeneratedContentCard({ item }: { item: { title: string; body: string; language: string; version: number } }) {
  const [copied, setCopied] = useState(false);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300">
          ✨ Version {item.version}
        </span>
        <span className="text-xs text-slate-400 font-mono">
          {item.body ? `${item.body.length} ตัวอักษร` : ""}
        </span>
      </div>

      {item.title ? (
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
          {item.title}
        </h4>
      ) : null}

      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-100 dark:border-slate-800">
        {item.body || "-"}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          ✓ มี Affiliate Disclosure
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => copyText(item.body)}
          >
            {copied ? "คัดลอกแล้ว ✓" : "📋 คัดลอกเนื้อหา"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => copyText(`${item.title}\n\n${item.body}`)}
          >
            คัดลอกพร้อมหัวข้อ
          </Button>
        </div>
      </div>
    </div>
  );
}
