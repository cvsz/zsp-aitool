# 048 — Admin Audit Logs Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool` after key product/import/export flows are stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
048 — Admin Audit Logs.

Priority:
High. Admins need a durable audit trail for imports, deletes, exports, AI generation, settings changes, deduplication, and operational actions.

Primary objective:
Implement admin audit logs that track sensitive/high-impact actions with user, action, target, metadata, IP/user-agent where safely available, and redacted payload summaries.

Hard constraints:
- Do not store secrets, access tokens, refresh tokens, API keys, cookies, sessions, raw Authorization headers, DATABASE_URL, passwords, password hashes, local paths, or raw stack traces.
- Do not log full request bodies for sensitive routes.
- Do not expose audit logs to non-admin users.
- Do not weaken auth or tenant isolation.
- Audit writes should not break critical user flows if audit fails; use safe best-effort unless action requires strict compliance.
- Keep audit metadata bounded in size.

Review first:
- prisma/schema.prisma
- src/app/api/admin/**
- src/middleware/auth-middleware.ts or auth helpers
- src/app/api/products/**
- src/app/api/export/**
- src/app/api/ai/**
- src/app/api/settings/**
- src/app/api/integrations/shopee/**
- src/services/**
- existing HyperFrameSocialExportAuditEvent if present
- tests/api/admin-analytics.test.ts
- tests/security/security-compliance-static-scans.test.ts
- package.json
- start.sh

Required work:
1. Schema
Add or reuse an audit model:
```prisma
model AdminAuditLog {
  id          String @id @default(cuid())
  actorUserId String?
  action      String
  targetType  String
  targetId    String?
  status      String @default("SUCCESS")
  ipHash      String?
  userAgent   String?
  metadata    Json?
  createdAt   DateTime @default(now())
  deletedAt   DateTime?

  @@index([actorUserId, createdAt])
  @@index([action, createdAt])
  @@index([targetType, targetId])
}
```

2. Audit service
Create:
```text
src/services/AdminAuditLogService.ts
```

Responsibilities:
- write audit events.
- redact metadata recursively.
- hash IP if present.
- cap metadata size.
- never throw secrets into logs.
- list/query audit logs for admins.

3. Instrument routes/actions
Track at least:
- product import/create/update/delete/archive/bulk actions.
- CSV import job create/cancel/retry/complete/fail.
- product deduplication scan/merge/dismiss.
- export job create/download.
- AI generation enqueue/cancel/retry/complete/fail.
- settings update.
- auth login failure/success if safe and existing policy allows.
- admin backend monitor access if desirable.

4. Admin API
Create/update:
```text
GET /api/admin/audit-logs
GET /api/admin/audit-logs/[id]
```

Filters:
- action
- targetType
- actorUserId
- dateFrom/dateTo
- status
- page/pageSize

5. Admin UI
Create/update:
```text
/dashboard/admin/audit-logs
```

UI:
- table with filters.
- safe metadata viewer.
- pagination.
- loading/empty/error states.
- no secrets/local paths.

6. Tests
Add/update:
```text
tests/services/AdminAuditLogService.test.ts
tests/api/admin-audit-logs.test.ts
tests/components/admin-audit-logs-static.test.tsx
tests/security/admin-audit-redaction.test.ts
```

Coverage:
- non-admin denied.
- admin can list audit logs.
- filters work.
- redaction removes secrets/tokens/cookies/local paths.
- metadata size is capped.
- instrumented service writes audit event.
- audit failure does not leak or crash where best-effort is expected.

7. Documentation
Create:
```text
docs/runbooks/admin-audit-logs.md
```

8. start.sh marker:
```text
ADMIN_AUDIT_LOGS_CONFIGURED=true
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
- ADMIN_AUDIT_LOGS_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
3. Files reviewed
4. Files changed
5. Schema changes
6. Audit events covered
7. Admin API behavior
8. Admin UI behavior
9. Redaction/security behavior
10. Commands run
11. Blocking issues
12. Remaining risks
13. Commit hash
14. PR status

Final line:
ADMIN_AUDIT_LOGS_READY=true or ADMIN_AUDIT_LOGS_READY=false
```
