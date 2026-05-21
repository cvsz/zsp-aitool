# 047 — Export Center v2 Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool` after Product scaling and AI/Social draft persistence are stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
047 — Export Center v2.

Priority:
High. Operators need a central export system for Products, AffiliateLinks, SocialDrafts, and ContentHistory with filters, safe headers, and auditable behavior.

Primary objective:
Build Export Center v2 with filterable exports for Product, AffiliateLink, Shopee social drafts, and content history in CSV/JSON/Markdown/TXT where appropriate.

Hard constraints:
- All exports require auth and user scoping unless existing admin export explicitly requires admin guard.
- Do not export secrets, tokens, cookies, sessions, local paths, DATABASE_URL, provider keys, webhook secrets, raw headers, or password hashes.
- Prevent spreadsheet formula injection in CSV exports.
- Do not return unbounded exports without limits or background job option.
- Export filenames must be safe.
- Exported data must respect deletedAt/soft-delete policy unless explicitly includeArchived with permission.

Review first:
- src/app/api/export/**
- src/services/ExportService.ts
- src/app/dashboard/** export/download components
- prisma/schema.prisma
- Product/AffiliateLink/ShopeeAffiliateSocialDraft/ContentGeneration models
- tests/services/ExportService.test.ts
- tests/export-panel-security.test.ts
- tests/api/export-routes-headers.test.ts if present
- package.json
- start.sh

Required work:
1. Export service v2
Create/update:
```text
src/services/ExportCenterService.ts
```

Responsibilities:
- validate export type and format.
- enforce auth/user scope.
- apply filters.
- cap synchronous export size.
- escape CSV formula cells.
- produce safe filenames.
- return correct content type.
- redact sensitive fields.

2. API routes
Create/update:
```text
GET  /api/export/v2/products
GET  /api/export/v2/affiliate-links
GET  /api/export/v2/social-drafts
GET  /api/export/v2/content-history
POST /api/export/v2/jobs
GET  /api/export/v2/jobs
GET  /api/export/v2/jobs/[id]
GET  /api/export/v2/jobs/[id]/download
```

Query filters:
- format=csv|json|md|txt where supported.
- dateFrom/dateTo.
- category.
- shopName.
- platform.
- status.
- q.
- hasAffiliateUrl.
- includeArchived=false default.

3. Optional schema
If large exports need background jobs, add:
```prisma
model ExportJob {
  id String @id @default(cuid())
  userId String
  type String
  format String
  status String @default("PENDING")
  filters Json?
  outputPath String?
  outputFileName String?
  rowCount Int @default(0)
  errorSummary String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  completedAt DateTime?
  failedAt DateTime?
  deletedAt DateTime?

  @@index([userId, status, createdAt])
}
```

Never expose outputPath to API/UI.

4. Dashboard UI
Add page:
```text
/dashboard/export-center
```

UI behavior:
- choose export dataset.
- choose format.
- set filters.
- preview estimated count where feasible.
- download small export directly.
- create background export job for large result sets.
- show job history/status.
- loading/empty/error states.

5. Tests
Add/update:
```text
tests/services/ExportCenterService.test.ts
tests/api/export-center-v2.test.ts
tests/components/export-center-v2-static.test.tsx
tests/security/export-center-redaction.test.ts
```

Coverage:
- auth required.
- user scoping.
- filters applied.
- CSV content-type and content-disposition.
- JSON content-type.
- CSV formula escaping.
- no secret/path leakage.
- large export creates job when configured.
- job download denies other users.

6. Documentation
Create:
```text
docs/runbooks/export-center-v2.md
```

7. start.sh marker:
```text
EXPORT_CENTER_V2_CONFIGURED=true
```

Verification:
```bash
git status --short
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm run prisma:generate
npx prisma validate
npx prisma migrate status --schema prisma/schema.prisma
npm run typecheck
npm run test
npm run build
bash start.sh
```

Final response format:
1. Overall verdict
- PASS / WARN / FAIL
- EXPORT_CENTER_V2_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
3. Files reviewed
4. Files changed
5. Schema changes
6. API/export behavior
7. Dashboard behavior
8. Security/redaction behavior
9. Commands run
10. Blocking issues
11. Remaining risks
12. Commit hash
13. PR status

Final line:
EXPORT_CENTER_V2_READY=true or EXPORT_CENTER_V2_READY=false
```
