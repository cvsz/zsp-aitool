"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type Summary = Record<string, number>;
type SocialChannel = "facebook" | "threads" | "x" | "instagram" | "tiktok" | "youtube_shorts";

const emptySummary: Summary = { pendingReview: 0, approved: 0, rejected: 0, imported: 0, failed: 0 };
const affiliateDisclosure = "โพสต์นี้มีลิงก์ Affiliate ผู้สร้างอาจได้รับค่าคอมมิชชันจากคำสั่งซื้อที่เข้าเงื่อนไข โดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับผู้ซื้อ";
const shortAffiliateDisclosure = "ลิงก์นี้เป็นลิงก์ Affiliate";
const spGlobalCategoryFileName = "SP-Product-Feed-All-Global-Category.csv";
const AUTO_REFRESH_MS = 30_000;

const statusLabels: Record<string, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  imported: "Imported",
  rejected: "Rejected",
  failed: "Failed",
};

const statusColors: Record<string, string> = {
  pending_review: "bg-amber-100 text-amber-900 border-amber-200",
  approved: "bg-emerald-100 text-emerald-900 border-emerald-200",
  imported: "bg-blue-100 text-blue-900 border-blue-200",
  rejected: "bg-red-100 text-red-900 border-red-200",
  failed: "bg-rose-100 text-rose-900 border-rose-200",
};

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
    offer, price, "",
    disclosure,
    link ? `ลิงก์: ${link}` : "ลิงก์: ตรวจสอบรายการก่อนแนบลิงก์",
    hashtags,
  ].filter(Boolean).join("\n");
}

