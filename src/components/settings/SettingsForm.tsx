"use client";

import { FormEvent, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BackgroundColorSelect } from "@/components/theme/BackgroundColorSelect";

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
  const [usage, setUsage] = useState<null | { plan: string; usage: Record<string, number>; limits: Record<string, number>; workspace: { memberships: number; note: string } }>(null);

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

    void (async () => {
      const res = await fetch("/api/usage/summary");
      const json = await res.json();
      if (json?.ok && json.data) setUsage(json.data);
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
      <BackgroundColorSelect />
      <p className="text-sm text-slate-600 dark:text-slate-300">สถานะคีย์ AI: <strong>{status.ai}</strong></p>
      <p className="text-sm text-slate-600 dark:text-slate-300">สถานะคีย์ OCR: <strong>{status.ocr}</strong></p>
      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-950">
        <p className="font-semibold text-slate-900 dark:text-slate-100">แพ็กเกจและโควต้า</p>
        <p className="text-slate-700 dark:text-slate-300">แผนปัจจุบัน: <strong>{usage?.plan ?? "-"}</strong> (ไม่มีการชำระเงินจริงในหน้านี้)</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div>AI Generations: {usage?.usage.aiGenerations ?? "-"}</div>
          <div>Products: {usage?.usage.products ?? "-"}</div>
          <div>Exports: {usage?.usage.exports ?? "-"}</div>
          <div>OCR Jobs: {usage?.usage.ocrJobs ?? "-"}</div>
          <div>HyperFrames Renders: {usage?.usage.hyperframesRenders ?? "-"}</div>
          <div>Storage: {usage?.usage.hyperframesStorageMb ?? "-"} / {usage?.limits.hyperframesStorageMb ?? "-"} MB</div>
        </div>
        <p className="text-slate-700 dark:text-slate-300">โควต้า HyperFrames รายเดือนคงเหลือ: {usage?.limits.hyperframesMonthlyRemaining ?? "-"} / {usage?.limits.hyperframesMonthlyRenders ?? "-"}</p>
        <p className="text-slate-700 dark:text-slate-300">Rate limit โดยประมาณ: AI {usage?.limits.aiPerMinute ?? "-"}/นาที · OCR {usage?.limits.ocrPerMinute ?? "-"}/นาที</p>
      </section>
      <section className="grid gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-100">
        <p className="font-semibold">ทีมและ Workspace</p>
        <p>สมาชิก Workspace ของคุณ: {usage?.workspace.memberships ?? "-"} องค์กร</p>
        <p>{usage?.workspace.note ?? "รองรับ RBAC ตามบทบาทองค์กรเมื่อเข้าถึงฟีเจอร์ที่เกี่ยวข้อง"}</p>
      </section>
      <textarea className="w-full rounded-xl border border-slate-200 p-2 dark:border-slate-700 dark:bg-slate-950" value={form.affiliateDisclosure} onChange={(e) => setForm({ ...form, affiliateDisclosure: e.target.value })} />
      <button disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950">{saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}</button>
    </form>
  );
}
