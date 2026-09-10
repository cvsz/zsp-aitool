"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, type TabOption } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";

type ContentHistoryItem = {
  id: string;
  platform: string;
  content: string;
  createdAt: string;
  product?: {
    title?: string;
  } | null;
};

type ContentHistoryResponse = {
  data?: ContentHistoryItem[];
};

const platformLabels: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  threads: "Threads",
  x: "X",
  blog: "Blog",
  seo: "SEO",
};

function getPlatformLabel(platform: string): string {
  return platformLabels[platform.toLowerCase()] ?? platform;
}

export default function ContentHistoryPage() {
  const [items, setItems] = useState<ContentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePlatform, setActivePlatform] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/content-history")
      .then(async (response) => {
        if (!response.ok) throw new Error("failed");
        return (await response.json()) as ContentHistoryResponse;
      })
      .then((payload) => {
        if (!mounted) return;
        setItems(payload.data ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError("ไม่สามารถโหลดประวัติคอนเทนต์ได้ กรุณาลองใหม่อีกครั้ง");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs = useMemo<TabOption[]>(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const key = item.platform.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const dynamicTabs = Array.from(counts.entries()).map(([key, count]) => ({
      key,
      label: getPlatformLabel(key),
      count,
    }));

    return [{ key: "all", label: "ทั้งหมด", count: items.length }, ...dynamicTabs];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activePlatform === "all") return items;
    return items.filter((item) => item.platform.toLowerCase() === activePlatform);
  }, [activePlatform, items]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ประวัติคอนเทนต์ (Content History)"
        subtitle="ตรวจสอบคอนเทนต์ที่เคยสร้าง แยกตามแพลตฟอร์ม และคัดลอกไปใช้งานต่อได้ทันที"
      />

      {loading ? <LoadingSpinner label="กำลังโหลดประวัติคอนเทนต์" /> : null}
      {error ? <AlertBanner title="โหลดข้อมูลไม่สำเร็จ" description={error} variant="error" /> : null}

      {!loading && !error ? (
        <Card>
          <CardContent className="space-y-4">
            <Tabs ariaLabel="ตัวกรองแพลตฟอร์ม" tabs={tabs} activeKey={activePlatform} onChange={setActivePlatform} />

            <DataTable
              columns={[
                {
                  key: "product",
                  title: "สินค้า",
                  render: (row) => (
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{row.product?.title ?? "ไม่ระบุสินค้า"}</p>
                  ),
                },
                {
                  key: "platform",
                  title: "แพลตฟอร์ม",
                  render: (row) => (
                    <span className="inline-flex items-center rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                      {getPlatformLabel(row.platform)}
                    </span>
                  ),
                },
                {
                  key: "content",
                  title: "ตัวอย่างคอนเทนต์",
                  render: (row) => (
                    <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{row.content || "-"}</p>
                  ),
                },
                {
                  key: "createdAt",
                  title: "วันที่สร้าง",
                  render: (row) => (
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(row.createdAt).toLocaleString("th-TH")}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  title: "การจัดการ",
                  render: (row) => (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopy(row.id, row.content)}
                    >
                      {copiedId === row.id ? "คัดลอกแล้ว ✓" : "📋 คัดลอก"}
                    </Button>
                  ),
                },
              ]}
              rows={filteredItems}
              empty={
                <EmptyState
                  title="ยังไม่มีประวัติคอนเทนต์"
                  description="เมื่อคุณสร้างคอนเทนต์จากหน้า AI Generator รายการจะแสดงที่นี่"
                />
              }
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
