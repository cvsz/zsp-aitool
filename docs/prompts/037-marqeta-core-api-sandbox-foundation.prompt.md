# 037 — Marqeta Core API Sandbox Foundation Prompt

Use after production passes `bash start.sh` and the Shopee Affiliate import/product flow remains healthy.

Reference docs reviewed:

- Marqeta Core API introduction: https://www.marqeta.com/docs/core-api/introduction
- Marqeta Core API authentication: https://www.marqeta.com/docs/core-api/authentication
- Marqeta Core API headers: https://www.marqeta.com/docs/core-api/headers
- Marqeta Core API idempotency: https://www.marqeta.com/docs/core-api/idempotency
- Marqeta Core API rate limiting: https://www.marqeta.com/docs/core-api/rate-limiting

```text
You are working on cvsz/zsp-aitool.

Phase:
037 — Marqeta Core API Sandbox Foundation.

Mode:
Compliance-first sandbox-only card-program integration foundation. Build safe configuration, health checks, client scaffolding, sandbox-only test routes, audit-safe logging, and documentation. Do not issue real cards, do not process real funds, do not onboard real cardholders, do not collect unnecessary PII, and do not move to production without a signed Marqeta program agreement, legal/compliance review, KYC/AML policy, PCI/security review, privacy review, and explicit production credentials.

Current production baseline:
- zsp-aitool production deployment passes with `bash start.sh` on the real VM.
- Next.js app runs on port 3001.
- Auth, tenant/user isolation, security scans, typecheck, tests, build, health, HyperFrames watchdog, Shopee Affiliate queue/import flow, and DB schema drift checks pass.

Official Marqeta facts to preserve:
- Core API is RESTful and uses HTTP methods such as POST, PUT, and GET with JSON request bodies where applicable.
- Public sandbox base URL is `https://sandbox-api.marqeta.com/v3`.
- Production uses a unique program base URL such as `https://programname-api.marqeta.com/v3/...`.
- Core API uses HTTP Basic Authentication.
- Requests must include proper headers: Authorization and `Content-Type: application/json` for POST/PUT.
- Core API POST calls are idempotent-capable when the primary token is set in the request object.
- Rate limits can return HTTP 429 and must be retried only with safe backoff and idempotency.

Main objective:
Add a safe Marqeta sandbox integration foundation to zsp-aitool without enabling production money movement or real card issuing.

Allowed scope for this phase:
1. Sandbox configuration only.
2. Server-side Marqeta client wrapper.
3. Health/status endpoint that validates configuration shape without leaking secrets.
4. Optional sandbox connectivity check behind explicit env flag.
5. Strict secret redaction.
6. Static tests for security/compliance claims.
7. Documentation and runbook.
8. No production credentials, no real card issuance, no real funds, no real cardholder PII.

Forbidden behavior:
- Do not store or print Marqeta application token, admin token, user access token, single-use token, client access token, Basic Auth header, PAN, CVV, PIN, full card number, card security code, bank account numbers, or raw webhook secrets.
- Do not expose credentials in client-side code, logs, error responses, analytics, metrics, test snapshots, build output, or Git.
- Do not create production card products, production users, production cards, production funding sources, production GPA orders, production transfers, or production ACH flows.
- Do not simulate or facilitate bypass of KYC/AML, sanctions checks, PCI controls, identity checks, age checks, geographic restrictions, account limits, or Marqeta program requirements.
- Do not claim users can launch a live card program without Marqeta approval and compliance work.
- Do not implement fake production credentials or hardcoded sandbox secrets.
- Do not call Marqeta from browser/client components.
- Do not weaken existing app auth, org/user isolation, security middleware, HyperFrames controls, Shopee controls, or deployment checks.

Environment variables:
Add to `.env.example` only; do not commit real values.

```bash
# Marqeta Core API sandbox-only foundation
MARQETA_ENABLED=false
MARQETA_ENV=sandbox
MARQETA_BASE_URL=https://sandbox-api.marqeta.com/v3
MARQETA_APPLICATION_TOKEN=
MARQETA_ADMIN_ACCESS_TOKEN=
MARQETA_CONNECTIVITY_CHECK_ENABLED=false
MARQETA_TIMEOUT_MS=10000
MARQETA_MAX_RETRIES=2
```

Validation rules:
- `MARQETA_ENABLED` defaults to false.
- `MARQETA_ENV` accepts only `sandbox` in this phase.
- `MARQETA_BASE_URL` must be HTTPS and must equal `https://sandbox-api.marqeta.com/v3` when `MARQETA_ENV=sandbox`.
- Production URLs must be rejected in this phase.
- Credentials must be read server-side only.
- Status endpoint must return booleans such as `configured`, `enabled`, `sandboxOnly`, and never token values.

Implementation tasks:

1. Config module
Create:

