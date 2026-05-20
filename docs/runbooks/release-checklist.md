# Production Release Checklist

Checklist นี้ใช้สำหรับ production release แบบตรวจสอบได้ โดยอ้างอิง `start.sh` และ runbook ปัจจุบัน

## 1) Pre-release build and safety checks

```bash
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run db:schema-drift-check
npm run typecheck
npm run test
npm run build
npm run health
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```

## 2) Migration safety policy

- ตรวจ migration state ก่อน deploy:

```bash
npx prisma migrate status --schema prisma/schema.prisma
```

- deploy migration แบบ production-safe เท่านั้น:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
```

- ห้ามใช้ `prisma migrate dev` บน production

## 3) Deployment and smoke verification

1. รัน `start.sh` บน production VM ที่มี systemd เท่านั้น
2. ยืนยัน route smoke ขั้นต่ำ:
   - `/`
   - `/dashboard`
   - `/dashboard/products`
   - `/dashboard/hyperframes`
   - `/dashboard/admin`
3. ยืนยัน `npm run health`, `npm run hyperframes:queue-status`, `npm run hyperframes:worker:watchdog`
4. ตรวจ journal:

```bash
sudo journalctl -u zsp-aitool --since "30 minutes ago" -l --no-pager
sudo journalctl -u zsp-hyperframes-worker --since "30 minutes ago" -l --no-pager
```

## 4) Rollback / roll-forward decision guide

- Priority 1: stabilize traffic (app rollback if needed)
- Priority 2: keep DB schema additive; avoid dropping newly added columns during active incident
- Priority 3: roll forward with corrective migration as preferred strategy
- ใช้ restore เฉพาะเมื่อมี backup ที่ verified และได้รับอนุมัติ downtime

## 5) Audit trail requirements

ต้องแนบใน release ticket:

- commit hash ที่ deploy
- ผลลัพธ์คำสั่งตรวจทั้งหมด
- migration status ก่อน/หลัง deploy
- health/queue/watchdog outputs
- journal summary
- rollback/roll-forward decision และเหตุผล

