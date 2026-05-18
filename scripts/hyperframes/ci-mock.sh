#!/usr/bin/env bash
set -euo pipefail

export CI="${CI:-true}"
export HYPERFRAMES_RENDER_ENABLED="${HYPERFRAMES_RENDER_ENABLED:-false}"

npm run hyperframes:doctor
npm run hyperframes:queue-status
npm run hyperframes:worker:once
