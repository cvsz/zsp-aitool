#!/usr/bin/env bash
set -Eeuo pipefail
echo "== CLIs =="
echo "agy:    $(command -v agy || true)"
echo "codex:  $(command -v codex || true)"
echo "claude: $(command -v claude || true)"
echo
echo "== Project =="
pwd
git branch --show-current 2>/dev/null || true
git status --short || true
echo
echo "== Agent files =="
find .agents .codex .claude -maxdepth 4 -type f 2>/dev/null | sort || true
echo
python3 -m json.tool package.json >/dev/null && echo "package.json OK"
