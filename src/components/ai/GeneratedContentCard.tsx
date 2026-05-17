"use client";

export function GeneratedContentCard({ item }: { item: { title: string; body: string; language: string; version: number } }) {
  return (
    <div className="border rounded p-3 space-y-2">
      <div className="font-semibold">v{item.version}: {item.title}</div>
      <p>{item.body || "-"}</p>
      <button className="text-blue-600 text-sm" onClick={() => navigator.clipboard.writeText(item.body)}>Copy</button>
    </div>
  );
}
