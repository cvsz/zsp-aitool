# 049 — Observability Pack Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool` after backend monitor and audit logs are stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
049 — Observability Pack.

Priority:
High. The app needs structured error tracking, slow API logs, DB query timing, import/worker monitoring, and safe operational dashboards.

Primary objective:
Add an observability pack that tracks backend health, slow routes, DB latency, worker queue health, import progress, and safe error summaries without exposing secrets.

Hard constraints:
- Do not leak DATABASE_URL, env secrets, API keys, tokens, cookies, sessions, Authorization headers, local paths, raw stack traces, passwords, or webhook secrets.
- Do not introduce external observability SaaS by default.
- External sinks must be optional and disabled by default.
- Do not add high-cardinality unbounded logging.
- Do not log raw request/response bodies for sensitive routes.
- Do not degrade performance significantly.

Review first:
- scripts/health-zsp-aitool.sh
- scripts/hyperframes/**
- scripts/monitor/** if present
- src/middleware/**
- src/app/api/**
- src/services/**
- prisma/schema.prisma
- package.json
- start.sh
- tests/security/security-compliance-static-scans.test.ts
- existing monitor/admin tests

Required work:
1. Structured logger
Create/update:
```text
src/lib/observability/logger.ts
```

Features:
- JSON structured logs.
- redaction helper.
- requestId/correlationId support.
- safe error shaping.
- severity levels.

2. API timing middleware/helper
Create:
```text
src/lib/observability/api-timing.ts
```

Track:
- route pattern.
- method.
- status.
- durationMs.
- userId hash or safe ID if policy allows.
- requestId.

Do not log raw query strings with secrets.

3. DB timing helper
Create:
```text
src/lib/observability/db-timing.ts
```

Track high-level Prisma operation timing where feasible.
Avoid logging raw SQL with values.

4. Observability events table
Optional if needed:
```prisma
model ObservabilityEvent {
  id        String @id @default(cuid())
  level     String
  source    String
  event     String
  durationMs Int?
  status    String?
  metadata  Json?
  createdAt DateTime @default(now())
  deletedAt DateTime?

  @@index([level, createdAt])
  @@index([source, event, createdAt])
}
```

5. Admin API
Create:
```text
GET /api/admin/observability/summary
GET /api/admin/observability/events
```

Admin-only. Return safe summaries:
- error count last 1h/24h.
- slow API routes.
- DB latency summary.
- worker status summary.
- import job health.
- recent redacted events.

6. Dashboard UI
Create:
```text
/dashboard/admin/observability
```

UI:
- cards for errors, slow APIs, DB latency, worker queues, import jobs.
- table for recent redacted events.
- loading/empty/error states.
- time window filters.

7. Worker monitoring
Extend monitor/observability to include:
- HyperFrames worker pending/running/stale/failed.
- CSV import worker pending/running/failed if Phase 041 exists.
- AI content queue pending/running/failed if Phase 046 exists.

8. Tests
Add/update:
```text
tests/lib/observability-redaction.test.ts
tests/lib/api-timing.test.ts
tests/services/ObservabilityService.test.ts
tests/api/admin-observability.test.ts
tests/components/admin-observability-static.test.tsx
tests/security/observability-secret-redaction.test.ts
```

Coverage:
- redaction removes secret/path/token patterns.
- logger emits safe JSON.
- admin-only API.
- slow route summaries are bounded.
- no raw body logging.
- dashboard states exist.
- package/start markers present.

9. Documentation
Create:
```text
docs/runbooks/observability-pack.md
```

Include:
- what is collected.
- what is explicitly not collected.
- redaction policy.
- dashboard usage.
- troubleshooting.
- optional external sink policy.

10. start.sh marker:
```text
OBSERVABILITY_PACK_CONFIGURED=true
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
npm run health
bash start.sh
```

Final response format:
1. Overall verdict
- PASS / WARN / FAIL
- OBSERVABILITY_PACK_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
3. Files reviewed
4. Files changed
5. Schema changes
6. Logging/timing behavior
7. Admin API behavior
8. Dashboard behavior
9. Redaction/security behavior
10. Commands run
11. Blocking issues
12. Remaining risks
13. Commit hash
14. PR status

Final line:
OBSERVABILITY_PACK_READY=true or OBSERVABILITY_PACK_READY=false
```
