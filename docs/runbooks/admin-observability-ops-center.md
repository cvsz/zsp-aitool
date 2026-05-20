# Admin Observability and Ops Center (Read-Only)

## Purpose

Phase 027 adds safe operational visibility for admins/operators without dangerous controls.

## Included cards

- App health summary (healthy/degraded by aggregate recent failures)
- DB schema drift check readiness (script available status)
- HyperFrames queue/watchdog readiness (pending/running/fail aggregates)
- Shopee Open API foundation status (safe config summary only)
- Recent aggregate events (7-day growth + 24-hour render activity)

## Safety guarantees

- Read-only dashboard with aggregate-only numbers
- No systemd start/stop/restart/enable/disable controls
- No secret/token output
- No raw paths, no `/var/lib`, no `outputPath` exposure
- No stack traces in operator-facing copy
- Admin panel remains gated by `ADMIN_PANEL_ENABLED` and auth

## Audit logs surface

- If dedicated audit tables are unavailable, UI shows aggregate placeholders and links here.
- Operators should use this page plus existing health/check scripts for incident triage.

## Verification commands

```bash
npm run prisma:generate
npx prisma validate
npm run db:schema-drift-check
npm run typecheck
npm run test
npm run build
npm run health
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```
