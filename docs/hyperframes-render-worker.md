# HyperFrames Render Worker

Rendering is disabled by default for safety and optional dependency isolation.

- Feature flag: `HYPERFRAMES_RENDER_ENABLED=true` to enable.
- Official CLI package/binary: `hyperframes`.
- Runtime requirements: Node.js >= 22 and FFmpeg.
- Dependencies checked by doctor: Node runtime, ffmpeg, HyperFrames CLI via configured bin/args.
- Worker commands: `npm run hyperframes:worker` (continuous) or `npm run hyperframes:worker:once`.

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

### Stage 4 (optional systemd worker)

Only after multiple successful smoke runs, install optional systemd worker. Keep the service disabled until explicitly enabled.

## Doctor behavior

- When `HYPERFRAMES_RENDER_ENABLED=false`, doctor reports disabled as `[SKIP]` and does not fail the check.
- Doctor still checks node, ffmpeg, and CLI callability to help preflight environments.
- By default doctor does **not** create directories while render is disabled.
- Set `HYPERFRAMES_DOCTOR_CREATE_DIRS=true` to allow directory creation/checks in disabled mode.

## Worker behavior and safety

- Worker exits cleanly when rendering is disabled.
- Worker only executes CLI commands when rendering is enabled.
- In `--once` mode, worker processes at most one `PENDING` job.
- Per-job workdir is isolated under `HYPERFRAMES_WORKDIR/<job-id>`.
- Final outputs are constrained to `HYPERFRAMES_OUTPUT_DIR` using path-safety checks.
- Failed renders are marked `FAILED` with controlled error messages.
- Completed renders are marked `COMPLETED` with `outputPath` metadata.
- API flow: create job -> worker claims `PENDING` job -> `RUNNING` -> `COMPLETED`/`FAILED`.

Systemd example is in `deploy/systemd/zsp-hyperframes-worker.service` and is optional.
