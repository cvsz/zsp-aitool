#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="zsp-hyperframes-worker.service"
LINES="${WORKER_LOG_LINES:-200}"

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }
skip() { echo "[SKIP] $*"; }

if ! command -v journalctl >/dev/null 2>&1; then
  skip "journalctl not found in this environment"
  exit 0
fi

ok "Showing last ${LINES} lines for ${SERVICE_NAME}"
sudo journalctl -u "${SERVICE_NAME}" -n "${LINES}" --no-pager || warn "No logs yet or service missing"
