"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CsvProductImportProgressPanel } from "@/components/imports/CsvProductImportProgressPanel";

type IngestionItem = {
  id: string;
  source: "manual" | "csv" | "extension" | "open_api_future";
  status: "pending_review" | "approved" | "rejected" | "imported" | "failed";
  affiliateUrl: string | null;
  productUrl: string | null;
  title: string | null;
  campaignNote: string | null;
  price: number | null;
  productId: string | null;
  errorSummary: string | null;
  rowIndex: number | null;
  createdAt: string;
  updatedAt: string;
};

type Summary = {
  pendingReview: number;
  approved: number;
  rejected: number;
  imported: number;
  failed: number;
};

type ListPayload = {
  items: IngestionItem[];
  summary: Summary;
};

type SocialChannel = "facebook" | "threads" | "x" | "instagram" | "tiktok" | "youtube_shorts";

const emptySummary: Summary = { pendingReview: 0, approved: 0, rejected: 0, imported: 0, failed: 0 };
const affiliateDisclosure = "โพสต์นี้มีลิงก์ Affiliate ผู้สร้างอาจได้รับค่าคอมมิชชันจากคำสั่งซื้อที่เข้าเงื่อนไข โดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับผู้ซื้อ";
const shortAffiliateDisclosure = "ลิงก์นี้เป็นลิงก์ Affiliate";
const spGlobalCategoryFileName = "SP-Product-Feed-All-Global-Category.csv";

const socialChannelLabels: Record<SocialChannel, string> = {
  facebook: "Facebook",
  threads: "Threads",
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube_shorts: "YouTube Shorts",
};

function buildSocialPostDraft(item: IngestionItem, channel: SocialChannel) {
  const title = item.title ?? "สินค้า/ร้านค้าที่เลือกจาก Shopee";
  const link = item.affiliateUrl ?? item.productUrl ?? "";
  const offer = item.campaignNote ? `\nโปรโมชัน/คอมมิชชัน: ${item.campaignNote}` : "";
  const price = item.price && item.price > 0 ? `\nราคาอ้างอิง: ฿${item.price.toLocaleString("th-TH")}` : "";
  const disclosure = channel === "x" ? shortAffiliateDisclosure : affiliateDisclosure;
  const hashtags = channel === "instagram" || channel === "tiktok" || channel === "youtube_shorts"
    ? "\n#ShopeeFinds #Affiliate #รีวิวสินค้า"
    : "";

  return [
    `แนะนำ: ${title}`,
    "เหมาะสำหรับคนที่กำลังมองหาตัวเลือกใน Shopee ลองเช็กรายละเอียด ราคา และเงื่อนไขล่าสุดก่อนสั่งซื้อ",
    offer,
    price,
    "",
    disclosure,
    link ? `ลิงก์: ${link}` : "ลิงก์: ตรวจสอบรายการก่อนแนบลิงก์",
    hashtags,
  ].filter(Boolean).join("\n");
}

