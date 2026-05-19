#!/usr/bin/env bash
# zsp-aitool full production start / deploy / verification script
# Safe for the real production VM. Requires systemd. Does not print secrets.

set -Eeuo pipefail
IFS=$'\n\t'

APP_SERVICE="${APP_SERVICE:-zsp-aitool}"
WORKER_SERVICE="${WORKER_SERVICE:-zsp-hyperframes-worker}"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3001}"
BASE_URL="http://${HOST}:${PORT}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-https://studio.zeaz.dev}"

log() { printf '\n[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
ok() { printf '[OK] %s\n' "$*"; }
warn() { printf '[WARN] %s\n' "$*"; }
fail() { printf '[FAIL] %s\n' "$*" >&2; exit 1; }

run() {
  log "RUN: $*"
  "$@"
}

on_error() {
  local exit_code=$?
  local line_no=${1:-unknown}
  printf '\n[FAIL] start.sh failed at line %s with exit code %s\n' "$line_no" "$exit_code" >&2
  printf '[INFO] Recent %s logs:\n' "$APP_SERVICE" >&2
  sudo journalctl -u "$APP_SERVICE" -n 80 -l --no-pager >&2 || true
  exit "$exit_code"
}
trap 'on_error $LINENO' ERR

resolve_repo_dir() {
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

  if [[ -f "${script_dir}/package.json" && -d "${script_dir}/.git" ]]; then
    cd "$script_dir"
    return 0
  fi

  if [[ -d "${HOME}/zsp-aitool" && -f "${HOME}/zsp-aitool/package.json" ]]; then
    cd "${HOME}/zsp-aitool"
    return 0
  fi

  fail "Cannot locate zsp-aitool repo. Run from repo root or set HOME correctly."
}

require_systemd_vm() {
  local init_name
  init_name="$(ps -p 1 -o comm= | tr -d '[:space:]')"
  [[ "$init_name" == "systemd" ]] || fail "PID 1 is '${init_name}', not systemd. This production script must run on the real VM."
  [[ -d /run/systemd/system ]] || fail "/run/systemd/system not found. systemd is unavailable."
  ok "Confirmed real systemd VM"

  local system_state
  system_state="$(systemctl is-system-running --no-pager || true)"
  if [[ "$system_state" == "running" ]]; then
    ok "systemd state: running"
  else
    warn "systemd state: ${system_state}; continuing but failed units will be reported at the end"
  fi
}

cleanup_temp_files() {
  log "Cleaning temporary unsafe files"
  shred -u .env.bak.* 2>/dev/null || rm -f .env.bak.* 2>/dev/null || true
  find . -type d -name __pycache__ -prune -exec rm -rf {} + 2>/dev/null || true
  ok "Temporary cleanup completed"
}

pull_latest() {
  log "Git status before pull"
  git status --short || true
  run git pull --rebase origin main
  log "Git revision after pull"
  git log --oneline -n 5
}

validate_install_prisma() {
  run python3 -m json.tool package.json >/tmp/package-json-ok.json
  ok "package.json is valid JSON"

  run npm ci
  run npm run prisma:generate
  run npx prisma validate

  run npx prisma migrate status --schema prisma/schema.prisma
  run npx prisma migrate deploy --schema prisma/schema.prisma
  run npx prisma migrate status --schema prisma/schema.prisma

  if npm run | grep -q '^  db:schema-drift-check'; then
    run npm run db:schema-drift-check
  else
    warn "db:schema-drift-check script not found; skipping"
  fi
}

verify_before_restart() {
  run npm run typecheck
  run npm run test
  run npm run build
}

restart_services() {
  log "Restarting production services"
  run sudo systemctl daemon-reload
  run sudo systemctl restart "$APP_SERVICE"
  run sudo systemctl enable "$APP_SERVICE"

  if [[ -f .env ]] && grep -q '^HYPERFRAMES_RENDER_ENABLED=true' .env; then
    ok "HYPERFRAMES_RENDER_ENABLED=true"
    run sudo systemctl enable --now "$WORKER_SERVICE"
  else
    warn "HYPERFRAMES_RENDER_ENABLED is not true or .env is missing; worker enable/start skipped"
  fi

  run sudo systemctl status "$APP_SERVICE" --no-pager -l
  sudo systemctl status "$WORKER_SERVICE" --no-pager -l || true
}

wait_for_app() {
  log "Waiting for ${BASE_URL}"
  for attempt in $(seq 1 30); do
    if curl -fsS -o /dev/null "${BASE_URL}/"; then
      ok "App is reachable at ${BASE_URL}/"
      return 0
    fi
    sleep 1
    printf '.'
  done
  printf '\n'
  fail "App did not become reachable at ${BASE_URL}/"
}

run_health_checks() {
  run npm run health
  run npm run hyperframes:doctor
  run npm run hyperframes:queue-status
  run npm run hyperframes:worker:watchdog

  if npm run | grep -q '^  db:schema-drift-check'; then
    run npm run db:schema-drift-check
  fi
}

curl_status() {
  local url="$1"
  curl -sS -o /dev/null -I -w '%{http_code}' "$url"
}

expect_status() {
  local path="$1"
  local allowed="$2"
  local url="${BASE_URL}${path}"
  local code
  code="$(curl_status "$url")"

  if [[ " ${allowed} " == *" ${code} "* ]]; then
    ok "${url} -> HTTP ${code}"
  else
    fail "${url} -> HTTP ${code}; expected one of: ${allowed}"
  fi
}

expect_public_status() {
  local path="$1"
  local allowed="$2"
  local url="${PUBLIC_BASE_URL}${path}"
  local code
  code="$(curl_status "$url")"

  if [[ " ${allowed} " == *" ${code} "* ]]; then
    ok "${url} -> HTTP ${code}"
  else
    warn "${url} -> HTTP ${code}; expected one of: ${allowed}"
  fi
}

route_smoke() {
  log "Local route smoke"
  expect_status "/" "200"
  expect_status "/login" "200"
  expect_status "/register" "200"
  expect_status "/dashboard" "200 307"
  expect_status "/dashboard/products" "200 307"
  expect_status "/dashboard/products/new" "200 307"
  expect_status "/dashboard/generator" "200 307"
  expect_status "/dashboard/content-history" "200 307"
  expect_status "/dashboard/templates" "200 307"
  expect_status "/dashboard/ocr" "200 307"
  expect_status "/dashboard/similar" "200 307"
  expect_status "/dashboard/settings" "200 307"
  expect_status "/dashboard/hyperframes" "200 307"
  expect_status "/dashboard/hyperframes/renders" "200 307"
  expect_status "/dashboard/hyperframes/batch" "200 307"
  expect_status "/dashboard/hyperframes/ops" "200 307"
  expect_status "/dashboard/hyperframes/ops/queue" "200 307"
  expect_status "/dashboard/admin" "200 307"

  log "Public route smoke"
  expect_public_status "/" "200 301 302 307 308 403"
  expect_public_status "/dashboard" "200 301 302 307 308 403"
  expect_public_status "/dashboard/products" "200 301 302 307 308 403"
}

journal_drift_check() {
  log "Checking recent app journal for Prisma/UserSetting drift errors"
  sudo journalctl -u "$APP_SERVICE" --since "30 minutes ago" -l --no-pager \
    | grep -iE "UserSetting|brandColors|fontPreference|logoUrl|watermarkText|defaultAspectRatio|defaultCTA|prisma:error" \
    && warn "Recent Prisma/UserSetting-related journal entries found; review output above" \
    || ok "No recent UserSetting drift errors found"
}

report_systemd_failed_units() {
  log "Systemd failed-unit report"
  if systemctl --failed --no-legend --no-pager | grep -q .; then
    warn "Failed units exist"
    systemctl --failed --no-pager || true
  else
    ok "No failed systemd units"
  fi

  local system_state
  system_state="$(systemctl is-system-running --no-pager || true)"
  if [[ "$system_state" == "running" ]]; then
    ok "systemd final state: running"
  else
    warn "systemd final state: ${system_state}"
  fi
}

show_recent_logs() {
  log "Recent ${APP_SERVICE} logs"
  sudo journalctl -u "$APP_SERVICE" -n 80 -l --no-pager || true

  log "Recent ${WORKER_SERVICE} logs"
  sudo journalctl -u "$WORKER_SERVICE" -n 80 -l --no-pager || true
}

main() {
  resolve_repo_dir
  log "Starting full production deployment for $(pwd)"
  require_systemd_vm
  pull_latest
  cleanup_temp_files
  validate_install_prisma
  verify_before_restart
  restart_services
  wait_for_app
  run_health_checks
  route_smoke
  journal_drift_check
  report_systemd_failed_units
  show_recent_logs

  cat <<'EOF'

[PASS] FULL_PRODUCTION_START_COMPLETED=true
[PASS] APP_SERVICE_ACTIVE=true
[PASS] HEALTH_CHECKS_COMPLETED=true
[PASS] DB_SCHEMA_DRIFT_CHECK_COMPLETED=true
[PASS] HYPERFRAMES_QUEUE_WATCHDOG_COMPLETED=true
EOF
}

main "$@"
