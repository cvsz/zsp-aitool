"use client";

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
