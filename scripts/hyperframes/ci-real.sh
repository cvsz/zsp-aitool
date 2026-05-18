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
export CI="${CI:-true}"
export HYPERFRAMES_RENDER_ENABLED="true"
export HYPERFRAMES_RENDER_SMOKE_CONFIRM="YES"
export HYPERFRAMES_CLI_BIN="npx"
export HYPERFRAMES_CLI_ARGS="-y hyperframes"

npm run hyperframes:doctor
npm run hyperframes:render-smoke

if [[ "${CI:-}" == "true" || "${GITHUB_ACTIONS:-}" == "true" ]]; then
  mkdir -p artifacts
  tar -czf artifacts/hyperframes-smoke-renders.tgz -C "${HYPERFRAMES_OUTPUT_DIR:-./tmp/hyperframes/renders}" smoke || true
  echo "[OK] prepared artifacts/hyperframes-smoke-renders.tgz"
else
  echo "[INFO] non-CI environment; skipping artifact packaging"
fi
