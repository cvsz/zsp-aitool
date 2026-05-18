#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-worker"
APP_DIR="${APP_DIR:-$HOME/zsp-aitool}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env}"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }

cd "$APP_DIR"

ok "Stopping and disabling $SERVICE_NAME"
sudo systemctl stop "$SERVICE_NAME" || warn "$SERVICE_NAME was not active"
sudo systemctl disable "$SERVICE_NAME" || warn "$SERVICE_NAME was not enabled"

if [[ -f "$ENV_FILE" ]]; then
  BACKUP="$ENV_FILE.disable.bak.$(date +%Y%m%d%H%M%S)"
  cp "$ENV_FILE" "$BACKUP"
  ok "Backed up .env to $BACKUP"

  python3 - <<'PY'
from pathlib import Path

env_path = Path(".env")
text = env_path.read_text()
lines = []

found = False
for line in text.splitlines():
    if line.startswith("HYPERFRAMES_RENDER_ENABLED="):
        lines.append("HYPERFRAMES_RENDER_ENABLED=false")
        found = True
    else:
        lines.append(line)

if not found:
    lines.append("HYPERFRAMES_RENDER_ENABLED=false")

env_path.write_text("\n".join(lines).rstrip() + "\n")
PY
else
  warn ".env not found; skipped env update"
fi

ok "Reloading systemd"
sudo systemctl daemon-reload

ok "Checking state"
systemctl is-enabled "$SERVICE_NAME" || true
systemctl is-active "$SERVICE_NAME" || true
systemctl status "$SERVICE_NAME" --no-pager || true

ok "Running health checks"
npm run health
npm run hyperframes:queue-status

ok "HyperFrames daemon disabled"
