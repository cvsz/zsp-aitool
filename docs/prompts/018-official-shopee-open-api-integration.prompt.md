# 018 — Official Shopee Open API Integration Prompt

Use this prompt after the Shopee Open API guide reference is added under `docs/reference/` and after post-launch monitoring/growth prompts are stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
018 — Official Shopee Open API Integration.

Mode:
Build a safe, optional, disabled-by-default integration foundation for official Shopee Open API only. Do not implement scraping, private endpoint usage, CAPTCHA/login bypass, or mass automation.

Source references:
- docs/reference/shopee-open-api-developer-guide-v2.1.md
- docs/reference/shopee-open-api-developer-guide-v2.1.pdf if present
- Uploaded source title: Shopee Thailand Open API Developer Guide, Open API Developer Account Signup and Shop Authorization, Open Platform v2.0, July 2022

Important source limitations:
- The available guide is primarily account signup, shop authorization, sandbox testing, Go-Live, and API flow orientation.
- It does not contain every endpoint request/response schema needed for a full product/order integration.
- Do not guess missing endpoint details.
- If endpoint-level details are needed, ask the operator to add the official Shopee Open Platform v2.0 endpoint docs to docs/reference/ or paste the exact endpoint section.

Project context:
zsp-aitool is a Thai-first SaaS for Shopee Affiliate creators. It supports manual product save, affiliate link management, AI promotional content, OCR, exports, similar products, Chrome Extension MV3 user-confirmed product capture, HyperFrames Studio/rendering, operator dashboards, and admin foundation.

Main objective:
Add a secure, optional official Shopee Open API integration foundation that can later import/sync product data only through documented official APIs and only after operator/user configuration.

Hard constraints:
- Do not bypass Shopee CAPTCHA.
- Do not bypass login walls.
- Do not bypass Shopee anti-bot systems.
- Do not use private or undocumented Shopee endpoints.
- Do not automate mass scraping.
- Do not collect private Shopee user data.
- Do not store seller passwords or developer account passwords.
- Do not store partner key/client secret in the database.
- Do not expose partner key, access token, refresh token, DATABASE_URL, outputPath, /var/lib, internal paths, or stack traces in UI/API/logs/tests.
- Do not implement endpoint details that are not present in official documentation.
- Do not change existing manual/extension/OCR/JSON import behavior.
- Keep feature disabled by default.
- Keep auth, tenant isolation, org isolation, admin gating, and HyperFrames guardrails intact.
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions.
- Do not run npm audit fix --force.
- Keep postbuild and scripts/fix-next-server-chunks.sh intact.
- Use prisma migrate deploy, not prisma migrate dev, on production.

Shopee Open API facts from available guide:
- OpenAPI connection is an ongoing maintenance effort, not a one-time setup.
- Thailand Open API availability is described for Mall Sellers, Non-Mall Managed Sellers with a Key Account Manager, and Third-party Partner Platform providers.
- The guide describes a six-step flow: Register as Developer, Profile Audit by Shopee, Create APP, Obtain Credentials and optional Webhook Setup, Test API in Sandbox, Request Go-Live.
- The developer account is different from the Shopee marketplace seller account.
- Sandbox / test-stable is used for testing before live usage.
- Go-Live approval provides live partner_id and key.
- API flow references include Upload Item, Add Model, Arrange Shipment / AirWayBill flows, and Order Status Flow.

Implementation tasks:

1. Environment configuration
Add placeholders to .env.example only:

SHOPEE_OPEN_API_ENABLED=false
SHOPEE_OPEN_API_ENV=sandbox
SHOPEE_PARTNER_ID=
SHOPEE_PARTNER_KEY=
SHOPEE_API_BASE_URL=
SHOPEE_AUTH_BASE_URL=
SHOPEE_REDIRECT_URL=
SHOPEE_WEBHOOK_SECRET=

Rules:
- No real credentials.
- Default disabled.
- Validate env safely.
- Never log secret values.

2. Config module
Create:
- src/lib/shopee/open-api-config.ts

Requirements:
- Parse enabled flag.
- Parse environment: sandbox/live.
- Validate required fields only when enabled.
- Return redacted safe config for UI/status.
- Do not expose partner key or webhook secret.

3. Signature/auth foundation
Create only if official documentation available in repo confirms the algorithm:
- src/lib/shopee/signature.ts

If algorithm is not available:
- create a placeholder interface with a clear unsupported error
- document that endpoint docs are required before enabling real signed calls
- tests must verify it refuses safely rather than guessing

4. Client abstraction
Create:
- src/services/shopee-open-api-client.ts
- src/services/ShopeeOpenApiService.ts

Requirements:
- Use an injectable HTTP client.
- Mock all calls in tests.
- Add timeout and safe error shaping.
- Redact secrets/tokens from errors.
- Support disabled mode returning controlled SKIP/DISABLED result.
- Do not call real Shopee API in tests.
- Do not implement undocumented endpoints.

