import { RenderJobCard, type RenderHistoryItem } from "./RenderJobCard";

export function RenderHistoryTable({ items, onCancel, onRetry }: { items: RenderHistoryItem[]; onCancel: (id: string) => void; onRetry: (id: string) => void }) {
  if (!items.length) return <div className="rounded-lg border border-dashed p-6 text-sm text-slate-500">ยังไม่มีประวัติเรนเดอร์</div>;
  return <div className="space-y-3">{items.map((item) => <RenderJobCard key={item.id} item={item} onCancel={onCancel} onRetry={onRetry} />)}</div>;
}
