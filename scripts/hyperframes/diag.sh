#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-worker"

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
