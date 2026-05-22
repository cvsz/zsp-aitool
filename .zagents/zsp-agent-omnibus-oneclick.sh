#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="${ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$ROOT"
echo "== zsp-agent-omnibus-oneclick =="
mkdir -p .agents/rules .agents/workflows .agents/agents .agents/reports .codex/prompts .codex/scripts .claude/commands .claude/agents .zagents/reports
write_if_missing(){ local path="$1"; if [ -f "$path" ]; then echo "exists: $path"; return 0; fi; mkdir -p "$(dirname "$path")"; cat > "$path"; echo "wrote: $path"; }
write_if_missing .agents/rules/00-zsp-constitution.md <<'EOF_RULE'
# ZSP-AITool Constitution
Runtime: local http://127.0.0.1:3001, public https://studio.zeaz.dev. Cloudflare 403 challenge is WARN.
Hard safety: no secrets/tokens/DATABASE_URL, no outputPath or /var/lib, no systemctl controls in UI, no dangerouslySetInnerHTML for user-controlled content.
EOF_RULE
write_if_missing .agents/workflows/zsp-ui-phase-status.md <<'EOF_WORKFLOW'
# zsp-ui-phase-status
Inspect UI phase status without editing files. Return current phase, missing files, risks, and next action.
EOF_WORKFLOW
write_if_missing .agents/workflows/zsp-admin-phase.md <<'EOF_WORKFLOW'
# zsp-admin-phase
Implement UI Phase 2 Admin Panel Foundation safely. Required routes: admin, users, products, content, renders, system, audit-logs, settings. Run validation after edits.
EOF_WORKFLOW
write_if_missing .codex/prompts/ui-phase-status.md <<'EOF_PROMPT'
Read GEMINI.md, AGENTS.md, CLAUDE.md, and .agents/workflows/zsp-ui-phase-status.md. Execute workflow. Do not edit files.
EOF_PROMPT
write_if_missing .claude/commands/zsp-status.md <<'EOF_CLAUDE'
Read CLAUDE.md, AGENTS.md, GEMINI.md, and .agents/workflows/zsp-ui-phase-status.md. Execute workflow. Do not edit files.
EOF_CLAUDE
if [ ! -f AGENTS.md ]; then cat > AGENTS.md <<'EOF_AGENTS'
# AGENTS.md — zsp-aitool
Repository: cvsz/zsp-aitool. Local: http://127.0.0.1:3001. Public: https://studio.zeaz.dev. Cloudflare 403 is WARN. Do not expose secrets, DATABASE_URL, tokens, outputPath, /var/lib, raw stack traces. No systemctl UI. No dangerouslySetInnerHTML. Validate with prisma:generate, typecheck, test, build, health.
EOF_AGENTS
fi
if [ ! -f CLAUDE.md ]; then cat > CLAUDE.md <<'EOF_CLAUDE_MD'
# CLAUDE.md — zsp-aitool
Follow GEMINI.md and AGENTS.md. Keep Thai-first UI, safe admin/operator UI, no secrets, no outputPath, no /var/lib, no systemctl controls, no dangerouslySetInnerHTML.
EOF_CLAUDE_MD
fi
.zagents/zsp-omnibus-init-safe.sh
.zagents/scripts/zsp-deep-dive.sh
echo "Complete. Commit: git add .zagents .agents .codex .claude AGENTS.md CLAUDE.md .gitignore && git commit -m 'chore: refresh zsp agent control pack'"
