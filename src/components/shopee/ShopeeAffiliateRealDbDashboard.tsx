"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

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

const emptySummary: Summary = { pendingReview: 0, approved: 0, rejected: 0, imported: 0, failed: 0 };

export function ShopeeAffiliateRealDbDashboard() {
  const [payload, setPayload] = useState<ListPayload>({ items: [], summary: emptySummary });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const [manual, setManual] = useState({ affiliateUrl: "", productUrl: "", title: "", campaignNote: "", price: "" });
  const [csv, setCsv] = useState("affiliate_url,product_url,title,campaign,price\n");

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

  async function submitCsv(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/integrations/shopee/affiliate-csv-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const json = await res.json();
    if (json?.ok) {
      setMessage(`บันทึก CSV ลงฐานข้อมูลจริงแล้ว ${json.data.createdIngestionCount} รายการ, rejected ${json.data.rejectedCount} รายการ`);
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

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Phase 034 · Real Database</p>
          <h1 className="text-2xl font-bold text-slate-950">Shopee Affiliate Import Dashboard</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">อัปโหลด CSV หรือวาง URL เพื่อบันทึกลง PostgreSQL จริงแบบ pending review ก่อนนำเข้าเป็นสินค้า/affiliate link</p>
        </div>
        <a className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-900" href="https://affiliate.shopee.co.th/" target="_blank" rel="noreferrer">Open Shopee Affiliate Portal</a>
      </header>

      <section className="grid gap-3 md:grid-cols-5">
        <Stat label="Pending" value={payload.summary.pendingReview} />
        <Stat label="Approved" value={payload.summary.approved} />
        <Stat label="Imported" value={payload.summary.imported} />
        <Stat label="Rejected" value={payload.summary.rejected} />
        <Stat label="Failed" value={payload.summary.failed} />
      </section>

      {message ? <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">{message}</div> : null}

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
            <h2 className="text-lg font-bold">Upload/Paste CSV</h2>
            <p className="text-sm text-slate-600">รองรับ columns: affiliate_url, product_url, title, campaign, price และ block CSV formula injection</p>
          </div>
          <textarea className="min-h-52 w-full rounded-xl border p-2 font-mono text-xs" value={csv} onChange={(e) => setCsv(e.target.value)} />
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Preview + Save CSV rows to DB</button>
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
                </div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={busyId === item.id || item.status !== "pending_review"} onClick={() => act(item.id, "approve")} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Approve</button>
                  <button disabled={busyId === item.id || item.status === "imported"} onClick={() => act(item.id, "reject")} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Reject</button>
                  <button disabled={busyId === item.id || item.status === "imported" || item.status === "rejected"} onClick={() => act(item.id, "import")} className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs text-white disabled:opacity-40">Import Product</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">Compliance-safe automation</p>
        <p className="mt-1">ไม่มี auto-login, ไม่เก็บ password/cookie/session/localStorage, ไม่ scrape private dashboard, ไม่ bypass CAPTCHA/anti-bot และไม่เรียก private endpoint</p>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{value}</p></div>;
}
