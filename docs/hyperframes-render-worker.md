# HyperFrames Render Worker

Rendering is disabled by default for safety and optional dependency isolation.

- Keep `HYPERFRAMES_RENDER_ENABLED=false` unless actively testing.
- Feature flag: `HYPERFRAMES_RENDER_ENABLED=true` to enable rendering for explicit runs.
- Official CLI package/binary: `hyperframes`.
- Runtime requirements: Node.js >= 22 and FFmpeg.
- Dependencies checked by doctor: Node runtime, ffmpeg, HyperFrames CLI via configured bin/args.
- Worker commands: `npm run hyperframes:worker` (continuous) or `npm run hyperframes:worker:once`.

## Prerequisites

- Linux host with systemd.
- User `zeazdev` exists and can run npm in `/home/zeazdev/zsp-aitool`.
- Repository present at `/home/zeazdev/zsp-aitool`.
- `.env` file exists and keeps `HYPERFRAMES_RENDER_ENABLED=false` by default.
- `npm ci`, `npm run prisma:generate`, `npm run typecheck`, and `npm run health` already pass.
- `npm run hyperframes:doctor` reports CLI callable.

## CLI configuration

Use one of these safe patterns:

1. Installed binary
   - `HYPERFRAMES_CLI_BIN=hyperframes`
   - `HYPERFRAMES_CLI_ARGS=` (empty)
2. npx invocation
   - `HYPERFRAMES_CLI_BIN=npx`
   - `HYPERFRAMES_CLI_ARGS=-y hyperframes`

The worker and smoke script execute the configured CLI as `HYPERFRAMES_CLI_BIN` + `HYPERFRAMES_CLI_ARGS` and then append command arguments.

## Staged enablement process

### Stage 0 (default, disabled)

```bash
HYPERFRAMES_RENDER_ENABLED=false
npm run hyperframes:doctor
npm run hyperframes:worker:once
```

### Stage 1 (sandbox CLI render)

```bash
npx -y hyperframes init cli-smoke
npx -y hyperframes render
```

### Stage 2 (explicit one-off smoke render)

```bash
HYPERFRAMES_RENDER_ENABLED=true \
HYPERFRAMES_RENDER_SMOKE_CONFIRM=YES \
npm run hyperframes:render-smoke
```

### Stage 3 (one-off DB worker job lifecycle)

Find a valid user id:

```bash
psql "$DATABASE_URL" -tAc 'select id,email from "User" limit 5;'
```

Enqueue one smoke job:

```bash
HYPERFRAMES_RENDER_ENABLED=true \
HYPERFRAMES_RENDER_SMOKE_CONFIRM=YES \
HYPERFRAMES_SMOKE_USER_ID=<user-id> \
npm run hyperframes:enqueue-smoke-job
```

Process one job:

```bash
HYPERFRAMES_RENDER_ENABLED=true \
npm run hyperframes:worker:once
```

Inspect job status:

```bash
npm run hyperframes:render-job-status -- <job-id>
```

Inspect render output:

```bash
find /var/lib/zsp-aitool/hyperframes/renders -maxdepth 5 -type f \
  \( -name "*.mp4" -o -name "*.webm" -o -name "*.mov" \) -print -ls
```

Verify app health:

```bash
npm run health
```

### Stage 4 (optional systemd worker, install service only)

Install unit file only (no auto-enable, no auto-start):

```bash
npm run hyperframes:worker:install-service
```

Check status:

```bash
npm run hyperframes:worker:status
```

Manual enable/start (operator decision only):

```bash
sudo systemctl enable zsp-hyperframes-worker
sudo systemctl start zsp-hyperframes-worker
```

Health verification:

```bash
npm run health
npm run hyperframes:worker:status
```

Logs:

```bash
npm run hyperframes:worker:logs
```

Rollback:

```bash
sudo systemctl stop zsp-hyperframes-worker
sudo systemctl disable zsp-hyperframes-worker
sudo rm -f /etc/systemd/system/zsp-hyperframes-worker.service
sudo systemctl daemon-reload
```

## Doctor behavior

- When `HYPERFRAMES_RENDER_ENABLED=false`, doctor reports disabled as `[SKIP]` and does not fail the check.
- Doctor still checks node, ffmpeg, and CLI callability to help preflight environments.
- By default doctor does **not** create directories while render is disabled.
- Set `HYPERFRAMES_DOCTOR_CREATE_DIRS=true` to allow directory creation/checks in disabled mode.

