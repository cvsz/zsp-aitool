#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-worker.service"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }
skip() { echo "[SKIP] $*"; }

if ! command -v systemctl >/dev/null 2>&1; then
  skip "systemctl not found in this environment"
  exit 0
fi

if systemctl list-unit-files | grep -q "^${SERVICE_NAME}"; then
  ok "Service file detected: ${SERVICE_NAME}"
else
  warn "Service file not installed: ${SERVICE_NAME}"
fi

ok "systemctl status ${SERVICE_NAME}"
sudo systemctl status "${SERVICE_NAME}" --no-pager || warn "Service may be inactive or missing"

ok "systemctl is-enabled ${SERVICE_NAME}"
if sudo systemctl is-enabled "${SERVICE_NAME}" >/dev/null 2>&1; then
  warn "Service is enabled"
else
  ok "Service is not enabled"
fi


ok "systemctl is-active ${SERVICE_NAME}"
if sudo systemctl is-active "${SERVICE_NAME}" >/dev/null 2>&1; then
  ok "Service is active"
else
  warn "Service is not active"
fi
