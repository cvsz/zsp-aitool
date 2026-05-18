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