## Worker behavior and safety

- Worker exits cleanly when rendering is disabled.
- Worker only executes CLI commands when rendering is enabled.
- In `--once` mode, worker processes at most one `PENDING` job.
- Per-job workdir is isolated under `HYPERFRAMES_WORKDIR/<job-id>` and rendered with `--input` pointing to that directory (project root containing `index.html`).
- Final outputs are constrained to `HYPERFRAMES_OUTPUT_DIR` using path-safety checks.
- Failed renders are marked `FAILED` with controlled error messages.
- Completed renders are marked `COMPLETED` with `outputPath` metadata.
- API flow: create job -> worker claims `PENDING` job -> `RUNNING` -> `COMPLETED`/`FAILED`.

Systemd unit template is in `deploy/systemd/zsp-hyperframes-worker.service` and is optional.

## Production guardrails (Phase 2.5)

- Queue limits: `HYPERFRAMES_MAX_PENDING_JOBS=25`, `HYPERFRAMES_MAX_RUNNING_JOBS=1`.
- Retry controls: `HYPERFRAMES_MAX_ATTEMPTS=3`, `HYPERFRAMES_RETRY_BACKOFF_SECONDS=300`.
- Stale recovery: `HYPERFRAMES_RUNNING_STALE_MINUTES=30`, run `npm run hyperframes:recover-stale-jobs` explicitly.
- Disk guard: `HYPERFRAMES_MIN_FREE_MB=2048`, `HYPERFRAMES_MAX_OUTPUT_MB=512`.
- Retention cleanup: `HYPERFRAMES_RETENTION_DAYS=14`, `HYPERFRAMES_CLEANUP_DRY_RUN=true` default.
- Queue status command: `npm run hyperframes:queue-status` returns safe JSON only.
- Cleanup command: `npm run hyperframes:cleanup-renders` prints `[OK]/[WARN]/[FAIL]/[SKIP]`; real deletion requires `HYPERFRAMES_CLEANUP_DRY_RUN=false`.
- Systemd remains install-only by default; no auto-enable/auto-start in scripts.
- Manual enable process and rollback remain operator-driven only.

## Phase 2.6: controlled persistent worker trial

This phase adds an operator-gated short-window trial for the systemd worker without changing default production safety.

### Preconditions

Run these before trialing:

```bash
npm run hyperframes:worker:install-service
npm run hyperframes:queue-status
npm run hyperframes:doctor
```

The trial refuses to run if:
- `HYPERFRAMES_WORKER_TRIAL_CONFIRM=YES` is not provided,
- `/etc/systemd/system/zsp-hyperframes-worker.service` is missing,
- `systemctl is-enabled zsp-hyperframes-worker` is `enabled`,
- queue status reports `running > 0`.

The trial warns if `pending = 0`.

### Trial command

```bash
HYPERFRAMES_WORKER_TRIAL_CONFIRM=YES HYPERFRAMES_WORKER_TRIAL_SECONDS=120 npm run hyperframes:worker:trial
```

- Default trial duration is 120 seconds.
- When `HYPERFRAMES_RENDER_ENABLED=true`, the script calls `systemctl start`, sleeps for the trial window, requires the service to remain active, then stops the service.
- When `HYPERFRAMES_RENDER_ENABLED=false`, the script runs a disabled-mode lifecycle check only: it starts the service, allows immediate clean exit, verifies logs/status, then continues with queue status and health checks.
- In disabled mode, immediate clean deactivation is expected behavior and is treated as success when lifecycle checks pass.
- The script prints service status/logs, then runs queue status and health checks.
- The script does not call `systemctl enable` and does not modify `.env`.

### Service/env behavior

- If `HYPERFRAMES_RENDER_ENABLED=false`, the worker exits cleanly with `render disabled`; trial success means lifecycle verified plus passing queue/health checks.
- Trial mode does not automate permanent env changes.
- For real render behavior testing only, use either:
  - a one-off systemd drop-in override, or
  - a temporary manual `.env` edit that you explicitly revert after testing.

### Trial rollback

```bash
sudo systemctl stop zsp-hyperframes-worker
sudo systemctl disable zsp-hyperframes-worker
sudo rm -f /etc/systemd/system/zsp-hyperframes-worker.service
sudo systemctl daemon-reload
```

### When not to run the trial

