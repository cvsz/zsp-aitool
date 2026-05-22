#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="${ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$ROOT"
TS="$(date +%Y%m%d-%H%M%S)"
REPORT_DIR=".zagents/reports"
REPORT="$REPORT_DIR/ZSP_DEEP_DIVE_REPORT-$TS.md"
LATEST="$REPORT_DIR/ZSP_DEEP_DIVE_REPORT.latest.md"
mkdir -p "$REPORT_DIR"
{
  echo "# ZSP-AITOOL Full Repo + .zagents Deep Review"
  echo
  echo "Generated: $(date -Is)"
  echo "Root: $ROOT"
  echo
  echo "## 1. Git state"
  git remote -v 2>/dev/null | sed 's/^/- /' || true
  echo '```text'; git status --short || true; echo '```'
  echo
  echo "## 2. Package baseline"
  if [ -f package.json ]; then
    python3 -m json.tool package.json >/dev/null 2>&1 && echo "- OK: package.json is valid JSON" || echo "- FAIL: package.json is invalid JSON"
    python3 - <<'PY_DEEP'
import json
from pathlib import Path
data=json.loads(Path('package.json').read_text())
print(f"- name: {data.get('name')}")
print(f"- version: {data.get('version')}")
for pkg in ['next','react','react-dom','@prisma/client','zod']:
 print(f"- dependency {pkg}: {data.get('dependencies',{}).get(pkg,'MISSING')}")
print('\n### Key scripts')
s=data.get('scripts',{})
for k in ['dev','build','start','typecheck','test','health','prisma:generate','hyperframes:doctor','hyperframes:queue-status','hyperframes:worker:watchdog','ci:local-preflight']:
 print(('- OK: ' if k in s else '- MISSING: ')+k)
post=s.get('postbuild')
print('- OK: postbuild preserves scripts/fix-next-server-chunks.sh' if post=='bash scripts/fix-next-server-chunks.sh' else f'- WARN: postbuild unexpected: {post}')
PY_DEEP
  else echo "- FAIL: package.json missing"; fi
  echo
  echo "## 3. Instruction docs"
  for f in GEMINI.md AGENTS.md CLAUDE.md .zagents/README.md .zagents/README-omnibus.md .zagents/GEMINI_CLI_COMMANDS.txt; do [ -f "$f" ] && echo "- OK: $f" || echo "- WARN: $f missing"; done
  echo
  echo "## 4. .zagents integrity"
  for f in .zagents/CHECKSUMS.sha256 .zagents/GEMINI_CLI_COMMANDS.txt .zagents/README.md .zagents/README-omnibus.md .zagents/scripts/zsp-agent-status.sh .zagents/scripts/zsp-deep-dive.sh .zagents/zsp-agent-omnibus-oneclick.sh .zagents/zsp-omnibus-init-safe.sh; do [ -f "$f" ] && echo "- OK: $f" || echo "- FAIL: $f missing"; done
  if [ -f .zagents/CHECKSUMS.sha256 ]; then echo; echo "### Checksum validation"; (cd .zagents && sha256sum -c CHECKSUMS.sha256 2>&1 | sed 's/^/- /') || true; fi
  echo
  echo "## 5. Agent directories"
  for d in .agents .agents/rules .agents/workflows .codex .claude .zagents/scripts; do [ -d "$d" ] && echo "- OK: $d" || echo "- WARN: $d missing"; done
  echo
  echo "## 6. Security static scan"
  if [ -d src ]; then
    grep -RIn "dangerouslySetInnerHTML" src 2>/dev/null || echo "- OK: no dangerouslySetInnerHTML under src"
    grep -RInE "DATABASE_URL|CF_ACCESS_CLIENT_SECRET|OPENAI_API_KEY|SHOPEE_PARTNER_KEY|SECRET|TOKEN" src 2>/dev/null | head -80 || echo "- OK: no obvious secret/env references under src"
    grep -RInE "outputPath|/var/lib" src/app src/components 2>/dev/null | head -80 || echo "- OK: no obvious outputPath or /var/lib exposure in UI"
    grep -RIn "systemctl" src/app src/components 2>/dev/null || echo "- OK: no systemctl references in UI"
  else echo "- WARN: src directory missing"; fi
  echo
  echo "## 7. Dangerous command pattern scan"
  echo "### Strict Checks (src/app, src/components)"
  grep -RInE "rm -rf /|npm audit fix --force|terraform apply|tofu apply|prisma migrate deploy|systemctl (start|stop|enable|disable)" src/app src/components 2>/dev/null | head -120 || echo "- OK: no dangerous commands in UI code"
  echo
  echo "### Documentation & Runbooks (INFO)"
  grep -RInE "rm -rf /|npm audit fix --force|terraform apply|tofu apply|prisma migrate deploy|systemctl (start|stop|enable|disable)" docs 2>/dev/null | sed 's/^/- [INFO] /' | head -120 || echo "- OK: no findings in docs"
  echo
  echo "### Other files"
  grep -RInE "rm -rf /|npm audit fix --force|terraform apply|tofu apply|prisma migrate deploy|systemctl (start|stop|enable|disable)" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=coverage --exclude-dir=logs --exclude-dir=.agent --exclude-dir=app --exclude-dir=components --exclude-dir=docs --exclude="ECC_REVIEW_REPORT.md" --exclude="*.log" 2>/dev/null | head -120 || echo "- OK: no obvious dangerous command patterns found elsewhere"
  echo
  echo "## 8. UI Phase 1 files"
  for f in src/components/layout/AppLayout.tsx src/components/layout/Sidebar.tsx src/components/layout/Header.tsx src/components/layout/MobileNav.tsx src/app/dashboard/page.tsx; do [ -f "$f" ] && echo "- OK: $f" || echo "- WARN: $f missing"; done
  echo
  echo "## 9. UI Phase 2 Admin routes"
  for f in src/app/dashboard/admin/page.tsx src/app/dashboard/admin/users/page.tsx src/app/dashboard/admin/products/page.tsx src/app/dashboard/admin/content/page.tsx src/app/dashboard/admin/renders/page.tsx src/app/dashboard/admin/system/page.tsx src/app/dashboard/admin/audit-logs/page.tsx src/app/dashboard/admin/settings/page.tsx; do [ -f "$f" ] && echo "- OK: $f" || echo "- WARN: $f missing"; done
  echo
  echo "## 10. UI Phase 3 HyperFrames routes"
  for f in src/app/dashboard/hyperframes/page.tsx src/app/dashboard/hyperframes/renders/page.tsx src/app/dashboard/hyperframes/batch/page.tsx src/app/dashboard/hyperframes/ops/page.tsx src/app/dashboard/hyperframes/ops/queue/page.tsx; do [ -f "$f" ] && echo "- OK: $f" || echo "- WARN: $f missing"; done
  echo
  echo "## 11. Dashboard route tree"
  echo '```text'; [ -d src/app/dashboard ] && find src/app/dashboard -maxdepth 6 -name page.tsx | sort || true; echo '```'
  echo
  echo "## 12. Root clutter"
  echo '```text'; find . -maxdepth 1 -type f | sed 's#^./##' | sort; echo '```'
  echo
  echo "## 13. Recommended next action"
  if [ ! -f src/app/dashboard/admin/page.tsx ]; then echo "- Next: implement UI Phase 2 Admin Panel Foundation."; elif [ ! -f src/app/dashboard/hyperframes/ops/queue/page.tsx ]; then echo "- Next: implement UI Phase 3 HyperFrames Operator UI Polish."; else echo "- Next: run full validation and production smoke review."; fi
} > "$REPORT"
cp "$REPORT" "$LATEST"
echo "Deep review complete:"
echo "  $REPORT"
echo "  $LATEST"
