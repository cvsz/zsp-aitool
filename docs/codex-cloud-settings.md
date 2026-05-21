# Codex Cloud Settings — zsp-aitool

Use this to update the Codex Cloud environment for `cvsz/zsp-aitool`.

This file was generated after reviewing `docs/codex-setup.log`. Current blockers observed there:

- `npx prisma generate` / `npx prisma validate` can fail because `prisma/schema.prisma` references `AIContentQueueJob` from `User` and `Product`, but the model is missing.
- Typecheck can fail because code references Prisma delegates that are missing from the generated client: `adminAuditLog`, `exportJob`, and `aIContentQueueJob`.
- Admin audit/observability dashboard pages have strict TypeScript issues such as implicit `any` or `unknown` values.
- Codex maintenance cannot assume systemd is available, so `systemctl` operations must be skipped in Codex.

## General Custom instructions

```text
You are working in repository cvsz/zsp-aitool.

Operate production-safely. Make the smallest correct patch for the requested phase. Prefer focused commits with clear messages.

Do not weaken auth, user/tenant isolation, admin gates, security scans, Shopee compliance controls, Marqeta sandbox-only controls, HyperFrames safety, or quota/budget controls.

Never commit or print secrets. Do not expose DATABASE_URL, API keys, access tokens, refresh tokens, cookies, session data, Authorization headers, webhook secrets, password hashes, browser credentials, /home paths, /var/lib paths, or raw stack traces in UI/API/test output.

Never use destructive production DB commands. Do not run prisma migrate reset, prisma db push --force-reset, DROP TABLE, TRUNCATE, or data-loss cleanup unless explicitly requested and guarded for a non-production database.

When adding Prisma relation fields, add the model, back-relations, migration, tests, and package test inclusion. Run prisma generate and prisma validate.

When editing dynamic Next.js App Router routes on Next.js 15, use async params typing, for example context: { params: Promise<{ id: string }> } and const { id } = await context.params.

All user-data API routes require auth and must scope data to request.auth.userId. Admin routes must use existing admin guard patterns.

For large CSV/Product Feed work, stream files line by line. Do not read multi-GB files into memory.

For Shopee work, do not automate Shopee portal login, store Shopee cookies/sessions/localStorage, scrape private dashboards, or bypass CAPTCHA/anti-bot/rate limits.

For Marqeta work, keep sandbox-only by default. Do not issue real cards or move real funds.

For AI/OCR work, tests must mock providers and must not call real external providers.

Always add/update tests for changed behavior. Add new test files to package.json scripts.test without removing existing tests.

Before final response, run the strongest feasible verification: package JSON validation, prisma generate/validate when schema should be valid, typecheck, focused tests, npm run test, and npm run build when practical.

Current blockers to prioritize:
1. Missing Prisma model AIContentQueueJob while User/Product reference aiContentQueueJobs.
2. Missing generated Prisma delegates: prisma.adminAuditLog, prisma.exportJob, prisma.aIContentQueueJob.
3. Invalid Next.js 15 route params typing in dynamic API routes.
4. Strict TypeScript issues in admin audit/observability pages.

Final response must include verdict, summary, files changed, commands run with PASS/WARN/FAIL, blocking issues, remaining risks, commit hash, and whether production bash start.sh is expected to pass.
```

## Environment variables

Paste as normal variables, not secrets:

```bash
NODE_ENV=development
CI=true
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_APP_NAME=zsp-aitool
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
AI_DAILY_BUDGET_USD=20
AI_MAX_REQUESTS_PER_MINUTE=30
OCR_MAX_REQUESTS_PER_MINUTE=20
HYPERFRAMES_RENDER_ENABLED=false
HYPERFRAMES_SOCIAL_EXPORT_ENABLED=false
HYPERFRAMES_TTS_ENABLED=false
HYPERFRAMES_WORKDIR=/tmp/zsp-aitool/hyperframes
HYPERFRAMES_OUTPUT_DIR=/tmp/zsp-aitool/hyperframes/renders
HYPERFRAMES_MAX_DURATION_SECONDS=60
HYPERFRAMES_MAX_CONCURRENT_JOBS=1
HYPERFRAMES_NODE_BIN=node
HYPERFRAMES_FFMPEG_BIN=ffmpeg
HYPERFRAMES_CLI_BIN=npx
HYPERFRAMES_CLI_ARGS=hyperframes
HYPERFRAMES_ALLOWED_QUALITY_PROFILES=preview,standard,high
HYPERFRAMES_HIGH_QUALITY_ENABLED=false
HYPERFRAMES_SIGNED_DOWNLOADS_ENABLED=false
HYPERFRAMES_DOWNLOAD_TOKEN_TTL_SECONDS=300
HYPERFRAMES_DOCTOR_CREATE_DIRS=false
HYPERFRAMES_OPERATOR_STATUS_ENABLED=false
HYPERFRAMES_METRICS_ENABLED=false
HYPERFRAMES_WATCHDOG_STALE_RUNNING_MINUTES=30
HYPERFRAMES_WATCHDOG_MAX_FAILED_LAST_24H=5
HYPERFRAMES_WATCHDOG_MAX_PENDING_JOBS=25
HYPERFRAMES_WATCHDOG_MIN_FREE_MB=2048
HYPERFRAMES_WATCHDOG_REQUIRE_SERVICE_ACTIVE=false
HYPERFRAMES_WATCHDOG_RECOVER_STALE=false
HYPERFRAMES_CLEANUP_DRY_RUN=true
HYPERFRAMES_DEFAULT_MONTHLY_RENDER_QUOTA=50
HYPERFRAMES_DEFAULT_STORAGE_QUOTA_MB=1024
HYPERFRAMES_DEFAULT_RETENTION_DAYS=14
ADMIN_PANEL_ENABLED=true
SHOPEE_OPEN_API_ENABLED=false
SHOPEE_OPEN_API_ENV=sandbox
SHOPEE_AFFILIATE_AUTH_URL=https://affiliate.shopee.co.th/
MARQETA_ENABLED=false
MARQETA_ENV=sandbox
MARQETA_BASE_URL=https://sandbox-api.marqeta.com/v3
MARQETA_CONNECTIVITY_CHECK_ENABLED=false
MARQETA_TIMEOUT_MS=10000
MARQETA_MAX_RETRIES=2
```

## Environment Secrets

Configure these as Codex Cloud secrets only. Use safe disposable/dev values unless a task explicitly requires a real provider:

```bash
AUTH_SECRET=<strong-random-dev-secret>
DATABASE_URL=<codex-postgres-url-or-safe-dev-postgres-url>
SHADOW_DATABASE_URL=<codex-shadow-postgres-url-if-migrations-run>
OPENAI_API_KEY=<optional-only-if-task-needs-real-openai>
HYPERFRAMES_DOWNLOAD_TOKEN_SECRET=<strong-random-dev-secret>
HYPERFRAMES_INTERNAL_TOKEN=<strong-random-dev-secret>
SHOPEE_PARTNER_ID=<optional-empty-or-sandbox>
SHOPEE_PARTNER_KEY=<optional-empty-or-sandbox>
SHOPEE_API_BASE_URL=<optional-empty-or-sandbox>
SHOPEE_AUTH_BASE_URL=<optional-empty-or-sandbox>
SHOPEE_REDIRECT_URL=<optional-empty-or-sandbox>
SHOPEE_WEBHOOK_SECRET=<optional-empty-or-sandbox>
MARQETA_APPLICATION_TOKEN=<optional-empty-or-sandbox>
MARQETA_ADMIN_ACCESS_TOKEN=<optional-empty-or-sandbox>
```

PostgreSQL is required for Prisma. Do not use SQLite URLs because the Prisma datasource provider is PostgreSQL.

## Environment Setup script

