# 032 — Shopee Affiliate Portal Integration Polish Prompt

Use after the Shopee Affiliate portal integration foundation is deployed and `start.sh` verifies `SHOPEE_AFFILIATE_AUTH_CONFIGURED=true` on production.

```text
You are working on cvsz/zsp-aitool.

Phase:
032 — Shopee Affiliate Portal Integration Polish.

Mode:
Compliance-safe Shopee Affiliate UX polish. The user has a Shopee Affiliate account at https://affiliate.shopee.co.th/, but the app must not automate login, store passwords/cookies, scrape private dashboard pages, bypass CAPTCHA/anti-bot/login walls, or call undocumented endpoints.

Current production baseline:
- start.sh passes on the real VM.
- SHOPEE_AFFILIATE_AUTH_URL is configured and allowlisted as https://affiliate.shopee.co.th/.
- Shopee Affiliate portal integration foundation exists.
- Shopee status API is protected and returns 401 without auth.
- npm ci passes with 0 vulnerabilities.
- Prisma migrations are up to date.
- db:schema-drift-check passes.
- typecheck passes.
- tests pass.
- build passes.
- health passes with 0 failures and 0 warnings.
- HyperFrames queue/watchdog are healthy.
- systemd has no failed units.

Main objective:
Polish the Shopee Affiliate portal integration into a clear, user-friendly, Thai-first workflow for creators who already have a Shopee Affiliate account, while keeping the integration manual-safe and separated from official Shopee Open API OAuth.

Integration model:
- Portal Link Mode: safe direct open link to https://affiliate.shopee.co.th/.
- Manual Affiliate Link Import: user pastes affiliate links/product URLs intentionally.
- CSV/Report Import Preview: user uploads their own Shopee Affiliate report files for preview before save.
- Extension-Assisted Capture: explicit user-triggered payload only, no cookies/session/passwords/background scraping.
- Official Open API: separate disabled/foundation-only flow unless official credentials and endpoint docs are available.

Hard constraints:
- Do not automate login to affiliate.shopee.co.th.
- Do not store Shopee passwords.
- Do not store Shopee cookies, localStorage, session tokens, browser credentials, or access tokens from the affiliate portal.
- Do not scrape private Shopee Affiliate dashboard pages.
- Do not bypass CAPTCHA, anti-bot, login walls, device checks, or rate limits.
- Do not call private or undocumented Shopee endpoints.
- Do not collect private Shopee user data beyond what the user explicitly pastes/uploads/imports.
- Do not create fake reviews or fake conversion claims.
- Do not make guaranteed income claims.
- Keep affiliate disclosure visible where relevant.
- Do not expose partner keys, webhook secrets, access tokens, refresh tokens, DATABASE_URL, outputPath, /var/lib, stack traces, or local filesystem paths.
- Do not weaken auth, tenant isolation, org isolation, admin gating, Shopee compliance, or HyperFrames guardrails.
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions.
- Do not run npm audit fix --force.
- Do not remove postbuild or scripts/fix-next-server-chunks.sh.

Review before changing:
- AGENTS.md
- .faf
- README.md
- SECURITY.md
- .env.example
- src/lib/shopee/open-api-config.ts
- src/services/ShopeeOpenApiService.ts
- src/app/api/integrations/shopee/status/route.ts
- existing Shopee Affiliate integration routes/components/services
- tests/lib/shopee-open-api-config.test.ts
- tests/services/ShopeeOpenApiService.test.ts
- tests/api/shopee-open-api-status.test.ts
- tests/components/shopee-open-api-import-static.test.ts
- docs/runbooks/shopee-open-api-integration.md
- docs/runbooks/shopee-open-api-managed-seller-kam.md
- docs/reference/shopee-open-api-developer-guide-v2.1.md
- start.sh

Required UX work:

1. Shopee Affiliate settings panel
Add or polish a clear integration panel in settings or integration area.
It must show:
- Shopee Affiliate Portal status: Manual Safe Mode
- Auth portal URL: https://affiliate.shopee.co.th/
- button/link: Open Shopee Affiliate Portal
- Open API status as a separate item: Disabled / Foundation only / Sandbox ready / Live ready / Blocked by KAM eligibility
- explanation that portal login is done by the user in their browser and is not connected to Open API OAuth
- setup checklist for manual usage
- link to relevant runbook docs

2. Manual affiliate link import polish
Add or polish a manual import flow:
- paste Shopee affiliate URL
- paste original Shopee product URL if available
- optional campaign tag/source note
- safe validation for known Shopee domains and affiliate portal URLs
- review-before-save screen/state
- save to product or affiliate link record using existing model/service patterns
- visible affiliate disclosure note
- controlled error states for invalid URL, missing product, duplicate link, and auth required

Allowed URL behavior:
- Accept HTTPS Shopee links only.
- Accept only allowlisted Shopee hosts/patterns already present or defined safely.
- Do not accept javascript:, data:, file:, localhost, internal IPs, or arbitrary redirect chains.
- Do not fetch private Shopee pages server-side unless an existing safe public URL validation function already does so without cookies/auth.

3. CSV/report import preview polish
Add or polish CSV preview flow:
- upload CSV/report exported by the user from Shopee Affiliate.
- parse with strict size limits.
- detect supported columns safely.
- preview detected rows before save.
- show column mapping if needed.
- protect against CSV formula injection.
- reject rows containing formulas or sanitize them according to existing export/import policy.
- do not store raw reports unnecessarily.
- no background scraping or portal automation.

4. Extension-assisted capture polish
If Chrome Extension MV3 exists:
- add explicit user-triggered capture handoff.
- accept only intentionally sent payloads.
- no cookie access.
- no password access.
- no session/localStorage capture.
- no private dashboard scraping.
- no broad permissions.
- validate payload server-side.
- show review-before-save.

5. Official Open API separation
Make copy and status behavior clear:
- Shopee Affiliate portal login is not Open API OAuth.
- Open API remains disabled/foundation-only unless official credentials and endpoint docs exist.
- Do not create fake token exchange.
- Do not invent OAuth/callback behavior.
- Keep existing Shopee Open API config secure and redacted.

6. API/service behavior
Add or polish endpoints only if already compatible with architecture:
- GET /api/integrations/shopee/status
- POST /api/integrations/shopee/affiliate-manual-import
- POST /api/integrations/shopee/affiliate-csv-preview
- extension capture endpoint if existing route pattern is present

Rules:
- all mutating/import routes must require auth.
- data must be scoped to authenticated user/tenant/org.
- responses must not leak secrets or internal paths.
- errors must be shaped and safe.
- no real Shopee network calls in tests.

7. Documentation
Create or update:
- docs/runbooks/shopee-affiliate-portal-integration.md

Include:
- manual-safe operating model
- how to open Shopee Affiliate portal
- how to paste affiliate links
- how to upload CSV/report preview
- how extension-assisted capture works safely
- why app does not store Shopee password/cookies
- why portal login is separate from Open API
- troubleshooting checklist
- compliance notes

8. Tests
Add or update tests covering:
- Shopee Affiliate URL allowlist accepts https://affiliate.shopee.co.th/
- rejects non-HTTPS, javascript:, data:, file:, localhost, private IP, and unrelated hosts
- status API remains auth-protected
- manual import route requires auth
- CSV preview route requires auth
- CSV formula injection is rejected or sanitized
- no password/cookie/session/localStorage capture fields are present
- no scraping/private endpoint/CAPTCHA bypass copy exists
- no guaranteed income/fake review claims
- no secret/path output in UI/API
- extension permissions remain minimal if extension exists
- Shopee Open API and Affiliate Portal statuses remain separate

Suggested test files:
- tests/lib/shopee-affiliate-url-safety.test.ts
- tests/api/shopee-affiliate-import.test.ts
- tests/components/shopee-affiliate-portal-static.test.ts
- tests/docs/shopee-affiliate-runbook-static.test.ts

9. start.sh / production smoke
Update start.sh only if needed:
- keep SHOPEE_AFFILIATE_AUTH_URL validation.
- keep /api/integrations/shopee/status smoke as protected route with expected 401/403/307/200.
- add manual import/CSV preview route smoke only if safe and non-mutating via OPTIONS/HEAD/GET; do not POST production data from start.sh.

Verification commands:
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

Static safety scans:

```bash
grep -RniE "password|cookie|localStorage|sessionStorage|captcha|anti-bot|scrape|crawler|private endpoint|undocumented endpoint" src app components tests docs 2>/dev/null || true

