# ZSP-AITool Step-by-Step Prompt Pack (TH)

ไฟล์นี้คือชุด prompt ภาษาไทยสำหรับสั่ง AI Coding Agent ให้สร้าง ตรวจสอบ หรือขยายโปรเจกต์ `zsp-aitool` แบบเป็นขั้นตอน โดยคุม architecture, security, HyperFrames safety, admin/operator UI และ production readiness ให้ไม่หลุดโครงสร้าง

Repository:

```text
https://github.com/cvsz/zsp-aitool.git
```

`zsp-aitool` คือ Thai-first SaaS สำหรับ Shopee Affiliate workflow: บันทึกสินค้า, จัดการ affiliate link, สร้างคอนเทนต์ AI, OCR, export, similar products, Chrome Extension MV3, HyperFrames Studio/render history/secure downloads/operator tools และ admin foundation

---

## กติกาหลัก ใช้ก่อนทุกคำสั่ง

```text
คุณกำลังทำงานใน repo cvsz/zsp-aitool

ต้องอ่านและทำตาม:
- AGENTS.md
- .faf
- SECURITY.md
- README.md
- CONTRIBUTING.md

กติกาความปลอดภัย:
- ห้าม bypass CAPTCHA
- ห้าม bypass login wall
- ห้าม bypass Shopee anti-bot systems
- ห้ามใช้ private/undocumented Shopee endpoints
- ห้ามทำ mass scraping
- Product import ต้องมาจาก user-provided data, official APIs where configured, หรือ visible page data ที่ browser extension เก็บหลังผู้ใช้กดยืนยันเท่านั้น
- ห้ามเก็บ private user data จาก Shopee pages
- ห้ามสร้าง fake reviews
- ห้ามแต่ง product specs ที่ไม่มีในข้อมูลสินค้า
- ห้ามทำ unsupported medical, financial, legal, exaggerated product claims
- AI content ต้องใส่ affiliate disclosure เมื่อเกี่ยวข้อง
- ผู้ใช้ต้องตรวจและแก้ไขข้อมูลสินค้าก่อนบันทึกได้
- ห้าม expose secrets, DATABASE_URL, tokens, stack traces, outputPath, /var/lib, internal render paths
- ห้ามใช้ dangerouslySetInnerHTML กับ user-controlled content
- ห้าม execute arbitrary user HTML
- ห้ามเพิ่มปุ่ม UI ที่ start/stop/restart/enable/disable systemd โดยตรง
- ห้ามเปลี่ยน production port 3001
- ห้ามเปลี่ยน Cloudflare routes
- ห้าม upgrade Next.js หรือ Prisma major versions ถ้าไม่ได้สั่งชัดเจน
- ห้าม npm audit fix --force
- ต้องเก็บ postbuild และ scripts/fix-next-server-chunks.sh ไว้
- Production ใช้ prisma migrate deploy เท่านั้น ห้าม prisma migrate dev

กติกา architecture:
- src/lib สำหรับ shared utilities
- src/services สำหรับ business logic
- src/schemas สำหรับ Zod schemas
- src/components สำหรับ reusable UI
- src/app/api สำหรับ API routes
- ใช้ Prisma สำหรับ database access
- ใช้ Zod validate external input
- ใช้ strict TypeScript
- หลีกเลี่ยง implicit any
- API response ต้อง consistent
- frontend/backend types ต้องตรงกัน
- สร้างไฟล์แบบ complete file ไม่ใช่ fragment
- ห้าม TODO ใน core features
- เพิ่มหรืออัปเดต tests ทุกครั้งที่ behavior เปลี่ยน

คำสั่ง verify หลัก:
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health

ถ้าเกี่ยวกับ HyperFrames/operator ให้รันเพิ่มเมื่อ environment รองรับ:
npm run hyperframes:doctor
npm run hyperframes:worker:once
npm run hyperframes:cleanup-renders
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog

ถ้า PostgreSQL หรือ systemd ไม่มีใน Codex/container ให้รายงานเป็น WARN/SKIP ไม่ใช่ PASS
```

---

# ลำดับคำสั่งหลัก

## คำสั่งที่ 0 — ตั้ง Project Context