export function ShopeeAffiliateControlCenter() {
  const [payload, setPayload] = useState<{ items: IngestionItem[]; summary: Summary }>({ items: [], summary: emptySummary });
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);
  const [bulkUrls, setBulkUrls] = useState("");
  const [showBulkUrlInput, setShowBulkUrlInput] = useState(false);

  const [manual, setManual] = useState({ affiliateUrl: "", productUrl: "", title: "", campaignNote: "", price: "" });
  const [csv, setCsv] = useState("affiliate_url,product_url,title,campaign,price\n");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [importProductsFromCsv, setImportProductsFromCsv] = useState(true);
  const [socialChannel, setSocialChannel] = useState<SocialChannel>("facebook");
  const [draftsById, setDraftsById] = useState<Record<string, { draftId: string; content: string }>>({});

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredEndpoint = useMemo(() => {
    if (status === "all") return "/api/integrations/shopee/affiliate-ingestions";
    return `/api/integrations/shopee/affiliate-ingestions?status=${status}`;
  }, [status]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return payload.items;
    const q = search.toLowerCase();
    return payload.items.filter((item) =>
      [item.title, item.affiliateUrl, item.productUrl, item.campaignNote, item.source, item.id]
        .some((f) => f?.toLowerCase().includes(q))
    );
  }, [payload.items, search]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(filteredEndpoint);
      const json = await res.json();
      if (json?.ok && json.data) setPayload(json.data);
    } finally {
      setLoading(false);
    }
  }, [filteredEndpoint]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => void refresh(), AUTO_REFRESH_MS);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, refresh]);

  const hasFilteredItems = filteredItems.length > 0;

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

  async function submitBulkUrls(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const lines = bulkUrls.split("\n").map((l) => l.trim()).filter(Boolean);
    let success = 0;
    let fail = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const [aff, prod] = line.includes(",") ? line.split(",").map((s) => s.trim()) : [line, line];
      try {
        const res = await fetch("/api/integrations/shopee/affiliate-manual-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            affiliateUrl: aff,
            productUrl: prod,
            saveMode: "affiliate-link",
            title: undefined,
            campaignNote: undefined,
            price: undefined,
          }),
        });
        const json = await res.json();
        if (json?.ok) success++;
        else fail++;
      } catch { fail++; }
      setBatchProgress(`นำเข้าที่ ${i + 1}/${lines.length}... (สำเร็จ ${success}, ล้มเหลว ${fail})`);
    }
    setBulkUrls("");
    setShowBulkUrlInput(false);
    setBatchProgress(null);
    setMessage(`นำเข้า ${success} รายการสำเร็จ, ล้มเหลว ${fail} รายการ`);
    await refresh();
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
    setBusyIds((prev) => new Set(prev).add(id));
    setMessage(null);
    try {
      const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "reject" ? JSON.stringify({ reason: "Rejected from dashboard" }) : undefined,
      });
      const json = await res.json();
      setMessage(json?.ok ? `ดำเนินการ ${action} สำเร็จ` : json?.error?.message ?? `ไม่สามารถ ${action} ได้`);
    } finally {
      setBusyIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      await refresh();
    }
  }

  async function batchAct(action: "approve" | "reject" | "import") {
    if (selected.size === 0) return;
    setMessage(null);
    let success = 0;
    let fail = 0;
    const ids = Array.from(selected);
    setBusyIds(new Set(ids));
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      try {
        const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${id}/${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: action === "reject" ? JSON.stringify({ reason: "Batch reject from dashboard" }) : undefined,
        });
        const json = await res.json();
        if (json?.ok) success++;
        else fail++;
      } catch { fail++; }
      setBatchProgress(`กำลังดำเนินการ ${action} ที่ ${i + 1}/${ids.length}... (สำเร็จ ${success}, ล้มเหลว ${fail})`);
    }
    setSelected(new Set());
    setBusyIds(new Set());
    setBatchProgress(null);
    setMessage(`ดำเนินการ ${action} แบบกลุ่ม: สำเร็จ ${success}, ล้มเหลว ${fail}`);
    await refresh();
  }

  async function createSocialDraft(item: IngestionItem) {
    const content = buildSocialPostDraft(item, socialChannel);
    const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${item.id}/social-drafts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: socialChannel, content }),
    });
    const json = await res.json();
    if (!json?.ok) return setMessage(json?.error?.message ?? "ไม่สามารถสร้าง draft ได้");
    setDraftsById((current) => ({ ...current, [item.id]: { draftId: json.data.id, content: json.data.content } }));
    setMessage(`สร้าง draft สำหรับ ${socialChannelLabels[socialChannel]} แล้ว โปรดตรวจทานก่อนโพสต์จริง`);
  }

  async function batchCreateSocialDrafts() {
    if (selected.size === 0) return;
    setMessage(null);
    let success = 0;
    let fail = 0;
    const ids = Array.from(selected);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const item = payload.items.find((it) => it.id === id);
      if (!item || !item.affiliateUrl) { fail++; continue; }
      try {
        const content = buildSocialPostDraft(item, socialChannel);
        const res = await fetch(`/api/integrations/shopee/affiliate-ingestions/${id}/social-drafts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: socialChannel, content }),
        });
        const json = await res.json();
        if (json?.ok) {
          success++;
          setDraftsById((current) => ({ ...current, [id]: { draftId: json.data.id, content: json.data.content } }));
        } else fail++;
      } catch { fail++; }
      setBatchProgress(`สร้าง draft ที่ ${i + 1}/${ids.length}... (สำเร็จ ${success}, ล้มเหลว ${fail})`);
    }
    setSelected(new Set());
    setBatchProgress(null);
    setMessage(`สร้าง draft แบบกลุ่ม: สำเร็จ ${success}, ล้มเหลว ${fail}`);
  }

  async function saveSocialDraft(item: IngestionItem, content: string) {
    const current = draftsById[item.id];
    if (!current?.draftId) return;
    await fetch(`/api/integrations/shopee/affiliate-ingestions/${item.id}/social-drafts`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftId: current.draftId, content }),
    });
  }

  async function copySocialDraft(item: IngestionItem) {
    const current = draftsById[item.id];
    const draft = current?.content ?? buildSocialPostDraft(item, socialChannel);
    await navigator.clipboard.writeText(draft);
    if (current?.draftId) {
      await fetch("/api/integrations/shopee/affiliate-ingestions/social-drafts/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: current.draftId }),
      });
    }
    setMessage("คัดลอก social post draft แล้ว — ผู้ใช้ต้องตรวจทานและโพสต์เอง");
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      if (prev.size === filteredItems.length) return new Set();
      return new Set(filteredItems.map((it) => it.id));
    });
  }

  function exportCsv() {
    const headers = ["id", "status", "source", "title", "affiliateUrl", "productUrl", "price", "campaignNote", "createdAt"];
    const rows = filteredItems.map((it) =>
      headers.map((h) => JSON.stringify(String((it as Record<string, unknown>)[h] ?? ""))).join(",")
    );
    const blob = new Blob([headers.join(","), "\n", rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shopee-affiliate-queue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="space-y-6 p-6">
      <Header
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh((p) => !p)}
        onRefresh={refresh}
        loading={loading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={hasFilteredItems ? exportCsv : undefined}
      />

      <StatsBar
        summary={payload.summary}
        activeStatus={status}
        onStatusClick={setStatus}
      />

      <ComplianceBanner />

      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">{message}</div>
      ) : null}

      {batchProgress ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{batchProgress}</div>
      ) : null}

      <SearchBar
        search={search}
        onSearchChange={setSearch}
        showBulkUrlInput={showBulkUrlInput}
        onToggleBulkUrl={() => setShowBulkUrlInput((p) => !p)}
        hasSelected={selected.size > 0}
        selectedCount={selected.size}
        onBatchAct={batchAct}
        onBatchDraft={batchCreateSocialDrafts}
        socialChannel={socialChannel}
      />

      {showBulkUrlInput ? (
        <BulkUrlForm
          value={bulkUrls}
          onChange={setBulkUrls}
          onSubmit={submitBulkUrls}
          onCancel={() => { setShowBulkUrlInput(false); setBulkUrls(""); }}
        />
      ) : null}

      <CsvProductImportProgressPanel />

      <section className="grid gap-4 lg:grid-cols-2">
        <ManualForm manual={manual} onChange={setManual} onSubmit={submitManual} />
        <CsvForm
          csv={csv}
          onChange={setCsv}
          onFileChange={handleCsvFile}
          onSubmit={submitCsv}
          selectedFileName={selectedFileName}
          importProductsFromCsv={importProductsFromCsv}
          onToggleImport={() => setImportProductsFromCsv((p) => !p)}
        />
      </section>

      {viewMode === "kanban" ? (
        <KanbanView
          items={filteredItems}
          busyIds={busyIds}
          selected={selected}
          onToggleSelect={toggleSelect}
          onAct={act}
          socialChannel={socialChannel}
          draftsById={draftsById}
          onCreateDraft={createSocialDraft}
          onSaveDraft={saveSocialDraft}
          onCopyDraft={copySocialDraft}
          onSelectAll={toggleSelectAll}
          allSelected={filteredItems.length > 0 && selected.size === filteredItems.length}
        />
      ) : (
        <ListView
          items={filteredItems}
          loading={loading}
          busyIds={busyIds}
          selected={selected}
          onToggleSelect={toggleSelect}
          onAct={act}
          socialChannel={socialChannel}
          draftsById={draftsById}
          onDraftContentChange={setDraftsById}
          onCreateDraft={createSocialDraft}
          onSaveDraft={saveSocialDraft}
          onCopyDraft={copySocialDraft}
          onSelectAll={toggleSelectAll}
          allSelected={filteredItems.length > 0 && selected.size === filteredItems.length}
        />
      )}
    </main>
  );
}

function Header({
  autoRefresh, onToggleAutoRefresh, onRefresh, loading, viewMode, onViewModeChange, onExport,
}: {
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  loading: boolean;
  viewMode: "list" | "kanban";
  onViewModeChange: (v: "list" | "kanban") => void;
  onExport: (() => void) | undefined;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Phase 034 · Real Database</p>
        <h1 className="text-2xl font-bold text-slate-950">Shopee Affiliate Control Center</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Import, review, approve, and publish Shopee affiliate links from your real PostgreSQL database.
          Supports manual URLs, CSV/TSV upload, social draft generation, and batch operations.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs">
          <span className={`inline-block h-2 w-2 rounded-full ${autoRefresh ? "bg-emerald-500" : "bg-slate-300"}`} />
          <span className="text-slate-600">Auto</span>
          <button onClick={onToggleAutoRefresh} className="font-semibold text-slate-800 hover:text-slate-950">
            {autoRefresh ? "ON" : "OFF"}
          </button>
        </div>
        <button onClick={onRefresh} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40">
          {loading ? "..." : "Refresh"}
        </button>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs">
          <button onClick={() => onViewModeChange("list")}
            className={`px-3 py-1.5 font-semibold ${viewMode === "list" ? "bg-slate-950 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}>
            List
          </button>
          <button onClick={() => onViewModeChange("kanban")}
            className={`px-3 py-1.5 font-semibold ${viewMode === "kanban" ? "bg-slate-950 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}>
            Pipeline
          </button>
        </div>
        <a className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-900" href="https://affiliate.shopee.co.th/" target="_blank" rel="noreferrer">Open Shopee Affiliate Portal</a>
        <a className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700" href="/dashboard/templates">Create social post</a>
        {onExport ? (
          <button onClick={onExport} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            Export CSV
          </button>
        ) : null}
      </div>
    </header>
  );
}

function StatsBar({ summary, activeStatus, onStatusClick }: { summary: Summary; activeStatus: string; onStatusClick: (s: string) => void }) {
  const items = [
    { key: "all", label: "All", count: Object.values(summary).reduce((a, b) => a + b, 0) },
    { key: "pending_review", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "imported", label: "Imported" },
    { key: "rejected", label: "Rejected" },
    { key: "failed", label: "Failed" },
  ];
  return (
    <section className="grid gap-3 md:grid-cols-6">
      {items.map(({ key, label }) => {
        const value = key === "all" ? Object.values(summary).reduce((a, b) => a + b, 0) : (summary[key] ?? 0);
        return (
          <button key={key} onClick={() => onStatusClick(key)}
            className={`rounded-2xl border p-4 text-left shadow-sm transition-all hover:shadow-md ${activeStatus === key ? "border-orange-400 bg-orange-50 ring-2 ring-orange-200" : "border-slate-200 bg-white"}`}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-black ${value > 0 ? "text-slate-950" : "text-slate-300"}`}>{value}</p>
          </button>
        );
      })}
    </section>
  );
}

