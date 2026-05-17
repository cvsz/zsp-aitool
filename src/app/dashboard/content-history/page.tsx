"use client";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageTitle } from "@/components/ui/PageTitle";
import { Toast } from "@/components/ui/Toast";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const { data, loading, error, refetch } = useApi<unknown[]>("/api/content-history");
  const { toast, showToast } = useToast();

  return (
    <section>
      <PageTitle title="ประวัติคอนเทนต์" subtitle="เชื่อมต่อข้อมูลผ่าน API client" />
      <button className="mb-4 rounded border px-3 py-2 text-sm" onClick={() => { void refetch(); showToast("รีเฟรชข้อมูลแล้ว", "success"); }}>รีเฟรช</button>
      {loading ? <LoadingSpinner /> : null}
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">เกิดข้อผิดพลาด: {error}</div> : null}
      {!loading && !error && (!data || data.length === 0) ? <EmptyState title="ยังไม่มีข้อมูล" description="เมื่อมีข้อมูลจาก API จะแสดงที่นี่" /> : null}
      {!loading && !error && data && data.length > 0 ? <pre className="overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(data, null, 2)}</pre> : null}
      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </section>
  );

import { useEffect, useState } from "react";

export default function ContentHistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/content-history").then((r) => r.json()).then((d) => {
      setItems(d?.data ?? []);
      setLoading(false);
    }).catch(() => { setError("Failed to load history"); setLoading(false); });
  }, []);

  if (loading) return <main className="p-6">Loading...</main>;
  if (error) return <main className="p-6 text-red-600">{error}</main>;
  if (!items.length) return <main className="p-6 text-gray-500">No history found</main>;

  return <main className="p-6 space-y-3"><h1 className="text-2xl font-bold">Content History</h1>{items.map((item) => <div key={item.id} className="border rounded p-3"><div className="font-semibold">{item.product?.title} - {item.platform}</div><div className="text-sm text-gray-600">{new Date(item.createdAt).toLocaleString()}</div></div>)}</main>;
}
