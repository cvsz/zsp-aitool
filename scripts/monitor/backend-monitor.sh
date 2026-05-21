#!/usr/bin/env bash
# zsp-aitool backend monitor
# Read-only production monitor for app, worker, HTTP routes, DB drift, resources, and recent logs.

set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="${ROOT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
APP_SERVICE="${APP_SERVICE:-zsp-aitool}"
WORKER_SERVICE="${WORKER_SERVICE:-zsp-hyperframes-worker}"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3001}"
BASE_URL="${BASE_URL:-http://${HOST}:${PORT}}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-https://studio.zeaz.dev}"
JOURNAL_SINCE="${JOURNAL_SINCE:-15 minutes ago}"
DISK_WARN_PCT="${DISK_WARN_PCT:-85}"
MEM_WARN_PCT="${MEM_WARN_PCT:-90}"
LOG_DIR="${BACKEND_MONITOR_LOG_DIR:-/var/log/zsp-aitool}"
WEBHOOK_URL="${BACKEND_MONITOR_WEBHOOK_URL:-}"
WEBHOOK_MIN_STATUS="${BACKEND_MONITOR_WEBHOOK_MIN_STATUS:-warn}"
RUN_HEALTH_SCRIPT="${RUN_HEALTH_SCRIPT:-false}"
RUN_PRISMA_STATUS="${RUN_PRISMA_STATUS:-true}"
RUN_DB_DRIFT_CHECK="${RUN_DB_DRIFT_CHECK:-true}"
RUN_HYPERFRAMES_QUEUE="${RUN_HYPERFRAMES_QUEUE:-true}"

STATUS="ok"
FAILURES=0
WARNINGS=0
DETAILS=()
START_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

cd "$ROOT_DIR"

log() { printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
ok() { DETAILS+=("OK: $*"); printf '[OK] %s\n' "$*"; }
warn() { WARNINGS=$((WARNINGS + 1)); DETAILS+=("WARN: $*"); printf '[WARN] %s\n' "$*"; [[ "$STATUS" == "ok" ]] && STATUS="warn"; }
fail() { FAILURES=$((FAILURES + 1)); DETAILS+=("FAIL: $*"); printf '[FAIL] %s\n' "$*"; STATUS="fail"; }

have_cmd() { command -v "$1" >/dev/null 2>&1; }

json_escape() {
  python3 -c 'import json,sys; print(json.dumps(sys.stdin.read())[1:-1])'
}

safe_log_dir() {
  if mkdir -p "$LOG_DIR" 2>/dev/null && [[ -w "$LOG_DIR" ]]; then
    return 0
  fi
  LOG_DIR="${HOME}/zsp-backend-monitor-logs"
  mkdir -p "$LOG_DIR"
}

http_code() {
  local url="$1"
  curl -sS -o /dev/null -w '%{http_code}' --max-time 12 "$url" || true
}

check_local_route() {
  local path="$1"
  local allowed="$2"
  local code
  code="$(http_code "${BASE_URL}${path}")"
  if [[ " ${allowed} " == *" ${code} "* ]]; then
    ok "local ${path} -> HTTP ${code}"
  else
    fail "local ${path} -> HTTP ${code}; expected ${allowed}"
  fi
}

check_public_route() {
  local path="$1"
  local allowed="$2"
  local code
  code="$(http_code "${PUBLIC_BASE_URL}${path}")"
  if [[ " ${allowed} " == *" ${code} "* ]]; then
    ok "public ${path} -> HTTP ${code}"
  elif [[ "$code" == "403" ]]; then
    warn "public ${path} -> HTTP 403; possible Cloudflare/challenge edge condition"
  else
    warn "public ${path} -> HTTP ${code}; expected ${allowed}"
  fi
}

check_systemd_service() {
  local unit="$1"
  if ! have_cmd systemctl || [[ ! -d /run/systemd/system ]]; then
    warn "systemd not available; skipping ${unit}"
    return 0
  fi

  local active enabled
  active="$(systemctl is-active "$unit" 2>/dev/null || true)"
  enabled="$(systemctl is-enabled "$unit" 2>/dev/null || true)"
  if [[ "$active" == "active" ]]; then
    ok "${unit} active=${active} enabled=${enabled:-unknown}"
  else
    fail "${unit} active=${active:-unknown} enabled=${enabled:-unknown}"
  fi
}

check_failed_units() {
  if ! have_cmd systemctl || [[ ! -d /run/systemd/system ]]; then
    return 0
  fi
  if systemctl --failed --no-legend --no-pager | grep -q .; then
    warn "systemd has failed units"
    systemctl --failed --no-pager || true
  else
    ok "no failed systemd units"
  fi
}

check_port() {
  if have_cmd ss; then
    if ss -ltn "( sport = :${PORT} )" | awk 'NR>1{found=1} END{exit !found}'; then
      ok "port ${PORT} is listening"
    else
      fail "port ${PORT} is not listening"
    fi
  else
    warn "ss command missing; skipping port check"
  fi
}

check_disk() {
  local pct mount
  pct="$(df -P "$ROOT_DIR" | awk 'NR==2{gsub(/%/,"",$5); print $5}')"
  mount="$(df -P "$ROOT_DIR" | awk 'NR==2{print $6}')"
  if [[ -z "$pct" ]]; then
    warn "could not read disk usage"
    return 0
  fi
  if (( pct >= DISK_WARN_PCT )); then
    warn "disk usage ${pct}% on ${mount}; threshold ${DISK_WARN_PCT}%"
  else
    ok "disk usage ${pct}% on ${mount}"
  fi
}

check_memory() {
  if ! have_cmd free; then
    warn "free command missing; skipping memory check"
    return 0
  fi
  local pct
  pct="$(free | awk '/Mem:/{printf "%d", ($3/$2)*100}')"
  if (( pct >= MEM_WARN_PCT )); then
    warn "memory usage ${pct}%; threshold ${MEM_WARN_PCT}%"
  else
    ok "memory usage ${pct}%"
  fi
}

check_db() {
  if [[ "$RUN_PRISMA_STATUS" == "true" ]]; then
    if npx prisma migrate status --schema prisma/schema.prisma >/tmp/zsp-prisma-status.out 2>/tmp/zsp-prisma-status.err; then
      ok "Prisma migration status clean"
    else
      fail "Prisma migration status failed: $(tail -n 3 /tmp/zsp-prisma-status.err | tr '\n' ' ')"
    fi
  fi

  if [[ "$RUN_DB_DRIFT_CHECK" == "true" ]]; then
    if npm run db:schema-drift-check >/tmp/zsp-db-drift.out 2>/tmp/zsp-db-drift.err; then
      ok "DB schema drift check passed"
    else
      fail "DB schema drift check failed: $(tail -n 5 /tmp/zsp-db-drift.err /tmp/zsp-db-drift.out 2>/dev/null | tr '\n' ' ')"
    fi
  fi
}

check_hyperframes_queue() {
  if [[ "$RUN_HYPERFRAMES_QUEUE" != "true" ]]; then
    return 0
  fi
  if npm run hyperframes:queue-status >/tmp/zsp-hyperframes-queue.json 2>/tmp/zsp-hyperframes-queue.err; then
    ok "HyperFrames queue status command passed"
    cat /tmp/zsp-hyperframes-queue.json || true
  else
    warn "HyperFrames queue status failed: $(tail -n 5 /tmp/zsp-hyperframes-queue.err | tr '\n' ' ')"
  fi
}

check_recent_logs() {
  if ! have_cmd journalctl || [[ ! -d /run/systemd/system ]]; then
    warn "journalctl not available; skipping recent log scan"
    return 0
  fi

  local patterns='error|exception|unhandled|prisma:error|PrismaClientKnownRequestError|ECONNREFUSED|EADDRINUSE|User\.planTier|does not exist|fatal'
  local app_hits worker_hits
  app_hits="$(journalctl -u "$APP_SERVICE" --since "$JOURNAL_SINCE" -l --no-pager 2>/dev/null | grep -Ei "$patterns" | grep -Ev 'Failed to kill control group .*Invalid argument' || true)"
  worker_hits="$(journalctl -u "$WORKER_SERVICE" --since "$JOURNAL_SINCE" -l --no-pager 2>/dev/null | grep -Ei "$patterns" | grep -Ev 'Failed to kill control group .*Invalid argument' || true)"

  if [[ -n "$app_hits" ]]; then
    warn "recent ${APP_SERVICE} error-like logs found since ${JOURNAL_SINCE}"
    printf '%s\n' "$app_hits" | tail -n 20
  else
    ok "no recent ${APP_SERVICE} error-like logs since ${JOURNAL_SINCE}"
  fi

  if [[ -n "$worker_hits" ]]; then
    warn "recent ${WORKER_SERVICE} error-like logs found since ${JOURNAL_SINCE}"
    printf '%s\n' "$worker_hits" | tail -n 20
  else
    ok "no recent ${WORKER_SERVICE} error-like logs since ${JOURNAL_SINCE}"
  fi
}

run_full_health_script() {
  if [[ "$RUN_HEALTH_SCRIPT" != "true" ]]; then
    return 0
  fi
  if npm run health; then
    ok "npm run health passed"
  else
    fail "npm run health failed"
  fi
}

write_json_log() {
  safe_log_dir
  local log_file="${LOG_DIR}/backend-monitor.jsonl"
  local details_json
  details_json="$(printf '%s\n' "${DETAILS[@]}" | python3 -c 'import json,sys; print(json.dumps([line.rstrip("\n") for line in sys.stdin if line.rstrip("\n")]))')"
  cat >>"$log_file" <<EOF
{"timestamp":"${START_UTC}","status":"${STATUS}","failures":${FAILURES},"warnings":${WARNINGS},"appService":"${APP_SERVICE}","workerService":"${WORKER_SERVICE}","baseUrl":"${BASE_URL}","publicBaseUrl":"${PUBLIC_BASE_URL}","details":${details_json}}
EOF
  ok "wrote monitor log ${log_file}"
}

send_webhook() {
  [[ -z "$WEBHOOK_URL" ]] && return 0
  if [[ "$WEBHOOK_MIN_STATUS" == "fail" && "$STATUS" != "fail" ]]; then
    return 0
  fi
  if [[ "$WEBHOOK_MIN_STATUS" == "warn" && "$STATUS" == "ok" ]]; then
    return 0
  fi

  local payload
  payload="$(python3 - <<PY
import json
print(json.dumps({
  "service": "zsp-aitool-backend",
  "timestamp": "${START_UTC}",
  "status": "${STATUS}",
  "failures": ${FAILURES},
  "warnings": ${WARNINGS},
  "baseUrl": "${BASE_URL}",
  "publicBaseUrl": "${PUBLIC_BASE_URL}",
}))
PY
)"
  curl -fsS -X POST -H 'Content-Type: application/json' --data "$payload" "$WEBHOOK_URL" >/dev/null \
    && ok "webhook alert sent" \
    || warn "webhook alert failed"
}

