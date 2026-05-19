"use client";

import { FormEvent, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const initialState = {
  aiProvider: "openai",
  defaultLanguage: "th",
  defaultTone: "friendly",
  affiliateDisclosure: "โพสต์นี้มีลิงก์ Affiliate หากมีการสั่งซื้อ ฉันอาจได้รับค่าคอมมิชชันโดยไม่มีค่าใช้จ่ายเพิ่มสำหรับคุณ",
  defaultHashtagPreference: "balanced",
  defaultCtaStyle: "soft",
  ocrProvider: "google_vision",
  profile: { displayName: "", niche: "", bio: "" },
};

export function SettingsForm() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ ai: "ยังไม่ตั้งค่า", ocr: "ยังไม่ตั้งค่า" });

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json?.ok && json.data) {
        const data = json.data;
        setForm({ ...initialState, ...data, profile: { ...initialState.profile, ...data.profile } });
        setStatus({ ai: data.aiProviderKeyStatus?.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า", ocr: data.ocrProviderKeyStatus?.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า" });
      }
      setLoading(false);
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await res.json();
    if (json?.ok && json.data) {
      setStatus({ ai: json.data.aiProviderKeyStatus?.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า", ocr: json.data.ocrProviderKeyStatus?.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า" });
    }
    setSaving(false);
  }

  if (loading) return <p className="text-slate-600 dark:text-slate-300">กำลังโหลดการตั้งค่า...</p>;

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ตั้งค่า</h1>
      <ThemeToggle />
      <p className="text-sm text-slate-600 dark:text-slate-300">สถานะคีย์ AI: <strong>{status.ai}</strong></p>
      <p className="text-sm text-slate-600 dark:text-slate-300">สถานะคีย์ OCR: <strong>{status.ocr}</strong></p>
      <textarea className="w-full rounded-xl border border-slate-200 p-2 dark:border-slate-700 dark:bg-slate-950" value={form.affiliateDisclosure} onChange={(e) => setForm({ ...form, affiliateDisclosure: e.target.value })} />
      <button disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950">{saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}</button>
    </form>
  );
}
