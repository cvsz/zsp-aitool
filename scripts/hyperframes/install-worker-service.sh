#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-worker.service"
SOURCE_FILE="deploy/systemd/${SERVICE_NAME}"
TARGET_FILE="/etc/systemd/system/${SERVICE_NAME}"
ENV_FILE=".env"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }
skip() { echo "[SKIP] $*"; }

if [[ ! -f "$SOURCE_FILE" ]]; then
  fail "Service template not found: $SOURCE_FILE"
fi

if [[ -f "$ENV_FILE" ]] && grep -Eq '^HYPERFRAMES_RENDER_ENABLED=true([[:space:]]*)$' "$ENV_FILE"; then
  warn "$ENV_FILE has HYPERFRAMES_RENDER_ENABLED=true"
  if [[ "${HYPERFRAMES_INSTALL_CONFIRM:-}" != "YES" ]]; then
    fail "Refusing install. Re-run with HYPERFRAMES_INSTALL_CONFIRM=YES to acknowledge."
  fi
  ok "Explicit confirmation received via HYPERFRAMES_INSTALL_CONFIRM=YES"
else
  skip "Render remains disabled by default in .env (or .env missing)"
fi

ok "Installing service file to $TARGET_FILE"
sudo install -m 0644 "$SOURCE_FILE" "$TARGET_FILE"

if command -v systemd-analyze >/dev/null 2>&1; then
  ok "Validating service with systemd-analyze verify"
  sudo systemd-analyze verify "$TARGET_FILE"
else
  skip "systemd-analyze not found; skipped unit verification"
fi

ok "Reloading systemd units"
sudo systemctl daemon-reload

skip "Service install only. Not enabling or starting ${SERVICE_NAME} automatically"
ok "Done"
