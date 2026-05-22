#!/usr/bin/env bash
set -Eeuo pipefail

# CI/CD hardening marker required by GitHub Actions static gate.
CICD_HARDENING_CONFIGURED=true

ROOT="${ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$ROOT"

LOG_DIR="${LOG_DIR:-logs}"
REPORT_DIR="${REPORT_DIR:-.zagents/reports}"
TS="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$LOG_DIR" "$REPORT_DIR"

usage() {
  cat <<'HELP'
ZSP-AITOOL start.sh

Usage:
  ./start.sh status        Show agent/repo status
  ./start.sh deep          Run deep-dive report
  ./start.sh validate      Run full validation suite
  ./start.sh build         Run build only
  ./start.sh health        Run health only
  ./start.sh main          Run status + deep + full validation
  ./start.sh release       Run release readiness check
  ./start.sh views         Generate report index/views
  ./start.sh view latest   Show latest deep-dive report
  ./start.sh view logs     List logs
  ./start.sh view reports  List reports
  ./start.sh tail          Tail latest validation log
  ./start.sh help          Show this help

Safety:
  - Keeps old logs/reports.
  - Does not delete reports.
  - Does not change Cloudflare/DNS/systemd.
  - Does not run migrations.
HELP
}

run() {
  echo "+ $*"
  "$@"
}

run_db_drift_check() {
  DB_SCHEMA_DRIFT_CHECK_PLAN_TIER_GUARD=true run npm run db:schema-drift-check
}

run_logged() {
  local name="$1"
  shift

  local log="$LOG_DIR/${name}-${TS}.log"
  local latest="$LOG_DIR/${name}.latest.log"

  echo "== Running: $name =="
  echo "log: $log"

  {
    echo "== $name =="
    echo "time: $(date -Is)"
    echo "root: $ROOT"
    echo "branch: $(git branch --show-current 2>/dev/null || true)"
    echo

    "$@"
  } 2>&1 | tee "$log"

  local status="${PIPESTATUS[0]}"
  cp "$log" "$latest"

  echo
  echo "LOG=$log"
  echo "LATEST=$latest"
  echo "STATUS=$status"

  return "$status"
}

status_cmd() {
  if [ -x .zagents/scripts/zsp-agent-status.sh ]; then
    .zagents/scripts/zsp-agent-status.sh
  else
    echo "WARN: .zagents/scripts/zsp-agent-status.sh missing"
    git status --short || true
  fi
}

deep_cmd() {
  if [ -x .zagents/scripts/zsp-deep-dive.sh ]; then
    .zagents/scripts/zsp-deep-dive.sh
  else
    echo "ERROR: .zagents/scripts/zsp-deep-dive.sh missing"
    return 1
  fi

  generate_views
}

validate_cmd() {
  python3 -m json.tool package.json
  npm run prisma:generate
  npx prisma validate

  echo "== db schema drift check: before runtime checks =="
  run_db_drift_check

  npm run typecheck
  npm run test
  npm run build
  npm run health

  echo "== db schema drift check: after runtime checks =="
  run_db_drift_check
}

build_cmd() {
  npm run build
}

health_cmd() {
  npm run health
}

release_cmd() {
  local rel_report="$REPORT_DIR/RELEASE_READINESS-$TS.md"
  local rel_latest="$REPORT_DIR/RELEASE_READINESS.latest.md"
  {
    echo "# ZSP-AITOOL Release Readiness Report"
    echo "Generated: $(date -Is)"
    echo "Branch: $(git branch --show-current 2>/dev/null || true)"
    echo
    echo "## 1. Validation Run"
    npm run typecheck
    npm run test
    npm run build
    npm run health
    echo
    echo "## 2. Deep Dive Scan"
    .zagents/scripts/zsp-deep-dive.sh > /dev/null
    cat "$REPORT_DIR/ZSP_DEEP_DIVE_REPORT.latest.md"
    echo
    echo "## 3. Checklist Verification"
    if [ -f docs/runbooks/zsp-release-smoke-checklist.md ]; then
      echo "- OK: docs/runbooks/zsp-release-smoke-checklist.md exists"
    else
      echo "- FAIL: docs/runbooks/zsp-release-smoke-checklist.md missing"
    fi
  } > "$rel_report"
  cp "$rel_report" "$rel_latest"
  echo "Release report generated:"
  echo "  $rel_report"
  echo "  $rel_latest"
  generate_views
}

