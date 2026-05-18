#!/usr/bin/env bash
set -euo pipefail

SERVICE_UNIT="zsp-hyperframes-worker.service"
SERVICE_NAME="zsp-hyperframes-worker"
SERVICE_FILE="/etc/systemd/system/${SERVICE_UNIT}"
DROPIN_DIR="/etc/systemd/system/${SERVICE_UNIT}.d"
DROPIN_FILE="${DROPIN_DIR}/trial.conf"
TRIAL_SECONDS="${HYPERFRAMES_LIVE_TRIAL_SECONDS:-300}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }

if [[ "${HYPERFRAMES_LIVE_TRIAL_CONFIRM:-}" != "YES" ]]; then
  fail "Refusing live trial. Set HYPERFRAMES_LIVE_TRIAL_CONFIRM=YES"
fi

if [[ -z "${HYPERFRAMES_SMOKE_USER_ID:-}" ]]; then
  fail "HYPERFRAMES_SMOKE_USER_ID is required"
fi

if ! [[ "${TRIAL_SECONDS}" =~ ^[0-9]+$ ]] || (( TRIAL_SECONDS <= 0 )); then
  fail "HYPERFRAMES_LIVE_TRIAL_SECONDS must be a positive integer (got: ${TRIAL_SECONDS})"
fi

if ! command -v systemctl >/dev/null 2>&1; then
  fail "systemctl not found; live trial requires a systemd host"
fi

if ! [[ -f "${SERVICE_FILE}" ]]; then
  fail "Required service file is not installed: ${SERVICE_FILE}"
fi

if systemctl is-enabled "${SERVICE_NAME}" >/dev/null 2>&1; then
  fail "Refusing live trial: ${SERVICE_NAME} is enabled"
fi

cd "${ROOT_DIR}"

QUEUE_JSON="$(npm run --silent hyperframes:queue-status)"
RUNNING_JOBS="$(printf '%s' "${QUEUE_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(Number(x.running ?? 0));')"
if (( RUNNING_JOBS > 0 )); then
  fail "Refusing live trial: running jobs > 0 (running=${RUNNING_JOBS})"
fi

npm run health
npm run hyperframes:doctor

DISK_JSON="$(tsx -e 'import { getHyperFramesRenderConfig } from "./src/lib/hyperframes/render-config"; process.stdout.write(JSON.stringify({ outputDir: getHyperFramesRenderConfig().outputDir, minFreeMb: getHyperFramesRenderConfig().minFreeMb }));')"
OUTPUT_DIR="$(printf '%s' "${DISK_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(String(x.outputDir));')"
MIN_FREE_MB="$(printf '%s' "${DISK_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(Number(x.minFreeMb));')"
FREE_KB="$(df -Pk "${OUTPUT_DIR}" | awk 'NR==2 {print $4}')"
FREE_MB="$(( FREE_KB / 1024 ))"
if (( FREE_MB < MIN_FREE_MB )); then
  fail "Refusing live trial: free disk ${FREE_MB}MB below threshold ${MIN_FREE_MB}MB at ${OUTPUT_DIR}"
fi
ok "Disk check passed (${FREE_MB}MB free >= ${MIN_FREE_MB}MB)"

started=0
rollback() {
  local exit_code=$?
  if systemctl is-active "${SERVICE_NAME}" >/dev/null 2>&1; then
    systemctl stop "${SERVICE_NAME}" || warn "Failed to stop ${SERVICE_NAME}"
  fi
  rm -f "${DROPIN_FILE}" || true
  rmdir "${DROPIN_DIR}" 2>/dev/null || true
  systemctl daemon-reload || warn "daemon-reload failed"

  journalctl -u "${SERVICE_NAME}" -n 200 --no-pager || warn "Unable to fetch logs"
  npm run health || warn "Health check failed"

  if (( exit_code != 0 )); then
    echo "[FAIL] HyperFrames live queue trial failed"
  fi
}
trap rollback EXIT

ok "Enqueueing one smoke render job"
JOB_JSON="$(HYPERFRAMES_RENDER_ENABLED=true HYPERFRAMES_RENDER_SMOKE_CONFIRM=YES HYPERFRAMES_SMOKE_USER_ID="${HYPERFRAMES_SMOKE_USER_ID}" npm run --silent hyperframes:enqueue-smoke-job)"
JOB_ID="$(printf '%s' "${JOB_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(String(x.jobId ?? ""));')"
if [[ -z "${JOB_ID}" ]]; then
  fail "Failed to extract jobId from enqueue response"
fi
ok "Queued job: ${JOB_ID}"

mkdir -p "${DROPIN_DIR}"
cat > "${DROPIN_FILE}" <<'DROPIN'
[Service]
Environment=HYPERFRAMES_RENDER_ENABLED=true
Environment=HYPERFRAMES_RENDER_SMOKE_CONFIRM=YES
Environment=HYPERFRAMES_CLI_BIN=npx
Environment=HYPERFRAMES_CLI_ARGS=-y hyperframes
DROPIN

systemctl daemon-reload
systemctl start "${SERVICE_NAME}"
started=1

start_epoch="$(date +%s)"
end_epoch="$(( start_epoch + TRIAL_SECONDS ))"
final_status=""
output_path=""
while :; do
  JOB_STATUS_JSON="$(npm run --silent hyperframes:render-job-status -- "${JOB_ID}")"
  final_status="$(printf '%s' "${JOB_STATUS_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(String(x.status ?? ""));')"
  output_path="$(printf '%s' "${JOB_STATUS_JSON}" | node -e 'const fs=require("node:fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));console.log(String(x.outputPath ?? ""));')"

  if [[ "${final_status}" == "COMPLETED" || "${final_status}" == "FAILED" ]]; then
    break
  fi

  if (( $(date +%s) >= end_epoch )); then
    fail "Timed out waiting for job ${JOB_ID} (timeout=${TRIAL_SECONDS}s)"
  fi

  sleep 5
done

ok "Job ${JOB_ID} finished with status=${final_status}"
if [[ "${final_status}" == "FAILED" ]]; then
  fail "Live queue trial job failed"
fi

systemctl stop "${SERVICE_NAME}"
rm -f "${DROPIN_FILE}"
rmdir "${DROPIN_DIR}" 2>/dev/null || true
systemctl daemon-reload

if systemctl is-enabled "${SERVICE_NAME}" >/dev/null 2>&1; then
  fail "Service must remain disabled after trial"
fi
if systemctl is-active "${SERVICE_NAME}" >/dev/null 2>&1; then
  fail "Service must be inactive after trial"
fi

npm run health
npm run hyperframes:queue-status

if [[ -n "${output_path}" ]]; then
  ok "Render output: ${output_path}"
fi
