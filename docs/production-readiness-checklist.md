# Production Readiness Checklist (zsp-aitool)

เอกสารนี้ใช้สำหรับประเมินความพร้อมก่อนเปิดใช้งาน production ของ `zsp-aitool` โดยจัดสถานะเป็น 3 ระดับ:

- **Required before launch**: ต้องเสร็จก่อนเปิดใช้งานจริง
- **Recommended**: ควรทำเพื่อเพิ่มความเสถียร/ความปลอดภัย
- **Future improvement**: ทำภายหลังเพื่อยกระดับระบบ

---

## 1) Security

- [ ] **Required before launch**: ตั้งค่า `AUTH_SECRET` ที่มีความยาวและ entropy สูงใน production
- [ ] **Required before launch**: เก็บ secrets ใน secret manager (ห้าม hardcode หรือ commit ลง repo)
- [ ] **Required before launch**: บังคับ HTTPS และตั้งค่า secure headers (เช่น HSTS, X-Content-Type-Options, CSP)
- [ ] **Required before launch**: ปิด debug output ที่เผยข้อมูลภายในระบบ
- [ ] **Recommended**: ทำ dependency vulnerability scan ใน CI (เช่น `npm audit`/SCA tool)
- [ ] **Recommended**: จัดรอบ secret rotation + key revocation playbook
- [ ] **Future improvement**: ทำ periodic penetration test + threat modeling รายไตรมาส

## 2) Authentication

- [ ] **Required before launch**: ยืนยันว่า password ถูก hash (ไม่เก็บ plain text)
- [ ] **Required before launch**: session/JWT มี expiry ชัดเจน และมี logout invalidation
- [ ] **Required before launch**: ป้องกัน brute force ที่ endpoint login
- [ ] **Recommended**: เพิ่ม MFA สำหรับ admin/operator
- [ ] **Recommended**: เพิ่ม device/session management ให้ผู้ใช้ดู active sessions
- [ ] **Future improvement**: รองรับ SSO (OIDC/SAML) สำหรับทีม/องค์กร

## 3) Rate Limiting

- [ ] **Required before launch**: จำกัด request ต่อ IP/user ใน API สำคัญ (`/api/auth/*`, `/api/ai/*`, `/api/ocr/*`)
- [ ] **Required before launch**: กำหนด hard limit + burst policy แยก endpoint
- [ ] **Recommended**: แสดง response header ของ quota ที่เหลือ
- [ ] **Recommended**: ทำ dynamic throttling ตามโหลดระบบ
- [ ] **Future improvement**: ใช้ distributed rate limiter (Redis/edge) สำหรับหลาย instance

## 4) Input Validation

- [ ] **Required before launch**: ทุก API route validate input ด้วย schema (เช่น Zod)
- [ ] **Required before launch**: sanitize fields ที่เสี่ยง XSS ก่อน render
- [ ] **Required before launch**: จำกัดขนาด payload และขนาดไฟล์ upload
- [ ] **Recommended**: เพิ่ม schema contract test ครอบคลุมทุก endpoint
- [ ] **Future improvement**: ทำ centralized validation/error catalog แบบ versioned

## 5) Database Backup

- [ ] **Required before launch**: ตั้ง scheduled automated backup (รายวันอย่างน้อย)
- [ ] **Required before launch**: ทดสอบ restore จริงบน staging และบันทึก RTO/RPO
- [ ] **Required before launch**: เข้ารหัส backup at rest + in transit
- [ ] **Recommended**: ทำ point-in-time recovery (PITR)
- [ ] **Recommended**: กำหนด retention policy (เช่น 7/30/90 วัน)
- [ ] **Future improvement**: ทำ cross-region backup replication

## 6) Logging

- [ ] **Required before launch**: บันทึก structured logs (request id, user id, endpoint, latency, status)
- [ ] **Required before launch**: mask/redact ข้อมูลอ่อนไหว (token, password, PII)
- [ ] **Required before launch**: แยก log level (`info`, `warn`, `error`) ให้ชัดเจน
- [ ] **Recommended**: รวม logs แบบ centralized (ELK/Datadog/Cloud Logging)
- [ ] **Recommended**: ตั้ง alert จาก log pattern ผิดปกติ
- [ ] **Future improvement**: เพิ่ม trace correlation (logs + metrics + traces)

## 7) Error Monitoring

- [ ] **Required before launch**: ติดตั้ง error monitoring (เช่น Sentry) ทั้ง frontend และ API
- [ ] **Required before launch**: มี alert สำหรับ error rate spike และ API failure สำคัญ
- [ ] **Required before launch**: ตั้งค่า release tracking เพื่อ map error กับเวอร์ชัน
- [ ] **Recommended**: จัด incident response runbook + on-call rotation
- [ ] **Future improvement**: auto-triage errors ตามผลกระทบธุรกิจ

## 8) AI Cost Control

- [ ] **Required before launch**: ตั้ง budget limit ต่อวัน/เดือนสำหรับ AI provider
- [ ] **Required before launch**: จำกัด max tokens / max generations ต่อ request
- [ ] **Required before launch**: บันทึก usage ต่อ user/feature เพื่อตรวจสอบต้นทุน
- [ ] **Recommended**: ตั้ง model fallback (ถูกกว่า) เมื่อเกิน threshold
- [ ] **Recommended**: ทำ prompt/result caching กรณีใช้ซ้ำ
- [ ] **Future improvement**: สร้าง cost anomaly detection และ auto cut-off

## 9) OCR Cost Control

