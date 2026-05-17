"use client";

import { FormEvent, useEffect, useState } from "react";

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
  const [status, setStatus] = useState({ ai: "not configured", ocr: "not configured" });

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json?.ok && json.data) {
        const data = json.data;
        setForm({ ...initialState, ...data, profile: { ...initialState.profile, ...data.profile } });
        setStatus({ ai: data.aiProviderKeyStatus?.configured ? "configured" : "not configured", ocr: data.ocrProviderKeyStatus?.configured ? "configured" : "not configured" });
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
      setStatus({ ai: json.data.aiProviderKeyStatus?.configured ? "configured" : "not configured", ocr: json.data.ocrProviderKeyStatus?.configured ? "configured" : "not configured" });
    }
    setSaving(false);
  }

  if (loading) return <p>Loading settings...</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm">AI Provider key status: <strong>{status.ai}</strong></p>
      <p className="text-sm">OCR Provider key status: <strong>{status.ocr}</strong></p>

      <select className="border p-2 w-full" value={form.aiProvider} onChange={(e) => setForm({ ...form, aiProvider: e.target.value })}>
        <option value="openai">OpenAI</option><option value="openrouter">OpenRouter</option><option value="anthropic">Anthropic</option><option value="google">Google</option><option value="other">Other</option>
      </select>
      <select className="border p-2 w-full" value={form.ocrProvider} onChange={(e) => setForm({ ...form, ocrProvider: e.target.value })}>
        <option value="google_vision">Google Vision</option><option value="tesseract">Tesseract</option><option value="ocr_space">OCR Space</option><option value="other">Other</option>
      </select>
      <select className="border p-2 w-full" value={form.defaultLanguage} onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })}>
        <option value="th">Thai</option><option value="en">English</option><option value="mixed">Mixed</option>
      </select>
      <select className="border p-2 w-full" value={form.defaultTone} onChange={(e) => setForm({ ...form, defaultTone: e.target.value })}>
        <option value="friendly">Friendly</option><option value="professional">Professional</option><option value="casual">Casual</option><option value="sales">Sales</option><option value="minimal">Minimal</option>
      </select>
      <select className="border p-2 w-full" value={form.defaultHashtagPreference} onChange={(e) => setForm({ ...form, defaultHashtagPreference: e.target.value })}>
        <option value="light">Light</option><option value="balanced">Balanced</option><option value="heavy">Heavy</option><option value="none">None</option>
      </select>
      <select className="border p-2 w-full" value={form.defaultCtaStyle} onChange={(e) => setForm({ ...form, defaultCtaStyle: e.target.value })}>
        <option value="soft">Soft</option><option value="direct">Direct</option><option value="urgent">Urgent</option><option value="educational">Educational</option>
      </select>
      <input className="border p-2 w-full" placeholder="Display name" value={form.profile.displayName} onChange={(e) => setForm({ ...form, profile: { ...form.profile, displayName: e.target.value } })} />
      <input className="border p-2 w-full" placeholder="Niche" value={form.profile.niche ?? ""} onChange={(e) => setForm({ ...form, profile: { ...form.profile, niche: e.target.value } })} />
      <textarea className="border p-2 w-full" placeholder="Bio" value={form.profile.bio ?? ""} onChange={(e) => setForm({ ...form, profile: { ...form.profile, bio: e.target.value } })} />
      <textarea className="border p-2 w-full" placeholder="Affiliate disclosure" value={form.affiliateDisclosure} onChange={(e) => setForm({ ...form, affiliateDisclosure: e.target.value })} />

      <button disabled={saving} className="bg-black text-white px-4 py-2 rounded">{saving ? "Saving..." : "Save settings"}</button>
    </form>
  );
}
