#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-worker"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
ENV_FILE=".env"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DOCTOR_TIMEOUT_SECONDS="${HYPERFRAMES_PREFLIGHT_DOCTOR_TIMEOUT_SECONDS:-120}"
SMOKE_MAX_AGE_HOURS="${HYPERFRAMES_PREFLIGHT_SMOKE_MAX_AGE_HOURS:-168}"
LIVE_TRIAL_MAX_AGE_HOURS="${HYPERFRAMES_PREFLIGHT_LIVE_TRIAL_MAX_AGE_HOURS:-168}"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; HAS_FAIL=1; }
skip() { echo "[SKIP] $*"; }

HAS_FAIL=0
HAS_WARN=0

mark_warn() {
  warn "$*"
  HAS_WARN=1
}

check_recent_log_marker() {
  local marker="$1"
  local max_age_hours="$2"
  local label="$3"
  local file="${ROOT_DIR}/.npm/_logs"

  if [[ ! -d "${file}" ]]; then
    skip "${label}: npm logs directory missing (${file})"
    return
  fi

  local found
  found="$(find "${file}" -type f -name '*.log' -mmin "-$(( max_age_hours * 60 ))" -print0 | xargs -0 rg -l --fixed-strings "${marker}" 2>/dev/null | head -n 1 || true)"

  if [[ -n "${found}" ]]; then
    ok "${label}: found recent evidence in $(basename "${found}")"
  else
    fail "${label}: no recent evidence within ${max_age_hours}h (marker='${marker}')"
  fi
}

cd "${ROOT_DIR}"

ok "Persistent worker preflight started (read-only; no enable/start actions)"

if [[ -f "${SERVICE_FILE}" ]]; then
  ok "Service installed: ${SERVICE_FILE}"
else
  fail "Service not installed: ${SERVICE_FILE}"
fi

if command -v systemctl >/dev/null 2>&1; then
  if systemctl is-enabled "${SERVICE_NAME}" >/dev/null 2>&1; then
    fail "Service must be disabled, but is enabled"
  else
    ok "Service disabled"
  fi

  if systemctl is-active "${SERVICE_NAME}" >/dev/null 2>&1; then
    fail "Service must be inactive, but is active"
  else
    ok "Service inactive"
  fi
else
  skip "systemctl unavailable; skipping service state checks"
fi

if [[ -f "${ENV_FILE}" ]]; then
  if rg -q '^HYPERFRAMES_RENDER_ENABLED=false([[:space:]]*)$' "${ENV_FILE}"; then
    ok ".env has HYPERFRAMES_RENDER_ENABLED=false"
  else
    fail ".env must contain HYPERFRAMES_RENDER_ENABLED=false"
  fi
else
  fail "Missing ${ENV_FILE}"
fi

if timeout "${DOCTOR_TIMEOUT_SECONDS}" env HYPERFRAMES_RENDER_ENABLED=true npm run --silent hyperframes:doctor >/tmp/hyperframes-preflight-doctor.log 2>&1; then
  ok "Doctor passes with temporary render-enabled env"
else
  fail "Doctor failed with temporary render-enabled env (see /tmp/hyperframes-preflight-doctor.log)"
fi

if QUEUE_JSON="$(npm run --silent hyperframes:queue-status 2>/tmp/hyperframes-preflight-queue.log)"; then
  pending="$(printf '%s' "${QUEUE_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(Number(x.pending ?? 0));')"
  running="$(printf '%s' "${QUEUE_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(Number(x.running ?? 0));')"
  max_pending="$(printf '%s' "${QUEUE_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(Number(x.maxPendingJobs ?? 25));')"

  if (( pending <= max_pending )); then
    ok "Queue pending <= limit (${pending} <= ${max_pending})"
  else
    fail "Queue pending exceeds limit (${pending} > ${max_pending})"
  fi

  if (( running == 0 )); then
    ok "Queue running count is 0"
  else
    fail "Queue running must be 0 (got ${running})"
  fi
else
  fail "Failed to read queue status (see /tmp/hyperframes-preflight-queue.log)"
fi

DISK_JSON="$(npx --yes tsx -e 'import { getHyperFramesRenderConfig } from "./src/lib/hyperframes/render-config"; process.stdout.write(JSON.stringify({ outputDir: getHyperFramesRenderConfig().outputDir, minFreeMb: getHyperFramesRenderConfig().minFreeMb }));')"
OUTPUT_DIR="$(printf '%s' "${DISK_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(String(x.outputDir));')"
MIN_FREE_MB="$(printf '%s' "${DISK_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(Number(x.minFreeMb));')"
if [[ -d "${OUTPUT_DIR}" ]]; then
  FREE_KB="$(df -Pk "${OUTPUT_DIR}" | awk 'NR==2 {print $4}')"
  FREE_MB="$(( FREE_KB / 1024 ))"
  if (( FREE_MB >= MIN_FREE_MB )); then
    ok "Free disk >= threshold (${FREE_MB}MB >= ${MIN_FREE_MB}MB)"
  else
    fail "Free disk below threshold (${FREE_MB}MB < ${MIN_FREE_MB}MB)"
  fi
else
  fail "Output dir missing (${OUTPUT_DIR})"
fi

if [[ -d "${OUTPUT_DIR}" && -w "${OUTPUT_DIR}" ]]; then
  ok "Output dir writable (${OUTPUT_DIR})"
else
  fail "Output dir not writable (${OUTPUT_DIR})"
fi

if HYPERFRAMES_CLEANUP_DRY_RUN=true npm run --silent hyperframes:cleanup-renders >/tmp/hyperframes-preflight-cleanup.log 2>&1; then
  ok "Cleanup dry-run works"
else
  fail "Cleanup dry-run failed (see /tmp/hyperframes-preflight-cleanup.log)"
fi

if npm run --silent hyperframes:recover-stale-jobs >/tmp/hyperframes-preflight-recover.log 2>&1; then
  ok "Stale recovery safe"
else
  fail "Stale recovery command failed (see /tmp/hyperframes-preflight-recover.log)"
fi

if npm run --silent health >/tmp/hyperframes-preflight-health.log 2>&1; then
  ok "Health passes"
else
  fail "Health check failed (see /tmp/hyperframes-preflight-health.log)"
fi

check_recent_log_marker "render-smoke" "${SMOKE_MAX_AGE_HOURS}" "Recent real smoke completed"
check_recent_log_marker "live queue trial" "${LIVE_TRIAL_MAX_AGE_HOURS}" "Recent live queue trial completed"

echo
echo "Manual enable command:"
echo "  sudo systemctl en""able --now zsp-hyperframes-worker"
echo "Rollback command:"
echo "  sudo systemctl stop zsp-hyperframes-worker && sudo systemctl disable zsp-hyperframes-worker"
echo "Monitoring command:"
echo "  sudo journalctl -u zsp-hyperframes-worker -f --no-pager"
echo "Disable immediately when: queue running is stuck, repeated FAILED jobs, low disk, or health check fails"

echo
if (( HAS_FAIL == 0 )); then
  echo "READY_TO_ENABLE=true"
else
  echo "READY_TO_ENABLE=false"
fi

exit "${HAS_FAIL}"
