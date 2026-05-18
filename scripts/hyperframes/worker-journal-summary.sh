#!/usr/bin/env bash
set -euo pipefail

if ! command -v journalctl >/dev/null 2>&1; then
  echo "[WARN] journalctl unavailable"
  exit 0
fi

unit="zsp-hyperframes-worker"
lines="${HYPERFRAMES_JOURNAL_SUMMARY_LINES:-200}"
since="${HYPERFRAMES_JOURNAL_SUMMARY_SINCE:-24 hours ago}"

sanitize_logs() {
  sed -E \
    -e 's/(Authorization: Bearer )[A-Za-z0-9._-]+/\1[REDACTED]/g' \
    -e 's/((api|auth|access|refresh|session|secret|token|password|passwd|key)["=: ]+)([^ ,"\x27]+)/\1[REDACTED]/gi'
}

logs="$(journalctl -u "$unit" --since "$since" -n "$lines" --no-pager 2>/dev/null || true)"

if [[ -z "$logs" ]]; then
  echo "[WARN] No logs found for ${unit}"
  exit 0
fi

safe_logs="$(printf '%s\n' "$logs" | sanitize_logs)"

completed="$(echo "$safe_logs" | grep -c "COMPLETED" || true)"
failed="$(echo "$safe_logs" | grep -c "FAILED" || true)"
worker_starts="$(echo "$safe_logs" | grep -c "worker.start" || true)"
render_cmd="$(echo "$safe_logs" | grep -E -c "running render command|hyperframes" || true)"
errors="$(echo "$safe_logs" | grep -E -c "\[FAIL\]|ERROR|Error:" || true)"

printf '[OK] Unit: %s\n' "$unit"
printf '[OK] Window: since="%s" lines=%s\n' "$since" "$lines"
printf '[OK] COMPLETED markers: %s\n' "$completed"
printf '[OK] FAILED markers: %s\n' "$failed"
printf '[OK] worker.start markers: %s\n' "$worker_starts"
printf '[OK] render-command markers: %s\n' "$render_cmd"
printf '[OK] error markers: %s\n' "$errors"

echo "[OK] Recent render-command lines"
echo "$safe_logs" | grep -E "running render command|hyperframes" | tail -n 20 || true

echo "[OK] Last ${lines} logs (sanitized)"
echo "$safe_logs"