Do not run when any of the following apply:
- active production queue,
- low disk capacity,
- doctor preflight failure,
- pending migration,
- unhealthy web app status.


## Phase 2.7: live queue trial with temporary render-enabled drop-in

This phase runs exactly one real queued job through the systemd worker with a temporary runtime override, then rolls back automatically.

### Safety constraints

- No permanent `.env` edits.
- No `systemctl enable` calls.
- Service must remain disabled after trial.
- Worker is stopped after trial (success or failure).

### Get a user id safely

Use read-only query output and pick an existing user id:

```bash
psql "$DATABASE_URL" -tAc 'select id,email from "User" order by "createdAt" desc limit 5;'
```

### Run the live queue trial

```bash
HYPERFRAMES_LIVE_TRIAL_CONFIRM=YES HYPERFRAMES_SMOKE_USER_ID=<user-id> HYPERFRAMES_LIVE_TRIAL_SECONDS=300 npm run hyperframes:worker:live-trial
```

Preflight gates refuse the run when:
- confirmation flag is missing,
- user id is missing,
- service file is missing,
- service is enabled,
- running jobs > 0,
- health check fails,
- doctor check fails,
- free disk is below `HYPERFRAMES_MIN_FREE_MB`.

### What the script does

1. Enqueues exactly one smoke render job.
2. Creates temporary drop-in: `/etc/systemd/system/zsp-hyperframes-worker.service.d/trial.conf`.
3. Sets runtime env via drop-in:
   - `HYPERFRAMES_RENDER_ENABLED=true`
   - `HYPERFRAMES_RENDER_SMOKE_CONFIRM=YES`
   - `HYPERFRAMES_CLI_BIN=npx`
   - `HYPERFRAMES_CLI_ARGS=-y hyperframes`
4. Runs `systemctl daemon-reload` and `systemctl start`.
5. Polls job status until `COMPLETED`/`FAILED` or timeout (default 300s).
6. Stops service, removes drop-in, daemon-reloads.
7. Verifies service is disabled + inactive.
8. Runs `npm run health` and `npm run hyperframes:queue-status`.
9. Prints output path when completed.

### Expected output

- `[OK] Queued job: <job-id>`
- `[OK] Job <job-id> finished with status=COMPLETED`
- `[OK] Render output: /var/lib/zsp-aitool/hyperframes/renders/...`

### Rollback commands (manual emergency path)

```bash
sudo systemctl stop zsp-hyperframes-worker || true
sudo rm -f /etc/systemd/system/zsp-hyperframes-worker.service.d/trial.conf
sudo rmdir /etc/systemd/system/zsp-hyperframes-worker.service.d 2>/dev/null || true
sudo systemctl daemon-reload
npm run health
```

After trial completion, `systemctl is-enabled zsp-hyperframes-worker` must not report `enabled` and service should be inactive.

## Phase 2.8: operator status dashboard and runbook

This phase adds read-only operator visibility without enabling persistent rendering.

### Safety defaults

- Keep `HYPERFRAMES_RENDER_ENABLED=false` unless running an explicit trial.
- Keep `HYPERFRAMES_OPERATOR_STATUS_ENABLED=false` by default.
- Operator status API is authenticated and returns controlled 404 when disabled.
- Status response excludes secrets and local filesystem paths.

### Operator status endpoint

- Route: `GET /api/hyperframes/render/status`
- Expected fields:
  - `pending`
  - `running`
  - `completedLast24h`
  - `failedLast24h`
  - `oldestPendingCreatedAt`
  - `renderEnabled`
  - `maxPendingJobs`
  - `maxRunningJobs`
  - `diskFreeMb` (if available)

### Dashboard

- Read-only page: `/dashboard/hyperframes/ops`
- Shows queue counts, render enabled/disabled state, and warnings.
- No controls that start worker.
- No destructive buttons.

### Live trial interpretation

- `pending` rising with `running=0` while `renderEnabled=false` is expected safe idle behavior.
- `running > 0` should only happen during explicit controlled trials.
- `failedLast24h > 0` requires operator review of worker logs and render job status.
- Low `diskFreeMb` signals risk of output failures; run cleanup dry-run first.

### Rollback and cleanup

- Disable endpoint visibility: set `HYPERFRAMES_OPERATOR_STATUS_ENABLED=false`.
- Ensure worker is not persistent:

