# HyperFrames Render Worker

Rendering is disabled by default for safety and optional dependency isolation.

- Feature flag: `HYPERFRAMES_RENDER_ENABLED=true` to enable.
- Official CLI package/binary: `hyperframes`.
- Manual verification commands:
  - `npx hyperframes init my-video`
  - `npx hyperframes preview`
  - `npx hyperframes render`
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
   - `HYPERFRAMES_CLI_ARGS=hyperframes`

The worker and doctor execute the configured CLI as `HYPERFRAMES_CLI_BIN` + `HYPERFRAMES_CLI_ARGS` and then append command arguments.

## Doctor behavior

- When `HYPERFRAMES_RENDER_ENABLED=false`, doctor reports disabled as `[SKIP]` and does not fail the check.
- Doctor still checks node, ffmpeg, and CLI callability to help preflight environments.
- By default doctor does **not** create directories while render is disabled.
- Set `HYPERFRAMES_DOCTOR_CREATE_DIRS=true` to allow directory creation/checks in disabled mode.

## Worker behavior and safety

- Worker exits cleanly when rendering is disabled.
- Worker only executes CLI commands when rendering is enabled.
- Per-job workdir is isolated under `HYPERFRAMES_WORKDIR/<job-id>`.
- Final outputs are constrained to `HYPERFRAMES_OUTPUT_DIR` using path-safety checks.
- Worker writes submitted composition to a local file and passes it as CLI input; no arbitrary script execution path is introduced by worker internals.
- API flow: create job -> worker claims `PENDING` job -> `RUNNING` -> `COMPLETED`/`FAILED`.

Systemd example is in `deploy/systemd/zsp-hyperframes-worker.service` and is optional.
