#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-cleanup.service"
TIMER_NAME="zsp-hyperframes-cleanup.timer"

if ! command -v systemctl >/dev/null 2>&1; then
  echo "[SKIP] systemctl not available"
  exit 0
fi

echo "[OK] systemctl status ${TIMER_NAME}"
sudo systemctl status "${TIMER_NAME}" --no-pager || true

echo "[OK] systemctl status ${SERVICE_NAME}"
sudo systemctl status "${SERVICE_NAME}" --no-pager || true

echo "[OK] systemctl list-timers ${TIMER_NAME}"
sudo systemctl list-timers "${TIMER_NAME}" --no-pager || true
