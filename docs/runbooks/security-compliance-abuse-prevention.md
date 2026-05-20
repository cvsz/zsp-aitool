# Security, Compliance, and Abuse Prevention Runbook

## Scope

This runbook covers production-hardening checks for:
- auth/admin/tenant isolation
- safe export and render artifact handling
- Shopee compliance-safe copy and flows
- abuse prevention and error shaping

## Static security scan coverage

Run these checks in CI/local:

```bash
npm run test -- tests/security/security-compliance-static-scans.test.ts
```

The static scan enforces:
- no secret tokens in `src/app` or `src/components`
- no `outputPath` or `/var/lib` in user-facing UI code
- no direct `systemctl start|stop|restart|enable|disable` controls in UI
- no raw `<img>` in Next app/components (use `next/image`)
- no `dangerouslySetInnerHTML` in app/components
- no prohibited growth claims such as guaranteed income or fake review copy

## Abuse prevention and rate limits

- OCR API enforces request-per-minute quota via `enforceUsageQuota`.
- All abuse controls should return safe 429 envelopes without stack traces.
- Preserve explicit user confirmation for product import and extension capture.

## Safe error response shaping

Error responses must:
- avoid stack trace disclosure
- avoid local path exposure (`/var/lib`, internal work dirs)
- avoid secret leakage (`DATABASE_URL`, tokens, API keys)
- return stable envelopes: `ok: false`, `error.code`, `error.message`

## Verification commands

```bash
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run db:schema-drift-check
npm run typecheck
npm run test
npm run build
npm run health
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```

If PostgreSQL or systemd is unavailable in container/Codex, report DB/systemd checks as WARN/SKIP.
