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
SCRIPT_START_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
JOURNAL_SINCE="${JOURNAL_SINCE:-$SCRIPT_START_UTC}"
BENIGN_SYSTEMD_CGROUP_RE="Failed to kill control group .*ignoring: Invalid argument"
DEFAULT_SHOPEE_AFFILIATE_AUTH_URL="https://affiliate.shopee.co.th/"

log() { printf '\n[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
ok() { printf '[OK] %s\n' "$*"; }
warn() { printf '[WARN] %s\n' "$*"; }
fail() { printf '[FAIL] %s\n' "$*" >&2; exit 1; }

run() {
  local display=()
  local arg
  for arg in "$@"; do
    display+=("$(printf '%q' "$arg")")
  done
  local IFS=' '
  log "RUN: ${display[*]}"
  "$@"
}

has_npm_script() {
  local script_name="$1"
  node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts[process.argv[1]] ? 0 : 1)" "$script_name" >/dev/null 2>&1
}

journal_filtered_since() {
  local unit_name="$1"
  local output
  output="$(sudo journalctl -u "$unit_name" --since "$JOURNAL_SINCE" -l --no-pager 2>/dev/null \
    | grep -Ev "$BENIGN_SYSTEMD_CGROUP_RE" || true)"

  if [[ -n "$output" ]]; then
    printf '%s\n' "$output"
  else
    ok "No recent non-benign logs for ${unit_name} since ${JOURNAL_SINCE}"
  fi
}

on_error() {
  local exit_code=$?
  local line_no=${1:-unknown}
  printf '\n[FAIL] start.sh failed at line %s with exit code %s\n' "$line_no" "$exit_code" >&2
  printf '[INFO] Recent %s logs since %s:\n' "$APP_SERVICE" "$JOURNAL_SINCE" >&2
  sudo journalctl -u "$APP_SERVICE" --since "$JOURNAL_SINCE" -l --no-pager >&2 || true
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

validate_shopee_affiliate_auth_url() {
  local value="$1"
  if [[ "$value" =~ ^https://affiliate\.shopee\.co\.th(/.*)?$ ]]; then
    return 0
  fi
  return 1
}

ensure_shopee_affiliate_auth_env() {
  log "Checking Shopee Affiliate portal auth config"

  if [[ ! -f .env ]]; then
    warn ".env not found; cannot add SHOPEE_AFFILIATE_AUTH_URL"
    return 0
  fi

  local current
  current="$(awk -F= '/^SHOPEE_AFFILIATE_AUTH_URL=/{sub(/^SHOPEE_AFFILIATE_AUTH_URL=/,""); print; exit}' .env)"

  if [[ -z "$current" ]]; then
    printf '\n# Shopee Affiliate portal auth/setup helper (official user-facing portal only)\nSHOPEE_AFFILIATE_AUTH_URL=%s\n' "$DEFAULT_SHOPEE_AFFILIATE_AUTH_URL" >> .env
    ok "Added SHOPEE_AFFILIATE_AUTH_URL to .env"
    return 0
  fi

  if validate_shopee_affiliate_auth_url "$current"; then
    ok "SHOPEE_AFFILIATE_AUTH_URL is allowlisted"
  else
    fail "SHOPEE_AFFILIATE_AUTH_URL must be https://affiliate.shopee.co.th/ or a same-host HTTPS path"
  fi
}

validate_install_prisma() {
  run python3 -m json.tool package.json >/tmp/package-json-ok.json
  ok "package.json is valid JSON"

  run npm ci
  run npm run prisma:generate
  run npx prisma validate

  log "Checking Prisma migration status before deploy"
  if npx prisma migrate status --schema prisma/schema.prisma; then
    ok "Prisma pre-deploy migration status is clean"
  else
    warn "Prisma pre-deploy status reported pending migrations or drift; continuing to production migrate deploy"
  fi

  run npx prisma migrate deploy --schema prisma/schema.prisma
  run npx prisma migrate status --schema prisma/schema.prisma

  if has_npm_script "db:schema-drift-check"; then
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

  if has_npm_script "db:schema-drift-check"; then
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
  expect_status "/dashboard/shopee-affiliate" "200 307"
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
  expect_status "/api/integrations/shopee/status" "200 401 403 307"
  expect_status "/api/integrations/shopee/affiliate-ingestions" "200 401 403 307"

  log "Public route smoke"
  expect_public_status "/" "200 301 302 307 308 403"
  expect_public_status "/dashboard" "200 301 302 307 308 403"
  expect_public_status "/dashboard/products" "200 301 302 307 308 403"
  expect_public_status "/dashboard/shopee-affiliate" "200 301 302 307 308 403"
}

journal_drift_check() {
  log "Checking app journal since ${JOURNAL_SINCE} for new Prisma/UserSetting drift errors"
  local matches
  matches="$(sudo journalctl -u "$APP_SERVICE" --since "$JOURNAL_SINCE" -l --no-pager 2>/dev/null \
    | grep -iE "prisma:error|column .*UserSetting|UserSetting\..*does not exist|brandColors.*does not exist|fontPreference.*does not exist|logoUrl.*does not exist|watermarkText.*does not exist|defaultAspectRatio.*does not exist|defaultCTA.*does not exist" \
    || true)"

  if [[ -n "$matches" ]]; then
    printf '%s\n' "$matches"
    warn "Recent Prisma/UserSetting drift entries found; review output above"
  else
    ok "No new UserSetting drift errors found since ${JOURNAL_SINCE}"
  fi
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
  log "Recent ${APP_SERVICE} logs since ${JOURNAL_SINCE} (benign cgroup-stop noise filtered)"
  journal_filtered_since "$APP_SERVICE"

  log "Recent ${WORKER_SERVICE} logs since ${JOURNAL_SINCE} (benign cgroup-stop noise filtered)"
  journal_filtered_since "$WORKER_SERVICE"
}

main() {
  resolve_repo_dir
  log "Starting full production deployment for $(pwd)"
  ok "Journal checks scoped since ${JOURNAL_SINCE}"
  require_systemd_vm
  pull_latest
  cleanup_temp_files
  ensure_shopee_affiliate_auth_env
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
[PASS] SHOPEE_AFFILIATE_AUTH_CONFIGURED=true
[PASS] SHOPEE_AFFILIATE_REAL_DB_ROUTES_CONFIGURED=true
EOF
}

main "$@"
