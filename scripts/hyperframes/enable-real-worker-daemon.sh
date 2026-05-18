#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-worker"
APP_DIR="${APP_DIR:-$HOME/zsp-aitool}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env}"
CONFIRM="${HYPERFRAMES_ENABLE_DAEMON_CONFIRM:-NO}"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }
skip() { echo "[SKIP] $*"; }

cd "$APP_DIR"

if [[ "$CONFIRM" != "YES" ]]; then
  fail "Refusing to enable daemon. Run with HYPERFRAMES_ENABLE_DAEMON_CONFIRM=YES"
fi

[[ -f package.json ]] || fail "package.json not found in $APP_DIR"
[[ -f "$ENV_FILE" ]] || fail ".env not found: $ENV_FILE"

ok "Starting real HyperFrames worker daemon enable flow"

ok "Running health/preflight before enabling"
npm run health
npm run hyperframes:doctor
npm run hyperframes:queue-status
npm run hyperframes:worker:preflight

ok "Installing service file if needed"
npm run hyperframes:worker:install-service

if systemctl is-enabled "$SERVICE_NAME" >/dev/null 2>&1; then
  warn "$SERVICE_NAME is already enabled"
else
  ok "$SERVICE_NAME is currently not enabled"
fi

if systemctl is-active "$SERVICE_NAME" >/dev/null 2>&1; then
  fail "$SERVICE_NAME is already active. Stop it before running this enable script."
fi

BACKUP="$ENV_FILE.bak.$(date +%Y%m%d%H%M%S)"
cp "$ENV_FILE" "$BACKUP"
ok "Backed up .env to $BACKUP"

ok "Writing safe render daemon env values"
python3 - <<'PY'
from pathlib import Path

env_path = Path(".env")
text = env_path.read_text() if env_path.exists() else ""

updates = {
    "HYPERFRAMES_RENDER_ENABLED": "true",
    "HYPERFRAMES_CLI_BIN": "npx",
    "HYPERFRAMES_CLI_ARGS": "-y hyperframes",
    "HYPERFRAMES_WORKDIR": "/var/lib/zsp-aitool/hyperframes",
    "HYPERFRAMES_OUTPUT_DIR": "/var/lib/zsp-aitool/hyperframes/renders",
    "HYPERFRAMES_MAX_DURATION_SECONDS": "60",
    "HYPERFRAMES_MAX_CONCURRENT_JOBS": "1",
    "HYPERFRAMES_MAX_PENDING_JOBS": "25",
    "HYPERFRAMES_MAX_RUNNING_JOBS": "1",
    "HYPERFRAMES_MAX_ATTEMPTS": "3",
    "HYPERFRAMES_RETRY_BACKOFF_SECONDS": "300",
    "HYPERFRAMES_RUNNING_STALE_MINUTES": "30",
    "HYPERFRAMES_MIN_FREE_MB": "2048",
    "HYPERFRAMES_MAX_OUTPUT_MB": "512",
    "HYPERFRAMES_RETENTION_DAYS": "14",
    "HYPERFRAMES_CLEANUP_DRY_RUN": "true",
}

lines = text.splitlines()
seen = set()
out = []

for line in lines:
    stripped = line.strip()
    if "=" in line and not stripped.startswith("#"):
        key = line.split("=", 1)[0].strip()
        if key in updates:
            out.append(f"{key}={updates[key]}")
            seen.add(key)
        else:
            out.append(line)
    else:
        out.append(line)

for key, value in updates.items():
    if key not in seen:
        out.append(f"{key}={value}")

env_path.write_text("\n".join(out).rstrip() + "\n")
PY

ok "Ensuring render directories"
sudo install -d -o zeazdev -g zeazdev -m 750 /var/lib/zsp-aitool
sudo install -d -o zeazdev -g zeazdev -m 750 /var/lib/zsp-aitool/hyperframes
sudo install -d -o zeazdev -g zeazdev -m 750 /var/lib/zsp-aitool/hyperframes/renders

ok "Running doctor with render enabled"
npm run hyperframes:doctor

ok "Reloading systemd"
sudo systemctl daemon-reload

ok "Enabling and starting $SERVICE_NAME"
sudo systemctl enable --now "$SERVICE_NAME"

sleep 5

ok "Checking daemon state"
systemctl is-enabled "$SERVICE_NAME"
systemctl is-active "$SERVICE_NAME"
systemctl status "$SERVICE_NAME" --no-pager || true

ok "Running post-enable checks"
npm run health
npm run hyperframes:queue-status

ok "Recent worker logs"
sudo journalctl -u "$SERVICE_NAME" -n 80 --no-pager || true

ok "HyperFrames real systemd daemon enabled"
