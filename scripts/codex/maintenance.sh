#!/usr/bin/env bash
set -u

log() { printf '[%s] %s\n' "$1" "$2"; }
ok() { log OK "$1"; }
warn() { log WARN "$1"; }
fail() { log FAIL "$1"; }
skip() { log SKIP "$1"; }

run_required() {
  local label="$1"
  shift
  ok "$label"
  "$@"
}

run_optional() {
  local label="$1"
  shift
  ok "$label"
  if ! "$@"; then
    warn "$label failed; treating as environment warning when dependency is unavailable"
  fi
}

is_systemd_available() {
  command -v systemctl >/dev/null 2>&1 || return 1
  [ -d /run/systemd/system ] || return 1
  [ "$(ps -p 1 -o comm= 2>/dev/null | tr -d '[:space:]')" = "systemd" ] || return 1
  systemctl is-system-running >/dev/null 2>&1 || return 0
  return 0
}

main() {
  ok "zsp-aitool Codex maintenance started"

  cd "${CODEX_WORKSPACE_DIR:-$PWD}" || exit 1
  ok "Current directory: $(pwd)"

  export NEXT_TELEMETRY_DISABLED=1
  export CI=true
  export HYPERFRAMES_RENDER_ENABLED=false
  export HYPERFRAMES_WORKDIR="${HYPERFRAMES_WORKDIR:-/tmp/zsp-aitool/hyperframes}"
  export HYPERFRAMES_OUTPUT_DIR="${HYPERFRAMES_OUTPUT_DIR:-/tmp/zsp-aitool/hyperframes/renders}"
  export HYPERFRAMES_CLEANUP_DRY_RUN=true

  mkdir -p "$HYPERFRAMES_WORKDIR" "$HYPERFRAMES_OUTPUT_DIR"

  if is_systemd_available; then
    ok "systemd is available, but Codex maintenance does not start/stop/enable/disable services"
  else
    skip "systemd unavailable or not PID 1; skipping all systemctl operations"
  fi

  run_required "Validate package.json" python3 -m json.tool package.json

  if [ -f package-lock.json ]; then
    run_required "Install dependencies with npm ci" npm ci
  else
    run_required "Install dependencies with npm install --legacy-peer-deps" npm install --legacy-peer-deps
  fi

  run_optional "Generate Prisma client" npm run prisma:generate
  run_optional "Validate Prisma schema" npx prisma validate
  run_required "Typecheck" npm run typecheck
  run_required "Test" npm run test
  run_required "Build" npm run build
  run_optional "Health check" npm run health

  run_optional "HyperFrames doctor" npm run hyperframes:doctor
  run_optional "HyperFrames disabled worker once" npm run hyperframes:worker:once
  run_optional "HyperFrames queue status" npm run hyperframes:queue-status
  run_optional "HyperFrames watchdog" npm run hyperframes:worker:watchdog

  ok "Codex maintenance complete"
  printf 'CODEX_MAINTENANCE_READY=true\n'
}

main "$@"