function ComplianceBanner() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-semibold">Compliance-safe automation</p>
      <p className="mt-1">ไม่มี auto-login, ไม่เก็บ password/cookie/session/localStorage, ไม่ scrape private dashboard, ไม่ bypass CAPTCHA/anti-bot และไม่เรียก private endpoint ไม่มี auto-publish ไปยังโซเชียล ทุก draft ต้องให้ผู้ใช้ตรวจทานและโพสต์เอง</p>
    </section>
  );
}

function SearchBar({
  search, onSearchChange, showBulkUrlInput, onToggleBulkUrl,
  hasSelected, selectedCount, onBatchAct, onBatchDraft, socialChannel,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  showBulkUrlInput: boolean;
  onToggleBulkUrl: () => void;
  hasSelected: boolean;
  selectedCount: number;
  onBatchAct: (action: "approve" | "reject" | "import") => void;
  onBatchDraft: () => void;
  socialChannel: SocialChannel;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-0 flex-1">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm" placeholder="Search by title, URL, source, or ID..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      <button onClick={onToggleBulkUrl} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
        {showBulkUrlInput ? "Close bulk paste" : "+ Bulk paste URLs"}
      </button>
      {hasSelected ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5">
          <span className="text-xs font-semibold text-orange-900">{selectedCount} selected</span>
          <button onClick={() => onBatchAct("approve")} className="rounded-lg border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-200">Approve</button>
          <button onClick={() => onBatchAct("reject")} className="rounded-lg border border-red-300 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-900 hover:bg-red-200">Reject</button>
          <button onClick={() => onBatchAct("import")} className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800">Import</button>
          <button onClick={onBatchDraft} className="rounded-lg border border-orange-300 bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-900 hover:bg-orange-200">Drafts ({socialChannelLabels[socialChannel]})</button>
        </div>
      ) : null}
    </div>
  );
}