export function ShopeeAffiliateRealDbDashboard() {
  const [payload, setPayload] = useState<ListPayload>({ items: [], summary: emptySummary });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const [manual, setManual] = useState({ affiliateUrl: "", productUrl: "", title: "", campaignNote: "", price: "" });
  const [csv, setCsv] = useState("affiliate_url,product_url,title,campaign,price\n");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [importProductsFromCsv, setImportProductsFromCsv] = useState(true);
  const [socialChannel, setSocialChannel] = useState<SocialChannel>("facebook");
  const [draftsById, setDraftsById] = useState<Record<string, { draftId: string; content: string }>>({});

  const filteredEndpoint = useMemo(() => status === "all" ? "/api/integrations/shopee/affiliate-ingestions" : `/api/integrations/shopee/affiliate-ingestions?status=${status}`, [status]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(filteredEndpoint);
      const json = await res.json();
      if (json?.ok && json.data) setPayload(json.data);
    } finally {
      setLoading(false);
    }
  }, [filteredEndpoint]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function submitManual(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const price = manual.price.trim() ? Number(manual.price) : undefined;
    const res = await fetch("/api/integrations/shopee/affiliate-manual-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affiliateUrl: manual.affiliateUrl,
        productUrl: manual.productUrl,
        saveMode: "affiliate-link",
        title: manual.title || undefined,
        campaignNote: manual.campaignNote || undefined,
        price: Number.isFinite(price) ? price : undefined,
      }),
    });
    const json = await res.json();
    if (json?.ok) {
      setManual({ affiliateUrl: "", productUrl: "", title: "", campaignNote: "", price: "" });
      setMessage("บันทึกรายการ URL ลงฐานข้อมูลจริงแล้ว รอตรวจทานก่อน import");
      await refresh();
    } else {
      setMessage(json?.error?.message ?? "ไม่สามารถบันทึก URL ได้");
    }
  }

  async function handleCsvFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isExpectedName = file.name === spGlobalCategoryFileName;
    const text = await file.text();
    setSelectedFileName(file.name);
    setCsv(text);
    setMessage(isExpectedName
      ? `โหลดไฟล์ ${spGlobalCategoryFileName} แล้ว กด Save + Import Products to DB เพื่อสร้างสินค้า`
      : `โหลดไฟล์ ${file.name} แล้ว ระบบจะ validate header/URL ก่อนสร้างสินค้า`);
  }

  async function submitCsv(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/integrations/shopee/affiliate-csv-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv, importProducts: importProductsFromCsv }),
    });
    const json = await res.json();
    if (json?.ok) {
      const imported = json.data.importedProductCount ?? 0;
      const failed = json.data.importFailedCount ?? 0;
      setMessage(importProductsFromCsv
        ? `บันทึก CSV แล้ว ${json.data.createdIngestionCount} รายการ และสร้างสินค้า ${imported} รายการ, import failed ${failed}, rejected ${json.data.rejectedCount}`
        : `บันทึก CSV ลง queue แล้ว ${json.data.createdIngestionCount} รายการ, rejected ${json.data.rejectedCount} รายการ`);
      await refresh();
    } else {
      setMessage(json?.error?.message ?? "ไม่สามารถ preview/import CSV ได้");
    }
  }

  async function act(id: string, action: "approve" | "reject" | "import") {
    setBusyId(id);
    setMessage(null);
    const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: action === "reject" ? JSON.stringify({ reason: "Rejected from dashboard" }) : undefined,
    });
    const json = await res.json();
    setMessage(json?.ok ? `ดำเนินการ ${action} สำเร็จ` : json?.error?.message ?? `ไม่สามารถ ${action} ได้`);
    setBusyId(null);
    await refresh();
  }

  async function createSocialDraft(item: IngestionItem) {
    const content = buildSocialPostDraft(item, socialChannel);
    const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${item.id}/social-drafts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel: socialChannel, content }) });
    const json = await res.json();
    if (!json?.ok) return setMessage(json?.error?.message ?? "ไม่สามารถสร้าง draft ได้");
    setDraftsById((current) => ({ ...current, [item.id]: { draftId: json.data.id, content: json.data.content } }));
    setMessage(`สร้าง draft สำหรับ ${socialChannelLabels[socialChannel]} แล้ว โปรดตรวจทานก่อนโพสต์จริง`);
  }

  async function saveSocialDraft(item: IngestionItem, content: string) {
    const current = draftsById[item.id];
    if (!current?.draftId) return;
    await fetch(`/api/integrations/shopee/affiliate-ingestions/${item.id}/social-drafts`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ draftId: current.draftId, content }) });
  }

  async function copySocialDraft(item: IngestionItem) {
    const current = draftsById[item.id];
    const draft = current?.content ?? buildSocialPostDraft(item, socialChannel);
    await navigator.clipboard.writeText(draft);
    if (current?.draftId) {
      await fetch("/api/integrations/shopee/affiliate-ingestions/social-drafts/copy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ draftId: current.draftId }) });
    }
    setMessage("คัดลอก social post draft แล้ว — ผู้ใช้ต้องตรวจทานและโพสต์เอง");
  }

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Phase 034 · Real Database</p>
          <h1 className="text-2xl font-bold text-slate-950">Shopee Affiliate Import Dashboard</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">อัปโหลด CSV/TSV หรือวาง URL เพื่อบันทึกลง PostgreSQL จริงแบบ pending review ก่อนนำเข้าเป็นสินค้า/affiliate link</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-900" href="https://affiliate.shopee.co.th/" target="_blank" rel="noreferrer">Open Shopee Affiliate Portal</a>
          <a className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700" href="/dashboard/templates">Create social post</a>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-5">
        <Stat label="Pending" value={payload.summary.pendingReview} />
        <Stat label="Approved" value={payload.summary.approved} />
        <Stat label="Imported" value={payload.summary.imported} />
        <Stat label="Rejected" value={payload.summary.rejected} />
        <Stat label="Failed" value={payload.summary.failed} />
      </section>

      <section className="rounded-2xl border border-orange-100 bg-orange-50 p-5 text-sm text-orange-950 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Social posting workflow</p>
            <h2 className="mt-1 text-lg font-bold">โพสต์โปรโมตลิงก์ Affiliate แบบปลอดภัย</h2>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-orange-950">
              <li>เลือกสินค้าหรือร้านค้าจาก Product Feed ที่ import แล้ว</li>
              <li>ตรวจว่า affiliate URL เป็นลิงก์ Shopee หรือ Shopee short link ที่ผ่าน allowlist</li>
              <li>สร้างโพสต์ที่อธิบายประโยชน์สินค้าอย่างชัดเจน ไม่กล่าวอ้างเกินจริง</li>
              <li>ใส่ disclosure ให้เห็นชัดก่อนเผยแพร่ใน Facebook, Threads, X, Instagram, TikTok หรือ YouTube</li>
              <li>ให้ผู้ใช้ตรวจทานและกดโพสต์เอง หรือใช้ระบบโพสต์ที่ผ่าน official platform auth เท่านั้น</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-orange-200 bg-white p-4">
            <p className="font-semibold text-slate-950">Disclosure แนะนำ</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{affiliateDisclosure}</p>
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="social-channel">Social draft channel</label>
            <select id="social-channel" className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm" value={socialChannel} onChange={(e) => setSocialChannel(e.target.value as SocialChannel)}>
              {Object.entries(socialChannelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>
      </section>

      {message ? <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">{message}</div> : null}

      <CsvProductImportProgressPanel />

      <section className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={submitManual} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-bold">เพิ่มจาก URL</h2>
            <p className="text-sm text-slate-600">ระบบจะ validate Shopee HTTPS allowlist และเก็บลง DB เป็น pending review</p>
          </div>
          <input className="w-full rounded-xl border p-2 text-sm" placeholder="Affiliate URL" value={manual.affiliateUrl} onChange={(e) => setManual({ ...manual, affiliateUrl: e.target.value })} required />
          <input className="w-full rounded-xl border p-2 text-sm" placeholder="Product URL" value={manual.productUrl} onChange={(e) => setManual({ ...manual, productUrl: e.target.value })} required />
          <input className="w-full rounded-xl border p-2 text-sm" placeholder="Title optional" value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} />
          <div className="grid gap-3 md:grid-cols-2">
            <input className="w-full rounded-xl border p-2 text-sm" placeholder="Campaign note" value={manual.campaignNote} onChange={(e) => setManual({ ...manual, campaignNote: e.target.value })} />
            <input className="w-full rounded-xl border p-2 text-sm" placeholder="Price" inputMode="decimal" value={manual.price} onChange={(e) => setManual({ ...manual, price: e.target.value })} />
          </div>
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save URL to real DB</button>
        </form>

        <form onSubmit={submitCsv} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-bold">Upload/Paste CSV or TSV</h2>
            <p className="text-sm text-slate-600">รองรับ Product Feed header ภาษาไทย และไฟล์ {spGlobalCategoryFileName}</p>
          </div>
          <label className="block rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-950">
            <span className="font-semibold">Import {spGlobalCategoryFileName}</span>
            <span className="mt-1 block text-xs">เลือกไฟล์ CSV จาก Shopee Product Feed แล้วระบบจะโหลดข้อมูลเข้า preview box โดยยังไม่สร้างสินค้าจนกดปุ่มด้านล่าง</span>
            <input className="mt-3 block w-full text-xs" type="file" accept=".csv,text/csv,.tsv,text/tab-separated-values" onChange={handleCsvFile} />
          </label>
          {selectedFileName ? <p className="text-xs text-slate-500">Selected: {selectedFileName}</p> : null}
          <label className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
            <input className="mt-1" type="checkbox" checked={importProductsFromCsv} onChange={(e) => setImportProductsFromCsv(e.target.checked)} />
            <span><strong>สร้างสินค้าเข้าฐานข้อมูลทันทีหลัง validate</strong><br /><span className="text-xs">เปิดไว้เพื่อให้ปุ่มนี้ save queue + import เป็น Product/AffiliateLink เลย ปิดไว้ถ้าต้องการตรวจทานทีละรายการก่อน</span></span>
          </label>
          <textarea className="min-h-52 w-full rounded-xl border p-2 font-mono text-xs" value={csv} onChange={(e) => setCsv(e.target.value)} />
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{importProductsFromCsv ? "Preview + Save + Import Products to DB" : "Preview + Save CSV/TSV rows to Review Queue"}</button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Real Database Queue</h2>
            <p className="text-sm text-slate-600">รายการนี้มาจากตาราง ShopeeAffiliateIngestion ไม่ใช่ memory preview</p>
          </div>
          <select className="rounded-xl border p-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="pending_review">Pending review</option>
            <option value="approved">Approved</option>
            <option value="imported">Imported</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {loading ? <p className="text-sm text-slate-600">กำลังโหลดข้อมูลจาก DB...</p> : null}
        {!loading && !payload.items.length ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-600">ยังไม่มีรายการใน DB queue</p> : null}

        <div className="space-y-3">
          {payload.items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{item.source}</span>
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">{item.status}</span>
                    {item.productId ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">product linked</span> : null}
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-950">{item.title ?? "Shopee Affiliate Import"}</h3>
                  <p className="mt-1 break-all text-xs text-slate-500">Affiliate: {item.affiliateUrl}</p>
                  <p className="break-all text-xs text-slate-500">Product: {item.productUrl}</p>
                  {item.errorSummary ? <p className="mt-1 text-xs text-red-700">{item.errorSummary}</p> : null}
                  {draftsById[item.id] ? (
                    <textarea className="mt-3 min-h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700" value={draftsById[item.id].content} onChange={(e) => setDraftsById((current) => ({ ...current, [item.id]: { ...(current[item.id] ?? { draftId: "", content: "" }), content: e.target.value } }))} onBlur={(e) => void saveSocialDraft(item, e.target.value)} />
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={busyId === item.id || item.status !== "pending_review"} onClick={() => act(item.id, "approve")} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Approve</button>
                  <button disabled={busyId === item.id || item.status === "imported"} onClick={() => act(item.id, "reject")} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Reject</button>
                  <button disabled={busyId === item.id || item.status === "imported" || item.status === "rejected"} onClick={() => act(item.id, "import")} className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs text-white disabled:opacity-40">Import Product</button>
                  <button disabled={item.status === "rejected" || !item.affiliateUrl} onClick={() => createSocialDraft(item)} className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-900 disabled:opacity-40">Generate social draft</button>
                  <button disabled={item.status === "rejected" || !item.affiliateUrl} onClick={() => copySocialDraft(item)} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Copy draft</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">Compliance-safe automation</p>
        <p className="mt-1">ไม่มี auto-login, ไม่เก็บ password/cookie/session/localStorage, ไม่ scrape private dashboard, ไม่ bypass CAPTCHA/anti-bot และไม่เรียก private endpoint ไม่มี auto-publish ไปยังโซเชียล ทุก draft ต้องให้ผู้ใช้ตรวจทานและโพสต์เอง</p>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{value}</p></div>;
}
