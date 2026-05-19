import Link from "next/link";

const sampleWorkflows = [
  {
    title: "เพิ่มสินค้า → สร้างโพสต์ AI",
    description: "บันทึกสินค้า ใส่ลิงก์ Affiliate แล้วสร้างแคปชันสำหรับ Facebook/IG/Threads/X ได้ในขั้นตอนเดียว",
  },
  {
    title: "นำเข้าจากภาพ → ตรวจทานก่อนบันทึก",
    description: "ใช้ OCR เพื่อช่วยดึงข้อมูลเบื้องต้น และให้ผู้ใช้ตรวจแก้ก่อนบันทึกทุกครั้ง",
  },
  {
    title: "แปลงสินค้าที่บันทึก → วิดีโอโปรโมต",
    description: "ต่อยอดจากสินค้าที่พร้อมใช้งานไปสู่ HyperFrames composition และเรนเดอร์แบบควบคุมได้",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold">ZSP AI Tool สำหรับสาย Shopee Affiliate ไทย</h1>
      <p className="mt-3 max-w-3xl text-slate-600">จัดการสินค้า ลิงก์ Affiliate และคอนเทนต์ AI แบบ Thai-first เพื่อช่วยให้คุณทำงานได้เร็วขึ้นอย่างเป็นระบบ โดยยังคงความโปร่งใสและตรวจทานข้อมูลได้ก่อนเผยแพร่</p>
      <p className="mt-2 max-w-3xl text-sm text-slate-500">หมายเหตุ: ผลลัพธ์ขึ้นอยู่กับคุณภาพข้อมูลสินค้าและการเขียนโพสต์ ไม่มีการการันตีรายได้ โปรดเปิดเผยว่าเป็นลิงก์ Affiliate ทุกครั้งที่เกี่ยวข้อง</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">3 เวิร์กโฟลว์เริ่มต้นสำหรับผู้ใช้ใหม่</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {sampleWorkflows.map((workflow) => (
            <div key={workflow.title} className="rounded-xl border bg-white p-4">
              <h3 className="font-medium text-slate-900">{workflow.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{workflow.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Link href="/dashboard" className="mt-8 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white">
        เริ่มใช้งานแดชบอร์ด
      </Link>
    </main>
  );
}
