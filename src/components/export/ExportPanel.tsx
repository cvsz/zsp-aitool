"use client";

import { FormEvent, useMemo, useState } from "react";

type ExportKind = "products" | "contentCsv" | "contentMd";

export function ExportPanel(): JSX.Element {
  const [platform, setPlatform] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [singleContentId, setSingleContentId] = useState("");

  const query = useMemo(() => {
    const search = new URLSearchParams();
    if (platform) search.set("platform", platform);
    if (startDate) search.set("startDate", startDate);
    if (endDate) search.set("endDate", endDate);
    const value = search.toString();
    return value ? `?${value}` : "";
  }, [platform, startDate, endDate]);

  const downloadUrl = (kind: ExportKind): string => {
    if (kind === "products") return "/api/export/products.csv";
    if (kind === "contentCsv") return `/api/export/content.csv${query}`;
    return `/api/export/content.md${query}`;
  };

  const onExportSingle = (event: FormEvent) => {
    event.preventDefault();
    const trimmedId = singleContentId.trim();
    if (!trimmedId) return;
    const encodedId = encodeURIComponent(trimmedId);
    window.location.href = `/api/export/content/${encodedId}.txt`;
  };

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 p-4">
      <h2 className="text-lg font-semibold">Export Data</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <input className="rounded border p-2" placeholder="platform เช่น facebook" value={platform} onChange={(e) => setPlatform(e.target.value)} />
        <input className="rounded border p-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input className="rounded border p-2" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <a className="rounded bg-slate-900 px-3 py-2 text-white" href={downloadUrl("products")}>Export Products CSV</a>
        <a className="rounded bg-slate-900 px-3 py-2 text-white" href={downloadUrl("contentCsv")}>Export Content CSV</a>
        <a className="rounded bg-slate-900 px-3 py-2 text-white" href={downloadUrl("contentMd")}>Export Content Markdown</a>
      </div>

      <form className="flex gap-2" onSubmit={onExportSingle}>
        <input
          className="w-full rounded border p-2"
          placeholder="กรอก Content ID เพื่อ export .txt"
          value={singleContentId}
          onChange={(e) => setSingleContentId(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-3 py-2 text-white" type="submit">Export TXT</button>
      </form>
    </section>
  );
}
