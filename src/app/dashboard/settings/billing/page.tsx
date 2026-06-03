import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function BillingPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <Link href="/dashboard/settings" className="text-sm text-blue-600 hover:underline">&larr; กลับไปตั้งค่า</Link>
        <h1 className="mt-2 text-2xl font-bold">การจัดการแพ็กเกจ</h1>
        <p className="mt-1 text-sm text-slate-500">ดูและจัดการแพ็กเกจปัจจุบันของคุณ</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>แพ็กเกจปัจจุบัน</CardTitle>
          <CardDescription>คุณกำลังใช้แพ็กเกจเริ่มต้น</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="font-semibold">Free Plan</p>
              <p className="text-sm text-slate-500">ฟรี ไม่มีค่าใช้จ่าย</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Active</span>
          </div>
          <p className="text-xs text-slate-400">
            ระบบชำระเงินและการอัปเกรดแพ็กเกจจะเปิดให้บริการเร็วๆ นี้
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
