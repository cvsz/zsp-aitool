"use client";

import { FormEvent, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BackgroundColorSelect } from "@/components/theme/BackgroundColorSelect";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/ui/PageHeader";

const initialState = {
  aiProvider: "openai",
  defaultLanguage: "th",
  defaultTone: "friendly",
  affiliateDisclosure: "โพสต์นี้มีลิงก์ Affiliate ผู้สร้างอาจได้รับค่าคอมมิชชันจากคำสั่งซื้อที่เข้าเงื่อนไข โดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับผู้ซื้อ",
  defaultHashtagPreference: "balanced",
  defaultCtaStyle: "soft",
  ocrProvider: "google_vision",
  profile: { displayName: "", niche: "", bio: "" },
};

export function SettingsForm() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [status, setStatus] = useState({ ai: "ยังไม่ตั้งค่า", ocr: "ยังไม่ตั้งค่า" });
  const [openApiMode, setOpenApiMode] = useState("DISABLED");

  const openApiStatusLabel: Record<string, string> = {
    DISABLED: "Disabled (Manual Mode)",
    FOUNDATION_ONLY: "Foundation only",
    SANDBOX_READY: "Sandbox ready",
    LIVE_READY: "Live ready",
    MANAGED_SELLER_BLOCKED: "Blocked by KAM eligibility",
    MISSING_CREDENTIALS: "Foundation only",
  };

  useEffect(() => {
    void (async () => {
      const [settingsRes, shopeeStatusRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/integrations/shopee/status"),
      ]);
      const settingsJson = await settingsRes.json();
      if (settingsJson?.ok && settingsJson.data) {
        const data = settingsJson.data;
        setForm({ ...initialState, ...data, profile: { ...initialState.profile, ...data.profile } });
        setStatus({
          ai: data.aiProviderKeyStatus?.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า",
          ocr: data.ocrProviderKeyStatus?.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า",
        });
      }
      const shopeeJson = await shopeeStatusRes.json();
      setOpenApiMode(shopeeJson?.mode ?? "DISABLED");
      setLoading(false);
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json?.ok && json.data) {
      setStatus({
        ai: json.data.aiProviderKeyStatus?.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า",
        ocr: json.data.ocrProviderKeyStatus?.configured ? "ตั้งค่าแล้ว" : "ยังไม่ตั้งค่า",
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-slate-600 dark:text-slate-300">กำลังโหลดการตั้งค่า...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-4xl space-y-6">
      <PageHeader
        title="ตั้งค่าระบบ (Settings & Compliance)"
        subtitle="ปรับแต่งธีมการแสดงผล ข้อความ Affiliate Disclosure และตรวจสอบความพร้อมของระบบ"
        actions={
          <Button type="submit" variant="primary" busy={saving}>
            {saving ? "กำลังบันทึก..." : saveSuccess ? "บันทึกเรียบร้อย ✓" : "บันทึกการตั้งค่า"}
          </Button>
        }
      />

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle>ธีมและหน้าตาการแสดงผล (Appearance)</CardTitle>
          <CardDescription>สลับโหมดสว่าง/มืด และเลือกโทนสีพื้นหลัง</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">โหมดสี (Color Mode)</p>
              <p className="text-xs text-slate-400">เลือกโหมดสว่าง, มืด หรือตามระบบ</p>
            </div>
            <ThemeToggle />
          </div>
          <div className="py-2">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">โทนสีพื้นหลัง (Background Palette)</p>
            <BackgroundColorSelect />
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Compliance Section */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อความ Affiliate Disclosure มาตรฐาน</CardTitle>
          <CardDescription>
            ข้อความนี้จะถูกแทรกอัตโนมัติในทุกแคปชันและสคริปต์วิดีโอที่สร้างโดย AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            rows={3}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
            value={form.affiliateDisclosure}
            onChange={(e) => setForm({ ...form, affiliateDisclosure: e.target.value })}
          />
          <p className="text-xs text-slate-400">
            ตัวอย่าง: "โพสต์นี้มีลิงก์ Affiliate ผู้สร้างอาจได้รับค่าคอมมิชชันจากคำสั่งซื้อที่เข้าเงื่อนไข โดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับผู้ซื้อ"
          </p>
        </CardContent>
      </Card>

      {/* Provider Status Section */}
      <Card tone="muted">
        <CardHeader>
          <CardTitle>สถานะการเชื่อมต่อบริการ (Integration Status)</CardTitle>
          <CardDescription>ตรวจสอบความพร้อมของ AI Provider และ Shopee Portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-800 p-3.5 border border-slate-200/80 dark:border-slate-700">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">AI Provider Key</p>
                <p className="text-xs text-slate-400">OpenAI / OpenRouter Bridge</p>
              </div>
              <StatusBadge
                label={status.ai}
                tone={status.ai === "ตั้งค่าแล้ว" ? "success" : "info"}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-800 p-3.5 border border-slate-200/80 dark:border-slate-700">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">OCR Provider Key</p>
                <p className="text-xs text-slate-400">Vision Spec Extractor</p>
              </div>
              <StatusBadge
                label={status.ocr}
                tone={status.ocr === "ตั้งค่าแล้ว" ? "success" : "info"}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-2 text-xs text-amber-900 dark:text-amber-300">
            <div className="flex items-center justify-between">
              <span className="font-bold">Shopee Affiliate Portal Mode:</span>
              <StatusBadge label="Manual Safe Mode" tone="warning" />
            </div>
            <p>Open API Mode: <strong>{openApiStatusLabel[openApiMode] ?? "Foundation only"}</strong></p>
            <p>
              ระบบทำงานแบบปลอดภัยสูงสุด (Zero-Credential Leak) โดยผู้ใช้ล็อกอินที่ Shopee Affiliate Portal ด้วยตนเอง และคัดลอกลิงก์หรือ CSV feed เข้าสู่ระบบ
            </p>
            <div className="pt-2">
              <a
                href="https://affiliate.shopee.co.th/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-semibold text-amber-900 dark:text-amber-200 shadow-sm"
              >
                <span>🌐</span> เปิด Shopee Affiliate Portal
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
