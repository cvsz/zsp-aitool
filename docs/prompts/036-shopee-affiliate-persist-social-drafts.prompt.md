# 036 — Shopee Affiliate Persist Social Drafts Prompt

Use after production passes `bash start.sh` with these markers:

```text
FULL_PRODUCTION_START_COMPLETED=true
SHOPEE_AFFILIATE_REAL_DB_ROUTES_CONFIGURED=true
SHOPEE_THAI_DATAFEED_IMPORT_CONFIGURED=true
SHOPEE_SOCIAL_POSTING_GUIDE_CONFIGURED=true
GIT_CONFLICT_GUARD_CONFIGURED=true
```

```text
You are working on cvsz/zsp-aitool.

Phase:
036 — Persist Shopee Affiliate Social Drafts to Database.

Mode:
Compliance-safe social content drafting. Persist generated social post drafts to the real PostgreSQL database and keep all drafts user-reviewed. Do not auto-publish to any social platform. Do not scrape Shopee Affiliate Portal or social platforms. Do not store Shopee cookies, sessions, localStorage, sessionStorage, passwords, or browser credentials.

Current production baseline:
- Production deploy passes on the real VM via `bash start.sh`.
- Shopee Affiliate ingestion queue is real database-backed.
- Thai Product Feed CSV/TSV import is configured.
- Shopee short link host `s.shopee.co.th` is allowlisted.
- `/dashboard/shopee-affiliate` exists and is healthy.
- Dashboard can generate social drafts in frontend state.
- Social posting runbook exists.
- Shopee Affiliate status/API routes are auth-protected.
- Prisma migrations are up to date.
- Typecheck, tests, build, health, and HyperFrames watchdog pass.

Main objective:
Move Shopee Affiliate social post drafts from frontend-only state to real PostgreSQL persistence with versioned, editable, review-before-copy behavior.

Required user flow:
1. User imports Product Feed CSV/TSV or manual URL into Shopee Affiliate DB queue.
2. User approves/imports queue item into Product/AffiliateLink where needed.
3. User selects social channel: Facebook, Threads, X, Instagram, TikTok, YouTube Shorts.
4. User clicks Generate Social Draft.
5. App creates a persisted DB draft linked to the ingestion item and optional Product/AffiliateLink.
6. User edits and saves the draft.
7. User copies the final draft.
8. User manually posts it or uses only platform-approved posting/auth flows in a later phase.

Forbidden behavior:
- No auto-publishing to Facebook, Instagram, Threads, X, TikTok, YouTube, or any other platform.
- No storing social media passwords, cookies, sessions, localStorage, or browser credentials.
- No scraping social platforms.
- No automated Shopee Affiliate Portal login.
- No private/undocumented Shopee endpoint calls.
- No CAPTCHA, anti-bot, login-wall, rate-limit, or device-check bypass.
- No fake reviews, fake personal experience, fake conversion claims, fake urgency, or guaranteed income claims.
- No secret leakage, stack traces, local filesystem paths, `DATABASE_URL`, partner keys, access tokens, refresh tokens, `/var/lib`, or `outputPath` in UI/API.

Hard constraints:
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions.
- Do not run `npm audit fix --force`.
- Do not remove `postbuild` or `scripts/fix-next-server-chunks.sh`.
- Do not weaken auth, tenant/user isolation, org isolation, admin gating, HyperFrames safety, quota checks, or Shopee compliance guardrails.
- All social draft routes must require auth.
- All data must be scoped to authenticated user and tenant/org where applicable.
- Generated drafts must preserve affiliate disclosure.

Review before changing:
- AGENTS.md
- .faf
- README.md
- SECURITY.md
- package.json
- start.sh
- prisma/schema.prisma
- prisma/migrations/**
- src/components/shopee/ShopeeAffiliateRealDbDashboard.tsx
- src/services/ShopeeAffiliateIngestionService.ts
- src/lib/shopee-affiliate-url-safety.ts
- src/app/api/integrations/shopee/affiliate-ingestions/**
- src/app/api/integrations/shopee/affiliate-manual-import/route.ts
- src/app/api/integrations/shopee/affiliate-csv-preview/route.ts
- docs/runbooks/shopee-affiliate-social-posting.md
- docs/runbooks/shopee-affiliate-safe-automation.md if present
- tests/security/security-compliance-static-scans.test.ts
- tests/security/extension-permissions.test.ts
- existing Shopee tests and dashboard static tests

Implementation tasks:

1. Database schema
Add Prisma enums and model for persisted social drafts.

Suggested enums:

```prisma
enum ShopeeAffiliateSocialChannel {
  FACEBOOK
  THREADS
  X
  INSTAGRAM
  TIKTOK
  YOUTUBE_SHORTS
}

