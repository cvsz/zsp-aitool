#!/usr/bin/env bash
# Install zsp-aitool backend monitor as a systemd service + timer.

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/home/zeazdev/zsp-aitool}"
RUN_USER="${RUN_USER:-zeazdev}"
INTERVAL="${INTERVAL:-2min}"
LOG_DIR="${BACKEND_MONITOR_LOG_DIR:-/var/log/zsp-aitool}"
SERVICE_NAME="zsp-backend-monitor"

if [[ $EUID -ne 0 ]]; then
  echo "[FAIL] Run with sudo/root: sudo bash scripts/monitor/install-backend-monitor-timer.sh" >&2
  exit 1
fi

[[ -d "$APP_DIR" ]] || { echo "[FAIL] APP_DIR not found: $APP_DIR" >&2; exit 1; }
install -d -o "$RUN_USER" -g "$RUN_USER" "$LOG_DIR"
chmod 0750 "$LOG_DIR"
chmod +x "$APP_DIR/scripts/monitor/backend-monitor.sh"

cat >"/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=zsp-aitool backend monitor
Wants=network-online.target
After=network-online.target postgresql.service zsp-aitool.service

[Service]
Type=oneshot
User=${RUN_USER}
WorkingDirectory=${APP_DIR}
Environment=BACKEND_MONITOR_LOG_DIR=${LOG_DIR}
ExecStart=${APP_DIR}/scripts/monitor/backend-monitor.sh
Nice=5
IOSchedulingClass=best-effort
EOF

cat >"/etc/systemd/system/${SERVICE_NAME}.timer" <<EOF
[Unit]
Description=Run zsp-aitool backend monitor every ${INTERVAL}

[Timer]
OnBootSec=1min
OnUnitActiveSec=${INTERVAL}
AccuracySec=30s
Persistent=true
Unit=${SERVICE_NAME}.service

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now "${SERVICE_NAME}.timer"
systemctl start "${SERVICE_NAME}.service" || true
systemctl status "${SERVICE_NAME}.timer" --no-pager -l
systemctl status "${SERVICE_NAME}.service" --no-pager -l || true

echo "[OK] BACKEND_MONITOR_TIMER_INSTALLED=true"
echo "[INFO] Logs: ${LOG_DIR}/backend-monitor.jsonl"
echo "[INFO] Journal: journalctl -u ${SERVICE_NAME}.service -f"
