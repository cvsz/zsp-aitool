import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">เริ่มใช้งาน ZSP AI Tool</h1>
        <p className="mt-2 text-sm text-slate-600">สมัครเพื่อบันทึกสินค้า สร้างคอนเทนต์ AI และติดตามงาน HyperFrames ภายใต้นโยบายความปลอดภัยสำหรับการใช้งานจริง</p>
      </section>
      <RegisterForm />
    </main>
  );
}
