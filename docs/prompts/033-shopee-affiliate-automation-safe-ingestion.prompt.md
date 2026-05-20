# 033 — Shopee Affiliate Automation Safe Ingestion Prompt

Use after `032-shopee-affiliate-portal-integration-polish.prompt` is complete and production still passes `bash start.sh` with `SHOPEE_AFFILIATE_AUTH_CONFIGURED=true`.

```text
You are working on cvsz/zsp-aitool.

Phase:
033 — Shopee Affiliate Automation Safe Ingestion.

Mode:
Compliance-safe automation. Automate ingestion and downstream processing only after the user intentionally provides data through paste, upload, export, or explicit extension capture. Do not automate Shopee Affiliate Portal login. Do not scrape private pages. Do not capture cookies, passwords, sessions, localStorage, or browser credentials.

Current production baseline:
- zsp-aitool production start script passes on the real VM.
- SHOPEE_AFFILIATE_AUTH_URL is configured and allowlisted as https://affiliate.shopee.co.th/.
- Shopee Affiliate portal integration foundation exists.
- Shopee Affiliate Portal mode is manual-safe.
- Shopee Open API remains separate from Affiliate Portal login.
- Shopee status API is auth-protected.
- Prisma migrations are up to date.
- db:schema-drift-check passes.
- typecheck/tests/build/health pass.
- HyperFrames queue/watchdog are healthy.
- systemd has no failed units.

Main objective:
Add safe automation around Shopee Affiliate data ingestion:
- auto-parse affiliate links pasted by the user.
- auto-preview CSV/report uploads exported by the user.
- optionally process files from a local operator-approved import folder.
- optionally accept explicit user-triggered browser extension captures.
- queue review-before-save tasks.
- generate product/content drafts after validation.
- prepare for future Official Shopee Open API scheduled sync without inventing auth or using portal sessions.

Allowed automation:
1. User-provided link automation
   - user pastes affiliate/product link.
   - app validates allowed domains/protocols.
   - app extracts safe URL metadata if already supported.
   - app creates review-before-save draft.
   - app can generate content draft after user confirmation or configured safe rule.

2. User-uploaded CSV/report automation
   - user exports CSV/report from Shopee Affiliate Portal themselves.
   - user uploads to zsp-aitool.
   - app validates file type/size/content.
   - app detects columns and previews rows.
   - app rejects or sanitizes CSV formula injection.
   - app queues approved rows for save/generation.

3. Operator-approved local import folder automation
   - optional production worker scans a local folder such as `storage/imports/shopee-affiliate/inbox`.
   - folder must be inside app-controlled storage, not arbitrary paths.
   - files are processed read-only first and moved to pending/review/archive/error folders.
   - no secrets, cookies, browser profile files, or session exports are accepted.
   - disabled by default via env flag.

4. Extension-assisted automation
   - user opens portal/product page manually.
   - user clicks extension action explicitly.
   - extension sends only selected visible fields.
   - server validates payload and shows review-before-save.
   - no cookie/session/password/localStorage capture.
   - no background scraping.

5. Official Open API future sync
   - prepare interfaces for scheduled sync only when official partner credentials and endpoint docs exist.
   - do not implement fake OAuth.
   - do not convert Affiliate Portal browser login into Open API token.

Forbidden automation:
- No automated login to `affiliate.shopee.co.th`.
- No Shopee username/password storage.
- No Shopee cookie/session/localStorage/sessionStorage/browser credential capture.
- No browser profile import.
- No private dashboard scraping.
- No private/undocumented endpoint calls.
- No CAPTCHA/anti-bot/login-wall/device-check bypass.
- No mass scraping.
- No fake reviews, fake conversions, or guaranteed income claims.
- No unapproved external tracking SDKs.

Hard constraints:
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions.
- Do not run npm audit fix --force.
- Do not remove postbuild or scripts/fix-next-server-chunks.sh.
- Do not weaken auth, tenant isolation, org isolation, admin gating, Shopee compliance, HyperFrames guardrails, signed downloads, or quota checks.
- Do not expose DATABASE_URL, partner keys, webhook secrets, access tokens, refresh tokens, outputPath, /var/lib, stack traces, or local filesystem paths.
- All import/save routes must require auth.
- All data must be scoped to authenticated user and tenant/org where applicable.
- Keep affiliate disclosure visible where relevant.

Review before changing:
- AGENTS.md
- .faf
- README.md
- SECURITY.md
- .env.example
- start.sh
- prisma/schema.prisma
- prisma/migrations/**
- src/lib/shopee/open-api-config.ts
- src/services/ShopeeOpenApiService.ts
- existing Shopee Affiliate routes/services/components
- src/app/api/integrations/shopee/status/route.ts
- src/app/api/integrations/shopee/affiliate-manual-import/route.ts if present
- src/app/api/integrations/shopee/affiliate-csv-preview/route.ts if present
- Chrome Extension/MV3 files if present
- docs/runbooks/shopee-affiliate-portal-integration.md if present
- docs/runbooks/shopee-open-api-integration.md
- docs/runbooks/shopee-open-api-managed-seller-kam.md
- tests/api/shopee-affiliate-portal-routes.test.ts if present
- tests/lib/shopee-open-api-config.test.ts
- tests/services/ShopeeOpenApiService.test.ts

Implementation tasks:

1. Ingestion architecture inventory
Create or update documentation describing current safe ingestion surfaces:
- manual affiliate link import
- CSV/report preview
- extension capture if present
- Open API status separation
- production start.sh Shopee config validation

2. Safe ingestion service layer
Add or polish a service such as:
- `ShopeeAffiliateIngestionService`
- `ShopeeAffiliateCsvPreviewService`
- `ShopeeAffiliateAutomationQueueService`

Service responsibilities:
- validate URLs with an allowlist.
- parse user-provided CSV safely.
- normalize rows into draft records.
- classify source: `manual`, `csv`, `extension`, `open_api_future`.
- produce review-before-save payloads.
- avoid real Shopee network calls unless already using a documented official API flow.
- return safe shaped errors.

3. URL validation hardening
Ensure Shopee Affiliate/product URL validation rejects:
- non-HTTPS URLs.
- `javascript:`, `data:`, `file:`, `blob:`.
- localhost, loopback, link-local, private IPs.
- arbitrary redirect URLs.
- non-Shopee hosts.
- malformed URLs.

Allow only known safe Shopee-related hosts and paths already approved by project policy, including:
- `affiliate.shopee.co.th` for portal link/setup.
- safe Shopee product/link hosts if already supported by the app.

4. CSV/report automation
Add or polish CSV preview automation:
- strict max file size.
- strict max row count.
- UTF-8 handling.
- column detection.
- formula injection rejection/sanitization for values beginning with `=`, `+`, `-`, `@`, tab, or carriage return.
- preview summary with row counts and rejected rows.
- no raw report retention unless explicitly saved by user and scoped.
- no formulas exported back unsanitized.

5. Review-before-save queue
Add or polish a pending ingestion queue concept using existing DB/model patterns when available.
If adding schema, keep minimal and production-safe:
- source
- status: pending_review / approved / rejected / imported / failed
- normalized payload JSON
- safe error summary
- userId / tenantId / orgId scope
- createdAt / updatedAt

Do not store secrets, cookies, raw browser session data, passwords, or private logs.

6. Automation rules
Add safe automation rules only after validation:
- auto-create draft product from approved CSV row/link.
- auto-create draft AI content from product data only when product data is complete enough.
- never auto-publish or externally post without explicit user action.
- always preserve affiliate disclosure.
- keep generated content editable.

7. Optional local import folder worker
Only implement if low-risk and consistent with repo architecture.
Rules:
- disabled by default.
- env-gated, for example:
  - `SHOPEE_AFFILIATE_IMPORT_WATCH_ENABLED=false`
  - `SHOPEE_AFFILIATE_IMPORT_DIR=storage/imports/shopee-affiliate`
- refuse absolute paths outside repo/app storage unless already approved storage root exists.
- never read browser profile directories.
- never read cookie/session exports.
- move processed files to archive/error folders.
- produce safe logs only.

8. Extension-assisted capture foundation
If extension exists:
- ensure permissions are minimal.
- no cookies permission.
- no broad host permissions beyond required user-facing pages.
- no background scraping.
- payload must be explicit user click.
- server must validate payload exactly like manual import.

9. UI/UX polish
Add or polish UI for:
- Automation status card.
- Import queue pending review count.
- Upload CSV/report with preview.
- Paste affiliate link with instant validation.
- Extension capture status/help.
- Clear Thai-first copy explaining safe automation boundaries.
- Empty/loading/error states.
- Mobile friendly layout.

10. Admin/operator visibility
Add aggregate-only safe operator metrics if admin analytics exists:
- imported links count.
- CSV previews count.
- rejected unsafe URLs count.
- rejected CSV formula rows count.
- pending review count.

Do not show raw private user content or secrets.

11. Documentation
Create or update:
- `docs/runbooks/shopee-affiliate-safe-automation.md`

Include:
- automation levels.
- safe manual link pipeline.
- safe CSV/report pipeline.
- optional folder watcher policy.
- extension capture policy.
- Open API future sync path.
- forbidden automation list.
- troubleshooting.
- production env variables.
- rollback notes.

12. Tests
Add or update tests covering:
- URL allowlist accepts official Shopee Affiliate portal URL.
- URL allowlist accepts safe Shopee product/affiliate links if supported.
- URL allowlist rejects non-HTTPS, javascript/data/file/blob, localhost, private IP, and unrelated hosts.
- CSV formula injection rejection/sanitization.
- CSV row count/file size limits.
- manual import route requires auth.
- CSV preview route requires auth.
- queue/review records are scoped to user/tenant/org.
- no password/cookie/session/localStorage fields are stored or accepted.
- no scraping/private endpoint/CAPTCHA bypass copy or code.
- no guaranteed income/fake review claims.
- no secret/path leakage in UI/API.
- extension permissions remain minimal if extension exists.
- start.sh keeps Shopee Affiliate auth URL validation.

Suggested tests:
- `tests/lib/shopee-affiliate-url-safety.test.ts`
- `tests/services/shopee-affiliate-ingestion-service.test.ts`
- `tests/api/shopee-affiliate-safe-ingestion.test.ts`
- `tests/components/shopee-affiliate-automation-static.test.ts`
- `tests/docs/shopee-affiliate-safe-automation-runbook-static.test.ts`

13. start.sh / production smoke
Update `start.sh` only if needed:
- keep `SHOPEE_AFFILIATE_AUTH_URL` validation.
- do not add mutating POST smoke tests.
- HEAD/GET route smoke only.
- do not create production import records from start.sh.

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
grep -RniE "password|cookie|localStorage|sessionStorage|browser profile|captcha|anti-bot|scrape|crawler|private endpoint|undocumented endpoint" src app components tests docs scripts 2>/dev/null || true

grep -RniE "guaranteed income|guarantee income|รวยแน่นอน|รายได้แน่นอน|การันตีรายได้|รีวิวปลอม|fake review" src app components tests docs scripts 2>/dev/null || true

grep -RniE "DATABASE_URL|SHOPEE_PARTNER_KEY|SHOPEE_WEBHOOK_SECRET|access_token|refresh_token|/var/lib|outputPath" src app components tests docs scripts 2>/dev/null || true
```

