#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-worker.service"
DROPIN_DIR="/etc/systemd/system/${SERVICE_NAME}.d"
DROPIN_FILE="${DROPIN_DIR}/log-policy.conf"
INTERVAL="${HYPERFRAMES_LOG_RATE_LIMIT_INTERVAL_SEC:-30s}"
BURST="${HYPERFRAMES_LOG_RATE_LIMIT_BURST:-2000}"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }
skip() { echo "[SKIP] $*"; }

if [[ "${HYPERFRAMES_LOG_POLICY_CONFIRM:-}" != "YES" ]]; then
  fail "Refusing to write systemd drop-in without confirmation. Re-run with HYPERFRAMES_LOG_POLICY_CONFIRM=YES."
fi

if [[ ! "$BURST" =~ ^[0-9]+$ ]]; then
  fail "HYPERFRAMES_LOG_RATE_LIMIT_BURST must be an integer (got: $BURST)"
fi

ok "Installing worker log policy drop-in"
sudo install -d -m 0755 "$DROPIN_DIR"

TMP_FILE="$(mktemp)"
cat > "$TMP_FILE" <<POLICY
[Service]
# Optional journald rate-limit policy for noisy worker logs.
# Controls only logging throttling; does not change worker runtime behavior.
LogRateLimitIntervalSec=${INTERVAL}
LogRateLimitBurst=${BURST}
POLICY

sudo install -m 0644 "$TMP_FILE" "$DROPIN_FILE"
rm -f "$TMP_FILE"

if command -v systemd-analyze >/dev/null 2>&1; then
  ok "Validating unit and drop-in with systemd-analyze verify"
  sudo systemd-analyze verify "/etc/systemd/system/${SERVICE_NAME}"
else
  skip "systemd-analyze unavailable; skipped verify"
fi

ok "Reloading systemd manager configuration"
sudo systemctl daemon-reload
skip "Drop-in installed only. Service restart is operator-controlled and NOT automatic."

ok "Preview drop-in"
sudo sed -n '1,80p' "$DROPIN_FILE"
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
