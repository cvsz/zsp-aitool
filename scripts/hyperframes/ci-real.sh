#!/usr/bin/env bash
set -euo pipefail

if [[ "${HYPERFRAMES_CI_REAL_RENDER_CONFIRM:-}" != "YES" ]]; then
  echo "[SKIP] HYPERFRAMES_CI_REAL_RENDER_CONFIRM must be YES"
  exit 0
fi

export HYPERFRAMES_RENDER_ENABLED="true"
export HYPERFRAMES_RENDER_SMOKE_CONFIRM="YES"

npm run hyperframes:render-smoke

if [[ "${CI:-}" == "true" ]]; then
  mkdir -p .artifacts/hyperframes
  if [[ -d "/tmp/hyperframes/renders/smoke" ]]; then
    cp -R /tmp/hyperframes/renders/smoke/. .artifacts/hyperframes/ || true
  fi
fi
