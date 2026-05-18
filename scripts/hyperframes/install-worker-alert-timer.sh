#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-alerts.service"
TIMER_NAME="zsp-hyperframes-alerts.timer"
SERVICE_SRC="deploy/systemd/${SERVICE_NAME}"
TIMER_SRC="deploy/systemd/${TIMER_NAME}"
SERVICE_DST="/etc/systemd/system/${SERVICE_NAME}"
TIMER_DST="/etc/systemd/system/${TIMER_NAME}"

ok() { echo "[OK] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }
skip() { echo "[SKIP] $*"; }

[[ -f "$SERVICE_SRC" ]] || fail "Missing service template: $SERVICE_SRC"
[[ -f "$TIMER_SRC" ]] || fail "Missing timer template: $TIMER_SRC"

ok "Installing alert service and timer"
sudo install -m 0644 "$SERVICE_SRC" "$SERVICE_DST"
sudo install -m 0644 "$TIMER_SRC" "$TIMER_DST"

if command -v systemd-analyze >/dev/null 2>&1; then
  ok "Validating unit files"
  sudo systemd-analyze verify "$SERVICE_DST" "$TIMER_DST"
else
  skip "systemd-analyze not found; skipped validation"
fi

ok "Reloading systemd"
sudo systemctl daemon-reload
skip "Install only: timer/service were NOT enabled or started automatically"
ok "Done"
