#!/usr/bin/env bash
set -euo pipefail

if ! command -v journalctl >/dev/null 2>&1; then
  echo "[WARN] journalctl unavailable"
  exit 0
fi

unit="zsp-hyperframes-worker"
lines="${HYPERFRAMES_JOURNAL_SUMMARY_LINES:-200}"
since="${HYPERFRAMES_JOURNAL_SUMMARY_SINCE:-24h}"
logs="$(journalctl -u "$unit" --since "-$since" -n "$lines" --no-pager 2>/dev/null || true)"

if [[ -z "$logs" ]]; then
  echo "[WARN] No journal output for unit=$unit (since=$since, lines=$lines)"
  exit 0
fi

echo "[OK] Worker journal summary (unit=$unit since=$since lines=$lines)"
completed="$(echo "$logs" | grep -c '"status":"COMPLETED"\|COMPLETED' || true)"
failed="$(echo "$logs" | grep -c '"status":"FAILED"\|FAILED' || true)"
start_events="$(echo "$logs" | grep -c 'worker.start' || true)"
render_cmd="$(echo "$logs" | grep -c 'running render command' || true)"

printf '[OK] completedMarkers=%s failedMarkers=%s workerStarts=%s renderCommandLogs=%s\n' "$completed" "$failed" "$start_events" "$render_cmd"

echo "[OK] Recent notable lines"
echo "$logs" | grep -E 'worker.start|running render command|COMPLETED|FAILED|render disabled|watchdog' | tail -n 40 || true

echo "[OK] Last ${lines} lines (sensitive-safe reminder: no secrets should be logged)"
echo "$logs"
