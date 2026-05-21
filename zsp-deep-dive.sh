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
  if python3 -m json.tool package.json >/dev/null 2>&1; then
    echo "- OK: package.json is valid JSON."
  else
    echo "- CRITICAL: package.json is invalid JSON."
  fi
  echo

  echo "## Security Audit"

  if grep -RIn "dangerouslySetInnerHTML" src 2>/dev/null; then
    echo "- WARNING: dangerouslySetInnerHTML found in src."
  else
    echo "- OK: no dangerouslySetInnerHTML found in src."
  fi

  if grep -RIn "DATABASE_URL\|CF_ACCESS_CLIENT_SECRET\|OPENAI_API_KEY\|SHOPEE_PARTNER_KEY" src 2>/dev/null; then
    echo "- WARNING: possible secret/env exposure found in src."
  else
    echo "- OK: no obvious secret env exposure in src."
  fi

  if grep -RIn "outputPath\|/var/lib" src/app src/components 2>/dev/null; then
    echo "- WARNING: local render path exposure found in UI."
  else
    echo "- OK: no outputPath or /var/lib in UI."
  fi

  if grep -RIn "systemctl" src/app src/components 2>/dev/null; then
    echo "- CRITICAL: systemctl reference found in UI."
  else
    echo "- OK: no systemctl references in UI."
  fi

  echo
  echo "## UI Phase 1 files"
  for path in \
    src/components/layout/AppLayout.tsx \
    src/components/layout/Sidebar.tsx \
    src/components/layout/Header.tsx \
    src/components/layout/MobileNav.tsx \
    src/app/dashboard/page.tsx
  do
    [ -e "$path" ] && echo "- OK: $path" || echo "- MISSING: $path"
  done

  echo
  echo "## UI Phase 2 admin routes"
  for path in \
    src/app/dashboard/admin/page.tsx \
    src/app/dashboard/admin/users/page.tsx \
    src/app/dashboard/admin/products/page.tsx \
    src/app/dashboard/admin/content/page.tsx \
    src/app/dashboard/admin/renders/page.tsx \
    src/app/dashboard/admin/system/page.tsx \
    src/app/dashboard/admin/audit-logs/page.tsx \
    src/app/dashboard/admin/settings/page.tsx
  do
    [ -e "$path" ] && echo "- OK: $path" || echo "- MISSING: $path"
  done

  echo
  echo "## UI Phase 3 HyperFrames routes"
  for path in \
    src/app/dashboard/hyperframes/page.tsx \
    src/app/dashboard/hyperframes/renders/page.tsx \
    src/app/dashboard/hyperframes/batch/page.tsx \
    src/app/dashboard/hyperframes/ops/page.tsx \
    src/app/dashboard/hyperframes/ops/queue/page.tsx
  do
    [ -e "$path" ] && echo "- OK: $path" || echo "- MISSING: $path"
  done

  echo
  echo "## Dashboard route tree"
  find src/app/dashboard -maxdepth 5 -name page.tsx | sort || true

  echo
  echo "## Suggested next step"
  if [ ! -e "src/app/dashboard/admin/page.tsx" ]; then
    echo "- Next: UI Phase 2 — Admin Panel Foundation."
  elif [ ! -e "src/app/dashboard/hyperframes/ops/queue/page.tsx" ]; then
    echo "- Next: UI Phase 3 — HyperFrames Operator UI Polish."
  else
    echo "- Next: full audit and production integration for studio.zeaz.dev."
  fi
} > "$REPORT"

echo "Deep Dive Complete. Review ${REPORT}."
