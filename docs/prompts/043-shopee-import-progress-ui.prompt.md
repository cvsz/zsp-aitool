# 043 — Shopee Import Progress UI Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool` after Phase 041 CSV import job queue is available.

```text
You are working on cvsz/zsp-aitool.

Phase:
043 — Shopee Import Progress UI.

Priority:
High. Operators importing large Shopee Product Feed files need live progress, rejected-row summaries, status, cancel/retry controls, and safe visibility in the dashboard.

Primary objective:
Add a production-safe import progress panel to `/dashboard/shopee-affiliate` or `/dashboard/imports` that displays CSV import job status from the DB-backed job queue.

Dependencies:
- Phase 041 should provide CsvImportJob/CsvImportJobEvent or equivalent job data.
- If Phase 041 is not yet implemented, create the UI/API against a small service abstraction and document what remains blocked.

Hard constraints:
- Do not expose local file paths.
- Do not expose DATABASE_URL, env secrets, API keys, tokens, cookies, sessions, or raw stack traces.
- Do not call external Shopee endpoints.
- Do not auto-login to Shopee.
- Do not scrape private dashboard data.
- All routes require auth and user scoping.
- Cancel/retry controls must be safe and idempotent.

Review first:
- src/components/shopee/ShopeeAffiliateRealDbDashboard.tsx
- src/app/dashboard/shopee-affiliate/**
- src/app/api/integrations/shopee/**
- src/app/api/imports/csv-products/** if present
- src/services/CsvProductImportJobService.ts if present
- prisma/schema.prisma
- tests/components/shopee-open-api-import-static.test.ts
- tests/api/csv-product-import-jobs.test.ts if present
- package.json
- start.sh

Required UI behavior:
1. Show current/recent import jobs.
2. For each job show:
   - safe file label/name.
   - status.
   - processed rows.
   - imported rows.
   - rejected rows.
   - failed rows.
   - started/completed/cancelled timestamps.
   - progress percent when total row/byte info is available.
   - speed/ETA if easy and stable.
   - sample rejected reasons.
3. Controls:
   - refresh.
   - cancel job.
   - retry job.
   - view imported products link/filter.
4. States:
   - loading.
   - empty.
   - error.
   - cancelled.
   - failed.
   - completed.
5. Polling:
   - conservative polling while jobs are active, e.g. 5–10 seconds.
   - stop/slow polling when no active jobs.

Required API behavior:
If not already available, create or update:
```text
GET  /api/imports/csv-products
GET  /api/imports/csv-products/[id]
POST /api/imports/csv-products/[id]/cancel
POST /api/imports/csv-products/[id]/retry
```

All responses must redact local paths and secrets.

Suggested component:
```text
src/components/imports/CsvProductImportProgressPanel.tsx
```

Integrate into:
```text
src/components/shopee/ShopeeAffiliateRealDbDashboard.tsx
```

Tests:
Add/update:
```text
tests/components/shopee-import-progress-panel-static.test.tsx
tests/api/csv-product-import-progress.test.ts
tests/security/import-progress-redaction-static.test.ts
```

Coverage:
- loading/empty/error states.
- active job progress display.
- completed job display.
- failed/cancelled display.
- cancel button presence and route use.
- retry button presence and route use.
- no local path/secret leakage.
- auth required and user scoped.

Docs:
Create/update:
```text
docs/runbooks/shopee-import-progress-ui.md
```

Include:
- operator flow.
- status meanings.
- troubleshooting stuck imports.
- cancel/retry behavior.
- safe data display policy.

start.sh:
Add source checks and final marker:
```text
SHOPEE_IMPORT_PROGRESS_UI_CONFIGURED=true
```

Verification commands:
```bash
git status --short
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm run typecheck
npm run test
npm run build
bash start.sh
```

Final response format:
1. Overall verdict
- PASS / WARN / FAIL
- SHOPEE_IMPORT_PROGRESS_UI_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
3. Files reviewed
4. Files changed
5. API behavior
6. UI behavior
7. Security/redaction behavior
8. Commands run
9. Blocking issues
10. Remaining risks
11. Commit hash
12. PR status

Final line:
SHOPEE_IMPORT_PROGRESS_UI_READY=true or SHOPEE_IMPORT_PROGRESS_UI_READY=false
```
