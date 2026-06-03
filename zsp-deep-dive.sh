#!/usr/bin/env bash
set -Eeuo pipefail
REPORT="ZSP_DEEP_DIVE_REPORT.md"
{
echo "# ZSP-AITOOL Deep Dive Scanner Report"
echo "Generated: $(date -Is)"
echo
echo "## Security & Hard Constraints Audit"
if grep -RIn "dangerouslySetInnerHTML" src 2>/dev/null; then echo "- ⚠️ WARNING: dangerouslySetInnerHTML found."; else echo "- ✅ OK: no dangerouslySetInnerHTML."; fi
if grep -RIn "DATABASE_URL|CF_ACCESS_CLIENT_SECRET|OPENAI_API_KEY" src 2>/dev/null; then echo "- ⚠️ WARNING: possible secret exposure."; else echo "- ✅ OK: no obvious secrets."; fi
if grep -RIn "systemctl" src/app src/components 2>/dev/null; then echo "- 🛑 CRITICAL: systemctl reference found."; else echo "- ✅ OK: no systemctl references."; fi
echo
echo "## UI Route Tree Verification"
find src/app/dashboard -maxdepth 4 -name page.tsx | sort || true
echo
echo "## Internal Modules Found"
find src/services src/lib -maxdepth 2 -type f | sort || true
} > "$REPORT"
echo "Deep Dive Complete. Review $REPORT."
