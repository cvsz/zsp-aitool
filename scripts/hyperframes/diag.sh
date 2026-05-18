#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-worker"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

line() { printf '[%s] %s\n' "$1" "$2"; }
run() {
  local label="$1"; shift
  line "RUN" "${label}"
  if "$@"; then
    line "OK" "${label}"
  else
    line "WARN" "${label} failed"
  fi
}

line "INFO" "HyperFrames diagnostics (read-only)"
run "App health" npm run --silent health
run "Render queue status" npm run --silent hyperframes:queue-status
run "Worker watchdog" npm run --silent hyperframes:worker:watchdog
run "Render doctor" npm run --silent hyperframes:doctor

run "systemd active state" systemctl is-active "${SERVICE_NAME}"
run "systemd enabled state" systemctl is-enabled "${SERVICE_NAME}"

line "INFO" "Disk usage around render output"
if df -h /var/lib/zsp-aitool/hyperframes/renders; then
  line "OK" "Disk check completed"
else
  line "WARN" "Disk check skipped"
fi

line "INFO" "Recent worker journal summary"
npm run --silent hyperframes:worker:journal-summary || line "WARN" "journal summary unavailable"

line "OK" "Diagnostics complete (no changes applied)"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
info() { echo "[INFO] $*"; }

info "HyperFrames diagnostic bundle (read-only)"

ok "Queue status"
npm run hyperframes:queue-status

ok "Watchdog status"
npm run hyperframes:worker:watchdog

ok "App health"
npm run health

ok "Disk usage"
df -h

if command -v systemctl >/dev/null 2>&1; then
  ok "systemd state: ${SERVICE_NAME}"
  systemctl is-enabled "${SERVICE_NAME}" || true
  systemctl is-active "${SERVICE_NAME}" || true
  systemctl status "${SERVICE_NAME}" --no-pager || true
else
  warn "systemctl not found in this environment"
fi

if command -v journalctl >/dev/null 2>&1; then
  ok "Recent worker logs"
  journalctl -u "${SERVICE_NAME}" -n 50 --no-pager || true
fi

info "Diagnostics complete (no state-changing actions executed)."
