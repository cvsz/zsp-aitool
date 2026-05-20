# Production Backup and Restore Rehearsal Runbook

เอกสารนี้กำหนดขั้นตอน backup/restore rehearsal สำหรับ production ของ `zsp-aitool` แบบปลอดภัย ตรวจสอบย้อนกลับได้ และไม่ทำลายข้อมูลโดยค่าเริ่มต้น

## 1) Scope and safety rules

- ห้ามรัน restore ใส่ production database โดยตรงโดยไม่ได้รับอนุมัติ maintenance window
- ห้ามแสดงหรือบันทึกค่า `DATABASE_URL` ลง terminal log, CI log, หรือ ticket
- production migration ใช้ `npx prisma migrate deploy --schema prisma/schema.prisma` เท่านั้น
- ห้ามใช้ `prisma migrate dev` บน production
- backup script นี้ไม่มี auto-delete ค่าเริ่มต้น

## 2) Inventory (current repository)

- Production deploy/verification entrypoint: `start.sh`
- Health checks: `scripts/health-zsp-aitool.sh` and `npm run health`
- Drift check: `npm run db:schema-drift-check` (`scripts/db/check-user-settings-schema.ts`)
- Prisma migration policy: `prisma/schema.prisma` + `npm run prisma:migrate:deploy`
- VM/container docs: `README.md`, `docker-compose.yml`, `docs/runbooks/production-launch.md`

## 3) Create DB backup (safe default)

Script:

```bash
scripts/ops/backup-db.sh
```

Examples:

```bash
# Read-only plan
scripts/ops/backup-db.sh --dry-run --dir /var/backups/zsp-aitool

# Runtime info only
scripts/ops/backup-db.sh --info

# Create real backup artifact
scripts/ops/backup-db.sh --dir /var/backups/zsp-aitool --format custom --retention-days 14
```

Output behavior:

- ใช้ UTC timestamp ในชื่อไฟล์ เช่น `zsp-aitool-db-20260520T140000Z.dump`
- ไม่ echo ค่า `DATABASE_URL`
- default เป็น backup only ไม่มี delete เก่าอัตโนมัติ

Retention guidance:

- แนะนำตั้ง policy ภายนอกสคริปต์ (เช่น cron + operator review + immutable object storage)
- ลบ backup เก่าต้องทำผ่าน change control และอนุมัติชัดเจน

## 4) Restore rehearsal (non-production target only)

> WARNING: ขั้นตอนนี้คือ rehearsal เพื่อยืนยันว่า backup ใช้งานได้จริง ห้ามชี้ไป production DB

1. เตรียม rehearsal database (isolated host/container)
2. restore dump ไปยัง rehearsal DB
3. รัน migration deploy ซ้ำเพื่อยืนยัน schema consistency:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
npm run db:schema-drift-check
npm run health
```

4. บันทึกผล rehearsal: วันที่, dump filename, ระยะเวลา restore (RTO), จุดคืนข้อมูล (RPO), ผู้ดำเนินการ
5. เก็บหลักฐานใน incident/release ticket

## 5) Incident migration policy (rollback/roll-forward)

- ให้เลือก **roll-forward** ก่อนเสมอเมื่อ migration ผิดพลาดบางส่วน
- ระหว่าง incident ห้าม drop คอลัมน์ใหม่ที่เพิ่งเพิ่มถ้ายังไม่มีแผน restore ที่ทดสอบแล้ว
- rollback ของ app version ทำได้ แต่ schema additive ให้คงไว้ก่อน
- ถ้าต้องย้อนข้อมูล ให้ restore จาก backup ล่าสุดที่ verify แล้วใน maintenance window เท่านั้น

