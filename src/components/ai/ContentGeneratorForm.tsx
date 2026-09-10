"use client";

import { useEffect, useState } from "react";
import { Platform, Tone } from "@prisma/client";
import { PlatformSelector } from "./PlatformSelector";
import { ToneSelector } from "./ToneSelector";
import { GeneratedContentCard } from "./GeneratedContentCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlertBanner } from "@/components/ui/AlertBanner";

type OutputItem = { title: string; body: string; language: string; version: number };
type ResultEntry = { platform: string; outputs: OutputItem[] };

export function ContentGeneratorForm() {
  const [products, setProducts] = useState<{ id: string; title: string; description?: string | null; price?: number | null }[]>([]);
  const [productId, setProductId] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([Platform.FACEBOOK]);
  const [tone, setTone] = useState<Tone>(Tone.FRIENDLY);
  const [language, setLanguage] = useState("th");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [versions, setVersions] = useState(2);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        const list = d?.data ?? [];
        setProducts(list);
        if (list[0]) setProductId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/generate-batch", {
        method: "POST",
        body: JSON.stringify({ productId, platforms, tone, language, versions }),
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "สร้างคอนเทนต์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      } else {
        setResults((json.data?.results ?? [])[0]?.results ?? []);
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      setLoading(false);
    }
  };

  const selected = products.find((p) => p.id === productId);

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* Left Control Panel */}
      <div className="lg:col-span-5 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>ตั้งค่าการสร้างคอนเทนต์ AI</CardTitle>
            <CardDescription>เลือกสินค้า แพลตฟอร์ม และสไตล์การเขียน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. เลือกสินค้าจากคลัง Affiliate
              </label>
              {products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center text-xs text-slate-500">
                  ยังไม่มีสินค้าในคลัง <a href="/dashboard/products/new" className="text-sky-500 font-semibold underline">เพิ่มสินค้าใหม่</a>
                </div>
              ) : (
                <select
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  {products.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.title} {p.price ? `(฿${p.price.toLocaleString()})` : ""}
                    </option>
                  ))}
                </select>
              )}
              {selected && !selected.description ? (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  ⚠️ คำเตือน: สินค้านี้ยังไม่มีคำอธิบายสเปก แนะนำให้เพิ่มข้อมูลก่อนเพื่อความแม่นยำ
                </p>
              ) : null}
            </div>

            {/* Platform Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. แพลตฟอร์มปลายทาง
              </label>
              <PlatformSelector value={platforms} onChange={setPlatforms} multiple />
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                3. โทนภาษา & อารมณ์
              </label>
              <ToneSelector value={tone} onChange={setTone} />
            </div>

            {/* Version & Language Config */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">ภาษา</label>
                <select
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="th">ไทย (TH)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">จำนวนเวอร์ชัน</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={versions}
                  onChange={(e) => setVersions(Number(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold"
                onClick={submit}
                busy={loading}
                disabled={!productId || platforms.length === 0}
              >
                {loading ? "กำลังสร้างคอนเทนต์ด้วย AI..." : "⚡ สร้างคอนเทนต์รีวิว AI"}
              </Button>
            </div>

            {error ? (
              <AlertBanner
                title="สร้างคอนเทนต์ไม่สำเร็จ"
                description={error}
                variant="error"
              />
            ) : null}
          </CardContent>
        </Card>

        {/* Safety Guidance Card */}
        <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 p-4 text-xs text-amber-900 dark:text-amber-300 space-y-1.5">
          <p className="font-bold flex items-center gap-1.5">
            <span>🛡️</span> แนวทาง Shopee Affiliate Compliance:
          </p>
          <ul className="list-disc list-inside space-y-0.5 opacity-90">
            <li>ใช้เฉพาะข้อมูลจริงของสินค้า ห้ามแต่งรีวิวหรือสเปกปลอม</li>
            <li>ห้ามอ้างรายได้การันตีหรือสรรพคุณเกินจริง</li>
            <li>มี Affiliate Disclosure อัตโนมัติในทุกเวอร์ชัน</li>
          </ul>
        </div>
      </div>

      {/* Right Output Stream */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
            ผลลัพธ์คอนเทนต์รีวิว ({results.reduce((acc, r) => acc + (r.outputs?.length || 0), 0)} รายการ)
          </h3>
          {results.length > 0 ? (
            <Button size="sm" variant="secondary" onClick={() => setResults([])}>
              ล้างผลลัพธ์
            </Button>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
            <LoadingSpinner />
            <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
              กำลังประมวลผล Hook ภาษาไทยและคำเปิดเผย Affiliate...
            </p>
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            title="ยังไม่มีผลลัพธ์คอนเทนต์"
            description="เลือกสินค้าและกดปุ่ม 'สร้างคอนเทนต์รีวิว AI' เพื่อเริ่มสร้างแคปชันสำหรับโพสต์"
            tone="muted"
          />
        ) : (
          <div className="space-y-6">
            {results.map((r, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                    แพลตฟอร์ม: {r.platform}
                  </span>
                </div>
                <div className="space-y-3">
                  {(r.outputs ?? []).map((o: OutputItem) => (
                    <GeneratedContentCard key={String(o.version)} item={o} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
