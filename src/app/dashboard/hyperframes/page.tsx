"use client";

import { useEffect, useMemo, useState } from "react";

type Product = { id: string; title: string };

const PLATFORM_OPTIONS = ["facebook", "instagram", "threads", "x", "blog"] as const;
const ASPECT_RATIO_OPTIONS = ["16:9", "9:16", "1:1"] as const;

export default function HyperFramesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [platform, setPlatform] = useState<(typeof PLATFORM_OPTIONS)[number]>("facebook");
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_RATIO_OPTIONS)[number]>("9:16");
  const [durationSeconds, setDurationSeconds] = useState(15);
  const [textInput, setTextInput] = useState("");
  const [compositionHtml, setCompositionHtml] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts((data.data ?? []).map((item: { id: string; title: string }) => ({ id: item.id, title: item.title }))));
  }, []);

  const canCompose = useMemo(() => Boolean(productId && textInput.trim()), [productId, textInput]);

  async function compose() {
    setErrorMessage("");
    const response = await fetch("/api/hyperframes/compose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, platform, aspectRatio, durationSeconds, caption: textInput }),
    });
    const data = await response.json();
    if (data.ok) {
      setCompositionHtml(data.data.compositionHtml);
      return;
    }
    setCompositionHtml("");
    setErrorMessage(data?.error?.message ?? "สร้าง composition ไม่สำเร็จ");
  }

  function downloadHtml() {
    const blob = new Blob([compositionHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hyperframes-composition.html";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">HyperFrames</h1>
      <p className="text-slate-600">สร้างวิดีโอโปรโมตจากข้อมูลสินค้าและคอนเทนต์ AI</p>

      <div className="grid gap-3 md:grid-cols-2">
        <select className="rounded border p-2" value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">เลือกสินค้า</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </select>

        <select className="rounded border p-2" value={platform} onChange={(e) => setPlatform(e.target.value as (typeof PLATFORM_OPTIONS)[number])}>
          {PLATFORM_OPTIONS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <select className="rounded border p-2" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as (typeof ASPECT_RATIO_OPTIONS)[number])}>
          {ASPECT_RATIO_OPTIONS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <input className="rounded border p-2" type="number" min={3} max={60} value={durationSeconds} onChange={(e) => setDurationSeconds(Number(e.target.value))} />
      </div>

      <textarea className="min-h-32 w-full rounded border p-2" placeholder="ใส่สคริปต์หรือแคปชัน" value={textInput} onChange={(e) => setTextInput(e.target.value)} />

      <div className="flex gap-2">
        <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" onClick={compose} disabled={!canCompose}>
          Generate composition
        </button>
        <button className="rounded border px-4 py-2" onClick={downloadHtml} disabled={!compositionHtml}>
          Export .html
        </button>
      </div>

      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

      <pre className="max-h-96 overflow-auto rounded bg-slate-100 p-3 text-xs">{compositionHtml || "Preview composition source จะแสดงที่นี่"}</pre>
    </main>
  );
}