function BulkUrlForm({ value, onChange, onSubmit, onCancel }: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-blue-950">Paste multiple URLs</h3>
          <p className="text-xs text-blue-800">One per line, or affiliate_url,product_url per line. Each will be saved as a pending review item.</p>
        </div>
        <button type="button" onClick={onCancel} className="text-xs text-blue-700 hover:text-blue-900">Cancel</button>
      </div>
      <textarea className="mt-3 min-h-28 w-full rounded-xl border border-blue-200 p-3 font-mono text-xs" placeholder={`https://shopee.co.th/product/123\nhttps://shopee.co.th/product/456,https://shopee.co.th/product/456\n...`} value={value} onChange={(e) => onChange(e.target.value)} />
      <button className="mt-2 rounded-xl bg-blue-950 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900">Import all URLs</button>
    </form>
  );
}

function ManualForm({ manual, onChange, onSubmit }: {
  manual: { affiliateUrl: string; productUrl: string; title: string; campaignNote: string; price: string };
  onChange: (v: typeof manual) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold">เพิ่มจาก URL</h2>
        <p className="text-sm text-slate-600">ระบบจะ validate Shopee HTTPS allowlist และเก็บลง DB เป็น pending review</p>
      </div>
      <input className="w-full rounded-xl border p-2 text-sm" placeholder="Affiliate URL" value={manual.affiliateUrl} onChange={(e) => onChange({ ...manual, affiliateUrl: e.target.value })} required />
      <input className="w-full rounded-xl border p-2 text-sm" placeholder="Product URL" value={manual.productUrl} onChange={(e) => onChange({ ...manual, productUrl: e.target.value })} required />
      <input className="w-full rounded-xl border p-2 text-sm" placeholder="Title optional" value={manual.title} onChange={(e) => onChange({ ...manual, title: e.target.value })} />
      <div className="grid gap-3 md:grid-cols-2">
        <input className="w-full rounded-xl border p-2 text-sm" placeholder="Campaign note" value={manual.campaignNote} onChange={(e) => onChange({ ...manual, campaignNote: e.target.value })} />
        <input className="w-full rounded-xl border p-2 text-sm" placeholder="Price" inputMode="decimal" value={manual.price} onChange={(e) => onChange({ ...manual, price: e.target.value })} />
      </div>
      <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save URL to real DB</button>
    </form>
  );
}

