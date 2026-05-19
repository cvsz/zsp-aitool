# Production Launch Runbook

เอกสารนี้สรุปขั้นตอนเปิดใช้งาน production แบบปลอดภัยสำหรับ `zsp-aitool` โดยเน้นแนวทาง monitor-first และ rollback ที่ตรวจสอบได้

## 1) Pre-launch checks

```bash
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```

## 2) Production VM smoke checks (read-only)

```bash
npx prisma migrate status --schema prisma/schema.prisma
systemctl is-active zsp-aitool
systemctl is-active zsp-hyperframes-worker
systemctl is-enabled zsp-hyperframes-worker
curl -I http://127.0.0.1:3001/
curl -I http://127.0.0.1:3001/dashboard
curl -I http://127.0.0.1:3001/dashboard/products
curl -I http://127.0.0.1:3001/dashboard/generator
curl -I http://127.0.0.1:3001/dashboard/hyperframes
curl -I http://127.0.0.1:3001/dashboard/hyperframes/renders
curl -I http://127.0.0.1:3001/dashboard/hyperframes/ops
curl -I http://127.0.0.1:3001/dashboard/admin
curl -I https://studio.zeaz.dev/
curl -I https://studio.zeaz.dev/dashboard
```

## 3) Migration policy

หาก production พบ migration ค้าง ให้ใช้เฉพาะคำสั่งปลอดภัย:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma migrate status --schema prisma/schema.prisma
npm run health
```

ห้ามใช้ `prisma migrate dev` บน production

## 4) HyperFrames safety notes

- UI ฝั่ง operator/admin เป็น monitor-only (ไม่ควบคุม systemd โดยตรง)
- ดาวน์โหลดไฟล์เรนเดอร์ต้องผ่าน API ที่ตรวจ path traversal และ symlink escape
- cleanup ใช้ dry-run เป็นค่าตั้งต้น

## 5) Rollback guidance (execute only when approved)

```bash
sudo systemctl restart zsp-aitool
sudo systemctl stop zsp-hyperframes-worker && sudo systemctl disable zsp-hyperframes-worker
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```
