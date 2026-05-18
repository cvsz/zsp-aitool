#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-worker"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
ENV_FILE=".env"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }
skip() { echo "[SKIP] $*"; }

if [[ -f "$ENV_FILE" ]] && grep -Eq '^HYPERFRAMES_RENDER_ENABLED=true([[:space:]]*)$' "$ENV_FILE"; then
  warn "$ENV_FILE has HYPERFRAMES_RENDER_ENABLED=true"
  if [[ "${HYPERFRAMES_DISABLE_CONFIRM:-}" != "YES" ]]; then
    fail "Refusing disable workflow. Re-run with HYPERFRAMES_DISABLE_CONFIRM=YES to acknowledge."
  fi
fi

ok "Stopping ${SERVICE_NAME} (if running)"
sudo systemctl stop "${SERVICE_NAME}" || warn "Stop returned non-zero (possibly not running)"

ok "Disabling ${SERVICE_NAME} (if enabled)"
sudo systemctl disable "${SERVICE_NAME}" || warn "Disable returned non-zero (possibly not enabled)"

ok "Removing unit file ${SERVICE_FILE}"
sudo rm -f "${SERVICE_FILE}"

ok "Reloading systemd"
sudo systemctl daemon-reload

ok "Disable/remove workflow completed"
