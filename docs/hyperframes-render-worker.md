# HyperFrames Render Worker

Rendering is disabled by default for safety and optional dependency isolation.

- Feature flag: `HYPERFRAMES_RENDER_ENABLED=true` to enable.
- Dependencies: Node runtime, ffmpeg, HyperFrames CLI.
- Run checks: `npm run hyperframes:doctor`.
- Worker: `npm run hyperframes:worker` (continuous) or `npm run hyperframes:worker:once`.
- Uses isolated per-job working directories and writes final outputs under `HYPERFRAMES_OUTPUT_DIR`.
- API flow: create job -> worker claims PENDING job -> RUNNING -> COMPLETED/FAILED.
- Security model: authenticated routes only, user-scoped access, sanitized composition, no arbitrary script execution.

Systemd example is in `deploy/systemd/zsp-hyperframes-worker.service` and is optional.
