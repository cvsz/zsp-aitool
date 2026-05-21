# Observability Pack Runbook

OBSERVABILITY_PACK_CONFIGURED=true

## What is collected
- Structured JSON log events (level, source, event, duration, status).
- API timing summaries and slow-route aggregates.
- DB timing summaries (without SQL values).
- Worker/import/AI queue health counts.

## What is NOT collected
- No raw request/response bodies for sensitive routes.
- No secrets, tokens, cookies, authorization headers, or passwords.
- No local machine paths in exposed admin payloads.

## Redaction policy
- Token-like values are replaced with `[REDACTED]`.
- Home/var paths are redacted.
- Error shaping returns name/message only.

## Dashboard usage
- Open `/dashboard/admin/observability`.
- Use cards for error/latency/queue trends.
- Review recent redacted events table.

## Troubleshooting
- If DB is unavailable, summary returns safe fallback values.
- If worker status is unavailable, worker card may show zeros or null.

## Optional external sink policy
- External sinks are opt-in only and must remain disabled by default.
