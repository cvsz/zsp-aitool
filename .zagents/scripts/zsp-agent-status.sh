#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="${ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$ROOT"
echo "== ZSP Agent Status =="
echo "root: $ROOT"
echo
for cmd in agy antigravity gemini codex claude node npm pnpm git python3; do
  if command -v "$cmd" >/dev/null 2>&1; then printf "%-12s %s\n" "$cmd:" "$(command -v "$cmd")"; else printf "%-12s %s\n" "$cmd:" "MISSING"; fi
done
echo
echo "== Git =="
git branch --show-current 2>/dev/null || true
git status --short || true
echo
echo "== Instruction docs =="
for f in GEMINI.md AGENTS.md CLAUDE.md .zagents/README.md .zagents/README-omnibus.md .zagents/GEMINI_CLI_COMMANDS.txt; do [ -f "$f" ] && echo "OK      $f" || echo "MISSING $f"; done
echo
echo "== Expected .zagents tree =="
for f in .zagents/CHECKSUMS.sha256 .zagents/GEMINI_CLI_COMMANDS.txt .zagents/README.md .zagents/README-omnibus.md .zagents/scripts/zsp-agent-status.sh .zagents/scripts/zsp-deep-dive.sh .zagents/zsp-agent-omnibus-oneclick.sh .zagents/zsp-omnibus-init-safe.sh; do [ -f "$f" ] && echo "OK      $f" || echo "MISSING $f"; done
echo
echo "== package.json =="
if [ -f package.json ]; then python3 -m json.tool package.json >/dev/null && echo "OK      package.json valid JSON" || echo "FAIL    package.json invalid JSON"; else echo "MISSING package.json"; fi
echo
echo "== Key scripts =="
python3 - <<'PY_STATUS' 2>/dev/null || true
import json
from pathlib import Path
p=Path('package.json')
if not p.exists(): raise SystemExit(0)
s=json.loads(p.read_text()).get('scripts',{})
for k in ['dev','build','start','typecheck','test','health','prisma:generate','hyperframes:doctor','hyperframes:queue-status','hyperframes:worker:watchdog']:
 print(('OK      ' if k in s else 'MISSING ')+k)
PY_STATUS