Interpretation:
- Docs/tests may mention forbidden terms only as explicit prohibitions.
- App/UI code must not offer unsafe actions.
- No route should capture password/cookie/session material.
- No tests should call real Shopee endpoints.
- No production smoke should mutate import data.

Production verification:
Run on real VM after merge:

```bash
cd ~/zsp-aitool
git pull --rebase origin main
bash start.sh

# Auth-protected endpoint should not expose private status without login/session.
curl -i http://127.0.0.1:3001/api/integrations/shopee/status | head -40

systemctl --failed --no-pager
systemctl is-system-running --no-pager || true
```

Expected production markers:
- `FULL_PRODUCTION_START_COMPLETED=true`
- `SHOPEE_AFFILIATE_AUTH_CONFIGURED=true`
- health check completed with 0 failures and 0 warnings
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
   - `feat: add Shopee affiliate safe ingestion automation`
   - `test: add Shopee affiliate ingestion safety coverage`
   - `docs: add Shopee affiliate safe automation runbook`
   - `fix: harden Shopee affiliate ingestion validation`

Do not bundle unrelated HyperFrames, billing, admin, or deployment changes.

Final response format:
Return exactly these sections:

1. Overall verdict
- PASS / WARN / FAIL
- SHOPEE_AFFILIATE_SAFE_AUTOMATION_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
- concise explanation of safe automation work

3. Files reviewed
- grouped by area

4. Files changed
- list files changed, or None

5. Schema changes
- describe migration/SQL changes, or No schema changes

6. Automation behavior
- manual link automation
- CSV/report automation
- local import folder watcher
- extension capture automation
- Open API future sync path

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
- automation status card
- import queue
- CSV preview
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
- URL safety
- ingestion service
- manual import API
- CSV preview API
- import queue/review
- optional folder watcher
- extension capture
- settings/import UI
- admin metrics
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
SHOPEE_AFFILIATE_SAFE_AUTOMATION_READY=true or SHOPEE_AFFILIATE_SAFE_AUTOMATION_READY=false
```
