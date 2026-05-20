# Marqeta Core API Sandbox Foundation (Phase 037)

## Sandbox-only policy
This phase is sandbox-only and must not be used for production card issuing, production funding, or real money movement.

## Environment variables
Use only `.env` values derived from `.env.example`:
- `MARQETA_ENABLED`
- `MARQETA_ENV=sandbox`
- `MARQETA_BASE_URL=https://sandbox-api.marqeta.com/v3`
- `MARQETA_APPLICATION_TOKEN`
- `MARQETA_ADMIN_ACCESS_TOKEN`
- `MARQETA_CONNECTIVITY_CHECK_ENABLED`
- `MARQETA_TIMEOUT_MS`
- `MARQETA_MAX_RETRIES`

## Auth model summary
Marqeta Core API requests use HTTP Basic Authentication. Credentials are read server-side only and never exposed in browser code.

## Headers summary
- `Authorization: Basic ...`
- `Content-Type: application/json` for `POST` and `PUT`

## Idempotency strategy
Mutating calls that are marked retryable must include an idempotency key. Non-idempotent unsafe retries are blocked.

## Rate-limit strategy
HTTP `429` and transient `5xx` responses are retried with bounded exponential backoff only for safe/idempotent requests.

## Secret redaction policy
Logs and errors must redact token-, secret-, password-, and Authorization-like fields.

## Production-readiness blockers
Do not proceed to production without all of:
- Signed Marqeta program agreement
- Legal/compliance review
- KYC/AML policy and sanctions controls
- PCI/security review
- Privacy review
- Explicit production credentials and program base URL

## Rollback steps
1. Set `MARQETA_ENABLED=false`.
2. Keep `MARQETA_CONNECTIVITY_CHECK_ENABLED=false`.
3. Deploy and verify status route remains non-mutating.

## Verification commands
Run:
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run health`

Marker: `MARQETA_SANDBOX_FOUNDATION_CONFIGURED=true`
