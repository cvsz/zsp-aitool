# Shopee Import Progress UI Runbook

## Operator flow
1. ไปที่หน้า `/dashboard/shopee-affiliate`.
2. เปิดส่วน **ความคืบหน้านำเข้า CSV** เพื่อตรวจงานล่าสุด.
3. กด **รีเฟรช** หรือรอ polling อัตโนมัติ (7 วินาทีเมื่อมีงาน active, 25 วินาทีเมื่อไม่มีงาน active).
4. ตรวจตัวเลข processed/imported/rejected/failed และตัวอย่างเหตุผล rejected.
5. เมื่องานเสร็จ ใช้ปุ่ม **ดูสินค้าที่นำเข้า** เพื่อตรวจรายการสินค้า.

## Status meanings
- `PENDING`: งานรอ worker.
- `RUNNING`: กำลังประมวลผล.
- `CANCEL_REQUESTED`: รับคำขอยกเลิกแล้ว รอ worker หยุด.
- `CANCELLED`: ยกเลิกสำเร็จ.
- `COMPLETED`: นำเข้าสำเร็จ.
- `FAILED`: เกิดข้อผิดพลาดระหว่างนำเข้า.

## Cancel / Retry behavior
- Cancel ใช้ได้กับ `PENDING` และ `RUNNING` เท่านั้น และเป็น idempotent-safe.
- Retry ใช้ได้กับ `FAILED` และ `CANCELLED` โดยสร้าง job ใหม่อ้างอิงงานเดิม.
- Route ที่ใช้:
  - `POST /api/imports/csv-products/[id]/cancel`
  - `POST /api/imports/csv-products/[id]/retry`

## Troubleshooting stuck imports
- ถ้างานค้างที่ `RUNNING` นานผิดปกติ ให้ตรวจ worker logs ก่อน retry.
- ถ้างานค้างที่ `CANCEL_REQUESTED` ให้รอบ worker cycle ถัดไป แล้วตรวจอีกครั้ง.
- ถ้า `FAILED` ซ้ำ ๆ ให้ตรวจคุณภาพไฟล์ CSV, header mapping, และ rejected reasons.

## Safe data display policy
- ห้ามแสดง `sourceFilePath`, internal absolute paths, หรือข้อมูลลับ.
- API response ต้องคืนเฉพาะ metadata ปลอดภัยสำหรับ UI.
- ห้ามเผยแพร่ env values, DB URL, secret keys, token, cookie, session.

SHOPEE_IMPORT_PROGRESS_UI_CONFIGURED=true
