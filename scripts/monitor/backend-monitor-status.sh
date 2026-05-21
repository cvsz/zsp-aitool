#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="${SERVICE_NAME:-zsp-backend-monitor}"
LOG_FILE="${BACKEND_MONITOR_LOG_FILE:-/var/log/zsp-aitool/backend-monitor.jsonl}"

if command -v systemctl >/dev/null 2>&1 && [[ -d /run/systemd/system ]]; then
  echo "# Timer"
  systemctl status "${SERVICE_NAME}.timer" --no-pager -l || true
  echo
  echo "# Last service run"
  systemctl status "${SERVICE_NAME}.service" --no-pager -l || true
  echo
  echo "# Recent journal"
  journalctl -u "${SERVICE_NAME}.service" -n 80 --no-pager -l || true
fi

echo
if [[ -f "$LOG_FILE" ]]; then
  echo "# Last JSON monitor records: ${LOG_FILE}"
  tail -n 10 "$LOG_FILE"
else
  echo "[WARN] Log file not found: ${LOG_FILE}"
fi
