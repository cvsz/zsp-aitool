#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-cleanup.service"
TIMER_NAME="zsp-hyperframes-cleanup.timer"
SOURCE_SERVICE="deploy/systemd/${SERVICE_NAME}"
SOURCE_TIMER="deploy/systemd/${TIMER_NAME}"
TARGET_SERVICE="/etc/systemd/system/${SERVICE_NAME}"
TARGET_TIMER="/etc/systemd/system/${TIMER_NAME}"

ok() { echo "[OK] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }
skip() { echo "[SKIP] $*"; }

[[ -f "$SOURCE_SERVICE" ]] || fail "Service template not found: $SOURCE_SERVICE"
[[ -f "$SOURCE_TIMER" ]] || fail "Timer template not found: $SOURCE_TIMER"

ok "Installing cleanup service and timer units"
sudo install -m 0644 "$SOURCE_SERVICE" "$TARGET_SERVICE"
sudo install -m 0644 "$SOURCE_TIMER" "$TARGET_TIMER"

if command -v systemd-analyze >/dev/null 2>&1; then
  ok "Validating units with systemd-analyze verify"
  sudo systemd-analyze verify "$TARGET_SERVICE" "$TARGET_TIMER"
else
  skip "systemd-analyze not found; skipped unit verification"
fi

ok "Reloading systemd units"
sudo systemctl daemon-reload

if [[ "${HYPERFRAMES_CLEANUP_TIMER_CONFIRM:-}" == "YES" ]]; then
  ok "Explicit confirmation received via HYPERFRAMES_CLEANUP_TIMER_CONFIRM=YES"
  ok "Enabling and starting timer ${TIMER_NAME}"
  sudo systemctl enable --now "${TIMER_NAME}"
else
  skip "Install only. Timer not enabled/started (set HYPERFRAMES_CLEANUP_TIMER_CONFIRM=YES to enable)."
fi

ok "Done"
