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
- The script calls `systemctl start` only, sleeps for the trial window, then stops the service.
- The script prints service status/logs, then runs queue status and health checks.
- The script does not call `systemctl enable` and does not modify `.env`.

### Service/env behavior

- If `HYPERFRAMES_RENDER_ENABLED=false`, the script warns that the service can start but the worker will not process jobs.
- Trial mode does not automate permanent env changes.
- For controlled testing only, use either:
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
