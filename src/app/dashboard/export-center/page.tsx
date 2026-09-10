import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const DATASETS = [
  { key: "products", label: "ข้อมูลสินค้า (Products)", icon: "🛍️", description: "รายการสินค้าทั้งหมดในคลังพร้อมราคาและสเปก" },
  { key: "affiliate-links", label: "ลิงก์แอฟฟิลิเอต (Affiliate Links)", icon: "🔗", description: "ลิงก์ Shopee พร้อม Tracking Parameter" },
  { key: "social-drafts", label: "ฉบับร่างโซเชียล (Social Drafts)", icon: "📝", description: "แคปชันและข้อความโพสต์ที่เตรียมไว้" },
  { key: "content-history", label: "ประวัติคอนเทนต์ (Content History)", icon: "📑", description: "ประวัติคอนเทนต์ที่สร้างโดย AI ทั้งหมด" },
] as const;

export default function ExportCenterPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Export Center (ศูนย์ส่งออกข้อมูล)"
        subtitle="ดาวน์โหลดข้อมูลสินค้า ลิงก์ Affiliate และประวัติคอนเทนต์ในรูปแบบ CSV และ JSON สำหรับนำไปใช้งานต่อ"
      />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Instant Download Datasets */}
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ดาวน์โหลดข้อมูลทันที (Instant Export)</CardTitle>
              <CardDescription>เลือกชุดข้อมูลที่ต้องการส่งออกเป็นไฟล์ CSV</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {DATASETS.map((item) => (
                  <div key={item.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{item.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/api/export/v2/${item.key}?format=csv`}>
                        <Button size="sm" variant="primary">
                          📥 ส่งออก CSV
                        </Button>
                      </Link>
                      <Link href={`/api/export/v2/${item.key}?format=json`}>
                        <Button size="sm" variant="secondary">
                          JSON
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Background Export & Security Notice */}
        <div className="lg:col-span-4 space-y-4">
          <Card tone="muted">
            <CardHeader>
              <CardTitle>งานส่งออกเบื้องหลัง (Async Export Jobs)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>สำหรับข้อมูลที่มีขนาดใหญ่เกิน 10,000 แถว ระบบจะสร้าง Export Job เบื้องหลังโดยอัตโนมัติ เพื่อป้องกันการ Timeout</p>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">🛡️ Data Privacy & Guardrails:</p>
                <p>ไฟล์ที่ส่งออกจะไม่รวม API Secrets หรือข้อมูลส่วนบุคคลของผู้ใช้อื่น (Tenant Isolated)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
