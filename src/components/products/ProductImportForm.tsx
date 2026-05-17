"use client";
import { useState } from "react";

export function ProductImportForm() {
  const [url, setUrl] = useState("");
  const [json, setJson] = useState('{"products":[]}');

  return <div className="space-y-4">
    <form onSubmit={async (e) => { e.preventDefault(); await fetch("/api/products/import-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ originalUrl: url }) }); }} className="space-y-2">
      <input className="border p-2 w-full" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Import URL" required />
      <button className="border px-3 py-2" type="submit">Import URL</button>
    </form>
    <form onSubmit={async (e) => { e.preventDefault(); await fetch("/api/products/import-json", { method: "POST", headers: { "Content-Type": "application/json" }, body: json }); }} className="space-y-2">
      <textarea className="border p-2 w-full min-h-28" value={json} onChange={(e) => setJson(e.target.value)} />
      <button className="border px-3 py-2" type="submit">Import JSON</button>
    </form>
  </div>;
}
