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
    ok "systemd is available, but Codex setup does not start/stop/restart/enable/disable services"
  else
    skip "systemd unavailable or not PID 1; skipping all systemctl operations"
  fi
}

main() {
  ok "Setting up zsp-aitool Codex environment"

  cd "${CODEX_WORKSPACE_DIR:-$PWD}" || exit 1
  ok "Current directory: $(pwd)"

  export NEXT_TELEMETRY_DISABLED=1
  export CI=true
  export HYPERFRAMES_RENDER_ENABLED=false
  export HYPERFRAMES_WORKDIR="${HYPERFRAMES_WORKDIR:-/tmp/zsp-aitool/hyperframes}"
  export HYPERFRAMES_OUTPUT_DIR="${HYPERFRAMES_OUTPUT_DIR:-/tmp/zsp-aitool/hyperframes/renders}"
  export HYPERFRAMES_CLEANUP_DRY_RUN=true

  mkdir -p "$HYPERFRAMES_WORKDIR" "$HYPERFRAMES_OUTPUT_DIR"
  note_systemd_policy

  if command -v node >/dev/null 2>&1; then
    ok "Node: $(node --version)"
  else
    fail "node is not installed"
    exit 1
  fi

  if command -v npm >/dev/null 2>&1; then
    ok "npm: $(npm --version)"
  else
    fail "npm is not installed"
    exit 1
  fi

  if [ -f package.json ]; then
    python3 -m json.tool package.json >/tmp/package-json-ok.json || {
      fail "package.json is invalid JSON"
      exit 1
    }
    ok "package.json is valid JSON"
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

  # Prefer npm install over npm ci during Codex setup because the repo may be under active repair.
  ok "Installing root dependencies"
  npm install --legacy-peer-deps
  root_install_status=$?
  if [ "$root_install_status" -ne 0 ]; then
    fail "Root npm install failed"
    exit "$root_install_status"
  fi

  # Prisma generate should not kill setup if DB is not running.
  if [ -f prisma/schema.prisma ]; then
    ok "Generating Prisma client"
    npx prisma generate || warn "prisma generate failed; continuing so Codex can repair the repo"
    ok "Validating Prisma schema"
    npx prisma validate || warn "prisma validate failed; continuing so Codex can repair the repo"
  else
    skip "prisma/schema.prisma not found"
  fi

  # Extension install is non-blocking because the main app is the priority.
  if [ -f extension/package.json ]; then
    ok "Installing extension dependencies"
    (
      cd extension || exit 1
      npm install --legacy-peer-deps
    ) || warn "extension dependency install failed; continuing so Codex can repair extension package versions"
  else
    skip "extension/package.json not found"
  fi

  ok "Setup complete"
  printf 'CODEX_SETUP_READY=true\n'
}

main "$@"
