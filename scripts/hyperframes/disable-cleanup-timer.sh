#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-cleanup.service"
TIMER_NAME="zsp-hyperframes-cleanup.timer"
TARGET_SERVICE="/etc/systemd/system/${SERVICE_NAME}"
TARGET_TIMER="/etc/systemd/system/${TIMER_NAME}"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }

ok "Stopping timer/service if running"
sudo systemctl stop "${TIMER_NAME}" || warn "Timer stop returned non-zero"
sudo systemctl stop "${SERVICE_NAME}" || warn "Service stop returned non-zero"

ok "Disabling timer if enabled"
sudo systemctl disable "${TIMER_NAME}" || warn "Timer disable returned non-zero"

ok "Removing cleanup unit files"
sudo rm -f "$TARGET_TIMER" "$TARGET_SERVICE"

ok "Reloading systemd units"
sudo systemctl daemon-reload

ok "Cleanup timer/service disabled"
