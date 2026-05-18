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

```bash
npm run hyperframes:safe-rollback
```

Apply only with explicit confirmation:

```bash
HYPERFRAMES_SAFE_ROLLBACK_CONFIRM=YES npm run hyperframes:safe-rollback
```

Post-rollback verification:

```bash
npm run health
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```

## Command reference

- Diagnostics (read-only): `npm run hyperframes:diag`
- Safe rollback preview: `npm run hyperframes:safe-rollback`
- Safe rollback apply: `HYPERFRAMES_SAFE_ROLLBACK_CONFIRM=YES npm run hyperframes:safe-rollback`
