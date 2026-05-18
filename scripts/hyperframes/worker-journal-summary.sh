#!/usr/bin/env bash
set -euo pipefail
if ! command -v journalctl >/dev/null 2>&1; then
  echo "[WARN] journalctl unavailable"
  exit 0
fi
unit="zsp-hyperframes-worker"
logs="$(journalctl -u "$unit" -n 100 --no-pager 2>/dev/null || true)"
echo "[OK] Recent render commands"
echo "$logs" | grep -E "running render command|hyperframes" | tail -n 20 || true
completed="$(echo "$logs" | grep -c "COMPLETED" || true)"
failed="$(echo "$logs" | grep -c "FAILED" || true)"
echo "[OK] COMPLETED markers: $completed"
echo "[OK] FAILED markers: $failed"
echo "[OK] Last 100 logs"
echo "$logs"
