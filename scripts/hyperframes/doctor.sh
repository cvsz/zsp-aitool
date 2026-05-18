#!/usr/bin/env bash
set -euo pipefail

enabled="${HYPERFRAMES_RENDER_ENABLED:-false}"
node_bin="${HYPERFRAMES_NODE_BIN:-node}"
ffmpeg_bin="${HYPERFRAMES_FFMPEG_BIN:-ffmpeg}"
cli_bin="${HYPERFRAMES_CLI_BIN:-hyperframes}"
cli_args="${HYPERFRAMES_CLI_ARGS:-}"
workdir="${HYPERFRAMES_WORKDIR:-/var/lib/zsp-aitool/hyperframes}"
outdir="${HYPERFRAMES_OUTPUT_DIR:-/var/lib/zsp-aitool/hyperframes/renders}"
create_dirs="${HYPERFRAMES_DOCTOR_CREATE_DIRS:-false}"

read -r -a cli_arg_array <<< "$cli_args"

if [[ "$enabled" != "true" ]]; then
  echo "[OK] HYPERFRAMES_RENDER_ENABLED=$enabled"
  echo "[SKIP] HyperFrames render disabled"
else
  echo "[OK] HYPERFRAMES_RENDER_ENABLED=$enabled"
fi

command -v "$node_bin" >/dev/null 2>&1 && echo "[OK] node found ($node_bin)" || { [[ "$enabled" == "true" ]] && echo "[FAIL] node missing ($node_bin)" || echo "[WARN] node missing ($node_bin)"; }
command -v "$ffmpeg_bin" >/dev/null 2>&1 && echo "[OK] ffmpeg found ($ffmpeg_bin)" || { [[ "$enabled" == "true" ]] && echo "[FAIL] ffmpeg missing ($ffmpeg_bin)" || echo "[WARN] ffmpeg missing ($ffmpeg_bin)"; }

if "$cli_bin" "${cli_arg_array[@]}" --help >/dev/null 2>&1; then
  echo "[OK] hyperframes CLI callable ($cli_bin ${cli_args})"
else
  [[ "$enabled" == "true" ]] && echo "[FAIL] hyperframes CLI missing/unusable ($cli_bin ${cli_args})" || echo "[WARN] hyperframes CLI missing/unusable ($cli_bin ${cli_args})"
fi

if [[ "$enabled" != "true" && "$create_dirs" != "true" ]]; then
  echo "[SKIP] workdir/output dir checks skipped while render disabled"
  exit 0
fi

if [[ "$create_dirs" == "true" ]]; then
  mkdir -p "$workdir" "$outdir"
fi

[[ -d "$workdir" && -w "$workdir" ]] && echo "[OK] workdir writable ($workdir)" || { [[ "$enabled" == "true" ]] && echo "[FAIL] workdir not writable ($workdir)" || echo "[WARN] workdir not writable ($workdir)"; }
[[ -d "$outdir" && -w "$outdir" ]] && echo "[OK] output dir writable ($outdir)" || { [[ "$enabled" == "true" ]] && echo "[FAIL] output dir not writable ($outdir)" || echo "[WARN] output dir not writable ($outdir)"; }