generate_views() {
  local index="$REPORT_DIR/INDEX.md"

  {
    echo "# ZSP Reports Index"
    echo
    echo "Generated: $(date -Is)"
    echo
    echo "## Latest files"
    echo
    [ -f "$REPORT_DIR/ZSP_DEEP_DIVE_REPORT.latest.md" ] && echo "- Deep dive latest: \`$REPORT_DIR/ZSP_DEEP_DIVE_REPORT.latest.md\`"
    [ -f "$REPORT_DIR/RELEASE_READINESS.latest.md" ] && echo "- Release readiness latest: \`$REPORT_DIR/RELEASE_READINESS.latest.md\`"
    [ -f "$LOG_DIR/main-validation.latest.log" ] && echo "- Main validation latest: \`$LOG_DIR/main-validation.latest.log\`"
    [ -f "$LOG_DIR/build.latest.log" ] && echo "- Build latest: \`$LOG_DIR/build.latest.log\`"
    echo
    echo "## Reports"
    echo
    find "$REPORT_DIR" -maxdepth 1 -type f | sort | sed 's#^#- #'
    echo
    echo "## Logs"
    echo
    find "$LOG_DIR" -maxdepth 1 -type f | sort | sed 's#^#- #'
  } > "$index"

  echo "views generated: $index"
}

view_latest() {
  if [ -f "$REPORT_DIR/ZSP_DEEP_DIVE_REPORT.latest.md" ]; then
    sed -n '1,240p' "$REPORT_DIR/ZSP_DEEP_DIVE_REPORT.latest.md"
  else
    echo "No latest deep-dive report found."
    echo "Run: ./start.sh deep"
  fi
}

view_logs() {
  find "$LOG_DIR" -maxdepth 1 -type f -printf "%TY-%Tm-%Td %TH:%TM %p\n" 2>/dev/null | sort || true
}

view_reports() {
  find "$REPORT_DIR" -maxdepth 1 -type f -printf "%TY-%Tm-%Td %TH:%TM %p\n" 2>/dev/null | sort || true
}

tail_latest() {
  if [ -f "$LOG_DIR/main-validation.latest.log" ]; then
    tail -n 200 "$LOG_DIR/main-validation.latest.log"
  elif [ -f "$LOG_DIR/build.latest.log" ]; then
    tail -n 200 "$LOG_DIR/build.latest.log"
  else
    echo "No latest log found."
  fi
}

cmd="${1:-help}"
sub="${2:-}"

case "$cmd" in
  status)
    run_logged "status" status_cmd
    ;;
  deep)
    run_logged "deep-dive" deep_cmd
    ;;
  validate)
    run_logged "main-validation" validate_cmd
    ;;
  build)
    run_logged "build" build_cmd
    ;;
  health)
    run_logged "health" health_cmd
    ;;
  release)
    run_logged "release" release_cmd
    ;;
  main)
    run_logged "main-validation" bash -lc '
      set -Eeuo pipefail
      .zagents/scripts/zsp-agent-status.sh
      .zagents/scripts/zsp-deep-dive.sh
      python3 -m json.tool package.json
      npm run prisma:generate
      npx prisma validate
      DB_SCHEMA_DRIFT_CHECK_PLAN_TIER_GUARD=true run npm run db:schema-drift-check
      npm run typecheck
      npm run test
      npm run build
      npm run health
      DB_SCHEMA_DRIFT_CHECK_PLAN_TIER_GUARD=true run npm run db:schema-drift-check
    '
    generate_views
    ;;
  views)
    generate_views
    ;;
  view)
    case "$sub" in
      latest) view_latest ;;
      logs) view_logs ;;
      reports) view_reports ;;
      *) echo "Usage: ./start.sh view latest|logs|reports"; exit 1 ;;
    esac
    ;;
  tail)
    tail_latest
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    echo "Unknown command: $cmd"
    usage
    exit 1
    ;;
esac
