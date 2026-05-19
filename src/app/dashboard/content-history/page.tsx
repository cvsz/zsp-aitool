"use client";

import { useEffect, useMemo, useState } from "react";

import { AlertBanner } from "@/components/ui/AlertBanner";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, type TabOption } from "@/components/ui/Tabs";

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

  useEffect(() => {
    let mounted = true;

    fetch("/api/content-history")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("failed");
        }
        return (await response.json()) as ContentHistoryResponse;
      })
      .then((payload) => {
        if (!mounted) {
          return;
        }
        setItems(payload.data ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }
        setError("ไม่สามารถโหลดประวัติคอนเทนต์ได้ กรุณาลองใหม่อีกครั้ง");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
    if (activePlatform === "all") {
      return items;
    }
    return items.filter((item) => item.platform.toLowerCase() === activePlatform);
  }, [activePlatform, items]);

  return (
    <main className="space-y-6">
      <PageHeader title="ประวัติคอนเทนต์" subtitle="ตรวจสอบคอนเทนต์ที่เคยสร้าง แยกตามแพลตฟอร์ม และคัดลอกไปใช้งานต่อได้ทันที" />

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
                  render: (row) => <p className="font-medium text-slate-900">{row.product?.title ?? "ไม่พบชื่อสินค้า"}</p>,
                },
                {
                  key: "platform",
                  title: "แพลตฟอร์ม",
                  render: (row) => <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{getPlatformLabel(row.platform)}</span>,
                },
                {
                  key: "content",
                  title: "ตัวอย่างคอนเทนต์",
                  render: (row) => <p className="line-clamp-2 text-slate-600">{row.content || "-"}</p>,
                },
                {
                  key: "createdAt",
                  title: "วันที่สร้าง",
                  render: (row) => <span className="text-xs text-slate-500">{new Date(row.createdAt).toLocaleString("th-TH")}</span>,
                },
              ]}
              rows={filteredItems}
              empty={<EmptyState title="ยังไม่มีประวัติคอนเทนต์" description="เมื่อคุณสร้างคอนเทนต์จากหน้า AI Generator รายการจะแสดงที่นี่" />}
            />
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