```text
src/lib/marqeta/config.ts
```

Responsibilities:
- parse env safely with zod or existing project validation style.
- expose a redacted config shape.
- validate sandbox-only base URL.
- refuse production mode.
- avoid reading credentials in client code.

2. Client wrapper
Create:

```text
src/services/MarqetaCoreApiService.ts
```

Responsibilities:
- server-only fetch wrapper.
- Basic Auth generated only in memory at request time.
- never log Authorization header.
- JSON request/response handling.
- timeout support.
- safe retries only for idempotent operations and safe transient failures.
- handle HTTP 401, 403, 404, 409, 422, 429, and 5xx with shaped errors.
- support idempotency tokens for future POST calls.
- redact sensitive fields in errors.

Do not implement real card creation in this phase unless it is explicit sandbox-only demo code behind a disabled-by-default flag and tests prove it cannot run in production.

3. API status route
Create:

```text
src/app/api/integrations/marqeta/status/route.ts
```

Behavior:
- requires existing app auth.
- returns redacted config status only.
- optional connectivity check only when `MARQETA_CONNECTIVITY_CHECK_ENABLED=true` and `MARQETA_ENABLED=true`.
- never returns tokens or Basic Auth header.
- never performs mutating API calls.

4. Dashboard or admin card
Optionally add a small integration status card under an existing integrations/admin dashboard.
Show:
- enabled/disabled.
- sandbox-only true.
- configured true/false.
- connectivity unknown/ok/error.
- no tokens.

5. Documentation
Create:

```text
docs/runbooks/marqeta-core-api-sandbox-foundation.md
```

Include:
- sandbox-only policy.
- env variables.
- auth model summary.
- headers summary.
- idempotency strategy.
- rate limit strategy.
- secret redaction policy.
- production-readiness blockers.
- rollback steps.
- verification commands.

6. Tests
Add tests:

```text
tests/lib/marqeta-config.test.ts
tests/services/MarqetaCoreApiService.test.ts
tests/api/marqeta-status.test.ts
tests/docs/marqeta-runbook-static.test.ts
tests/security/marqeta-secret-redaction-static.test.ts
```

Coverage:
- config defaults disabled.
- sandbox base URL accepted.
- production URL rejected in this phase.
- missing credentials produce configured=false but no secret leakage.
- status route requires auth.
- status route never returns token fields.
- client redacts Authorization and token-like fields from errors.
- idempotency token is required for future mutating helpers.
- 429 handling uses safe backoff and does not retry unsafe non-idempotent calls.
- no client-side Marqeta token references.
- docs mention no production use without Marqeta approval/compliance review.

7. start.sh
Add source-integrity checks only, not mutating external calls:
- verify `src/lib/marqeta/config.ts` exists.
- verify `src/services/MarqetaCoreApiService.ts` exists.
- verify status route exists.
- verify runbook exists.
- verify source does not contain obvious token leakage patterns.
- add final marker:

```text
MARQETA_SANDBOX_FOUNDATION_CONFIGURED=true
```

Do not make `start.sh` call Marqeta external APIs by default.

8. Verification commands
Run:

```bash
git status --short
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npx prisma migrate status --schema prisma/schema.prisma
npm run db:schema-drift-check
npm run typecheck
npm run test
npm run build
npm run health
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```

Optional route check after deployment:

```bash
curl -i http://127.0.0.1:3001/api/integrations/marqeta/status | head -40
```

Expected unauthenticated response:

```text
HTTP/1.1 401 Unauthorized
```

Production verification:

```bash
cd ~/zsp-aitool
bash start.sh
```

Expected markers include:

```text
FULL_PRODUCTION_START_COMPLETED=true
MARQETA_SANDBOX_FOUNDATION_CONFIGURED=true
```

Final response format:
Return exactly these sections:

1. Overall verdict
- PASS / WARN / FAIL
- MARQETA_SANDBOX_FOUNDATION_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
- concise explanation of sandbox foundation work

3. Files reviewed
- grouped by area

4. Files changed
- list files changed, or None

5. API behavior
- status route and connectivity behavior

6. Security/compliance behavior
- sandbox-only
- no production card issuing
- no real funds
- no PII collection
- no token leakage
- server-side only
- idempotency/rate-limit strategy

7. Checklist table
Rows:
- config
- client service
- status API
- dashboard card
- runbook
- tests
- start.sh
- secrets redaction
- auth/scoping
- typecheck
- tests
- build
- production start.sh

8. Commands run
- exact commands and PASS/WARN/FAIL

9. Blocking issues
- list or None

10. Remaining risks
- list real residual risks

11. Commit hash
- commit hash if committed
- No commit created if no changes

Final line:
MARQETA_SANDBOX_FOUNDATION_READY=true or MARQETA_SANDBOX_FOUNDATION_READY=false
```
