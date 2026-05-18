#!/usr/bin/env bash
set -euo pipefail

SERVICE_UNIT="zsp-hyperframes-worker.service"
SERVICE_NAME="zsp-hyperframes-worker"
SERVICE_FILE="/etc/systemd/system/${SERVICE_UNIT}"
TRIAL_SECONDS="${HYPERFRAMES_WORKER_TRIAL_SECONDS:-120}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }
skip() { echo "[SKIP] $*"; }

if [[ "${HYPERFRAMES_WORKER_TRIAL_CONFIRM:-}" != "YES" ]]; then
  fail "Refusing trial. Set HYPERFRAMES_WORKER_TRIAL_CONFIRM=YES"
fi

if ! [[ "${TRIAL_SECONDS}" =~ ^[0-9]+$ ]] || (( TRIAL_SECONDS <= 0 )); then
  fail "HYPERFRAMES_WORKER_TRIAL_SECONDS must be a positive integer (got: ${TRIAL_SECONDS})"
fi

if ! command -v systemctl >/dev/null 2>&1; then
  fail "systemctl not found; trial requires a systemd host"
fi

if ! [[ -f "${SERVICE_FILE}" ]]; then
  fail "Required service file is not installed: ${SERVICE_FILE}"
fi
ok "Service file detected: ${SERVICE_FILE}"

cd "${ROOT_DIR}"

QUEUE_JSON="$(npm run --silent hyperframes:queue-status)"
ok "Queue status fetched"

RUNNING_JOBS="$(printf '%s' "${QUEUE_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(Number(x.running ?? 0));')"
PENDING_JOBS="$(printf '%s' "${QUEUE_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(Number(x.pending ?? 0));')"

if (( RUNNING_JOBS > 0 )); then
  fail "Refusing trial: running jobs > 0 (running=${RUNNING_JOBS})"
fi

if (( PENDING_JOBS == 0 )); then
  warn "Pending queue is empty (pending=0); worker may idle during the trial"
else
  ok "Pending queue has work (pending=${PENDING_JOBS})"
fi

if systemctl is-enabled "${SERVICE_NAME}" >/dev/null 2>&1; then
  fail "Refusing trial: ${SERVICE_NAME} is enabled; this trial must not manage persistent services"
fi
ok "Service is not enabled"

if [[ "${HYPERFRAMES_RENDER_ENABLED:-false}" == "false" ]]; then
  warn "HYPERFRAMES_RENDER_ENABLED=false; service may start but worker will not process jobs"
fi

ok "Running doctor preflight"
npm run hyperframes:doctor

started=0
enabled_mode=0
if [[ "${HYPERFRAMES_RENDER_ENABLED:-false}" == "true" ]]; then
  enabled_mode=1
fi

cleanup() {
  local exit_code=$?
  if (( started == 1 )); then
    if systemctl is-active "${SERVICE_NAME}" >/dev/null 2>&1; then
      ok "Stopping trial service"
      systemctl stop "${SERVICE_NAME}" || warn "Failed to stop ${SERVICE_NAME}"
    fi

    ok "Service status after stop"
    systemctl status "${SERVICE_NAME}" --no-pager || warn "Unable to read service status"

    ok "Recent logs"
    journalctl -u "${SERVICE_NAME}" -n 200 --no-pager || warn "Unable to fetch service logs"

    ok "Queue status after stop"
    npm run hyperframes:queue-status || warn "Queue status failed"

    ok "Health check after stop"
    npm run health || warn "Health check failed"
  else
    skip "Service was never started; skipping stop/status/log checks"
  fi

  if (( exit_code != 0 )); then
    echo "[FAIL] Worker trial failed"
  fi
}
trap cleanup EXIT

ok "Starting worker service"
systemctl start "${SERVICE_NAME}"
started=1

if (( enabled_mode == 0 )); then
  warn "HYPERFRAMES_RENDER_ENABLED=false; running disabled-mode lifecycle check"
  sleep 2
  SERVICE_STATUS="$(systemctl show "${SERVICE_NAME}" --property=ActiveState,SubState,Result --value 2>/dev/null | tr '\n' ' ')"
  LOG_SAMPLE="$(journalctl -u "${SERVICE_NAME}" -n 200 --no-pager 2>/dev/null || true)"
  if [[ "${LOG_SAMPLE}" == *"render disabled"* ]] || [[ "${SERVICE_STATUS}" == *"inactive"* ]] || [[ "${SERVICE_STATUS}" == *"success"* ]]; then
    ok "disabled-mode service lifecycle verified"
  else
    fail "Disabled-mode lifecycle check failed: expected clean deactivation or 'render disabled' log"
  fi
else
  ok "Worker trial running for ${TRIAL_SECONDS} seconds"
  sleep "${TRIAL_SECONDS}"
  if ! systemctl is-active "${SERVICE_NAME}" >/dev/null 2>&1; then
    fail "Service became inactive during trial"
  fi
  ok "Trial window completed"
fi

ok "Queue status after trial"
npm run hyperframes:queue-status

ok "Health check after trial"
npm run health
