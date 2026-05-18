#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-worker"
DROPIN_DIR="/etc/systemd/system/${SERVICE_NAME}.service.d"
DROPIN_FILE="${DROPIN_DIR}/log-policy.conf"
RATE_INTERVAL="${HYPERFRAMES_LOG_RATE_LIMIT_INTERVAL_SEC:-30s}"
RATE_BURST="${HYPERFRAMES_LOG_RATE_LIMIT_BURST:-500}"

warn(){ echo "[WARN] $*"; }
ok(){ echo "[OK] $*"; }
fail(){ echo "[FAIL] $*"; exit 1; }

if [[ "${HYPERFRAMES_LOG_POLICY_CONFIRM:-NO}" != "YES" ]]; then
  warn "Dry-run only. No systemd changes were applied."
  echo "Set HYPERFRAMES_LOG_POLICY_CONFIRM=YES to apply the drop-in."
  echo
  echo "Planned file: ${DROPIN_FILE}"
  cat <<PLAN
[Service]
LogRateLimitIntervalSec=${RATE_INTERVAL}
LogRateLimitBurst=${RATE_BURST}
PLAN
  exit 0
fi

if ! command -v systemctl >/dev/null 2>&1; then
  fail "systemctl is required"
fi

if ! systemctl status "${SERVICE_NAME}" >/dev/null 2>&1; then
  fail "${SERVICE_NAME} service not found"
fi

sudo mkdir -p "${DROPIN_DIR}"
sudo tee "${DROPIN_FILE}" >/dev/null <<CONF
[Service]
LogRateLimitIntervalSec=${RATE_INTERVAL}
LogRateLimitBurst=${RATE_BURST}
CONF

sudo systemctl daemon-reload
ok "Installed log policy drop-in: ${DROPIN_FILE}"
ok "Reloaded systemd manager configuration"
echo "Next step: sudo systemctl restart ${SERVICE_NAME}"