- [ ] **Required before launch**: จำกัดจำนวน OCR jobs ต่อ user/วัน
- [ ] **Required before launch**: จำกัดขนาดรูปและจำนวนรูปต่อ batch
- [ ] **Required before launch**: บันทึก OCR usage metrics และต้นทุนต่อ job
- [ ] **Recommended**: เพิ่ม image pre-processing ลดงาน OCR ที่ไม่จำเป็น
- [ ] **Recommended**: queue + retry policy เพื่อลดการ fail ซ้ำ
- [ ] **Future improvement**: smart routing OCR provider ตามราคา/ความแม่นยำ

## 10) Affiliate Compliance

- [ ] **Required before launch**: บังคับมี affiliate disclosure ในคอนเทนต์ที่เผยแพร่
- [ ] **Required before launch**: ยืนยันว่าเก็บเฉพาะข้อมูลที่ผู้ใช้เห็นและยืนยันเอง
- [ ] **Required before launch**: ห้าม workflow ที่ bypass login/CAPTCHA/private API
- [ ] **Recommended**: เพิ่ม compliance checklist ใน UI ก่อน export/publish
- [ ] **Recommended**: เก็บ audit log ของการ generate/publish ที่เกี่ยวกับ affiliate
- [ ] **Future improvement**: automated compliance linting ต่อแพลตฟอร์ม (FB/IG/X/Threads)

## 11) Chrome Extension Permission Review

- [ ] **Required before launch**: ทบทวน `manifest.json` และลบ permissions ที่ไม่จำเป็น
- [ ] **Required before launch**: จำกัด host permissions เท่าที่ต้องใช้จริง
- [ ] **Required before launch**: แจ้งผู้ใช้ชัดเจนว่าดึงข้อมูลอะไรและส่งเมื่อใด (ต้องกดยืนยัน)
- [ ] **Recommended**: ทำ security review ของ message passing (content script/background)
- [ ] **Recommended**: เพิ่ม manual privacy review ทุกครั้งก่อน release extension
- [ ] **Future improvement**: ทำ automated permission diff check ใน CI

## 12) Privacy Policy

- [ ] **Required before launch**: มี Privacy Policy ที่เข้าถึงได้สาธารณะ
- [ ] **Required before launch**: อธิบายประเภทข้อมูล, วัตถุประสงค์, retention, และช่องทางติดต่อ
- [ ] **Required before launch**: ระบุการใช้ third-party providers (AI/OCR/analytics)
- [ ] **Recommended**: เพิ่ม cookie/consent banner ตามเขตอำนาจที่เกี่ยวข้อง
- [ ] **Future improvement**: ทำ data subject request portal (export/delete/self-service)

## 13) Terms of Service

- [ ] **Required before launch**: มี Terms of Service ชัดเจนเรื่องข้อจำกัดความรับผิดและการใช้งานที่ยอมรับได้
- [ ] **Required before launch**: ระบุข้อห้าม misuse (scraping ผิดเงื่อนไข, fake claims, unlawful use)
- [ ] **Required before launch**: ระบุเงื่อนไขการยุติบริการ/ระงับบัญชี
- [ ] **Recommended**: ให้ผู้ใช้ยอมรับ ToS ตอนสมัครใช้งาน
- [ ] **Future improvement**: versioned ToS + changelog + re-consent flow

## 14) Deployment

- [ ] **Required before launch**: มี production deployment runbook (build, migrate, rollback, smoke test)
- [ ] **Required before launch**: ใช้ `prisma migrate deploy` ในขั้น deploy production
- [ ] **Required before launch**: health checks ครอบคลุม app + DB + dependency สำคัญ
- [ ] **Recommended**: ทำ blue/green หรือ canary deployment
- [ ] **Recommended**: immutable build artifacts + signed container images
- [ ] **Future improvement**: progressive delivery พร้อม auto rollback ตาม SLO

## 15) Scaling

- [ ] **Required before launch**: ตั้ง connection pooling ของ PostgreSQL และ limit concurrency
- [ ] **Required before launch**: แยกงานหนัก (AI/OCR) ออกจาก request lifecycle ด้วย queue (อย่างน้อยแผนรองรับ)
- [ ] **Recommended**: caching ชั้น API/DB query ที่ถูกเรียกบ่อย
- [ ] **Recommended**: autoscaling policy จาก CPU/memory/latency
- [ ] **Future improvement**: read replica + workload isolation (web/worker)

## 16) Testing

- [ ] **Required before launch**: unit tests ผ่านสำหรับบริการหลัก (auth/product/AI/OCR/template)
- [ ] **Required before launch**: integration tests ผ่านสำหรับ API เส้นทางสำคัญ
- [ ] **Required before launch**: มี smoke tests หลัง deploy
- [ ] **Recommended**: e2e tests ครอบคลุม user journeys หลัก
- [ ] **Recommended**: test data management สำหรับ staging ให้ repeatable
- [ ] **Future improvement**: performance/load tests พร้อม baseline SLA

## 17) CI/CD

- [ ] **Required before launch**: pipeline ต้องรัน `lint`, `typecheck`, `test`, และ build ทุก PR
- [ ] **Required before launch**: ป้องกัน merge ถ้า checks ไม่ผ่าน (branch protection)
- [ ] **Required before launch**: แยก secret ตาม environment (dev/staging/prod)
- [ ] **Recommended**: เพิ่ม dependency/license scanning ใน CI
- [ ] **Recommended**: deploy อัตโนมัติไป staging + manual approval ไป production
- [ ] **Future improvement**: policy-as-code + security gates (SAST/DAST/container scan)

---

## Suggested Launch Gate (Quick Pass)

ให้ถือว่า “พร้อม launch” เมื่อ:

1. Checklist รายการ **Required before launch** ทุกข้อถูกติ๊กครบ
2. ไม่มี blocker severity สูงจาก security/error monitoring
3. ผ่าน smoke test หลัง deploy ใน production-like environment

