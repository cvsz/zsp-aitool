# HyperFrames Auto-Remediation Runbook (Phase 6.4)

This runbook documents safe, operator-driven workflows for HyperFrames incidents.

## Safety defaults

- All new remediation scripts are safe by default.
- `npm run hyperframes:diag` is read-only diagnostics.
- `npm run hyperframes:safe-rollback` is read-only until confirmation is explicitly provided.

## Quick diagnostics

Run these first:

```bash
npm run hyperframes:diag
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
npm run health
```

## Scenario playbooks

### 1) Stuck `RUNNING`

```bash
npm run hyperframes:queue-status
npm run hyperframes:recover-stale-jobs
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```

If repeated stale jobs continue, run safe rollback preview:

```bash
npm run hyperframes:safe-rollback
```

### 2) Database down

```bash
npm run health
npm run hyperframes:queue-status
npm run hyperframes:diag
```

Then restore database connectivity and re-check:

```bash
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

### 3) Low disk on render output

```bash
df -h /var/lib/zsp-aitool/hyperframes/renders
HYPERFRAMES_CLEANUP_DRY_RUN=true npm run hyperframes:cleanup-renders
npm run hyperframes:diag
```

Do not delete artifacts blindly; use dry-run output to plan targeted cleanup.

### 4) Repeated `FAILED` jobs

```bash
npm run hyperframes:worker:journal-summary
npm run hyperframes:render-job-status -- <job-id>
npm run hyperframes:doctor
npm run hyperframes:diag
```

Validate composition metadata and input safety before retrying.

### 5) cloudflared stale route

Symptoms: stale tunnel route points to old app process while local health is green.

```bash
npm run health
curl -I http://127.0.0.1:3001/dashboard/hyperframes/ops
curl -I http://127.0.0.1:3001/dashboard/hyperframes/renders
npm run hyperframes:diag
```

If local checks pass, refresh tunnel process using existing infra playbook (no route policy changes).

### 6) Service inactive

```bash
systemctl status zsp-hyperframes-worker --no-pager
npm run hyperframes:worker:status
npm run hyperframes:diag
```

If intentionally disabled for rollback, keep disabled until queue is stable.

### 7) Bad deploy rollback

Preview only:
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

Apply only with explicit confirmation:

```bash
HYPERFRAMES_SAFE_ROLLBACK_CONFIRM=YES npm run hyperframes:safe-rollback
```

Post-rollback verification:

```bash
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

## Command reference

- Diagnostics (read-only): `npm run hyperframes:diag`
- Safe rollback preview: `npm run hyperframes:safe-rollback`
- Safe rollback apply: `HYPERFRAMES_SAFE_ROLLBACK_CONFIRM=YES npm run hyperframes:safe-rollback`
