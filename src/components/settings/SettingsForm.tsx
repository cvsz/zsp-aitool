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
  const [openApiMode, setOpenApiMode] = useState("DISABLED");

  const openApiStatusLabel: Record<string, string> = {
    DISABLED: "Disabled",
    FOUNDATION_ONLY: "Foundation only",
    SANDBOX_READY: "Sandbox ready",
    LIVE_READY: "Live ready",
    MANAGED_SELLER_BLOCKED: "Blocked by KAM eligibility",
    MISSING_CREDENTIALS: "Foundation only",
  };

  useEffect(() => {
    void (async () => {
      const [settingsRes, shopeeStatusRes] = await Promise.all([fetch("/api/settings"), fetch("/api/integrations/shopee/status")]);
      const settingsJson = await settingsRes.json();
      if (settingsJson?.ok && settingsJson.data) {
        const data = settingsJson.data;
        setForm({ ...initialState, ...data, profile: { ...initialState.profile, ...data.profile } });
        setStatus({ ai: data.aiProviderKeyStatus?.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า", ocr: data.ocrProviderKeyStatus?.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า" });
      }
      const shopeeJson = await shopeeStatusRes.json();
      setOpenApiMode(shopeeJson?.mode ?? "DISABLED");
      setLoading(false);
    })();
  }, []);

  async function onSubmit(e: FormEvent) { e.preventDefault(); setSaving(true); const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const json = await res.json(); if (json?.ok && json.data) setStatus({ ai: json.data.aiProviderKeyStatus?.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า", ocr: json.data.ocrProviderKeyStatus?.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า" }); setSaving(false); }

  if (loading) return <p className="text-slate-600 dark:text-slate-300">กำลังโหลดการตั้งค่า...</p>;

  return <form onSubmit={onSubmit} className="max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ตั้งค่า</h1><ThemeToggle /><BackgroundColorSelect /><p className="text-sm text-slate-600 dark:text-slate-300">สถานะคีย์ AI: <strong>{status.ai}</strong></p><p className="text-sm text-slate-600 dark:text-slate-300">สถานะคีย์ OCR: <strong>{status.ocr}</strong></p>
  <section className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Shopee Affiliate Portal status: <span className="font-bold">Manual Safe Mode</span></p><p>Auth portal URL: <code>https://affiliate.shopee.co.th/</code></p><a className="w-fit rounded-lg border border-amber-400 bg-white px-3 py-1.5" href="https://affiliate.shopee.co.th/" target="_blank" rel="noreferrer">Open Shopee Affiliate Portal</a><p>Open API status: <strong>{openApiStatusLabel[openApiMode] ?? "Foundation only"}</strong> <span className="text-xs">(แยกจาก Affiliate Portal Login)</span></p><p>ผู้ใช้ต้องล็อกอินที่ Shopee Affiliate Portal ในเบราว์เซอร์ของตนเอง ระบบนี้ไม่เชื่อม Open API OAuth และไม่เก็บรหัสผ่าน/cookies/session/localStorage</p><ul className="list-disc pl-5"><li>1) เปิดพอร์ทัล Shopee Affiliate ด้วยตนเอง</li><li>2) คัดลอก Affiliate Link หรือ Product URL มาวางในระบบ</li><li>3) อัปโหลด CSV report เพื่อ preview ก่อน save</li><li>4) ตรวจทานข้อมูลและ affiliate disclosure ก่อนบันทึก/ใช้งาน</li></ul><p>Runbook: <a className="underline" href="/docs/runbooks/shopee-affiliate-portal-integration.md" target="_blank" rel="noreferrer">Shopee Affiliate Portal Integration</a></p></section>
  <textarea className="w-full rounded-xl border border-slate-200 p-2 dark:border-slate-700 dark:bg-slate-950" value={form.affiliateDisclosure} onChange={(e) => setForm({ ...form, affiliateDisclosure: e.target.value })} /><button disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950">{saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}</button></form>;
}
