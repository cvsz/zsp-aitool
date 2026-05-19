"use client";
import { useMemo, useState } from "react";

type ImportMethod = "manual" | "url" | "extension" | "ocr" | "json" | "shopee-open-api";

export function ProductImportForm() {
  const [method, setMethod] = useState<ImportMethod>("url");
  const [url, setUrl] = useState("");
  const [json, setJson] = useState('{"products":[]}');
  const [review, setReview] = useState<string>("");
  const [error, setError] = useState("");
  const [statusMode, setStatusMode] = useState<string>("DISABLED");

  const safeUrlHint = useMemo(() => "กรอกเฉพาะลิงก์สินค้าที่คุณเข้าถึงได้ตามปกติจากหน้าเว็บที่มองเห็นได้", []);
  const statusCopy = useMemo(() => {
    if (statusMode === "DISABLED") return "สถานะ: Foundation-only (ปิดการเรียก API จริงเป็นค่าเริ่มต้น)";
    if (statusMode === "FOUNDATION_ONLY") return "สถานะ: Foundation-only (รอเอกสาร endpoint/auth/signature ทางการให้ครบ)";
    if (statusMode === "MISSING_CREDENTIALS") return "สถานะ: ยังไม่พร้อมใช้งานจริง (ขาดค่า environment หรือ webhook secret)";
    if (statusMode === "MANAGED_SELLER_BLOCKED") return "สถานะ: ถูกบล็อกจากเกณฑ์ Managed Seller / Mall Seller / KAM";
    if (statusMode === "SANDBOX_READY") return "สถานะ: พร้อมทดสอบใน Sandbox (ยังไม่เปิด Live)";
    if (statusMode === "LIVE_READY") return "สถานะ: พร้อมใช้งาน Live ตามเกณฑ์และ credential ครบ";
    return "สถานะ: ไม่ทราบ";
  }, [statusMode]);

  return <div className="space-y-4 rounded-xl border bg-white p-4">
    <h2 className="text-lg font-semibold">นำเข้าสินค้า</h2>
    <p className="text-sm text-slate-600">รองรับ Manual, URL, Extension Payload, OCR, JSON และ Shopee Open API (ทางเลือก) โดยต้องให้ผู้ใช้ตรวจสอบและแก้ไขก่อนบันทึกเสมอ</p>
    <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">ข้อกำหนดความปลอดภัย: ระบบไม่สนับสนุนการ bypass CAPTCHA, login wall, anti-bot หรือ private endpoints และไม่ทำ mass scraping</p>

    <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">Shopee Open API (official) เป็นตัวเลือกเสริม และปิดไว้เป็นค่าเริ่มต้นจนกว่าผู้ดูแลระบบจะตั้งค่า Sandbox/Live ตามเอกสารทางการครบถ้วน ระบบนี้ไม่รองรับการดึงข้อมูลแบบ scraping หรือ bypass ใด ๆ</p>
    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
      <p>{statusCopy}</p>
      <p className="mt-1">เช็กลิสต์การตั้งค่า: docs/runbooks/shopee-open-api-managed-seller-kam.md และ docs/runbooks/shopee-open-api-integration.md</p>
      <button type="button" className="mt-2 rounded border px-2 py-1" onClick={async () => {
        const res = await fetch("/api/integrations/shopee/status");
        if (!res.ok) return;
        const body = await res.json();
        setStatusMode(body?.mode || "DISABLED");
      }}>รีเฟรชสถานะ Shopee Open API</button>
    </div>

    <div className="flex flex-wrap gap-2">
      {(["manual", "url", "extension", "ocr", "json", "shopee-open-api"] as ImportMethod[]).map((m) => (
        <button key={m} type="button" onClick={() => setMethod(m)} className={`rounded-lg border px-3 py-1.5 text-sm ${method === m ? "bg-slate-900 text-white" : "bg-white"}`}>
          {m.toUpperCase()}
        </button>
      ))}
    </div>

    {method === "url" ? <form onSubmit={async (e) => { e.preventDefault(); setError(""); const res = await fetch("/api/products/import-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ originalUrl: url }) }); if (!res.ok) setError("นำเข้า URL ไม่สำเร็จ กรุณาตรวจสอบลิงก์อีกครั้ง"); else setReview(`นำเข้า URL สำเร็จ: ${url}`); }} className="space-y-2">
      <input className="border p-2 w-full rounded" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="วาง URL สินค้า" required />
      <p className="text-xs text-slate-500">{safeUrlHint}</p>
      <button className="border px-3 py-2 rounded" type="submit">นำเข้า URL</button>
    </form> : null}

    {method === "json" ? <form onSubmit={async (e) => { e.preventDefault(); setError(""); const res = await fetch("/api/products/import-json", { method: "POST", headers: { "Content-Type": "application/json" }, body: json }); if (!res.ok) setError("นำเข้า JSON ไม่สำเร็จ กรุณาตรวจสอบรูปแบบข้อมูล"); else setReview("นำเข้า JSON สำเร็จ"); }} className="space-y-2">
      <textarea className="border p-2 w-full min-h-28 rounded" value={json} onChange={(e) => setJson(e.target.value)} />
      <button className="border px-3 py-2 rounded" type="submit">นำเข้า JSON</button>
    </form> : null}

    {method === "manual" ? <p className="rounded border-dashed border p-3 text-sm">ใช้ฟอร์ม Manual ด้านบนเพื่อกรอกข้อมูลเอง</p> : null}
    {method === "extension" ? <p className="rounded border-dashed border p-3 text-sm">รองรับข้อมูลจาก Chrome Extension หลังผู้ใช้กดยืนยันการส่งข้อมูล</p> : null}
    {method === "ocr" ? <p className="rounded border-dashed border p-3 text-sm">ไปที่หน้า OCR เพื่ออัปโหลดภาพและตรวจทานข้อมูลก่อนบันทึก</p> : null}
    {method === "shopee-open-api" ? <p className="rounded border-dashed border p-3 text-sm">โหมด Shopee Open API เป็นทางเลือกและปิดไว้โดยค่าเริ่มต้น ใช้ได้เฉพาะการเชื่อมต่อทางการที่ตั้งค่าโดยผู้ดูแลระบบ และผู้ใช้ต้องตรวจทาน/แก้ไขข้อมูลก่อนบันทึกทุกครั้ง (ไม่มีการ scraping หรือ bypass) พร้อมระบุ affiliate disclosure และหลีกเลี่ยงคำกล่าวอ้างเกินจริง</p> : null}

    <div className="rounded-lg border bg-slate-50 p-3">
      <h3 className="font-medium">Review before save</h3>
      <p className="text-sm text-slate-700">โปรดตรวจสอบชื่อสินค้า ราคา ลิงก์ และคำอธิบายก่อนกดบันทึก</p>
      <p className="mt-2 text-xs text-slate-600">{review || "ยังไม่มีข้อมูลที่รอรีวิว"}</p>
    </div>
    {error ? <p className="text-sm text-red-600">{error}</p> : null}
  </div>;
}