```text
คุณคือ Senior Full-Stack Engineer, Software Architect และ Security Reviewer

โปรเจกต์คือ zsp-aitool: Thai-first SaaS สำหรับ Shopee Affiliate users

ระบบต้องรองรับ:
1. Authentication
2. Product library
3. Affiliate link management
4. Product import: manual, URL, extension payload, OCR screenshot, JSON
5. AI content generation
6. Prompt templates
7. Content history
8. OCR workflow
9. Similar products จากสินค้าที่ผู้ใช้บันทึกเอง
10. Export CSV/TXT/Markdown
11. Chrome Extension Manifest V3
12. Thai-first dashboard UI
13. HyperFrames Studio
14. Render history, secure downloads, retry/cancel, thumbnails, shares, quotas
15. Worker watchdog และ operator tooling
16. Admin panel foundation แบบ gated/read-only aggregate
17. Professional responsive UI

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Zod
- Vitest
- Testing Library
- Chrome Extension MV3
- OpenAI-compatible AI provider abstraction
- Pluggable OCR provider abstraction
- Docker Compose
- HyperFrames worker scripts
- systemd เฉพาะ production VM จริง

ให้ตอบด้วย:
- architecture overview
- module list
- security/compliance policy
- folder structure
- implementation order
- verification checklist

ยังไม่ต้องเขียน code
```

---

## คำสั่งที่ 1 — Project Setup และ Configs

```text
สร้างหรือปรับ project setup ของ zsp-aitool ให้ครบและ production-ready

ไฟล์ที่ต้องตรวจ/สร้าง:
- package.json
- package-lock.json
- tsconfig.json
- tsconfig.typecheck.json
- next.config.js หรือ next.config.ts
- tailwind.config.ts
- postcss.config.js
- .env.example
- .gitignore
- Dockerfile
- docker-compose.yml
- README.md
- AGENTS.md
- SECURITY.md
- CONTRIBUTING.md
- .faf

Rules:
- package.json ต้อง valid JSON
- ห้าม duplicate scripts
- ต้องมี postbuild: bash scripts/fix-next-server-chunks.sh
- ห้าม npm audit fix --force
- ห้าม upgrade Next.js/Prisma major version
- .env.example ต้องไม่มี real secrets
- Codex/container ต้องตั้ง HyperFrames render disabled by default

หลังแก้ให้รัน:
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run typecheck
npm run test
npm run build
```

---

## คำสั่งที่ 2 — Prisma Schema และ Seed

```text
สร้าง/ตรวจ Prisma schema และ seed data สำหรับ zsp-aitool

Models สำคัญ:
- User
- Organization
- OrgMembership
- Product
- ProductImage
- AffiliateLink
- ContentGeneration
- ContentTemplate
- PromptPreset
- OCRJob
- SimilarProduct
- PlatformPost
- UserSetting
- APIUsageLog
- HyperFrameScriptGeneration
- HyperFrameRenderJob
- HyperFrameRenderShare
- HyperFrameSocialExportAuditEvent

Requirements:
- User-scoped data ต้องมี userId
- Org-scoped render jobs ต้องมี optional orgId และ membership/role checks
- Org roles: VIEWER, EDITOR, ADMIN
- Soft delete field สำหรับข้อมูล user-facing ที่เหมาะสม
- Indexes สำหรับ userId, orgId, productId, platform, status, createdAt, deletedAt, originalUrl
- outputPath อาจอยู่ใน DB สำหรับ worker internal เท่านั้น แต่ห้าม expose ผ่าน UI/API
- seed data ภาษาไทยสำหรับ demo products, prompt templates, content history

หลังแก้ให้รัน:
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test

Production rule:
ใช้ npx prisma migrate deploy --schema prisma/schema.prisma เท่านั้น ห้าม prisma migrate dev บน production
```

---

## คำสั่งที่ 3 — Shared Utilities และ API Foundation

```text
สร้าง/ตรวจ shared utilities และ API foundation

ไฟล์/โมดูล:
- src/lib/prisma.ts
- src/lib/env.ts
- src/lib/api-response.ts
- src/lib/errors.ts
- src/lib/auth.ts
- src/lib/password.ts
- src/lib/safe-json.ts
- src/lib/url-safety.ts
- src/lib/csv.ts
- src/middleware/auth-middleware.ts
- src/types/*

Requirements:
- consistent success/failure response
- reusable withAuth middleware
- no stack trace exposure
- env validation ไม่ leak secrets
- URL safety/SSRF protections
- CSV formula injection protection
- strict TypeScript

เพิ่ม tests สำหรับ safety helpers ถ้ายังไม่มี
```

