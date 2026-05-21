# Backend Monitor Runbook

## CLI
- Run: `npm run monitor:backend`
- Output is safe JSON summary for app/worker service status, local HTTP reachability, DB counts, HyperFrames queue summary, free disk, and warnings.

## API and Dashboard
- API: `GET /api/admin/backend/status` (auth required, admin panel enabled only).
- Dashboard: `/dashboard/admin/backend-monitor`

## Security and Redaction
- Never expose raw secrets (`DATABASE_URL`, API keys, tokens), auth headers, cookies, session payloads, raw journal lines, or private paths like `/home/*` and `/var/lib/*`.
- Responses are aggregate-only and read-only.

## Troubleshooting
- `service-check-unavailable:*`: systemd not accessible in current environment.
- `db-unreachable`: check PostgreSQL and Prisma configuration.
- `hyperframes-status-unavailable`: HyperFrames queue/status unavailable.

## Production verification
- `npm run monitor:backend`
- `npm run health`
- `bash start.sh`

BACKEND_MONITOR_CONFIGURED=true
