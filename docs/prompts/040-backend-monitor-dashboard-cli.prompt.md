# 040 — Backend Monitor Dashboard + CLI Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool` after Phase 039 DB drift repair is merged and production passes `bash start.sh`.

```text
You are working on cvsz/zsp-aitool.

Phase:
040 — Backend Monitor Dashboard + CLI.

Priority:
High. Operators need a single safe view of backend health, services, DB, queues, imports, and recent errors.

Primary objective:
Build backend monitoring utilities for the production VM and admin UI without leaking secrets or local filesystem internals.

Scope:
1. CLI/script monitor for terminal use.
2. Admin API route for backend status.
3. Admin dashboard page/card.
4. Tests for safety, auth, response shape, and redaction.
5. Documentation and start.sh verification marker.

Hard constraints:
- Do not expose `DATABASE_URL`, env secrets, API keys, tokens, cookies, sessions, auth headers, local private paths, `/home/*`, `/var/lib/*`, or raw journal output in API/UI responses.
- Do not add public unauthenticated monitoring endpoints.
- Admin status route must require auth and admin role/guard if existing admin guard exists.
- Do not run mutating operations from monitor endpoints.
- Do not call external providers from monitor endpoints.
- Do not weaken existing auth, tenant isolation, Shopee controls, Marqeta sandbox controls, or HyperFrames safety.

Review first:
- start.sh
- package.json
- scripts/health-zsp-aitool.sh
- scripts/hyperframes/render-queue-status.ts
- scripts/hyperframes/worker-watchdog.ts
- src/app/api/admin/**
- src/app/dashboard/admin/**
- src/components/** admin/dashboard components
- src/middleware or auth middleware
- prisma/schema.prisma
- tests/api/admin-analytics.test.ts
- tests/components/final-ui-admin-hyperframes-audit.test.ts
- tests/security/security-compliance-static-scans.test.ts

Required implementation:

1. CLI monitor
Create:
```text
scripts/monitor/backend-monitor.ts
```

Add npm script:
```json
"monitor:backend": "tsx scripts/monitor/backend-monitor.ts"
```

CLI output must include:
- app service status: `zsp-aitool` active/enabled if accessible.
- worker service status: `zsp-hyperframes-worker` active/enabled if accessible.
- HTTP local status for `http://127.0.0.1:3001/`.
- DB connectivity status.
- Product count.
- AffiliateLink count.
- ShopeeAffiliateIngestion counts by status.
- HyperFrames queue summary if available.
- disk free summary.
- recent app error count from safe journal summary if possible.

CLI must redact:
- DATABASE_URL.
- env values.
- tokens.
- `/home/...` and `/var/lib/...` local paths.

2. Admin API route
Create:
```text
src/app/api/admin/backend/status/route.ts
```

Behavior:
- requires authenticated admin user using existing project conventions.
- returns JSON shape:
```ts
{
  ok: true,
  data: {
    app: { reachable: boolean; serviceActive?: boolean; serviceEnabled?: boolean },
    worker: { serviceActive?: boolean; serviceEnabled?: boolean },
    db: { reachable: boolean; productCount: number; affiliateLinkCount: number; ingestionByStatus: Record<string, number> },
    hyperframes: { pending: number; running: number; staleRunning: number; failedLast24h: number } | null,
    system: { freeDiskMb?: number; checkedAt: string },
    warnings: string[]
  }
}
```
- never returns raw error stack or secrets.
- fails closed when unauthenticated.
- non-admin access must be denied if admin guard exists.

3. Dashboard page
Create/update:
```text
src/app/dashboard/admin/backend-monitor/page.tsx
```

Add navigation link if current admin nav convention supports it.

UI should show:
- app status.
- worker status.
- DB status.
- Product count.
- AffiliateLink count.
- Shopee ingestion counts.
- HyperFrames queue summary.
- warning panel.
- refresh button.
- loading state.
- empty/unavailable state.
- error state.

4. Shared monitor service
Prefer a server-side service:
```text
src/services/BackendMonitorService.ts
```

Responsibilities:
- collect DB status using Prisma.
- collect safe counts.
- collect safe process/service status with guarded shell calls if needed.
- normalize errors.
- redact sensitive data.

5. Tests
Add/update:
```text
tests/services/BackendMonitorService.test.ts
tests/api/admin-backend-status.test.ts
tests/components/admin-backend-monitor-static.test.tsx
tests/scripts/backend-monitor-static.test.ts
tests/security/backend-monitor-redaction-static.test.ts
```

Coverage:
- unauthenticated API denied.
- non-admin API denied if role guard exists.
- admin returns safe status shape.
- DB failure returns safe warning not stack trace.
- response does not include secret/path patterns.
- CLI redaction helper removes tokens and local paths.
- UI has loading/error/empty/status states.
- package.json includes `monitor:backend`.

6. Documentation
Create:
```text
docs/runbooks/backend-monitor.md
```

Include:
- CLI usage.
- API/dashboard usage.
- fields explained.
- troubleshooting.
- redaction/security policy.
- production verification.

7. start.sh
Add source integrity checks:
- BackendMonitorService exists.
- admin backend status route exists.
- dashboard page exists.
- backend monitor CLI exists.
- package script exists.
- runbook exists.
- final marker:
```text
BACKEND_MONITOR_CONFIGURED=true
```

Verification commands:
```bash
git status --short
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm run monitor:backend
npm run typecheck
npm run test
npm run build
npm run health
bash start.sh
```

Final response format:
1. Overall verdict
- PASS / WARN / FAIL
- BACKEND_MONITOR_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
3. Files reviewed
4. Files changed
5. Monitor output shape
6. API behavior
7. Dashboard behavior
8. Redaction/security behavior
9. Commands run
10. Blocking issues
11. Remaining risks
12. Commit hash
13. PR status

Final line:
BACKEND_MONITOR_READY=true or BACKEND_MONITOR_READY=false
```
