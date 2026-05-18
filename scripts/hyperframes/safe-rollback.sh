#!/usr/bin/env bash
set -euo pipefail

CONFIRM="${HYPERFRAMES_SAFE_ROLLBACK_CONFIRM:-NO}"
SERVICE_NAME="zsp-hyperframes-worker"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

note(){ printf '[INFO] %s\n' "$1"; }
warn(){ printf '[WARN] %s\n' "$1"; }
fail(){ printf '[FAIL] %s\n' "$1"; exit 1; }
ok(){ printf '[OK] %s\n' "$1"; }

note "HyperFrames safe rollback helper"
note "Default mode is read-only preview"

rollback_plan() {
  cat <<'PLAN'
Rollback plan:
1) Validate current health and queue state.
2) Stop worker service.
3) Disable worker service.
4) Re-run health/watchdog checks.
5) Confirm queue has no RUNNING backlog.
PLAN
}

rollback_plan

if [[ "${CONFIRM}" != "YES" ]]; then
  fail "Confirmation required. Re-run with HYPERFRAMES_SAFE_ROLLBACK_CONFIRM=YES to apply rollback actions."
fi

note "Current checks:"
npm run --silent health || warn "health check failed"
npm run --silent hyperframes:queue-status || warn "queue status failed"
npm run --silent hyperframes:worker:watchdog || warn "watchdog check failed"

note "Applying safe rollback actions"
systemctl stop "${SERVICE_NAME}" || warn "service stop returned non-zero"
systemctl disable "${SERVICE_NAME}" || warn "service disable returned non-zero"

note "Post-rollback verification"
npm run --silent health || warn "health check failed after rollback"
npm run --silent hyperframes:queue-status || warn "queue status failed after rollback"
npm run --silent hyperframes:worker:watchdog || warn "watchdog failed after rollback"

ok "Safe rollback flow completed"
