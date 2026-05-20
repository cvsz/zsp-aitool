"use client";

import { useState } from "react";
import { TEMPLATE_VARIABLES } from "@/schemas/template.schema";

type Props = {
  initialName?: string;
  initialContent?: string;
  onSave: (payload: { name: string; content: string }) => Promise<void>;
};

const presetTemplates = [
  {
    name: "โพสต์สั้นขายบน Facebook",
    content: "เขียนโพสต์ {{platform}} โทน {{tone}} ภาษา {{language}} แนะนำ {{productTitle}} ราคา {{price}} โดยอ้างอิงเฉพาะข้อมูลจริง: {{description}} ปิดท้ายด้วย CTA: {{ctaStyle}} และ disclosure พร้อมลิงก์ {{affiliateLink}}",
  },
  {
    name: "แคปชันเน้นรีวิวอย่างปลอดภัย",
    content: "สร้างแคปชัน {{platform}} สำหรับ {{productTitle}} โดยสรุปข้อเท็จจริงจากข้อมูลนี้ {{description}} ระบุ rating {{rating}} และ review summary {{reviewSummary}} แบบไม่แต่งเติมข้อมูล ปิดท้ายด้วย {{hashtags}} และ {{affiliateLink}}",
  },
];

export function PromptTemplateEditor({ initialName = "", initialContent = "", onSave }: Props) {
  const [name, setName] = useState(initialName);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="space-y-3 rounded-lg border p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        await onSave({ name, content });
        setSaving(false);
      }}
    >
      <div className="rounded-md border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
        <p className="font-semibold">Template Presets</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {presetTemplates.map((preset) => (
            <button className="rounded border bg-white px-2 py-1 text-xs" key={preset.name} onClick={() => { setName(preset.name); setContent(preset.content); }} type="button">{preset.name}</button>
          ))}
        </div>
      </div>
      <input className="w-full rounded border p-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อเทมเพลต" required />
      <textarea className="h-48 w-full rounded border p-2" value={content} onChange={(e) => setContent(e.target.value)} placeholder="เนื้อหาเทมเพลต" required />
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
        <p className="font-semibold">ตัวแปรที่ใช้ได้</p>
        <p className="mt-1">{TEMPLATE_VARIABLES.join(" ")}</p>
      </div>
      <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-60" disabled={saving} type="submit">
        {saving ? "กำลังบันทึก..." : "บันทึกเทมเพลต"}
      </button>
    </form>
  );
}
