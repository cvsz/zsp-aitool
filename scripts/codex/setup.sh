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
    warn "$label failed; continuing so Codex can inspect and repair the repository"
  fi
}

is_systemd_available() {
  command -v systemctl >/dev/null 2>&1 || return 1
  [ -d /run/systemd/system ] || return 1
  [ "$(ps -p 1 -o comm= 2>/dev/null | tr -d '[:space:]')" = "systemd" ] || return 1
  systemctl is-system-running >/dev/null 2>&1 || return 0
  return 0
}

safe_systemd_note() {
  if is_systemd_available; then
    ok "systemd is available, but Codex setup does not start/stop/enable/disable services"
  else
    skip "systemd unavailable or not PID 1; skipping all systemctl operations"
  fi
}

main() {
  ok "zsp-aitool Codex setup started"

  cd "${CODEX_WORKSPACE_DIR:-$PWD}" || exit 1
  ok "Current directory: $(pwd)"

  export NEXT_TELEMETRY_DISABLED=1
  export CI=true
  export HYPERFRAMES_RENDER_ENABLED=false
  export HYPERFRAMES_WORKDIR="${HYPERFRAMES_WORKDIR:-/tmp/zsp-aitool/hyperframes}"
  export HYPERFRAMES_OUTPUT_DIR="${HYPERFRAMES_OUTPUT_DIR:-/tmp/zsp-aitool/hyperframes/renders}"
  export HYPERFRAMES_CLEANUP_DRY_RUN=true

  mkdir -p "$HYPERFRAMES_WORKDIR" "$HYPERFRAMES_OUTPUT_DIR"

  safe_systemd_note

  if ! command -v node >/dev/null 2>&1; then
    fail "node is not installed"
    exit 1
  fi
  ok "Node: $(node --version)"

  if ! command -v npm >/dev/null 2>&1; then
    fail "npm is not installed"
    exit 1
  fi
  ok "npm: $(npm --version)"

  if [ -f package.json ]; then
    run_required "Validate package.json" python3 -m json.tool package.json
  else
    fail "package.json not found"
    exit 1
  fi

  if [ -f .env.example ] && [ ! -f .env ]; then
    cp .env.example .env
    ok "Created .env from .env.example"
  else
    skip ".env already exists or .env.example missing"
  fi

  if [ -f package-lock.json ]; then
    run_required "Install root dependencies with npm ci" npm ci
  else
    run_required "Install root dependencies with npm install --legacy-peer-deps" npm install --legacy-peer-deps
  fi

  if [ -f prisma/schema.prisma ]; then
    run_optional "Generate Prisma client" npm run prisma:generate
    run_optional "Validate Prisma schema" npx prisma validate
  else
    skip "prisma/schema.prisma not found"
  fi

  if [ -f extension/package.json ]; then
    ok "Install extension dependencies"
    (
      cd extension || exit 1
      if [ -f package-lock.json ]; then
        npm ci
      else
        npm install --legacy-peer-deps
      fi
    ) || warn "extension dependency install failed; continuing"
  else
    skip "extension/package.json not found"
  fi

  ok "Codex setup complete"
  printf 'CODEX_SETUP_READY=true\n'
}

main "$@"
