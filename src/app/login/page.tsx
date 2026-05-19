import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">เข้าสู่ระบบ ZSP AI Tool</h1>
        <p className="mt-2 text-sm text-slate-600">จัดการงาน Shopee Affiliate แบบ Thai-first พร้อมแนวทางใช้งานที่ปลอดภัยและตรวจสอบได้</p>
      </section>
      <LoginForm />
    </main>
  );
}