```bash
sudo systemctl stop zsp-hyperframes-worker
sudo systemctl disable zsp-hyperframes-worker
```

- Run safe cleanup dry-run:

```bash
HYPERFRAMES_CLEANUP_DRY_RUN=true npm run hyperframes:cleanup-renders
```

### Stale recovery

If queue has jobs stuck in running state beyond stale threshold:

```bash
npm run hyperframes:recover-stale-jobs
npm run hyperframes:queue-status
```

### When to enable persistent worker

Enable persistent worker only when all are true:

1. Trial run completed successfully.
2. Queue backlog needs sustained processing.
3. Disk guard and retention policy are active.
4. On-call operator can monitor logs and rollback immediately.

## Phase 2.10: watchdog, observability, and stuck-job detection

- Added watchdog config envs:
  - `HYPERFRAMES_WATCHDOG_STALE_RUNNING_MINUTES=30`
  - `HYPERFRAMES_WATCHDOG_MAX_FAILED_LAST_24H=5`
  - `HYPERFRAMES_WATCHDOG_MAX_PENDING_JOBS=25`
  - `HYPERFRAMES_WATCHDOG_MIN_FREE_MB=2048`
  - `HYPERFRAMES_WATCHDOG_REQUIRE_SERVICE_ACTIVE=true`
  - `HYPERFRAMES_WATCHDOG_RECOVER_STALE=false` (default non-destructive)
- New command: `npm run hyperframes:worker:watchdog` prints `[OK]/[WARN]/[FAIL]/[SKIP]` and a safe JSON summary.
- New command: `npm run hyperframes:worker:journal-summary` summarizes recent worker logs and last 100 lines.
- Queue observability now includes: `oldestRunningStartedAt`, `staleRunning`, `serviceActive`, `serviceEnabled`, `freeDiskMb`.
- Worker startup now logs a structured start event and uses stable `workerId` (`HYPERFRAMES_WORKER_ID` or `hostname-pid`).

### Detect stuck jobs quickly

```bash
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
sudo journalctl -u zsp-hyperframes-worker -f --no-pager
```

### Safe stale-recovery (explicit opt-in)

```bash
HYPERFRAMES_WATCHDOG_RECOVER_STALE=true \
HYPERFRAMES_WATCHDOG_CONFIRM=YES \
npm run hyperframes:worker:watchdog
```

Recovery remains operator-controlled and non-destructive by default.

### Expected service states

- Render enabled in production: service should be `enabled` and `active`.
- Render disabled: watchdog reports `[SKIP]` for render checks and warns if service is still active/enabled.

### Rollback

```bash
npm run hyperframes:worker:disable-real
```


## Phase 6.3: worker log rotation and journald policy

Goal: control worker/system log growth and reduce log bloat risk without changing render safety behavior.

- Added optional install command for a systemd drop-in: `npm run hyperframes:worker:install-log-policy`.
- Script path: `scripts/hyperframes/install-worker-log-policy.sh`.
- Drop-in target: `/etc/systemd/system/zsp-hyperframes-worker.service.d/log-policy.conf`.
- Policy keys:
  - `LogRateLimitIntervalSec`
  - `LogRateLimitBurst`
- Safe defaults (override via env at runtime):
  - `HYPERFRAMES_LOG_RATE_LIMIT_INTERVAL_SEC=30s`
  - `HYPERFRAMES_LOG_RATE_LIMIT_BURST=2000`

### Safety behavior

- Script is **operator-gated** and does nothing unless `HYPERFRAMES_LOG_POLICY_CONFIRM=YES` is set.
- Script does **not** restart, enable, or start the worker service automatically.
- Script writes only the drop-in and runs `systemctl daemon-reload`.

### Install example

```bash
HYPERFRAMES_LOG_POLICY_CONFIRM=YES \
HYPERFRAMES_LOG_RATE_LIMIT_INTERVAL_SEC=30s \
HYPERFRAMES_LOG_RATE_LIMIT_BURST=2000 \
npm run hyperframes:worker:install-log-policy
```

### Journal summary improvements

`npm run hyperframes:worker:journal-summary` now supports:

- `HYPERFRAMES_JOURNAL_SUMMARY_LINES` (default: `200`)
- `HYPERFRAMES_JOURNAL_SUMMARY_SINCE` (default: `24h`)
- marker counts for completed/failed/start/render-command events
- a concise “notable lines” section before full output

### Secret hygiene reminder