5. Authorization/status foundation
Optional safe API routes:
- GET /api/integrations/shopee/status
- GET /api/integrations/shopee/auth-url only if the auth URL format is documented
- POST /api/integrations/shopee/callback only if callback/signing requirements are documented

If auth URL/callback details are not fully documented:
- expose only status endpoint
- return setupRequired / docsRequired flags
- do not guess OAuth/signing behavior

Rules:
- Auth required for user-facing integration status.
- No secret/token exposure.
- Response must be shaped and redacted.

6. Product import integration point
Add import mode copy/UI foundation:
- Official Shopee Open API import is optional and disabled unless configured.
- User must review/edit imported product data before saving.
- Existing import modes remain unchanged: manual, URL, extension payload, OCR, JSON.

Do not add automated bulk import unless explicitly approved later.

7. Admin/operator docs
Create or update:
- docs/runbooks/shopee-open-api-integration.md

Include:
- eligibility notes from the guide
- developer account vs seller account warning
- sandbox/test-stable flow
- Go-Live checklist
- env variables
- credential handling policy
- user review-before-save policy
- unsupported actions list
- troubleshooting checklist
- what endpoint docs are still needed before full implementation

8. Tests
Add tests for:
- disabled mode returns safe status
- missing env returns controlled error only when enabled
- safe redaction of partner key/token/webhook secret
- no real network call in tests
- status endpoint does not expose secrets
- product import UI/copy does not imply scraping/bypass
- no private endpoint strings
- no raw seller password storage

Suggested test files:
- tests/lib/shopee-open-api-config.test.ts
- tests/services/ShopeeOpenApiService.test.ts
- tests/api/shopee-open-api-status.test.ts
- tests/components/shopee-open-api-import-static.test.ts

9. Static scans
Run and inspect:

grep -RniE "SHOPEE_PARTNER_KEY|SHOPEE_WEBHOOK_SECRET|access_token|refresh_token|seller password|seller_password" src app components scripts prisma tests docs 2>/dev/null || true

grep -RniE "captcha bypass|anti-bot bypass|private endpoint|mass scraping|undocumented endpoint" src app components scripts prisma tests docs 2>/dev/null || true

grep -RniE "dangerouslySetInnerHTML|DATABASE_URL|sk-[A-Za-z0-9]|/var/lib|outputPath" src app components scripts prisma tests docs 2>/dev/null || true

grep -RniE "<img|img[[:space:]]+src" src/app src/components 2>/dev/null || true

Interpretation:
- docs/tests may mention forbidden terms as safety rules; that is acceptable.
- runtime UI/API/logging code must not expose secrets or imply forbidden behavior.

Required verification:

git status --short
git log --oneline -n 20
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health

HyperFrames checks should remain green:

npm run hyperframes:queue-status || true
npm run hyperframes:worker:watchdog || true

Environment interpretation:
- If PostgreSQL is unavailable in Codex/container, report DB-dependent checks as WARN/SKIP, not PASS.
- If systemd is unavailable because PID 1 is not systemd, report as WARN/SKIP, not PASS.
- If Shopee endpoint docs are incomplete, report implementation as FOUNDATION_ONLY and do not guess.
- If a real package/schema/typecheck/test/build/health/security issue fails, fix it before finishing.

Fix policy:
If issues are found:
1. Make the smallest safe patch.
2. Preserve existing architecture.
3. Add/update regression tests.
4. Rerun verification.
5. Commit with one of:
   - feat: add Shopee Open API integration foundation
   - docs: add Shopee Open API integration runbook
   - test: add Shopee Open API safety coverage
   - fix: stabilize Shopee Open API foundation

Do not bundle unrelated feature work.

Final response format:
Return exactly these sections:

1. Overall verdict
- PASS / WARN / FAIL
- SHOPEE_OPEN_API_FOUNDATION_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
- concise explanation of integration foundation work

3. Source docs used
- list docs/reference files and limitations

4. Files reviewed
- grouped by area

5. Files changed
- list files changed, or None

6. Schema changes
- describe changes, or No schema changes

7. Security/compliance behavior
- official API only
- no scraping/private endpoint behavior
- credential handling
- user review-before-save
- auth/isolation
- secret redaction

8. Checklist table
Columns:
- Area
- Status
- Notes

Rows:
- reference docs
- env config
- feature flag
- config validation
- signing/auth foundation
- client abstraction
- status API
- product import UI/copy
- tests
- static safety scan
- typecheck
- build
- health
- HyperFrames queue/watchdog

9. Commands run
- include exact commands and PASS/WARN/FAIL

10. Blocking issues
- list or None

11. Documentation gaps
- endpoint docs still needed

12. Environment-only warnings
- list Codex/container-only warnings

13. Remaining risks
- list real residual risks, if any

14. Commit hash
- commit hash if committed
- No commit created if no changes

15. PR status
- PR created / not created

Final line:
SHOPEE_OPEN_API_FOUNDATION_READY=true or SHOPEE_OPEN_API_FOUNDATION_READY=false
```
