# Admin Audit Logs Runbook

ADMIN_AUDIT_LOGS_CONFIGURED=true

- Endpoint: `GET /api/admin/audit-logs`, `GET /api/admin/audit-logs/:id`
- Access: requires auth + `ADMIN_PANEL_ENABLED=true`.
- Secrets are redacted recursively; IP is stored as SHA-256 hash only.
- Metadata is bounded to prevent oversized payload logging.
- Writes are best-effort for non-blocking product flows.
