#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="${ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$ROOT"
echo "== zsp-omnibus-init-safe =="
mkdir -p .zagents/scripts .zagents/reports
chmod +x .zagents/scripts/zsp-agent-status.sh .zagents/scripts/zsp-deep-dive.sh .zagents/zsp-agent-omnibus-oneclick.sh .zagents/zsp-omnibus-init-safe.sh 2>/dev/null || true
touch .gitignore
for line in "" "# .zagents runtime reports" ".zagents/reports/*.tmp" ".zagents/reports/*.log" ".zagents/reports/ZSP_DEEP_DIVE_REPORT-*.md" "AGENTS.md.bak.*" "CLAUDE.md.bak.*" "GEMINI.md.bak.*" "*.bak.*"; do grep -qxF "$line" .gitignore || echo "$line" >> .gitignore; done
(cd .zagents && sha256sum GEMINI_CLI_COMMANDS.txt README.md README-omnibus.md scripts/zsp-agent-status.sh scripts/zsp-deep-dive.sh zsp-agent-omnibus-oneclick.sh zsp-omnibus-init-safe.sh > CHECKSUMS.sha256)
echo "Updated .zagents/CHECKSUMS.sha256"
.zagents/scripts/zsp-agent-status.sh