```bash
#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

log() { printf '[OK] %s\n' "$*"; }
warn() { printf '[WARN] %s\n' "$*"; }
run_soft() { local label="$1"; shift; log "$label"; "$@" && log "$label completed" || warn "$label failed; continuing so Codex can inspect/fix"; }

cd "${CODEX_REPO_DIR:-$PWD}"

export CI="${CI:-true}"
export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED:-1}"
export NODE_ENV="${NODE_ENV:-development}"
export NEXT_PUBLIC_APP_NAME="${NEXT_PUBLIC_APP_NAME:-zsp-aitool}"
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3001}"
export NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-http://localhost:3001/api}"
export HYPERFRAMES_RENDER_ENABLED="${HYPERFRAMES_RENDER_ENABLED:-false}"
export HYPERFRAMES_WORKDIR="${HYPERFRAMES_WORKDIR:-/tmp/zsp-aitool/hyperframes}"
export HYPERFRAMES_OUTPUT_DIR="${HYPERFRAMES_OUTPUT_DIR:-/tmp/zsp-aitool/hyperframes/renders}"
export HYPERFRAMES_CLEANUP_DRY_RUN="${HYPERFRAMES_CLEANUP_DRY_RUN:-true}"
export HYPERFRAMES_WATCHDOG_REQUIRE_SERVICE_ACTIVE="${HYPERFRAMES_WATCHDOG_REQUIRE_SERVICE_ACTIVE:-false}"
export SHOPEE_OPEN_API_ENABLED="${SHOPEE_OPEN_API_ENABLED:-false}"
export SHOPEE_OPEN_API_ENV="${SHOPEE_OPEN_API_ENV:-sandbox}"
export SHOPEE_AFFILIATE_AUTH_URL="${SHOPEE_AFFILIATE_AUTH_URL:-https://affiliate.shopee.co.th/}"
export MARQETA_ENABLED="${MARQETA_ENABLED:-false}"
export MARQETA_ENV="${MARQETA_ENV:-sandbox}"
export MARQETA_BASE_URL="${MARQETA_BASE_URL:-https://sandbox-api.marqeta.com/v3}"
export MARQETA_CONNECTIVITY_CHECK_ENABLED="${MARQETA_CONNECTIVITY_CHECK_ENABLED:-false}"

mkdir -p "$HYPERFRAMES_WORKDIR" "$HYPERFRAMES_OUTPUT_DIR" /tmp/zsp-aitool/imports /tmp/zsp-aitool/exports
npm config delete http-proxy >/dev/null 2>&1 || true
npm config delete proxy >/dev/null 2>&1 || true
npm config delete https-proxy >/dev/null 2>&1 || true

python3 -m json.tool package.json >/tmp/zsp-package-json-ok.json
if [[ -f package-lock.json ]]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi
if [[ -d extension && -f extension/package.json ]]; then (cd extension && npm install --legacy-peer-deps); fi
if [[ -f prisma/schema.prisma ]]; then run_soft 'Generating Prisma client' npx prisma generate; run_soft 'Validating Prisma schema' npx prisma validate; fi

printf 'CODEX_SETUP_READY=true\n'
```

## Environment Maintenance setup script

