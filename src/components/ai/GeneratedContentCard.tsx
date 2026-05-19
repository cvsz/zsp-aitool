"use client";

export function GeneratedContentCard({ item }: { item: { title: string; body: string; language: string; version: number } }) {
  return (
    <div className="space-y-2 rounded-xl border p-3">
      <div className="font-semibold">v{item.version}: {item.title}</div>
      <p className="whitespace-pre-wrap text-sm">{item.body || "-"}</p>
      <div className="flex gap-2 text-sm">
        <button className="text-blue-600" onClick={() => navigator.clipboard.writeText(item.body)}>คัดลอก</button>
        <button className="text-blue-600" onClick={() => navigator.clipboard.writeText(`${item.title}\n\n${item.body}`)}>คัดลอกพร้อมหัวข้อ</button>
      </div>
    </div>
  );
}