enum ShopeeAffiliateSocialDraftStatus {
  DRAFT
  READY_FOR_REVIEW
  COPIED
  ARCHIVED
  REJECTED
}
```

Suggested model:

```prisma
model ShopeeAffiliateSocialDraft {
  id             String   @id @default(cuid())
  userId         String
  ingestionId    String?
  productId      String?
  channel        ShopeeAffiliateSocialChannel
  status         ShopeeAffiliateSocialDraftStatus @default(DRAFT)
  title          String?
  body           String
  affiliateUrl   String?
  disclosure     String
  hashtags       String[]
  version        Int      @default(1)
  metadata       Json?
  copiedAt       DateTime?
  reviewedAt     DateTime?
  archivedAt     DateTime?
  deletedAt      DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ingestion      ShopeeAffiliateIngestion? @relation(fields: [ingestionId], references: [id], onDelete: SetNull)
  product        Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([userId, channel, status, createdAt])
  @@index([ingestionId])
  @@index([productId])
  @@index([deletedAt])
}
```

If relations require adding back-relations to `User`, `Product`, or `ShopeeAffiliateIngestion`, add them carefully without breaking existing migrations.

2. Migration
Create a production-safe Prisma migration for the model.
Use `npx prisma migrate deploy --schema prisma/schema.prisma` in production only.
Do not use `prisma migrate dev` in production.

3. Service layer
Create a service such as:

```text
src/services/ShopeeAffiliateSocialDraftService.ts
```

Responsibilities:
- build compliant draft body from an ingestion item.
- include required affiliate disclosure.
- select channel-specific format.
- sanitize unsafe claims.
- persist draft to DB.
- list drafts for authenticated user.
- update editable draft body/title/hashtags/status.
- mark copied with `copiedAt`.
- archive/reject drafts.
- never perform external social network calls.

4. Draft generation rules
Generated draft must:
- mention the product/shop title if available.
- include safe Shopee affiliate link if present.
- include affiliate disclosure.
- avoid guaranteed income/savings claims.
- avoid fake reviews or fake first-person experience.
- avoid fake urgency such as "only today" unless imported data explicitly supports it.
- avoid health/medical/financial claims unless verified and allowed.
- remain editable before copy/post.

Channel guidance:
- Facebook/Threads: concise explanatory post with disclosure and link.
- X: shorter draft with short disclosure.
- Instagram/TikTok/YouTube Shorts: caption-oriented draft with safe hashtags.

5. API routes
Add auth-protected routes:

```text
GET  /api/integrations/shopee/social-drafts
POST /api/integrations/shopee/social-drafts
GET  /api/integrations/shopee/social-drafts/[id]
PATCH /api/integrations/shopee/social-drafts/[id]
DELETE /api/integrations/shopee/social-drafts/[id]
POST /api/integrations/shopee/social-drafts/[id]/copy
POST /api/integrations/shopee/social-drafts/[id]/archive
POST /api/integrations/shopee/affiliate-ingestions/[id]/social-drafts
```

Behavior:
- `POST /affiliate-ingestions/[id]/social-drafts` creates a DB draft from a queue item.
- `PATCH /social-drafts/[id]` saves user edits.
- `POST /social-drafts/[id]/copy` marks copied and returns copy-safe body.
- `DELETE` should soft-delete by setting `deletedAt`.
- All routes must scope by userId.
- Return safe JSON errors only.

6. Dashboard UI
Update `/dashboard/shopee-affiliate`:
- Replace frontend-only `draftsById` persistence with DB-backed social drafts.
- Add draft list section under each queue item or a separate Social Drafts panel.
- Add Generate Draft button that calls DB route.
- Add Save Draft edits.
- Add Copy Draft button that calls DB copy endpoint.
- Show channel, status, version, createdAt, copiedAt.
- Keep current social posting guidance card.
- Keep no-auto-publish warning visible.
- Keep mobile responsive layout.

7. Documentation
Update:
- `docs/runbooks/shopee-affiliate-social-posting.md`

Add:
- DB social draft lifecycle.
- draft statuses.
- safe copy workflow.
- no-auto-publish policy.
- troubleshooting.
- rollback notes.

8. start.sh
Update `start.sh` source integrity checks only if needed:
- verify `ShopeeAffiliateSocialDraft` exists in `prisma/schema.prisma`.
- verify social draft service exists.
- verify dashboard uses social draft API instead of frontend-only state.
- verify final marker:

```text
SHOPEE_SOCIAL_DRAFTS_DB_CONFIGURED=true
```

Do not add mutating POST smoke tests to production start script.
Use only GET/HEAD route smoke and static source checks.

9. Tests
Add or update tests:

Suggested tests:

```text
tests/services/ShopeeAffiliateSocialDraftService.test.ts
tests/api/shopee-affiliate-social-drafts.test.ts
tests/components/shopee-affiliate-social-drafts-static.test.ts
tests/docs/shopee-affiliate-social-posting-static.test.ts
```

Coverage:
- social draft creation requires auth.
- draft generation from ingestion item is scoped to user.
- draft body includes affiliate disclosure.
- X uses short disclosure.
- Instagram/TikTok/YouTube captions include safe hashtags.
- draft update cannot change `id`, `userId`, `createdAt`, or ownership.
- copy endpoint marks `copiedAt` and returns draft body.
- delete soft-deletes only.
- no auto-publish API exists.
- no password/cookie/session/localStorage fields are accepted or stored.
- no fake review, fake conversion, or guaranteed income language.
- no secret/path leakage.
- dashboard copy says user must review/post manually.

10. Verification commands
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
grep -RniE "auto.?publish|publish automatically|password|cookie|localStorage|sessionStorage|browser credential|captcha|anti-bot|scrape|private endpoint|undocumented endpoint" src app components tests docs scripts 2>/dev/null || true

grep -RniE "guaranteed income|guarantee income|รวยแน่นอน|รายได้แน่นอน|การันตีรายได้|รีวิวปลอม|fake review|fake conversion" src app components tests docs scripts 2>/dev/null || true

grep -RniE "DATABASE_URL|SHOPEE_PARTNER_KEY|SHOPEE_WEBHOOK_SECRET|access_token|refresh_token|/var/lib|outputPath" src app components tests docs scripts 2>/dev/null || true
```