main() {
  log "Backend monitor started for ${ROOT_DIR}"
  check_systemd_service "$APP_SERVICE"
  check_systemd_service "$WORKER_SERVICE"
  check_failed_units
  check_port
  check_local_route "/" "200 307 308"
  check_local_route "/dashboard" "200 307 308"
  check_local_route "/api/integrations/shopee/status" "200 401 403 307 308"
  check_local_route "/api/integrations/marqeta/status" "200 401 403 307 308"
  check_public_route "/" "200 301 302 307 308"
  check_public_route "/dashboard" "200 301 302 307 308"
  check_disk
  check_memory
  check_db
  check_hyperframes_queue
  check_recent_logs
  run_full_health_script
  write_json_log
  send_webhook

  if (( FAILURES > 0 )); then
    printf '\n[FAIL] BACKEND_MONITOR_STATUS=fail failures=%s warnings=%s\n' "$FAILURES" "$WARNINGS"
    exit 1
  fi

  if (( WARNINGS > 0 )); then
    printf '\n[WARN] BACKEND_MONITOR_STATUS=warn failures=0 warnings=%s\n' "$WARNINGS"
    exit 0
  fi

  printf '\n[OK] BACKEND_MONITOR_STATUS=ok failures=0 warnings=0\n'
}

main "$@"
