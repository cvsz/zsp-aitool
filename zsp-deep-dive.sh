#!/usr/bin/env bash
set -Eeuo pipefail
REPORT="ZSP_DEEP_DIVE_REPORT.md"
{
  echo "# ZSP-AITOOL Deep Dive Report"
  echo
  echo "Generated: $(date -Is)"
  echo
  echo "## Git"
  git status --short || true
  echo
  echo "## Package"
  python3 -m json.tool package.json >/dev/null 2>&1 && echo "- OK: package.json" || echo "- CRITICAL: package.json invalid"
  echo
  echo "## Security"
  grep -RIn "dangerouslySetInnerHTML" src 2>/dev/null || echo "- OK: no dangerouslySetInnerHTML found"
  grep -RIn "DATABASE_URL\|CF_ACCESS_CLIENT_SECRET\|OPENAI_API_KEY\|SHOPEE_PARTNER_KEY" src 2>/dev/null || echo "- OK: no obvious secret env exposure in src"
  grep -RIn "outputPath\|/var/lib" src/app src/components 2>/dev/null || echo "- OK: no outputPath or /var/lib in UI"
  grep -RIn "systemctl" src/app src/components 2>/dev/null || echo "- OK: no systemctl in UI"
  echo
  echo "## Dashboard route tree"
  find src/app/dashboard -maxdepth 5 -name page.tsx | sort || true
} > "$REPORT"
echo "Deep Dive Complete. Review $REPORT."