---

## คำสั่งที่ 4 — Authentication และ Isolation

```text
สร้าง/ตรวจ auth, tenant isolation และ org isolation

Features:
- Register
- Login
- Logout
- Me
- Password hash
- Session/JWT handling
- Protected API routes
- User scoping
- Org membership checks
- Role checks: VIEWER, EDITOR, ADMIN

Rules:
- API user-facing ต้อง require auth เว้นแต่ intentionally public
- Product/content/export/render/history ต้อง scoped ด้วย authenticated userId
- Org-scoped data ต้องตรวจ membership
- Cross-user/cross-org lookup ต้อง controlled denial แบบไม่ leak existence โดย prefer 404
- ห้าม expose email/password/raw user private data ใน admin aggregate API

เพิ่ม tests:
- unauth blocked
- cross-user blocked
- cross-org blocked
- viewer cannot mutate org jobs
- admin/editor permission behavior
```

---

## คำสั่งที่ 5 — Product, Import และ Affiliate Module

```text
สร้าง/ตรวจ Product Module

Features:
- Product list/detail/create/update/delete soft delete
- Manual product form
- URL import
- Extension payload import
- JSON import
- Screenshot OCR handoff
- Duplicate detection by originalUrl within same user scope
- Affiliate link management
- Product image handling

Compliance:
- ห้าม scrape private endpoints
- URL import ไม่ bypass anti-bot
- Extension payload ต้องเป็น visible page data ที่ user confirm
- ผู้ใช้ต้อง review/edit ก่อน save
- Validate ด้วย Zod ทุก input

Files:
- src/services/ProductService.ts
- src/schemas/product.schema.ts
- src/app/api/products/**
- src/components/products/**
- src/app/dashboard/products/**

Tests:
- product validation
- duplicate URL
- extension payload safety
- user isolation
```

---

## คำสั่งที่ 6 — AI Content และ Prompt Templates

```text
สร้าง/ตรวจ AI content generation และ prompt template system

Features:
- OpenAI-compatible provider abstraction
- MockAIProvider สำหรับ tests/local
- PromptBuilder
- ContentSafety
- AIContentService
- PromptTemplateService
- TemplateRenderer
- Content history
- Batch generation
- Template duplicate/restore defaults

Rules:
- ห้ามเรียก real AI API ใน tests
- ห้าม fake reviews
- ห้าม invented specs
- ถ้าข้อมูลสินค้าไม่พอ ให้เขียนแบบ neutral
- ต้องใส่ affiliate disclosure เมื่อเกี่ยวข้อง
- Store generation history
- Structured JSON output

Platforms:
- Facebook
- Instagram
- Threads
- X
- Blog
- SEO Article
- Short Caption
- Comment Reply
- HyperFrames Script

Tests:
- PromptBuilder
- TemplateRenderer
- AIContentService
- content safety
```

---

## คำสั่งที่ 7 — OCR, Similar Products และ Export

```text
สร้าง/ตรวจ OCR, Similar Products และ Export modules

OCR:
- OCRProvider interface
- MockOCRProvider
- OCRService
- OCR job status
- extracted text review
- confidence if available
- ห้ามบอกว่า OCR ถูก 100%

Similar products:
- แนะนำจากสินค้าที่ user บันทึกเองเท่านั้น
- score 0-100
- reason explanation
- refresh API

Export:
- products CSV
- content CSV
- content Markdown
- single content TXT
- export เฉพาะ user data
- CSV formula injection protection

Tests:
- OCR mock
- similar product isolation
- export security
```

---

## คำสั่งที่ 8 — Chrome Extension MV3