Interpretation:
- Docs/tests may mention forbidden terms only as explicit prohibitions.
- UI code must not offer unsafe actions.
- No route should store password/cookie/session material.
- No social route should call real social platforms.
- No production smoke should mutate draft records.

Production verification:

```bash
cd ~/zsp-aitool
bash start.sh

curl -i http://127.0.0.1:3001/api/integrations/shopee/social-drafts | head -40
systemctl --failed --no-pager
```

Expected unauthenticated social draft API result:

```text
HTTP/1.1 401 Unauthorized
```

Expected final markers:

```text
FULL_PRODUCTION_START_COMPLETED=true
SHOPEE_AFFILIATE_REAL_DB_ROUTES_CONFIGURED=true
SHOPEE_THAI_DATAFEED_IMPORT_CONFIGURED=true
SHOPEE_SOCIAL_POSTING_GUIDE_CONFIGURED=true
SHOPEE_SOCIAL_DRAFTS_DB_CONFIGURED=true
GIT_CONFLICT_GUARD_CONFIGURED=true
```

Fix policy:
If issues are found:
1. Make the smallest safe patch.
2. Preserve architecture and compliance boundaries.
3. Add/update tests.
4. Rerun verification.
5. Commit with one of:
   - `feat(shopee): persist affiliate social drafts`
   - `test(shopee): cover affiliate social draft persistence`
   - `docs(shopee): update affiliate social draft runbook`
   - `fix(shopee): harden affiliate social draft validation`

Do not bundle unrelated billing, HyperFrames, admin, or deployment changes.

Final response format:
Return exactly these sections:

1. Overall verdict
- PASS / WARN / FAIL
- SHOPEE_SOCIAL_DRAFTS_DB_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
- concise explanation of DB-backed social draft work

3. Files reviewed
- grouped by area

4. Files changed
- list files changed, or None

5. Schema changes
- migration/model/enums, or No schema changes

6. API behavior
- list/create/read/update/delete/copy/archive/generate-from-ingestion

7. Dashboard behavior
- generation, edit, save, copy, status, social channel, disclosure

8. Security/compliance behavior
- no auto-publish
- no password/cookie/session/localStorage storage
- no scraping/private endpoints
- no CAPTCHA/anti-bot bypass
- disclosure preserved
- no fake reviews/guaranteed income claims
- user scoping

9. Checklist table
Columns:
- Area
- Status
- Notes

Rows:
- Prisma schema
- migration
- social draft service
- social draft APIs
- ingestion-to-draft API
- dashboard UI
- runbook
- start.sh
- auth/scoping
- disclosure
- no auto-publish
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
SHOPEE_SOCIAL_DRAFTS_DB_READY=true or SHOPEE_SOCIAL_DRAFTS_DB_READY=false
```
