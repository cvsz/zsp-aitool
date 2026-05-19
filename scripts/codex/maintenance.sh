#!/usr/bin/env bash
set -u

log() { printf '[%s] %s\n' "$1" "$2"; }
ok() { log OK "$1"; }
warn() { log WARN "$1"; }
fail() { log FAIL "$1"; }
skip() { log SKIP "$1"; }

is_systemd_available() {
  command -v systemctl >/dev/null 2>&1 || return 1
  [ -d /run/systemd/system ] || return 1
  [ "$(ps -p 1 -o comm= 2>/dev/null | tr -d '[:space:]')" = "systemd" ] || return 1
  systemctl is-system-running >/dev/null 2>&1 || return 0
  return 0
}

note_systemd_policy() {
  if is_systemd_available; then
    ok "systemd is available, but Codex maintenance does not start/stop/restart/enable/disable services"
  else
    skip "systemd unavailable or not PID 1; skipping all systemctl operations"
  fi
}

main() {
  ok "Running zsp-aitool maintenance setup"

  cd "${CODEX_WORKSPACE_DIR:-$PWD}" || exit 0
  ok "Current directory: $(pwd)"

  export NEXT_TELEMETRY_DISABLED=1
  export CI=true
  export HYPERFRAMES_RENDER_ENABLED=false
  export HYPERFRAMES_WORKDIR="${HYPERFRAMES_WORKDIR:-/tmp/zsp-aitool/hyperframes}"
  export HYPERFRAMES_OUTPUT_DIR="${HYPERFRAMES_OUTPUT_DIR:-/tmp/zsp-aitool/hyperframes/renders}"
  export HYPERFRAMES_CLEANUP_DRY_RUN=true

  mkdir -p "$HYPERFRAMES_WORKDIR" "$HYPERFRAMES_OUTPUT_DIR"
  note_systemd_policy

  if [ -f package.json ]; then
    python3 -m json.tool package.json >/tmp/package-json-ok.json || warn "package.json JSON validation failed during maintenance"
    npm install --legacy-peer-deps || warn "root npm install failed during maintenance"
  else
    skip "package.json not found"
  fi

  if [ -f prisma/schema.prisma ]; then
    npx prisma generate || warn "prisma generate failed during maintenance"
    npx prisma validate || warn "prisma validate failed during maintenance"
  else
    skip "prisma/schema.prisma not found"
  fi

  if [ -f extension/package.json ]; then
    (
      cd extension || exit 1
      npm install --legacy-peer-deps
    ) || warn "extension npm install failed during maintenance"
  else
    skip "extension/package.json not found"
  fi

  # These checks are helpful but should not block Codex from opening the workspace for repair.
  npm run typecheck || warn "typecheck failed during maintenance"
  npm run test || warn "test failed during maintenance"
  npm run build || warn "build failed during maintenance"
  npm run health || warn "health failed during maintenance"

  npm run hyperframes:doctor || warn "hyperframes:doctor failed during maintenance"
  npm run hyperframes:worker:once || warn "hyperframes:worker:once failed during maintenance"
  npm run hyperframes:queue-status || warn "hyperframes:queue-status failed during maintenance"
  npm run hyperframes:worker:watchdog || warn "hyperframes:worker:watchdog failed during maintenance"

  ok "Maintenance setup complete"
  printf 'CODEX_MAINTENANCE_READY=true\n'
}

main "$@"