function CsvForm({ csv, onChange, onFileChange, onSubmit, selectedFileName, importProductsFromCsv, onToggleImport }: {
  csv: string;
  onChange: (v: string) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  selectedFileName: string | null;
  importProductsFromCsv: boolean;
  onToggleImport: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold">Upload/Paste CSV or TSV</h2>
        <p className="text-sm text-slate-600">รองรับ Product Feed header ภาษาไทย และไฟล์ {spGlobalCategoryFileName}</p>
      </div>
      <label className="block rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-950">
        <span className="font-semibold">Import {spGlobalCategoryFileName}</span>
        <span className="mt-1 block text-xs">เลือกไฟล์ CSV จาก Shopee Product Feed แล้วระบบจะโหลดข้อมูลเข้า preview box โดยยังไม่สร้างสินค้าจนกดปุ่มด้านล่าง</span>
        <input className="mt-3 block w-full text-xs" type="file" accept=".csv,text/csv,.tsv,text/tab-separated-values" onChange={onFileChange} />
      </label>
      {selectedFileName ? <p className="text-xs text-slate-500">Selected: {selectedFileName}</p> : null}
      <label className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
        <input className="mt-1" type="checkbox" checked={importProductsFromCsv} onChange={onToggleImport} />
        <span><strong>สร้างสินค้าเข้าฐานข้อมูลทันทีหลัง validate</strong><br /><span className="text-xs">เปิดไว้เพื่อให้ปุ่มนี้ save queue + import เป็น Product/AffiliateLink เลย ปิดไว้ถ้าต้องการตรวจทานทีละรายการก่อน</span></span>
      </label>
      <textarea className="min-h-52 w-full rounded-xl border p-2 font-mono text-xs" value={csv} onChange={(e) => onChange(e.target.value)} />
      <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{importProductsFromCsv ? "Preview + Save + Import Products to DB" : "Preview + Save CSV/TSV rows to Review Queue"}</button>
    </form>
  );
}

