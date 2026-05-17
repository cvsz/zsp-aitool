"use client";

import { useEffect, useState } from "react";
import { Platform, Tone } from "@prisma/client";
import { PlatformSelector } from "./PlatformSelector";
import { ToneSelector } from "./ToneSelector";
import { GeneratedContentCard } from "./GeneratedContentCard";

export function ContentGeneratorForm() {
  const [products, setProducts] = useState<{ id: string; title: string }[]>([]);
  const [productId, setProductId] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([Platform.FACEBOOK]);
  const [tone, setTone] = useState<Tone>(Tone.FRIENDLY);
  const [language, setLanguage] = useState("th");
  const [versions, setVersions] = useState(1);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => {
      const list = d?.data ?? [];
      setProducts(list);
      if (list[0]) setProductId(list[0].id);
    });
  }, []);

  const submit = async () => {
    setLoading(true); setError("");
    const isBatch = platforms.length > 1;
    const endpoint = isBatch ? "/api/ai/generate-batch" : "/api/ai/generate";
    const payload = isBatch
      ? { productId, platforms, tone, language, versions, customPrompt }
      : { productId, platform: platforms[0], tone, language, versions, customPrompt };

    const res = await fetch(endpoint, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
    const json = await res.json();
    if (!res.ok || !json.ok) setError(json?.error?.message ?? "Failed");
    else setResults(isBatch ? json.data.results : [{ platform: platforms[0], ...json.data }]);
    setLoading(false);
  };

  return <div className="space-y-4">
    <select className="border rounded px-2 py-1" value={productId} onChange={(e) => setProductId(e.target.value)}>{products.map((p) => <option value={p.id} key={p.id}>{p.title}</option>)}</select>
    <PlatformSelector value={platforms} onChange={setPlatforms} multiple />
    <ToneSelector value={tone} onChange={setTone} />
    <input className="border rounded px-2 py-1" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="language" />
    <input className="border rounded px-2 py-1" type="number" min={1} max={10} value={versions} onChange={(e) => setVersions(Number(e.target.value))} />
    <textarea className="border rounded px-2 py-1 w-full" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="custom prompt" />
    <button className="bg-black text-white px-3 py-2 rounded" onClick={submit} disabled={loading}>{loading ? "Generating..." : "Generate"}</button>
    {error && <div className="text-red-600">{error}</div>}
    {!loading && results.length === 0 && <div className="text-gray-500">No generated content yet</div>}
    <div className="space-y-3">{results.map((r, idx) => <div key={idx} className="space-y-2"><div className="font-bold">{r.platform}</div>{(r.outputs ?? []).map((o: any) => <GeneratedContentCard key={o.version} item={o} />)}</div>)}</div>
  </div>;
}
