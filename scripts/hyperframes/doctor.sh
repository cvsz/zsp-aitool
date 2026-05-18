#!/usr/bin/env bash
set -euo pipefail
enabled="${HYPERFRAMES_RENDER_ENABLED:-false}"
echo "[OK] HYPERFRAMES_RENDER_ENABLED=$enabled"
if [[ "$enabled" != "true" ]]; then
  echo "[SKIP] HyperFrames render disabled"
fi
command -v "${HYPERFRAMES_NODE_BIN:-node}" >/dev/null 2>&1 && echo "[OK] node found" || { [[ "$enabled" == "true" ]] && echo "[FAIL] node missing" || echo "[WARN] node missing"; }
command -v "${HYPERFRAMES_FFMPEG_BIN:-ffmpeg}" >/dev/null 2>&1 && echo "[OK] ffmpeg found" || { [[ "$enabled" == "true" ]] && echo "[FAIL] ffmpeg missing" || echo "[WARN] ffmpeg missing"; }
command -v "${HYPERFRAMES_CLI_BIN:-hyperframes}" >/dev/null 2>&1 && echo "[OK] hyperframes CLI found" || { [[ "$enabled" == "true" ]] && echo "[FAIL] hyperframes CLI missing" || echo "[WARN] hyperframes CLI missing"; }
mkdir -p "${HYPERFRAMES_WORKDIR:-/var/lib/zsp-aitool/hyperframes}" "${HYPERFRAMES_OUTPUT_DIR:-/var/lib/zsp-aitool/hyperframes/renders}"
[[ -w "${HYPERFRAMES_WORKDIR:-/var/lib/zsp-aitool/hyperframes}" ]] && echo "[OK] workdir writable" || echo "[FAIL] workdir not writable"
[[ -w "${HYPERFRAMES_OUTPUT_DIR:-/var/lib/zsp-aitool/hyperframes/renders}" ]] && echo "[OK] output dir writable" || echo "[FAIL] output dir not writable"