Operational logs must not include API keys, tokens, secrets, or local filesystem-sensitive data in user-facing responses.

## Phase 6.3: log rotation and journal policy

Goal: prevent worker log bloat while keeping operator visibility.

- Added optional install script: `npm run hyperframes:worker:install-log-policy`.
- Script writes a systemd drop-in at `/etc/systemd/system/zsp-hyperframes-worker.service.d/log-policy.conf` with:
  - `LogRateLimitIntervalSec`
  - `LogRateLimitBurst`
- Default mode is **dry-run** and prints the planned config; nothing is applied unless `HYPERFRAMES_LOG_POLICY_CONFIRM=YES`.
- Drop-in values are configurable:
  - `HYPERFRAMES_LOG_RATE_LIMIT_INTERVAL_SEC` (default `30s`)
  - `HYPERFRAMES_LOG_RATE_LIMIT_BURST` (default `500`)
- Journal summary command now supports:
  - `HYPERFRAMES_JOURNAL_SUMMARY_LINES` (default `200`)
  - `HYPERFRAMES_JOURNAL_SUMMARY_SINCE` (default `24 hours ago`)
  - log sanitization for common secret/token patterns.

### Recommended journald limits (operator baseline)

Use host-level journald retention limits in `/etc/systemd/journald.conf` to cap total journal growth (example baseline):

```ini
[Journal]
SystemMaxUse=1G
SystemKeepFree=1G
RuntimeMaxUse=256M
MaxRetentionSec=14day
```

These are host policy examples only; choose values based on disk budget and retention requirements.

### Safe apply flow

```bash
npm run hyperframes:worker:install-log-policy
HYPERFRAMES_LOG_POLICY_CONFIRM=YES npm run hyperframes:worker:install-log-policy
sudo systemctl restart zsp-hyperframes-worker
npm run hyperframes:worker:journal-summary
```

## Phase 2.11: secure artifact serving and downloads

- Download API endpoint: `GET /api/hyperframes/render/:id/download` (also supports `HEAD`).
- Authentication is mandatory; unauthenticated requests return `401`.
- Access is user-scoped by `id + userId + deletedAt=null`; non-owned jobs return `404`.
- Only `COMPLETED` jobs can be downloaded; non-completed jobs return `409`.
- Output artifacts are never public static files; the output directory is not exposed directly.
- API responses do not expose local filesystem paths to normal users.

### Artifact validation rules

- Resolve and validate artifact paths under `HYPERFRAMES_OUTPUT_DIR`.
- Block traversal and symlink escape attempts using `resolve` + `realpath` checks.
- Require regular files only.
- Enforce allowed extensions only: `.mp4`, `.webm`, `.mov`.
- Enforce output size cap via `HYPERFRAMES_MAX_OUTPUT_MB`.

### Response behavior and headers

- Missing artifact returns `404`.
- Expired/deleted/unavailable artifact returns `410`.
- Successful downloads set:
  - `Content-Type` based on extension.
  - `Content-Disposition: attachment` with sanitized filename.
  - `X-Content-Type-Options: nosniff`.
  - `Cache-Control: private, no-store`.

### Render status API behavior

- Render status endpoint includes `canDownload` and `downloadUrl` for completed jobs.
- Normal user APIs do not include `outputPath`; operator tooling remains the path-aware surface.

### Troubleshooting

- `404` for completed job usually means cleanup retention removed the artifact file.
- `410` indicates invalid/expired/unavailable artifact metadata or policy violation.
- Verify retention and cleanup settings when historical downloads are no longer available.

## Phase 2.12: user render history dashboard

New user-facing route: `/dashboard/hyperframes/renders`.

- Authenticated users can view only their own render jobs.
- Render history API returns safe fields only (`id`, `status`, timestamps, attempts, dimensions, duration, safe metadata, and safe error message).
- Completed jobs expose a secure `downloadUrl`; internal `outputPath` is never returned to UI.
- Users can cancel only `PENDING` jobs from the dashboard.
- Dashboard polling runs every 12 seconds only while jobs are `PENDING` or `RUNNING`.
- Error text is truncated and local filesystem paths are redacted.

Status interpretation:
- `PENDING`: waiting in queue; user can cancel.
- `RUNNING`: currently rendering; user cannot cancel in this phase.
- `COMPLETED`: render finished; user can download artifact.
- `FAILED`: render failed; safe error shown (no stack trace/path leak).
- `CANCELLED`: cancelled before run.

