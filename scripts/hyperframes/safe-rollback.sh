#!/usr/bin/env bash
set -euo pipefail

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