```bash
#!/usr/bin/env bash
set -Euo pipefail
IFS=$'\n\t'

log() { printf '[OK] %s\n' "$*"; }
warn() { printf '[WARN] %s\n' "$*"; }
section() { printf '\n[INFO] %s\n' "$*"; }
run_soft() { local label="$1"; shift; section "$label"; "$@" && log "$label PASS" || warn "$label FAIL"; }

cd "${CODEX_REPO_DIR:-$PWD}"
export CI="${CI:-true}"
export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED:-1}"
export NODE_ENV="${NODE_ENV:-development}"
export HYPERFRAMES_RENDER_ENABLED="${HYPERFRAMES_RENDER_ENABLED:-false}"
export HYPERFRAMES_WORKDIR="${HYPERFRAMES_WORKDIR:-/tmp/zsp-aitool/hyperframes}"
export HYPERFRAMES_OUTPUT_DIR="${HYPERFRAMES_OUTPUT_DIR:-/tmp/zsp-aitool/hyperframes/renders}"
export HYPERFRAMES_CLEANUP_DRY_RUN="${HYPERFRAMES_CLEANUP_DRY_RUN:-true}"
export HYPERFRAMES_WATCHDOG_REQUIRE_SERVICE_ACTIVE="${HYPERFRAMES_WATCHDOG_REQUIRE_SERVICE_ACTIVE:-false}"
mkdir -p "$HYPERFRAMES_WORKDIR" "$HYPERFRAMES_OUTPUT_DIR"

section 'Git status'
git status --short || true
git log --oneline -n 8 || true

section 'Systemd policy'
if command -v systemctl >/dev/null 2>&1 && [[ -d /run/systemd/system ]]; then systemctl is-system-running --no-pager || true; else warn 'systemd unavailable in Codex; skipping systemctl'; fi

run_soft 'package.json validation' python3 -m json.tool package.json
if [[ -f package-lock.json ]]; then run_soft 'npm ci' npm ci --legacy-peer-deps; else run_soft 'npm install' npm install --legacy-peer-deps; fi
if [[ -f prisma/schema.prisma ]]; then run_soft 'prisma generate' npx prisma generate; run_soft 'prisma validate' npx prisma validate; run_soft 'prisma migrate status' npx prisma migrate status --schema prisma/schema.prisma; fi
if npm run | grep -q 'db:schema-drift-check'; then run_soft 'db:schema-drift-check' npm run db:schema-drift-check; fi
run_soft 'typecheck' npm run typecheck
run_soft 'test' npm run test
run_soft 'build' npm run build
if npm run | grep -q 'monitor:backend'; then run_soft 'backend monitor' npm run monitor:backend; fi

section 'Known blocker scan'
grep -RniE 'AIContentQueueJob\[\]|aIContentQueueJob|adminAuditLog|exportJob|params: \{ id: string \}' prisma src scripts tests 2>/dev/null || true

section 'Secret/path leakage scan'
grep -RniE 'DATABASE_URL=|OPENAI_API_KEY=|AUTH_SECRET=|SHOPEE_PARTNER_KEY=|MARQETA_ADMIN_ACCESS_TOKEN=|Authorization: Bearer|/home/[^[:space:]]+|/var/lib/[^[:space:]]+' src app scripts tests docs 2>/dev/null || true

printf '\nCODEX_MAINTENANCE_READY=true\n'
```

## Immediate Codex task prompt

```text
Fix current cvsz/zsp-aitool Codex/build blockers found in docs/codex-setup.log.

Observed failures:
1. npx prisma generate and npx prisma validate fail because prisma/schema.prisma has aiContentQueueJobs AIContentQueueJob[] on User/Product, but model AIContentQueueJob is missing.
2. Typecheck fails because code references missing Prisma delegates: prisma.adminAuditLog, prisma.exportJob, and prisma.aIContentQueueJob.
3. Typecheck reports implicit any/unknown types in admin audit logs and observability dashboard pages.
4. Earlier build failed on invalid Next.js 15 dynamic route handler params typing in src/app/api/ai/content-queue/[id]/cancel/route.ts.

Required fix:
- Restore/add Prisma models and migrations for AIContentQueueJob, ExportJob, AdminAuditLog, and ObservabilityEvent if code references them.
- Prefer restoring models because phases added those features.
- Regenerate Prisma client successfully.
- Fix Next.js 15 route handler params typing for dynamic routes.
- Fix dashboard TypeScript any/unknown errors.
- Add/update tests and package script inclusion.
- Run npm run prisma:generate, npx prisma validate, npm run typecheck, npm run test, and npm run build.
- Do not drop data, reset DB, weaken auth, or expose secrets.

Commit message:
fix(schema): restore queued feature models and route typing
```
