# Shopee Affiliate Portal Integration (Manual-safe)

## Operating model
ระบบนี้รองรับ **Portal Link Mode + Manual Import Mode** เท่านั้น โดยให้ผู้ใช้ล็อกอินที่ `https://affiliate.shopee.co.th/` ด้วยตัวเองในเบราว์เซอร์ของผู้ใช้

- ไม่ทำ automation login
- ไม่เก็บรหัสผ่าน Shopee
- ไม่เก็บ cookies, session token, localStorage หรือ browser credentials
- ไม่ scrape หน้า private dashboard
- ไม่ bypass CAPTCHA / anti-bot / login wall
- ไม่เรียก private หรือ undocumented endpoints

## วิธีใช้งาน
1. ไปที่หน้า Settings > Shopee Affiliate Portal (Manual Safe Mode)
2. กดปุ่ม `Open Shopee Affiliate Portal`
3. ล็อกอินในหน้า Shopee Affiliate ของผู้ใช้เอง
4. คัดลอก affiliate link / product URL มาวางในระบบ
5. (ทางเลือก) อัปโหลด CSV report ที่ export จาก Shopee Affiliate เพื่อ preview ก่อน save
6. ตรวจสอบข้อมูลและ affiliate disclosure ก่อนบันทึก

## Manual Affiliate Link Import
รองรับข้อมูลต่อไปนี้:
- affiliate URL (required)
- product URL (required)
- campaign/source note (optional)

กติกา URL:
- อนุญาตเฉพาะ HTTPS Shopee hosts ที่ allowlist ไว้เท่านั้น
- ไม่รับ javascript:, data:, file:
- ไม่รับ localhost หรือ private/internal IP

## CSV / Report Preview
- ผู้ใช้อัปโหลดข้อมูลรายงานเอง
- ระบบ parse ด้วยขนาดจำกัด
- แสดง headers + preview rows ก่อน save
- ป้องกัน CSV formula injection โดยบล็อกเซลล์ที่ขึ้นต้นด้วย `=`, `+`, `-`, `@`
- ไม่เก็บ raw report โดยไม่จำเป็น

## Extension-assisted capture
- รับเฉพาะ payload ที่ผู้ใช้กดยืนยันส่งจาก extension
- ไม่อ่าน cookies/password/session/localStorage
- ไม่ scrape private dashboard
- validate payload ฝั่ง server ทุกครั้งก่อน review/save

## Open API separation
Shopee Affiliate Portal login **ไม่ใช่** Shopee Open API OAuth

- Open API status แสดงแยกต่างหาก
- Open API ยัง disabled/foundation-only จนกว่าจะมี credentials และเอกสารทางการครบ
- ไม่มี fake token exchange และไม่มี callback จำลอง

## Troubleshooting checklist
- ตรวจสอบว่าลิงก์เป็น HTTPS และอยู่ใน Shopee allowlist
- ตรวจสอบว่าผู้ใช้ล็อกอินด้วยตนเองใน portal แล้ว
- ตรวจสอบไฟล์ CSV ไม่มีสูตรขึ้นต้นด้วย `=`, `+`, `-`, `@`
- ตรวจสอบว่าผู้ใช้ sign in ในระบบ zsp-aitool ก่อนเรียก API import
- ถ้า Open API mode ยัง disabled/foundation-only ถือเป็นพฤติกรรมปกติของ phase นี้

## Compliance notes
- ห้ามอ้างรายได้การันตี
- ห้ามรีวิวปลอม/ข้อมูลสเปกที่ไม่มีหลักฐาน
- แสดง affiliate disclosure ให้เห็นชัดก่อนเผยแพร่คอนเทนต์