Failed job guidance:
- Check prompt/script input and platform/aspect ratio metadata.
- Retry is guarded by max-attempt policy (Phase 2.13 optional endpoint).
- Contact operator if repeated failures persist.

Retention/cleanup:
- Artifact lifecycle still follows `HYPERFRAMES_RETENTION_DAYS` and cleanup policy.
- Once cleaned up, download endpoint returns controlled not-available response.

## Phase 2.20: backup and disaster recovery for render metadata

### Render inventory command

Use `npm run hyperframes:render-inventory` to compare DB job metadata with render artifacts on disk.

The command outputs safe JSON summary only:
- `totalJobs`
- `completedJobs`
- `failedJobs`
- `missingArtifactCount`
- `orphanArtifactCount`
- `totalArtifactBytes`
- `repairEnabled`
- `repairedJobs`

Safety behavior:
- Repair mode is disabled by default (`HYPERFRAMES_INVENTORY_REPAIR=false`).
- No files are deleted by this command.
- Path traversal is blocked; artifacts must be inside `HYPERFRAMES_OUTPUT_DIR`.
- Output does not print secrets.

### Optional repair mode

To repair only missing completed artifacts:

```bash
HYPERFRAMES_INVENTORY_REPAIR=true npm run hyperframes:render-inventory
```

Repair action:
- Completed jobs with missing artifact files are marked `FAILED` with `errorMessage=ARTIFACT_MISSING`.
- No artifact files are removed.

### Backup plan

1. **Database backup**
   - Run scheduled PostgreSQL dumps for metadata durability.
   - Example: `pg_dump "$DATABASE_URL" > backup-$(date +%F).sql`.
2. **Artifact backup**
   - Snapshot/sync `HYPERFRAMES_OUTPUT_DIR` to durable storage (same cadence as DB or faster).
   - Keep retention windows aligned with DB backup retention.
3. **Integrity verification**
   - Run `npm run hyperframes:render-inventory` on a schedule.
   - Alert on non-zero `missingArtifactCount` or high `orphanArtifactCount`.

### Restore sequence

1. Restore database backup first.
2. Restore artifact directory backup to `HYPERFRAMES_OUTPUT_DIR`.
3. Run `npm run hyperframes:render-inventory` and validate zero unexpected missing artifacts.
4. If missing artifacts remain, optionally run repair mode to downgrade stale `COMPLETED` rows to `FAILED` with `ARTIFACT_MISSING`.
5. Re-run queue/health checks before returning to normal operations.
## Cleanup timer (Phase 2.14)

- Retention is controlled by `HYPERFRAMES_RETENTION_DAYS` (default 14).
- Cleanup is dry-run by default because `HYPERFRAMES_CLEANUP_DRY_RUN=true` unless explicitly set to `false`.
- Install cleanup units (install only, no auto-enable by default):

```bash
npm run hyperframes:cleanup:install-timer
```

- Explicitly enable/start timer only when confirmed:

```bash
HYPERFRAMES_CLEANUP_TIMER_CONFIRM=YES npm run hyperframes:cleanup:install-timer
```

- Check status:

```bash
npm run hyperframes:cleanup:status
```

- Disable and remove timer/service:

```bash
npm run hyperframes:cleanup:disable-timer
```

- Emergency rollback:
  1. `npm run hyperframes:cleanup:disable-timer`
  2. Keep `HYPERFRAMES_CLEANUP_DRY_RUN=true`.
  3. Re-run `npm run hyperframes:cleanup:status` and `npm run hyperframes:worker:watchdog`.

Safety guarantees remain:
- Cleanup scope is constrained to `HYPERFRAMES_OUTPUT_DIR`.
- Path escape attempts are blocked.
- Active `RUNNING` job outputs are skipped.
- Symlink escapes are blocked via `realpath` root-prefix checks.

## UI safety note (Phase 3)

- Operator UI pages (`/dashboard/hyperframes/ops`, `/dashboard/hyperframes/ops/queue`) are read-only by default and intentionally avoid start/stop/enable/disable actions.
- Do not control worker daemon state from dashboard UI in production. Use CLI/systemd on the production VM for daemon changes.
- Render history downloads remain secure via API routes (`/api/hyperframes/render/:id/download`) with auth/scope checks; UI must not expose local filesystem paths.
