#!/usr/bin/env bash
# Safe PostgreSQL backup helper for zsp-aitool production operations.
# - No destructive actions by default
# - Never prints DATABASE_URL
# - Produces timestamped dump artifacts

set -Eeuo pipefail
IFS=$'\n\t'

BACKUP_DIR="${BACKUP_DIR:-./backups/db}"
RETENTION_DAYS="${RETENTION_DAYS:-}"
DRY_RUN=0
INFO_ONLY=0
FORMAT="custom"
COMPRESS=0

usage() {
  cat <<'USAGE'
Usage: scripts/ops/backup-db.sh [options]

Options:
  --dry-run           Print planned actions only (no files written)
  --info              Print runtime information only (no backup)
  --dir <path>        Backup output directory (default: ./backups/db)
  --format <custom|plain>
                      Dump format (default: custom)
  --compress          Compress plain SQL output with gzip
  --retention-days N  Optional retention guidance threshold (no deletion)
  -h, --help          Show this help

Required environment (not echoed):
  DATABASE_URL        PostgreSQL connection URL used by pg_dump
USAGE
}

log() { printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
warn() { printf '[WARN] %s\n' "$*"; }
fail() { printf '[FAIL] %s\n' "$*" >&2; exit 1; }

require_bin() {
  command -v "$1" >/dev/null 2>&1 || fail "required command missing: $1"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --info) INFO_ONLY=1 ;;
    --dir) shift; BACKUP_DIR="${1:-}" ;;
    --format) shift; FORMAT="${1:-}" ;;
    --compress) COMPRESS=1 ;;
    --retention-days) shift; RETENTION_DAYS="${1:-}" ;;
    -h|--help) usage; exit 0 ;;
    *) fail "unknown argument: $1" ;;
  esac
  shift
done

[[ -n "${DATABASE_URL:-}" ]] || fail "DATABASE_URL is required"
[[ "$FORMAT" == "custom" || "$FORMAT" == "plain" ]] || fail "--format must be custom|plain"
if [[ -n "$RETENTION_DAYS" && ! "$RETENTION_DAYS" =~ ^[0-9]+$ ]]; then
  fail "--retention-days must be a positive integer"
fi

require_bin pg_dump
require_bin date

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
ext="dump"
[[ "$FORMAT" == "plain" ]] && ext="sql"
outfile="${BACKUP_DIR}/zsp-aitool-db-${timestamp}.${ext}"

log "Backup mode: format=${FORMAT} dry_run=${DRY_RUN} info=${INFO_ONLY}"
log "Backup directory: ${BACKUP_DIR}"
[[ -n "$RETENTION_DAYS" ]] && log "Retention guidance threshold: ${RETENTION_DAYS} days (informational only)"

if [[ "$INFO_ONLY" -eq 1 ]]; then
  log "Info mode only; no backup executed"
  exit 0
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  log "Dry run: would create directory ${BACKUP_DIR}"
  log "Dry run: would write dump to ${outfile}"
  log "Dry run: no files changed"
  exit 0
fi

mkdir -p "$BACKUP_DIR"

if [[ "$FORMAT" == "custom" ]]; then
  log "Creating custom-format backup"
  pg_dump --no-owner --no-privileges --format=custom --file "$outfile" "$DATABASE_URL"
else
  log "Creating plain SQL backup"
  pg_dump --no-owner --no-privileges --format=plain --file "$outfile" "$DATABASE_URL"
  if [[ "$COMPRESS" -eq 1 ]]; then
    require_bin gzip
    gzip -f "$outfile"
    outfile="${outfile}.gz"
  fi
fi

log "Backup completed: ${outfile}"

if [[ -n "$RETENTION_DAYS" ]]; then
  warn "Retention cleanup is NOT automatic. Review and archive/delete backups older than ${RETENTION_DAYS} days via approved process"
fi
