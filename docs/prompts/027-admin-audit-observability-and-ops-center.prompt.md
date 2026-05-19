# 027 — Admin Audit, Observability, and Ops Center Prompt

Use after 026 is stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
027 — Admin Audit, Observability, and Ops Center.

Mode:
Production-safe observability and operator UX. Add read-only operational visibility, not dangerous server controls.

Main objective:
Improve admin/operator visibility for health, queue status, audit events, growth metrics, schema drift, integrations, and recent safe system summaries.

Required work:
1. Inventory existing admin pages, audit logs, health scripts, HyperFrames queue/watchdog, schema drift checker, and Shopee status endpoint.
2. Add or polish read-only ops cards for app health, DB schema drift status, HyperFrames queue/watchdog, Shopee Open API foundation status, and recent aggregate events.
3. Add audit-log UI if data exists; otherwise add safe placeholder with docs link.
4. Add operator-safe status copy with no stack traces, secrets, local paths, outputPath, /var/lib, or systemd controls.
5. Add tests for admin gating, no raw private data, no secret/path exposure, no systemctl controls, and safe aggregate-only display.
6. Update docs/runbooks/admin-observability-ops-center.md.

Hard constraints:
- Do not add UI buttons that start/stop/restart/enable/disable systemd services.
- Do not expose raw logs containing secrets or local filesystem paths.
- Do not expose raw emails, passwords, tokens, partner keys, DATABASE_URL, outputPath, /var/lib, or stack traces.
- Do not weaken admin gating or tenant/org isolation.
- Keep production port and Cloudflare routes unchanged.

Verification:
- npm run prisma:generate
- npx prisma validate
- npm run db:schema-drift-check
- npm run typecheck
- npm run test
- npm run build
- npm run health
- npm run hyperframes:queue-status
- npm run hyperframes:worker:watchdog

Final response:
- PASS/WARN/FAIL
- files changed
- ops cards added
- audit/security behavior
- tests run
- commit hash
```