function ListView({
  items, loading, busyIds, selected, onToggleSelect, onAct,
  socialChannel, draftsById, onDraftContentChange, onCreateDraft, onSaveDraft, onCopyDraft, onSelectAll, allSelected,
}: {
  items: IngestionItem[];
  loading: boolean;
  busyIds: Set<string>;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onAct: (id: string, action: "approve" | "reject" | "import") => void;
  socialChannel: SocialChannel;
  draftsById: Record<string, { draftId: string; content: string }>;
  onDraftContentChange: React.Dispatch<React.SetStateAction<Record<string, { draftId: string; content: string }>>>;
  onCreateDraft: (item: IngestionItem) => void;
  onSaveDraft: (item: IngestionItem, content: string) => void;
  onCopyDraft: (item: IngestionItem) => void;
  onSelectAll: () => void;
  allSelected: boolean;
}) {
  if (loading) return <p className="text-sm text-slate-600">กำลังโหลดข้อมูลจาก DB...</p>;
  if (!items.length) return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-600">ยังไม่มีรายการใน DB queue</p>;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-bold">Real Database Queue ({items.length})</h2>
        <label className="flex items-center gap-1.5 text-xs text-slate-500">
          <input type="checkbox" checked={allSelected} onChange={onSelectAll} />
          Select all
        </label>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const isBusy = busyIds.has(item.id);
          const isSelected = selected.has(item.id);
          return (
            <article key={item.id} className={`rounded-2xl border p-4 transition-all ${isSelected ? "border-orange-300 bg-orange-50/50" : "border-slate-200 hover:border-slate-300"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(item.id)} className="shrink-0" />
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{item.source}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColors[item.status] ?? "bg-slate-100 text-slate-700"}`}>{statusLabels[item.status] ?? item.status}</span>
                    {item.productId ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">product linked</span> : null}
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-950">{item.title ?? "Shopee Affiliate Import"}</h3>
                  <p className="mt-1 break-all text-xs text-slate-500">Affiliate: {item.affiliateUrl}</p>
                  <p className="break-all text-xs text-slate-500">Product: {item.productUrl}</p>
                  {item.errorSummary ? <p className="mt-1 text-xs text-red-700">{item.errorSummary}</p> : null}
                  {draftsById[item.id] ? (
                    <textarea className="mt-3 min-h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700"
                      value={draftsById[item.id].content}
                      onChange={(e) => {
                        onDraftContentChange((current) => ({ ...current, [item.id]: { ...(current[item.id] ?? { draftId: "", content: "" }), content: e.target.value } }));
                      }}
                      onBlur={(e) => void onSaveDraft(item, e.target.value)}
                    />
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={isBusy || item.status !== "pending_review"} onClick={() => onAct(item.id, "approve")}
                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Approve</button>
                  <button disabled={isBusy || item.status === "imported"} onClick={() => onAct(item.id, "reject")}
                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Reject</button>
                  <button disabled={isBusy || item.status === "imported" || item.status === "rejected"} onClick={() => onAct(item.id, "import")}
                    className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs text-white disabled:opacity-40">Import</button>
                  <button disabled={item.status === "rejected" || !item.affiliateUrl} onClick={() => onCreateDraft(item)}
                    className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-900 disabled:opacity-40">Draft</button>
                  <button disabled={item.status === "rejected" || !item.affiliateUrl} onClick={() => onCopyDraft(item)}
                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Copy</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function KanbanView({
  items, busyIds, selected, onToggleSelect, onAct,
  socialChannel, draftsById, onCreateDraft, onSaveDraft, onCopyDraft, onSelectAll, allSelected,
}: {
  items: IngestionItem[];
  busyIds: Set<string>;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onAct: (id: string, action: "approve" | "reject" | "import") => void;
  socialChannel: SocialChannel;
  draftsById: Record<string, { draftId: string; content: string }>;
  onCreateDraft: (item: IngestionItem) => void;
  onSaveDraft: (item: IngestionItem, content: string) => void;
  onCopyDraft: (item: IngestionItem) => void;
  onSelectAll: () => void;
  allSelected: boolean;
}) {
  const columns = ["pending_review", "approved", "imported", "rejected", "failed"];

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold">Pipeline ({items.length})</h2>
        <label className="flex items-center gap-1.5 text-xs text-slate-500">
          <input type="checkbox" checked={allSelected} onChange={onSelectAll} />
          Select all
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {columns.map((col) => {
          const colItems = items.filter((it) => it.status === col);
          return (
            <div key={col} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">{statusLabels[col] ?? col}</span>
                <span className="text-xs font-bold text-slate-400">{colItems.length}</span>
              </div>
              <div className="space-y-2">
                {colItems.map((item) => (
                  <div key={item.id} className={`rounded-xl border-2 p-3 text-xs ${selected.has(item.id) ? "border-orange-400 bg-orange-50" : "border-white bg-white shadow-sm"}`}>
                    <div className="flex items-start justify-between gap-1">
                      <input type="checkbox" checked={selected.has(item.id)} onChange={() => onToggleSelect(item.id)} className="mt-0.5 shrink-0" />
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{item.source}</span>
                    </div>
                    <p className="mt-1.5 truncate font-semibold text-slate-950">{item.title ?? "Untitled"}</p>
                    <p className="mt-1 truncate text-[10px] text-slate-400">{item.affiliateUrl}</p>
                    {item.price ? <p className="mt-0.5 font-semibold text-emerald-700">฿{item.price.toLocaleString("th-TH")}</p> : null}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.status === "pending_review" ? (
                        <>
                          <button disabled={busyIds.has(item.id)} onClick={() => onAct(item.id, "approve")}
                            className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 disabled:opacity-40">✓</button>
                          <button disabled={busyIds.has(item.id)} onClick={() => onAct(item.id, "reject")}
                            className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-800 disabled:opacity-40">✕</button>
                        </>
                      ) : item.status === "approved" ? (
                        <button disabled={busyIds.has(item.id)} onClick={() => onAct(item.id, "import")}
                          className="rounded bg-slate-950 px-2 py-0.5 text-[10px] font-semibold text-white disabled:opacity-40">Import</button>
                      ) : null}
                      {item.affiliateUrl ? (
                        <button onClick={() => onCreateDraft(item)}
                          className="rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-800">Draft</button>
                      ) : null}
                    </div>
                  </div>
                ))}
                {colItems.length === 0 ? (
                  <p className="py-6 text-center text-[10px] text-slate-400">No items</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


