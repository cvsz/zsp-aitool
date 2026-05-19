# Post-Launch Monitoring Runbook (Phase 016)

This runbook defines **read-only**, operator-safe monitoring for ZSP-AITool after launch.

## Scope and safety

- Applies to production post-launch health checks, HyperFrames queue/worker observation, and early growth feedback loops.
- Do not execute destructive or mutating operations from automated checks.
- Do not expose secrets or internal paths (`outputPath`, `/var/lib`, tokens, `DATABASE_URL`) in user-facing channels.
- Keep production app port at `3001`.

## Daily checklist

Run in this order:

1. `git status --short`
2. `npm run health`
3. `npm run hyperframes:queue-status`
4. `npm run hyperframes:worker:watchdog`
5. `systemctl is-active zsp-aitool`
6. `systemctl is-active zsp-hyperframes-worker`
7. `systemctl is-enabled zsp-hyperframes-worker`
8. `journalctl -u zsp-aitool -n 120 -l --no-pager`
9. `journalctl -u zsp-hyperframes-worker -n 120 -l --no-pager`
10. `df -h`

## Weekly checklist

1. `npm ci`
2. `npm run prisma:generate`
3. `npx prisma validate`
4. `npm run typecheck`
5. `npm run test`
6. `npm run build`
7. `npm run health`
8. `npx prisma migrate status --schema prisma/schema.prisma`
9. Review failed render count trends
10. Review failed login/auth reports
11. Review user feedback notes
12. Review onboarding funnel drop-off points

## HyperFrames incident thresholds

Treat as incident signals when one or more occur:

- Pending queue grows unexpectedly over baseline.
- Running jobs appear stuck or `staleRunning > 0`.
- `failedLast24h` increases sharply.
- Free disk drops below configured threshold.
- Worker inactive while render is intentionally enabled.
- Worker service disabled unexpectedly.
- Repeated render CLI failures.

## Operator response (safe-by-default)

1. Capture `npm run hyperframes:queue-status` output.
2. Capture `npm run hyperframes:worker:watchdog` output.
3. Capture journal summaries for app and worker units.
4. Keep cleanup in dry-run mode unless explicitly approved.
5. Recover stale jobs only via approved runbook/script.
6. Do not expose internal paths in user-facing communication.

## Convenience scripts

- `npm run post-launch:status-summary`
- `npm run post-launch:smoke-routes`

Both scripts are read-only and should be used for observation only.