```text
สร้าง/ตรวจ Chrome Extension Manifest V3 สำหรับ zsp-aitool

Purpose:
ให้ผู้ใช้เก็บข้อมูลสินค้าจากหน้า Shopee ที่กำลังเปิดอยู่ แล้วส่งเข้า zsp-aitool API หลัง user confirmation

Compliance:
- ดึงเฉพาะ visible page data
- ห้าม private API
- ห้าม bypass login/CAPTCHA/rate limits
- ห้ามเก็บ private user data
- ต้องให้ user review/edit ก่อนส่งหรือบันทึก

Files:
- extension/package.json
- extension/manifest.json
- extension/vite.config.ts
- extension/src/popup.html
- extension/src/popup.ts
- extension/src/popup.css
- extension/src/content-script.ts
- extension/src/background.ts
- extension/src/options.html
- extension/src/options.ts
- extension/src/api-client.ts
- extension/src/types.ts
- extension/README.md

หลังแก้ให้รัน extension npm install/ci และ build ถ้ามี script
```

---

## คำสั่งที่ 9 — Dashboard UI และ Professional App Shell

```text
สร้าง/ตรวจ Thai-first professional dashboard UI

Pages:
- Landing
- Login/Register
- Dashboard overview
- Product library/detail/new
- AI Generator
- Content History
- Prompt Templates
- OCR Tools
- Similar Products
- Settings

Components:
- AppLayout
- Sidebar
- Header
- MobileNav
- PageHeader
- Card
- StatCard
- StatusBadge
- ModuleCard
- AlertBanner
- EmptyState
- LoadingSpinner
- Toast

Requirements:
- Thai-first UI
- responsive desktop/mobile
- grouped navigation: Main, HyperFrames, Admin
- no raw JSON in normal dashboard UI
- no outputPath, /var/lib, DATABASE_URL, secrets
- no dangerouslySetInnerHTML
- accessible focus states

Tests:
- sidebar main modules
- HyperFrames nav group
- admin group
- dashboard no raw JSON
- no sensitive markers
```

---

## คำสั่งที่ 10 — HyperFrames Production-Safe System

```text
สร้าง/ตรวจ HyperFrames render system แบบ production-safe

Features:
- HyperFrames Studio
- script generation
- script-to-composition
- render enqueue
- batch render
- render history
- retry/cancel
- secure download
- thumbnail
- share token
- quota/billing gates
- operator queue
- worker daemon
- queue status
- cleanup dry-run
- stale recovery
- watchdog

Safety:
- Codex/container render disabled default
- worker command ใช้ bin + argv vector ห้าม shell concatenation
- max pending/running/attempts
- retry backoff
- disk checks
- stale running detection
- cleanup dry-run default
- cleanup ห้าม escape HYPERFRAMES_OUTPUT_DIR
- download ต้อง block traversal/symlink escape
- no outputPath, /var/lib ใน UI/API
- no arbitrary HTML execution
- operator UI read-only/safe ไม่มี systemd controls

Tests:
- disabled worker path
- command vector
- smoke gates
- queue limits
- output path safety
- secure downloads
- no sensitive UI exposure
```

---

## คำสั่งที่ 11 — Admin Panel Foundation

```text
สร้าง/ตรวจ Admin Panel Foundation

Routes:
- /dashboard/admin
- /dashboard/admin/users
- /dashboard/admin/products
- /dashboard/admin/content
- /dashboard/admin/renders
- /dashboard/admin/system
- /dashboard/admin/audit-logs
- /dashboard/admin/settings

API:
- GET /api/admin/overview

Rules:
- auth required
- ถ้ามี role system ให้ enforce admin/operator role
- ถ้า role unclear ให้ gate ด้วย ADMIN_PANEL_ENABLED=false default
- aggregate-only data
- ห้าม expose raw user list/emails/passwords/secrets/local paths/outputPath/stack traces
- no dangerous actions
- no systemd controls in UI
- Thai-first UI

Components:
- AdminShell
- AdminMetricCard
- AdminStatusPanel
- AdminGuardNotice
- AdminPlaceholderTable

Tests:
- admin pages use gated shell
- admin API withAuth + gate
- aggregate-only
- no sensitive markers
```

---

## คำสั่งที่ 12 — Final UI/Admin/HyperFrames Audit

```text
ตรวจสอบ UI/Admin/HyperFrames ทั้งหมดหลัง merge

Scope:
- src/app/dashboard/**
- src/components/layout/**
- src/components/ui/**
- src/components/admin/**
- src/components/hyperframes/**
- src/app/api/admin/**
- src/app/api/hyperframes/**

ตรวจ:
- no raw JSON in dashboard
- no outputPath in UI/API response shaping
- no /var/lib in UI
- no DATABASE_URL in UI/API response
- no dangerouslySetInnerHTML
- no direct systemctl controls in UI
- admin pages gated
- admin API withAuth + ADMIN_PANEL_ENABLED/role gate
- HyperFrames operator UI read-only/safe
- render thumbnails use next/image

เพิ่ม/อัปเดต test:
- tests/components/final-ui-admin-hyperframes-audit.test.ts

รัน:
npm run typecheck
npm run test
npm run build
npm run health
```

