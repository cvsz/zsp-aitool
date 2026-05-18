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
