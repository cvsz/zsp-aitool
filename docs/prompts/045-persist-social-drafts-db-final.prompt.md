# 045 — Persist Social Drafts DB Final Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool` after Product import/deduplication basics are stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
045 — Persist Social Drafts DB Final.

Priority:
High. Shopee social post drafts must be fully database-backed with edit/version/copy status and review-safe publishing workflow.

Primary objective:
Finish DB-backed Shopee Affiliate social drafts so generated drafts are persisted, editable, versioned, reviewable, copy-trackable, and linked to Product/AffiliateLink/import records.

Hard constraints:
- Do not auto-publish to any social platform.
- Do not store social platform passwords, cookies, sessions, localStorage, or browser credentials.
- Do not call private social APIs.
- Do not fake reviews, fake purchase experience, fake income claims, or guaranteed conversion claims.
- Preserve affiliate disclosure in generated copy.
- All draft routes require auth and user scoping.
- No secrets/local paths/raw stack traces in API/UI.

Review first:
- prisma/schema.prisma
- src/components/shopee/ShopeeAffiliateRealDbDashboard.tsx
- src/app/api/integrations/shopee/affiliate-ingestions/[id]/social-drafts/route.ts
- src/app/api/integrations/shopee/affiliate-ingestions/social-drafts/copy/route.ts
- src/services/ShopeeAffiliateSocialDraftService.ts if present
- src/services/ShopeeAffiliateIngestionService.ts
- docs/runbooks/shopee-affiliate-social-posting.md
- tests/api/**shopee**
- tests/components/**shopee**
- package.json
- start.sh

Required work:
1. Schema finalization
Ensure `ShopeeAffiliateSocialDraft` supports:
- userId
- ingestionId
- productId
- affiliateLinkId
- channel
- status
- title
- content/body
- disclosure
- hashtags
- version
- copiedAt
- reviewedAt
- archivedAt
- deletedAt
- metadata/source fields

Add `ShopeeAffiliateSocialDraftVersion` if needed:
- draftId
- version
- content
- editor/source
- createdAt

2. Service layer
Create/finalize:
```text
src/services/ShopeeAffiliateSocialDraftService.ts
```

Responsibilities:
- generate compliant initial draft from ingestion/product.
- save edits.
- create immutable version history on edit.
- mark copied.
- mark ready for review.
- archive/reject.
- list drafts by user/channel/status/product.
- ensure disclosure is present before ready/copy.
- sanitize unsafe claims.

3. API routes
Finalize:
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
- auth required.
- user scoped.
- PATCH creates new version.
- DELETE soft-deletes.
- copy marks copiedAt/status and returns copyable body.
- no external social calls.

4. Dashboard UI
Update `/dashboard/shopee-affiliate`:
- show persisted draft list per item/product.
- generate draft creates DB row.
- edit textarea saves to DB.
- version display.
- copy button calls copy endpoint.
- archive/reject controls.
- status pills.
- channel filter.
- loading/error/empty states.

5. Tests
Add/update:
```text
tests/services/ShopeeAffiliateSocialDraftService.test.ts
tests/api/shopee-social-drafts.test.ts
tests/components/shopee-social-drafts-static.test.tsx
tests/security/shopee-social-drafts-compliance.test.ts
```

Coverage:
- auth required.
- user scoping.
- generation includes disclosure.
- X uses short disclosure.
- edit increments version.
- copy sets copiedAt.
- archive soft state.
- no auto-publish route exists.
- forbidden claims are rejected/sanitized.
- no token/path leakage.

6. Documentation
Update:
```text
docs/runbooks/shopee-affiliate-social-posting.md
```
Create if needed:
```text
docs/runbooks/shopee-social-drafts-db.md
```

7. start.sh marker:
```text
SHOPEE_SOCIAL_DRAFTS_DB_FINAL_CONFIGURED=true
```

Verification:
```bash
git status --short
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm run prisma:generate
npx prisma validate
npx prisma migrate status --schema prisma/schema.prisma
npm run typecheck
npm run test
npm run build
bash start.sh
```

Final response format:
1. Overall verdict
- PASS / WARN / FAIL
- SHOPEE_SOCIAL_DRAFTS_DB_FINAL_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
3. Files reviewed
4. Files changed
5. Schema changes
6. Service behavior
7. API behavior
8. Dashboard behavior
9. Compliance behavior
10. Commands run
11. Blocking issues
12. Remaining risks
13. Commit hash
14. PR status

Final line:
SHOPEE_SOCIAL_DRAFTS_DB_FINAL_READY=true or SHOPEE_SOCIAL_DRAFTS_DB_FINAL_READY=false
```
