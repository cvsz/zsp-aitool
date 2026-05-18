#!/usr/bin/env bash
set -euo pipefail

export HYPERFRAMES_RENDER_ENABLED="${HYPERFRAMES_RENDER_ENABLED:-false}"
unset HYPERFRAMES_RENDER_SMOKE_CONFIRM || true

npx vitest run \
  tests/hyperframes-render-smoke.test.ts \
  tests/hyperframes-enqueue-smoke-job.test.ts \
  tests/hyperframes-worker.test.ts \
  tests/hyperframes-watchdog.test.ts
export CI="${CI:-true}"
export HYPERFRAMES_RENDER_ENABLED="${HYPERFRAMES_RENDER_ENABLED:-false}"

npm run hyperframes:doctor
npm run hyperframes:queue-status
npm run hyperframes:worker:once
