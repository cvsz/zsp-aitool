#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/zsp-aitool}"
OUTPUT_DIR="${HYPERFRAMES_OUTPUT_DIR:-/var/lib/zsp-aitool/hyperframes/renders}"

REAL_SMOKE=false
JOB_SMOKE=false
AUTO_USER=false

for arg in "$@"; do
  case "$arg" in
    --real-smoke) REAL_SMOKE=true ;;
    --job-smoke) JOB_SMOKE=true ;;
    --auto-user) AUTO_USER=true ;;
    -h|--help)
      cat <<'EOF'
Usage:
  bash scripts/hyperframes/test-hyperframes-render.sh
  bash scripts/hyperframes/test-hyperframes-render.sh --real-smoke
  HYPERFRAMES_SMOKE_USER_ID=<user-id> bash scripts/hyperframes/test-hyperframes-render.sh --job-smoke
  bash scripts/hyperframes/test-hyperframes-render.sh --job-smoke --auto-user

Default:
  Runs safe baseline only. Does not enable rendering.

Options:
  --real-smoke  Run one explicitly gated render-smoke command.
  --job-smoke   Enqueue one DB-backed smoke job and process it once.
  --auto-user   Use first existing DB user for job-smoke if HYPERFRAMES_SMOKE_USER_ID is not set.

Safety:
  This script never changes .env to enable rendering permanently.
  Rendering is enabled only inline for one command when --real-smoke or --job-smoke is used.
EOF
      exit 0
      ;;
    *)
      echo "[FAIL] Unknown argument: $arg"
      exit 2
      ;;
  esac
done

ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
fail() { echo "[FAIL] $*"; exit 1; }
skip() { echo "[SKIP] $*"; }

resolve_cli_bin() { echo "${HYPERFRAMES_CLI_BIN:-npx}"; }
resolve_cli_args() { echo "${HYPERFRAMES_CLI_ARGS:--y hyperframes}"; }


cd "$APP_DIR"

ok "Running in $APP_DIR"

if [[ ! -f package.json ]]; then
  fail "package.json not found"
fi

if [[ ! -f .env ]]; then
  warn ".env not found; commands relying on DATABASE_URL may fail"
fi

ok "Checking persistent render flag"
if grep -q '^HYPERFRAMES_RENDER_ENABLED=true' .env 2>/dev/null; then
  fail ".env has HYPERFRAMES_RENDER_ENABLED=true. Keep persistent render disabled."
fi

ok "Baseline verification"
npm ci
npm run prisma:generate
npm run typecheck
npm run test
npm run build
npm run health
npm run hyperframes:doctor
npm run hyperframes:worker:once

ok "Checking CLI command"
if HYPERFRAMES_CLI_BIN=npx HYPERFRAMES_CLI_ARGS="-y hyperframes" npm run hyperframes:doctor; then
  ok "HyperFrames CLI config check completed"
else
  fail "HyperFrames doctor failed with npx CLI config"
fi

ok "Worker disabled path verified"

if [[ "$REAL_SMOKE" == true ]]; then
  ok "Running explicitly gated render smoke"
  CLI_BIN="$(resolve_cli_bin)"
  CLI_ARGS="$(resolve_cli_args)"
  ok "Using render smoke CLI: $CLI_BIN $CLI_ARGS"

  HYPERFRAMES_RENDER_ENABLED=true \
  HYPERFRAMES_RENDER_SMOKE_CONFIRM=YES \
  HYPERFRAMES_CLI_BIN="$CLI_BIN" \
  HYPERFRAMES_CLI_ARGS="$CLI_ARGS" \
  npm run hyperframes:render-smoke

  ok "Listing rendered media after render-smoke"
  find "$OUTPUT_DIR" -maxdepth 5 -type f \
    \( -name '*.mp4' -o -name '*.webm' -o -name '*.mov' \) -print -ls || true

  npm run health
else
  skip "Real render smoke not requested. Use --real-smoke to run it."
fi

get_first_user_id() {
  node - <<'NODE'
const fs = require("fs");

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return;
  if (!fs.existsSync(".env")) return;

  const envText = fs.readFileSync(".env", "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key === "DATABASE_URL") {
      let value = rest.join("=").trim();
      value = value.replace(/^['"]|['"]$/g, "");
      process.env.DATABASE_URL = value;
      return;
    }
  }
}

loadDatabaseUrl();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const user = await prisma.user.findFirst({
    select: { id: true, email: true },
    orderBy: { createdAt: "asc" },
  });

  if (!user) {
    console.error("No users found");
    process.exit(1);
  }

  console.log(user.id);
})()
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
NODE
}

if [[ "$JOB_SMOKE" == true ]]; then
  ok "Running DB-backed one-off worker job smoke"

  if ! npm run | grep -q 'hyperframes:enqueue-smoke-job'; then
    fail "npm script hyperframes:enqueue-smoke-job not found. Implement Phase 2.3 first."
  fi

  SMOKE_USER_ID="${HYPERFRAMES_SMOKE_USER_ID:-}"

  if [[ -z "$SMOKE_USER_ID" ]]; then
    if [[ "$AUTO_USER" == true ]]; then
      warn "HYPERFRAMES_SMOKE_USER_ID not set; selecting first existing user because --auto-user was provided"
      SMOKE_USER_ID="$(get_first_user_id)"
    else
      fail "HYPERFRAMES_SMOKE_USER_ID is required for --job-smoke. Or use --auto-user."
    fi
  fi

  ok "Using smoke user id: $SMOKE_USER_ID"

  HYPERFRAMES_RENDER_ENABLED=true \
  HYPERFRAMES_RENDER_SMOKE_CONFIRM=YES \
  HYPERFRAMES_SMOKE_USER_ID="$SMOKE_USER_ID" \
  npm run hyperframes:enqueue-smoke-job

  ok "Processing exactly one pending render job"
  CLI_BIN="$(resolve_cli_bin)"
  CLI_ARGS="$(resolve_cli_args)"
  ok "Using worker CLI: $CLI_BIN $CLI_ARGS"

  HYPERFRAMES_RENDER_ENABLED=true \
  HYPERFRAMES_CLI_BIN="$CLI_BIN" \
  HYPERFRAMES_CLI_ARGS="$CLI_ARGS" \
  npm run hyperframes:worker:once

  if npm run | grep -q 'hyperframes:render-job-status'; then
    ok "Job status for latest smoke job"
    HYPERFRAMES_RENDER_SMOKE_CONFIRM=YES \
    HYPERFRAMES_SMOKE_USER_ID="$SMOKE_USER_ID" \
    node - <<'NODE'
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const job = await prisma.hyperFrameRenderJob.findFirst({
    where: { userId: process.env.HYPERFRAMES_SMOKE_USER_ID },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, errorMessage: true },
  });

  if (!job) {
    console.error("[FAIL] No smoke job found for user");
    process.exit(1);
  }

  console.log(`[OK] smoke job ${job.id} status=${job.status}`);
  if (job.status === "FAILED") {
    console.error(`[FAIL] smoke job failed: ${job.errorMessage ?? "no error message"}`);
    process.exit(1);
  }
})().finally(async () => prisma.$disconnect());
NODE
  else
    warn "hyperframes:render-job-status script not found; skipping status command"
  fi

  ok "Listing rendered media after worker once"
  find "$OUTPUT_DIR" -maxdepth 5 -type f \
    \( -name '*.mp4' -o -name '*.webm' -o -name '*.mov' \) -print -ls || true

  npm run health
  npm run hyperframes:worker:once
else
  skip "DB-backed job smoke not requested. Use --job-smoke to run it."
fi

ok "HyperFrames render test script completed"
