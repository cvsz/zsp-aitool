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
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </header>

      {!allowed ? (
        <AdminGuardNotice
          title="จำกัดการเข้าถึงแผงผู้ดูแลระบบ"
          description={`${denialReason} (ค่าเริ่มต้นคือ ADMIN_PANEL_ENABLED=false)`}
        />
      ) : (
        children
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <p>หน้า Admin ในเฟสนี้เป็นโหมดอ่านอย่างเดียว และยังไม่รองรับการแก้ไขข้อมูลหรือคำสั่งเสี่ยง</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50" href="/dashboard/hyperframes/ops">Operator Tools</Link>
          <Link className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50" href="/dashboard/hyperframes/ops/queue">Queue Monitor</Link>
        </div>
      </div>
    </section>
  );
}
