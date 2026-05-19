import Link from "next/link";
import type { ReactNode } from "react";

import { AdminGuardNotice } from "@/components/admin/AdminGuardNotice";

export function AdminShell({
  title,
  description,
  allowed,
  denialReason,
  children,
}: {
  title: string;
  description: string;
  allowed: boolean;
  denialReason: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Admin Console</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </header>

      {!allowed ? (
        <AdminGuardNotice
          title="จำกัดการเข้าถึงแผงผู้ดูแลระบบ"
          description={`${denialReason} (ค่าเริ่มต้นคือ ADMIN_PANEL_ENABLED=false)`}
        />
      ) : (
        children
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        <p>หน้า Admin โหมดนี้เป็นแบบ read-only, aggregate-only และไม่เปิดให้ทำคำสั่งเสี่ยง.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50" href="/dashboard/hyperframes/ops">Operator Tools</Link>
          <Link className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50" href="/dashboard/hyperframes/ops/queue">Queue Monitor</Link>
        </div>
      </div>
    </section>
  );
}
