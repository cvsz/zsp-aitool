"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { VariablePalette } from "./VariablePalette";

type Props = {
  template: { id: string; name: string; content: string; isDefault: boolean } | null;
  onSave: (payload: { name: string; content: string }) => Promise<void>;
  onClose: () => void;
};

const sampleData: Record<string, string> = {
  productTitle: "ลำโพงบลูทูธพกพา",
  price: "899 บาท",
  description: "เสียงดี แบตอึด พกง่าย",
  rating: "4.9/5",
  reviewSummary: "รีวิวชมเรื่องเสียงและความคุ้มค่า",
  affiliateLink: "https://example.com/aff",
  platform: "Facebook",
  tone: "เป็นกันเอง",
  language: "th",
  ctaStyle: "ชวนคลิกแบบสุภาพ",
  hashtags: "#ลำโพง #โปรโมชัน",
};

const VARIABLE_RE = /(\{\{[^}]+\}\})/g;

function highlightVariables(text: string): (string | { type: "variable"; value: string })[] {
  const parts = text.split(VARIABLE_RE);
  return parts.map((part) => {
    if (part.startsWith("{{") && part.endsWith("}}")) {
      return { type: "variable" as const, value: part };
    }
    return part;
  });
}

function renderPreview(content: string): string {
  return content.replace(/\{\{[^}]+\}\}/g, (match) => {
    const key = match.replace(/[{}]/g, "");
    return sampleData[key] ?? match;
  });
}

export function TemplateEditorModal({ template, onSave, onClose }: Props) {
  const [name, setName] = useState(template?.name ?? "");
  const [content, setContent] = useState(template?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const highlighted = useMemo(() => highlightVariables(content), [content]);

  useEffect(() => {
    setPreview(renderPreview(content));
  }, [content]);

  const insertVariable = useCallback((variable: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const next = before + variable + after;
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + variable.length;
    });
  }, [content]);

  const handleSave = async () => {
    if (!name.trim() || content.trim().length < 10) return;
    setSaving(true);
    await onSave({ name: name.trim(), content: content.trim() });
    setSaving(false);
  };

  const isNew = !template?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-[85vh] w-[90vw] max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-900">
              {isNew ? "สร้างเทมเพลตใหม่" : "แก้ไขเทมเพลต"}
            </h2>
            {template?.isDefault && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
                Default
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
              disabled={saving || !name.trim() || content.trim().length < 10}
              onClick={handleSave}
            >
              {saving ? "กำลังบันทึก..." : isNew ? "สร้าง" : "บันทึก"}
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              onClick={onClose}
            >
              ปิด
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex w-56 flex-col gap-4 overflow-y-auto border-r border-slate-200 p-4">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อเทมเพลต"
            />
            <VariablePalette onInsert={insertVariable} />
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
              <span className="text-[11px] font-medium text-slate-400">
                {content.length} ตัวอักษร
              </span>
              <span className="text-[11px] text-slate-300">
                ใช้ <span className="font-mono">{`{{variable}}`}</span> เพื่อแทรกข้อมูลสินค้า
              </span>
            </div>
            <div className="relative flex-1">
              <div
                className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap p-4 font-mono text-[13px] leading-relaxed"
                aria-hidden="true"
              >
                {highlighted.map((part, i) =>
                  typeof part === "string" ? (
                    <span key={i}>{part}</span>
                  ) : (
                    <span
                      key={i}
                      className="rounded bg-indigo-100 px-0.5 text-indigo-700"
                    >
                      {part.value}
                    </span>
                  ),
                )}
              </div>
              <textarea
                ref={textareaRef}
                className="absolute inset-0 resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-transparent caret-slate-800 outline-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="เขียนเนื้อหาเทมเพลตของคุณ..."
                spellCheck={false}
              />
            </div>
          </div>

          <div className="flex w-72 flex-col border-l border-slate-200">
            <div className="border-b border-slate-100 px-4 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                ตัวอย่าง
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {preview ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {preview}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-[11px] font-medium text-emerald-800">
                      ตัวแปรที่ใช้
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {(content.match(/\{\{[^}]+\}\}/g) ?? []).map((v) => (
                        <span
                          key={v}
                          className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-mono text-emerald-700"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  เนื้อหาที่เรนเดอร์จะแสดงที่นี่
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
