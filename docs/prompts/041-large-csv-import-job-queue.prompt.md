# 041 — Large CSV Import Job Queue Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool` after Phase 039 and Phase 040 are stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
041 — Large CSV Import Job Queue.

Priority:
High. The current CSV product import can stream large files from CLI, but production operators need resumable background jobs with progress, status, cancellation, and dashboard visibility.

Primary objective:
Refactor large CSV product imports into a durable, resumable, database-backed job queue that can import 3GB+ Shopee Product Feed files into Product and AffiliateLink safely.

Hard constraints:
- Do not read full CSV files into memory.
- Do not store uploaded files in web-accessible paths.
- Do not expose local file paths, DATABASE_URL, tokens, cookies, session data, or secrets in UI/API.
- Do not auto-login to Shopee or scrape private Shopee dashboards.
- Do not bypass CAPTCHA/anti-bot/rate limits.
- Do not drop/truncate Product or AffiliateLink data.
- Import must be scoped to authenticated user.
- Operators must be able to cancel jobs safely.

Review first:
- scripts/db/import-csv-to-products.ts
- src/services/ShopeeAffiliateIngestionService.ts
- src/components/shopee/ShopeeAffiliateRealDbDashboard.tsx
- src/app/api/integrations/shopee/**
- prisma/schema.prisma
- existing workflow/job/queue patterns
- scripts/hyperframes/render-worker.ts
- scripts/hyperframes/worker-watchdog.ts
- package.json
- start.sh

Required design:
1. Add DB model(s):
   - `CsvImportJob`
   - optional `CsvImportJobEvent`

Suggested fields:
```prisma
model CsvImportJob {
  id              String   @id @default(cuid())
  userId          String
  kind            String
  status          String   @default("PENDING")
  sourceFileName  String
  sourceFilePath  String?
  totalBytes      BigInt?
  processedRows   Int      @default(0)
  importedRows    Int      @default(0)
  rejectedRows    Int      @default(0)
  failedRows      Int      @default(0)
  lastRowNumber   Int      @default(0)
  lastError        String?
  sampleRejected  Json?
  startedAt       DateTime?
  completedAt     DateTime?
  cancelledAt     DateTime?
  failedAt         DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status, createdAt])
  @@index([status, createdAt])
}
```

Use enum types instead of strings if repo conventions prefer that.

2. File staging policy:
- Store imports under a private directory such as `/var/lib/zsp-aitool/imports`.
- Never expose raw path to UI/API.
- Store only basename or safe file label in API.
- Reject unsupported extension/MIME.
- Enforce size limits.
- Use streaming upload if possible.

3. API routes:
Create/update:
```text
POST /api/imports/csv-products
GET  /api/imports/csv-products
GET  /api/imports/csv-products/[id]
POST /api/imports/csv-products/[id]/cancel
POST /api/imports/csv-products/[id]/retry
```

Behavior:
- all routes require auth.
- list/get scoped by user.
- create accepts file upload or server-side staged file reference only if safe.
- cancel sets status to CANCEL_REQUESTED/CANCELLED.
- retry resumes from last safe checkpoint or creates a new retry job linked to previous job.

4. Worker:
Create:
```text
scripts/imports/csv-product-import-worker.ts
```

Add npm scripts:
```json
"imports:csv-products:worker": "tsx scripts/imports/csv-product-import-worker.ts",
"imports:csv-products:worker:once": "tsx scripts/imports/csv-product-import-worker.ts --once",
"imports:csv-products:status": "tsx scripts/imports/csv-product-import-status.ts"
```

Worker behavior:
- claims pending jobs atomically.
- streams CSV line by line.
- persists progress every N rows.
- batch upserts Product/AffiliateLink.
- records rejected row samples only, not all huge data.
- supports cancellation check every N rows.
- can resume from lastRowNumber.
- safe error messages only.

5. Dashboard:
Add import job panel to `/dashboard/shopee-affiliate` or a dedicated `/dashboard/imports` page:
- upload/select CSV.
- start import job.
- show progress: processed, imported, rejected, failed, status, started/completed.
- show speed/ETA if easy.
- cancel/retry controls.
- refresh button or polling.
- no local paths.

6. Tests:
Add/update:
```text
tests/services/CsvProductImportJobService.test.ts
tests/api/csv-product-import-jobs.test.ts
tests/scripts/csv-product-import-worker-static.test.ts
tests/components/csv-product-import-progress-static.test.tsx
tests/security/csv-import-redaction-static.test.ts
```

Coverage:
- auth required.
- user scoping.
- job creation validates file/safe path.
- worker streams not full-file read.
- progress updates.
- cancellation respected.
- retry/resume behavior.
- Product/AffiliateLink upsert behavior.
- no path/secret leakage.

7. start.sh:
Add source checks and final marker:
```text
CSV_IMPORT_JOB_QUEUE_CONFIGURED=true
```

Verification commands:
```bash
git status --short
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm run prisma:generate
npx prisma validate
npx prisma migrate status --schema prisma/schema.prisma
npm run typecheck
npm run test
npm run build
npm run imports:csv-products:worker:once
bash start.sh
```

Final response format:
1. Overall verdict
- PASS / WARN / FAIL
- CSV_IMPORT_JOB_QUEUE_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
3. Files reviewed
4. Files changed
5. Schema changes
6. API behavior
7. Worker behavior
8. Dashboard behavior
9. Security/redaction behavior
10. Commands run
11. Blocking issues
12. Remaining risks
13. Commit hash
14. PR status

Final line:
CSV_IMPORT_JOB_QUEUE_READY=true or CSV_IMPORT_JOB_QUEUE_READY=false
```
