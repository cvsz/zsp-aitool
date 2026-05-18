# HyperFrames Auto-Remediation Runbook (Phase 6.4)

This runbook provides **safe-by-default** remediation workflows for HyperFrames production incidents.

## Safety Rules

- Always keep tenant/user isolation controls enabled.
- Never expose local filesystem paths in API responses or logs.
- Never execute arbitrary user HTML directly on host.
- Never print secrets from `.env` in diagnostics.
- Use read-only diagnostics first.
- Use confirmation-gated scripts for rollback/remediation.

## Quick Diagnostics

Run read-only diagnostic bundle first:

```bash
npm run hyperframes:diag
```

## 1) Stuck `RUNNING` Jobs

Symptoms:
- Queue shows `running > 0` while worker appears idle.
- Jobs exceed stale threshold.

Commands:

```bash
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
npm run hyperframes:recover-stale-jobs
npm run hyperframes:queue-status
```

Expected:
- Stale RUNNING jobs transition to FAILED with safe error message.
- Queue returns to normal scheduling state.

## 2) Database Down

Symptoms:
- Prisma connection failures.
- Health check DB section fails.

Commands:

```bash
npm run health
npm run hyperframes:diag
```

Host-level checks (production host):

```bash
systemctl status postgresql --no-pager
journalctl -u postgresql -n 100 --no-pager
```

After DB recovery:

```bash
npm run prisma:generate
npm run health
npm run hyperframes:queue-status
```

## 3) Low Disk

Symptoms:
- Render failures with ENOSPC.
- Worker fails writing render artifacts.

Commands:

```bash
npm run hyperframes:diag
```

Host-level checks:

```bash
df -h
journalctl -u zsp-hyperframes-worker -n 100 --no-pager
```

Safe cleanup option:

```bash
npm run hyperframes:cleanup-renders
npm run hyperframes:queue-status
```

## 4) Repeated `FAILED` Jobs

Symptoms:
- Same composition/user jobs repeatedly fail.

Commands:

```bash
npm run hyperframes:queue-status
npm run hyperframes:worker:journal-summary
npm run hyperframes:worker:logs
npm run hyperframes:render-smoke
```

Actions:
- Validate render input payload and sanitization behavior.
- Confirm render-enabled flag is still intended and worker active.
- If failure started after deploy, follow rollback flow below.

## 5) cloudflared Stale Route

Symptoms:
- Tunnel up but stale origin mapping / unreachable dashboard routes.

Commands:

```bash
npm run hyperframes:diag
```

Host-level checks:

```bash
systemctl status cloudflared --no-pager
journalctl -u cloudflared -n 200 --no-pager
curl -I https://studio.zeaz.dev/dashboard/hyperframes/renders
curl -I https://studio.zeaz.dev/dashboard/hyperframes/ops
```

Remediation:
- Restart `cloudflared` **only** on host if route is stale.
- Do not change Cloudflare route configuration as part of this runbook.

## 6) Service Inactive

Symptoms:
- `serviceActive=false` in queue status or watchdog warning.

Commands:

```bash
npm run hyperframes:worker:status
npm run hyperframes:worker:watchdog
```

Host-level remediation:

```bash
sudo systemctl restart zsp-hyperframes-worker
sudo systemctl status zsp-hyperframes-worker --no-pager
npm run hyperframes:queue-status
```

## 7) Bad Deploy Rollback

Use confirmation-gated rollback script.

Preview only (non-destructive):

```bash
npm run hyperframes:safe-rollback
```

Execute rollback (confirmed):

```bash
HYPERFRAMES_CONFIRM=YES npm run hyperframes:safe-rollback
```

What rollback does:
- Stops and disables HyperFrames worker service.
- Sets `HYPERFRAMES_RENDER_ENABLED=false` in `.env` (with backup).
- Reloads systemd.
- Runs health + queue status checks.

## Post-Remediation Verification

Run full verification sequence:

```bash
npm ci
npm run prisma:generate
npm run typecheck
npm run test
npm run build
npm run health
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```