---

## คำสั่งที่ 13 — Final Full Repo Production Readiness

```text
ทำ final full-repo production readiness verification สำหรับ cvsz/zsp-aitool

Review scope:
- docs/governance
- package/scripts
- Prisma/schema/migrations
- app/API safety
- auth/tenant/org isolation
- admin foundation
- HyperFrames safety
- UI readiness
- tests/security regressions

Run:
git status --short
git log --oneline -n 20
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health
npm run hyperframes:doctor
npm run hyperframes:worker:once
npm run hyperframes:queue-status || true
npm run hyperframes:worker:watchdog || true

grep -RniE "dangerouslySetInnerHTML|DATABASE_URL|sk-[A-Za-z0-9]|/var/lib|outputPath" src app components scripts prisma tests docs 2>/dev/null || true
grep -RniE "systemctl[[:space:]]+(start|stop|restart|enable|disable)" src/app src/components 2>/dev/null || true

Production VM checks:
npx prisma migrate status --schema prisma/schema.prisma
systemctl is-active zsp-aitool
systemctl is-active zsp-hyperframes-worker
systemctl is-enabled zsp-hyperframes-worker
curl -I http://127.0.0.1:3001/dashboard
curl -I http://127.0.0.1:3001/dashboard/hyperframes
curl -I http://127.0.0.1:3001/dashboard/hyperframes/renders
curl -I http://127.0.0.1:3001/dashboard/hyperframes/ops
curl -I http://127.0.0.1:3001/dashboard/admin

ถ้า production มี pending migrations:
npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma migrate status --schema prisma/schema.prisma

Final response:
- Overall verdict
- Checklist table PASS/WARN/FAIL
- Files changed
- Schema changes
- Security/access behavior
- Commands run
- Blocking issues
- Environment-only warnings
- Remaining risks
- Commit hash
- READY_TO_DEPLOY=true/false
- READY_FOR_NEXT_PHASE=true/false
```

---

# Prompt คุมงานระหว่างทำ

## เมื่อต้องการให้ AI ตรวจสิ่งที่เพิ่งทำ

```text
หยุดก่อน แล้วตรวจสิ่งที่เพิ่งแก้

ตรวจว่า:
1. ไฟล์ครบตาม scope หรือไม่
2. import path ถูกต้องหรือไม่
3. TypeScript types ตรงหรือไม่
4. Prisma schema รองรับ service หรือไม่
5. API route ตรงกับ frontend หรือไม่
6. tests ครอบ behavior หรือไม่
7. มี TODO ใน core feature หรือไม่
8. มี secrets/local path exposure หรือไม่
9. มี outputPath หรือ /var/lib ใน UI/API response หรือไม่
10. มี dangerouslySetInnerHTML หรือไม่

ถ้าพบปัญหา ให้แก้ด้วย patch ที่เล็กที่สุด แล้วรัน verification
```

## เมื่อต้องการ continue

```text
continue

ทำ module ถัดไปตามลำดับเดิม
อย่าข้ามไฟล์
อย่าเปลี่ยน architecture
สร้าง missing files
แก้ existing files เมื่อจำเป็น
หลังแก้ให้สรุป files changed และ tests run
```

## เมื่อต้องการสรุปสถานะ

```text
สรุปสถานะโปรเจกต์ zsp-aitool ตอนนี้

ตอบเป็นตาราง:
- Module
- Files generated
- Completed features
- Missing features
- Known issues
- Next step

จากนั้นบอกว่าควรใช้คำสั่งลำดับถัดไปหมายเลขอะไร
```

---

# ลำดับใช้งานที่แนะนำ

```text
0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13
```

สำหรับ repo ปัจจุบันที่มี source code แล้ว ให้เริ่มจาก:

```text
12 → 13
```

ถ้าต้องการ redesign ต่อ ให้ใช้:

```text
9 → 10 → 11 → 12 → 13
```
