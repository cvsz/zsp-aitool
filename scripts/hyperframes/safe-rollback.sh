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
SERVICE_NAME="zsp-hyperframes-worker"
APP_DIR="${APP_DIR:-$HOME/zsp-aitool}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env}"
CONFIRM="${HYPERFRAMES_CONFIRM:-}"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }

if [[ "$CONFIRM" != "YES" ]]; then
  warn "Dry-run mode only. No destructive actions executed."
  echo "To execute rollback, rerun with:"
  echo "  HYPERFRAMES_CONFIRM=YES npm run hyperframes:safe-rollback"
  exit 0
fi

cd "$APP_DIR"

if ! command -v systemctl >/dev/null 2>&1; then
  fail "systemctl is required for safe rollback on production host"
fi

ok "Stopping and disabling ${SERVICE_NAME}"
sudo systemctl stop "${SERVICE_NAME}" || warn "${SERVICE_NAME} was not active"
sudo systemctl disable "${SERVICE_NAME}" || warn "${SERVICE_NAME} was not enabled"

if [[ -f "$ENV_FILE" ]]; then
  BACKUP="$ENV_FILE.rollback.bak.$(date +%Y%m%d%H%M%S)"
  cp "$ENV_FILE" "$BACKUP"
  ok "Backed up .env to $BACKUP"

  python3 - <<'PY'
from pathlib import Path

env_path = Path('.env')
text = env_path.read_text()
lines = []
found = False
for line in text.splitlines():
    if line.startswith('HYPERFRAMES_RENDER_ENABLED='):
        lines.append('HYPERFRAMES_RENDER_ENABLED=false')
        found = True
    else:
        lines.append(line)
if not found:
    lines.append('HYPERFRAMES_RENDER_ENABLED=false')
env_path.write_text('\n'.join(lines).rstrip() + '\n')
PY
  ok "Set HYPERFRAMES_RENDER_ENABLED=false"
else
  warn "$ENV_FILE not found; skipped env update"
fi

ok "Reloading systemd"
sudo systemctl daemon-reload

ok "Post-rollback verification"
npm run health
npm run hyperframes:queue-status
ok "Safe rollback complete"