grep -RniE "guaranteed income|guarantee income|รวยแน่นอน|รายได้แน่นอน|การันตีรายได้|รีวิวปลอม|fake review" src app components tests docs 2>/dev/null || true

grep -RniE "DATABASE_URL|SHOPEE_PARTNER_KEY|SHOPEE_WEBHOOK_SECRET|access_token|refresh_token|/var/lib|outputPath" src app components tests docs 2>/dev/null || true
```

Interpretation:
- Docs/tests may mention forbidden terms only as explicit prohibitions.
- App/UI code must not offer unsafe actions.
- No route should capture password/cookie/session material.
- No tests should call real Shopee endpoints.

Production verification:
Run on real VM after merge:

```bash
cd ~/zsp-aitool
git pull --rebase origin main
bash start.sh

# Auth-protected endpoint should not expose private status without login/session.
curl -i http://127.0.0.1:3001/api/integrations/shopee/status | head -40

# Final system check.
systemctl --failed --no-pager
systemctl is-system-running --no-pager || true
```

Expected production markers:
- FULL_PRODUCTION_START_COMPLETED=true
- SHOPEE_AFFILIATE_AUTH_CONFIGURED=true
- Health check completed with 0 failures and 0 warnings
- UserSetting schema drift check passed
- HyperFrames queue/watchdog healthy
- no failed systemd units

Fix policy:
If issues are found:
1. Make the smallest safe patch.
2. Preserve architecture.
3. Add/update tests.
4. Rerun verification.
5. Commit with one of:
   - feat: polish Shopee affiliate portal integration
   - test: add Shopee affiliate safety coverage
   - docs: add Shopee affiliate portal runbook
   - fix: harden Shopee affiliate URL validation

Do not bundle unrelated HyperFrames, billing, admin, or deployment changes.

Final response format:
Return exactly these sections:

1. Overall verdict
- PASS / WARN / FAIL
- SHOPEE_AFFILIATE_PORTAL_POLISHED=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
- concise explanation of Shopee Affiliate portal polish work

3. Files reviewed
- grouped by area

4. Files changed
- list files changed, or None

5. Schema changes
- describe migration/SQL changes, or No schema changes

6. Integration behavior
- portal link mode
- manual import
- CSV/report preview
- extension-assisted capture
- Open API separation

7. Security/compliance behavior
- no password storage
- no cookie/session capture
- no auto-login
- no scraping/private endpoints
- no CAPTCHA bypass
- URL allowlist
- CSV formula injection handling
- affiliate disclosure
- no guaranteed income/fake review claims

8. UX behavior
- settings panel
- import form
- review-before-save
- error/empty/loading states
- Thai-first copy
- mobile readiness

9. Checklist table
Columns:
- Area
- Status
- Notes

Rows:
- .env.example
- Shopee config
- status API
- manual import API
- CSV preview API
- settings UI
- product/import UI
- extension capture
- runbook
- tests
- install
- Prisma generate
- Prisma validate
- migration status
- db:schema-drift-check
- typecheck
- tests
- build
- health
- HyperFrames queue
- HyperFrames watchdog
- production start.sh

10. Commands run
- include exact commands and PASS/WARN/FAIL

11. Blocking issues
- list or None

12. Environment-only warnings
- list or None

13. Remaining risks
- list real residual risks

14. Commit hash
- commit hash if committed
- No commit created if no changes

15. PR status
- PR created / not created

Final line:
SHOPEE_AFFILIATE_PORTAL_POLISHED=true or SHOPEE_AFFILIATE_PORTAL_POLISHED=false
```
