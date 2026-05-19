#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FAILURES=0
WARNINGS=0

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; WARNINGS=$((WARNINGS + 1)); }
fail() { echo "[FAIL] $*"; FAILURES=$((FAILURES + 1)); }
skip() { echo "[SKIP] $*"; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1
}

check_http_code() {
  local url="$1"
  local code
  code="$(curl -sS -o /dev/null -w "%{http_code}" --max-time 8 "$url" || true)"
  if [[ "$code" =~ ^(200|307|308)$ ]]; then
    ok "$url returned HTTP $code"
    return 0
  fi
  if [[ "$code" == "000" ]]; then
    fail "$url is unreachable"
    return 1
  fi
  fail "$url returned unexpected HTTP $code"
  return 1
}

check_public_code() {
  local url="$1"
  local headers code
  headers="$(curl -sS -I --max-time 12 "$url" || true)"
  code="$(awk 'toupper($1) ~ /^HTTP\// {c=$2} END{print c}' <<<"$headers")"
  if [[ "$code" =~ ^(200|307|308)$ ]]; then
    ok "$url returned HTTP $code"
    return 0
  fi
  if grep -qi 'cf-mitigated: challenge' <<<"$headers"; then
    warn "$url returned Cloudflare challenge (HTTP ${code:-unknown}); treating as environment/network edge"
    return 0
  fi
  if [[ -z "$code" ]]; then
    warn "$url did not return a parseable HTTP status"
    return 0
  fi
  warn "$url returned HTTP $code"
  return 0
}

is_port_listening() {
  if require_cmd ss; then
    ss -ltn '( sport = :3001 )' | awk 'NR>1{found=1} END{exit !found}'
    return $?
  fi
  if require_cmd lsof; then
    lsof -iTCP:3001 -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi
  return 1
}

# 1) package.json valid JSON
if node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))" >/dev/null 2>&1; then
  ok "package.json is valid JSON"
else
  fail "package.json is not valid JSON"
fi

# 2) fix-next-server-chunks script exists and executable
if [[ -f scripts/fix-next-server-chunks.sh ]]; then
  ok "scripts/fix-next-server-chunks.sh exists"
else
  fail "scripts/fix-next-server-chunks.sh is missing"
fi
if [[ -x scripts/fix-next-server-chunks.sh ]]; then
  ok "scripts/fix-next-server-chunks.sh is executable"
else
  fail "scripts/fix-next-server-chunks.sh is not executable"
fi

# 3) .next chunk symlinks check (if build artifacts exist)
if [[ -d .next/server/chunks ]]; then
  sample_chunk="$(find .next/server/chunks -maxdepth 1 -type f -name '*.js' | head -n 1 || true)"
  if [[ -n "$sample_chunk" ]]; then
    sample_name="$(basename "$sample_chunk")"
    linked_path=".next/server/$sample_name"
    if [[ -L "$linked_path" ]]; then
      target="$(readlink "$linked_path")"
      if [[ "$target" == "chunks/$sample_name" ]]; then
        ok "Next.js server chunk symlink exists for $sample_name"
      else
        fail "Symlink target mismatch for $linked_path (got: $target)"
      fi
    else
      fail "Expected symlink missing: $linked_path"
    fi
  else
    warn "No .js files found in .next/server/chunks"
  fi
else
  skip ".next/server/chunks not found (run npm run build first)"
fi

# 4) branding check
brand_hits="$(grep -RniE "ShopeeLeaz|Shopee Leaz|shopeeleaz|SHOPEELEAZ" src prisma scripts README.md package.json .env.example extension --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=.git --exclude='*.bak' --exclude='*.bak.*' 2>/dev/null | grep -v "^scripts/health-zsp-aitool.sh:" || true)"
if [[ -n "$brand_hits" ]]; then
  fail "Old branding references found in app/runtime files"
  echo "$brand_hits"
else
  ok "No old branding references found in app/runtime files"
fi

# 5) local endpoints only when 3001 listening
if is_port_listening; then
  ok "Port 3001 is listening; checking local endpoints"
  check_http_code "http://127.0.0.1:3001"
  check_http_code "http://127.0.0.1:3001/dashboard"
  check_http_code "http://127.0.0.1:3001/dashboard/products"
else
  skip "Port 3001 is not listening in this environment; skipping local endpoint checks"
fi

# 6) public endpoints (Cloudflare challenge => WARN)
check_public_code "https://studio.zeaz.dev/"
check_public_code "https://studio.zeaz.dev/dashboard"
check_public_code "https://studio.zeaz.dev/dashboard/products"

# 7) systemd only if usable
if require_cmd systemctl && [[ -d /run/systemd/system ]]; then
  status="$(systemctl is-active zsp-aitool 2>/dev/null || true)"
  if [[ "$status" == "active" ]]; then
    ok "zsp-aitool service is active"
  else
    fail "zsp-aitool service is not active (status: ${status:-unknown})"
  fi
else
  skip "systemctl/systemd not usable in this environment; skipping service check"
fi

# 8) prisma migration status only when DB URL set and reachable
DATABASE_URL_VALUE="${DATABASE_URL:-}"
if [[ -z "$DATABASE_URL_VALUE" && -f .env ]]; then
  DATABASE_URL_VALUE="$(awk -F= '/^DATABASE_URL=/{sub(/^DATABASE_URL=/,""); print; exit}' .env)"
fi

if [[ -z "$DATABASE_URL_VALUE" ]]; then
  skip "DATABASE_URL not set; skipping Prisma migration status"
else
  db_host_port="$(DATABASE_URL_VALUE="$DATABASE_URL_VALUE" python3 - <<'PY'
import os
from urllib.parse import urlparse
u=os.environ.get('DATABASE_URL_VALUE','')
try:
    p=urlparse(u)
    host=p.hostname or ''
    port=p.port or 5432
    print(f"{host}:{port}" if host else '')
except Exception:
    print('')
PY
)"
  if [[ -z "$db_host_port" ]]; then
    warn "Could not parse DATABASE_URL host/port; skipping connectivity precheck"
  fi

  db_host="${db_host_port%%:*}"
  db_port="${db_host_port##*:}"
  if [[ -n "$db_host" ]] && (timeout 2 bash -c "</dev/tcp/$db_host/$db_port" >/dev/null 2>&1); then
    if npx prisma migrate status >/dev/null 2>&1; then
      ok "Prisma migration status check passed"
    else
      fail "Prisma migration status reported an error"
    fi
  else
    skip "Database ${db_host:-unknown}:${db_port:-unknown} unreachable; skipping Prisma migration status"
  fi
fi


# 9) read-only UserSetting schema drift check when DB is reachable
if [[ -z "$DATABASE_URL_VALUE" ]]; then
  skip "DATABASE_URL not set; skipping UserSetting schema drift check"
else
  if [[ -n "$db_host" ]] && (timeout 2 bash -c "</dev/tcp/$db_host/$db_port" >/dev/null 2>&1); then
    if npm run db:schema-drift-check >/dev/null 2>&1; then
      ok "UserSetting schema drift check passed"
    else
      fail "UserSetting schema drift check failed (schema drift or check error)"
    fi
  else
    skip "Database ${db_host:-unknown}:${db_port:-unknown} unreachable; skipping UserSetting schema drift check"
  fi
fi

if (( FAILURES > 0 )); then
  echo "[FAIL] Health check completed with $FAILURES failure(s) and $WARNINGS warning(s)."
  exit 1
fi

echo "[OK] Health check completed with 0 failures and $WARNINGS warning(s)."
exit 0
