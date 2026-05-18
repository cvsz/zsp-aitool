#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-worker.service"
TRIAL_SECONDS="${HYPERFRAMES_WORKER_TRIAL_SECONDS:-120}"
MAX_PENDING_JOBS="${HYPERFRAMES_MAX_PENDING_JOBS:-25}"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }
skip() { echo "[SKIP] $*"; }

if [[ "${HYPERFRAMES_WORKER_TRIAL_CONFIRM:-}" != "YES" ]]; then
  fail "Refusing trial. Set HYPERFRAMES_WORKER_TRIAL_CONFIRM=YES to continue"
fi

if ! command -v systemctl >/dev/null 2>&1; then
  fail "systemctl not found; persistent worker trial requires a systemd host"
fi

if ! command -v sudo >/dev/null 2>&1; then
  fail "sudo not found; cannot safely manage ${SERVICE_NAME}"
fi

if ! systemctl list-unit-files --type=service --no-legend | awk '{print $1}' | grep -Fxq "${SERVICE_NAME}"; then
  fail "Service is not installed: ${SERVICE_NAME}"
fi
ok "Service file detected: ${SERVICE_NAME}"

QUEUE_JSON="$(npm run --silent hyperframes:queue-status)"
ok "Queue status fetched"

RUNNING_JOBS="$(printf '%s' "${QUEUE_JSON}" | node -e 'const fs=require("node:fs");const raw=fs.readFileSync(0,"utf8");const x=JSON.parse(raw);console.log(Number(x.running ?? 0));')"
PENDING_JOBS="$(printf '%s' "${QUEUE_JSON}" | node -e 'const fs=require("node:fs");const raw=fs.readFileSync(0,"utf8");const x=JSON.parse(raw);console.log(Number(x.pending ?? 0));')"

if (( RUNNING_JOBS > 0 )); then
  fail "Refusing trial: running jobs > 0 (running=${RUNNING_JOBS})"
fi

if (( PENDING_JOBS > MAX_PENDING_JOBS )); then
  fail "Refusing trial: pending jobs (${PENDING_JOBS}) exceed HYPERFRAMES_MAX_PENDING_JOBS (${MAX_PENDING_JOBS})"
fi
ok "Queue gate passed (running=${RUNNING_JOBS}, pending=${PENDING_JOBS}, maxPending=${MAX_PENDING_JOBS})"

ok "Running doctor preflight"
npm run hyperframes:doctor

if sudo systemctl is-enabled "${SERVICE_NAME}" >/dev/null 2>&1; then
  warn "Service is enabled. Trial will not modify enablement state"
else
  ok "Service is not enabled (expected for default-safe posture)"
fi

ok "Starting trial service for ${TRIAL_SECONDS}s"
if ! sudo systemctl start "${SERVICE_NAME}"; then
  fail "Failed to start ${SERVICE_NAME}"
fi

trial_failed=0
cleanup() {
  local exit_code=$?
  ok "Stopping trial service"
  sudo systemctl stop "${SERVICE_NAME}" || warn "Failed to stop ${SERVICE_NAME}"

  ok "Service status after trial"
  sudo systemctl status "${SERVICE_NAME}" --no-pager || warn "Unable to read service status"

  ok "Queue status after trial"
  npm run --silent hyperframes:queue-status || warn "Queue status failed"

  ok "Health check after trial"
  npm run health || warn "Health check failed"

  if (( trial_failed == 1 || exit_code != 0 )); then
    warn "Trial failure detected; printing recent logs"
    sudo journalctl -u "${SERVICE_NAME}" -n 200 --no-pager || warn "Unable to fetch logs"
  fi

  if (( exit_code != 0 )); then
    fail "Worker trial exited with failure"
  fi

  ok "Worker trial completed and rolled back to stopped state"
}
trap cleanup EXIT

sleep "${TRIAL_SECONDS}"
if ! sudo systemctl is-active "${SERVICE_NAME}" >/dev/null 2>&1; then
  trial_failed=1
  fail "Service became inactive during trial window"
fi

ok "Trial window finished"
