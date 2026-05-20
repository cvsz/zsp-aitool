# Shopee Affiliate Portal Integration (Compliance-safe)

## Scope
- รองรับการเปิด portal ด้วยผู้ใช้เท่านั้น: `https://affiliate.shopee.co.th`
- โหมด integration คือ Manual import + CSV/report import + extension user-triggered payload
- Shopee Open API เป็นคนละส่วน และยัง disabled จนกว่า credentials/เอกสารทางการจะครบ

## Guardrails
- ห้าม automate login
- ห้ามเก็บ password/cookie/session token/browser credential
- ห้าม scrape หน้า private dashboard
- ห้าม bypass CAPTCHA/anti-bot/login wall
- ห้ามใช้ private หรือ undocumented endpoints

## Flows
1. User เปิด portal ด้วยตัวเอง
2. คัดลอก affiliate link/product URL มาวางในระบบ
3. อัปโหลด CSV report เพื่อ preview ก่อน save
4. ตรวจทานข้อมูลทุกครั้งก่อนบันทึก

## Security checks
- Allowlist เฉพาะ Shopee HTTPS domains
- Block CSV formula injection (`=`, `+`, `-`, `@` prefix)
- ทุก route ต้อง authenticated และยึด user scope
