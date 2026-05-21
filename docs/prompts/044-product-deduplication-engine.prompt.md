# 044 — Product Deduplication Engine Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool` after Phase 042 Product List Scaling is stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
044 — Product Deduplication Engine.

Priority:
High. Large Shopee imports can create duplicates across Product rows when the same item appears through multiple feed files, short links, campaign links, shop links, or category exports.

Primary objective:
Build a safe product deduplication engine that detects, reviews, and merges duplicate Shopee products by URL, raw product ID, shop/category/title similarity, and affiliate/source metadata while preserving user ownership and auditability.

Hard constraints:
- Do not auto-delete products without explicit user/admin action.
- Do not merge products across different users or tenants.
- Do not drop Product, AffiliateLink, ContentGeneration, PlatformPost, OCRJob, HyperFrameRenderJob, SocialDraft, or import metadata.
- Do not lose affiliate URLs, tracking codes, source files, or campaign notes.
- Do not expose secrets, local paths, DATABASE_URL, tokens, cookies, sessions, or raw stack traces.
- Deduplication suggestions must be reviewable before merge.
- Merge must be idempotent and reversible enough via audit logs/metadata.

Review first:
- prisma/schema.prisma
- src/services/ProductService.ts
- scripts/db/import-csv-to-products.ts
- src/app/api/products/**
- src/app/dashboard/products/**
- src/components/products/**
- existing SimilarProduct models/services/tests
- tests/services/SimilarProductService.test.ts
- tests/api/products.test.ts
- tests/product-validation.test.ts
- tests/security/security-compliance-static-scans.test.ts
- package.json
- start.sh

Deduplication signals:
1. Exact same `Product.originalUrl` under same user.
2. Same normalized Shopee product/item ID from rawMetadata/productIdRaw/link parsing.
3. Same affiliate/product short link after expansion is not required; do not call external URL expansion.
4. Same shopName + normalized title + category.
5. Same rawMetadata source product ID from CSV imports.
6. Same Shopee URL path/item identifiers if extractable locally.

Required design:
1. Add dedupe service:
```text
src/services/ProductDeduplicationService.ts
```

Responsibilities:
- normalize URLs without external network calls.
- extract Shopee item/product ID where possible.
- compute deterministic dedupe fingerprint.
- find duplicate groups scoped to user.
- score candidates with explanation.
- create merge suggestions.
- merge reviewed groups safely.

2. Optional schema:
If needed, add model(s):
```prisma
model ProductDuplicateGroup {
  id          String @id @default(cuid())
  userId      String
  status      String @default("PENDING_REVIEW")
  canonicalProductId String?
  productIds  String[]
  score       Decimal? @db.Decimal(5,2)
  reason      Json?
  reviewedAt  DateTime?
  mergedAt    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  @@index([userId, status, createdAt])
}
```

Prefer existing models if the repo already has a better pattern.

3. API routes:
Create/update:
```text
GET  /api/products/deduplication/groups
POST /api/products/deduplication/scan
POST /api/products/deduplication/groups/[id]/merge
POST /api/products/deduplication/groups/[id]/dismiss
```

Behavior:
- auth required.
- user scoped.
- scan is bounded and paginated/batched.
- merge requires explicit canonical product selection.
- dismiss preserves products.
- safe shaped errors only.

4. Merge semantics:
Canonical Product keeps:
- best title.
- best price if current value is zero/missing or newer import metadata says better.
- affiliateUrl preference: newest valid affiliate URL; preserve others in rawMetadata.
- shopName/category if canonical missing.
- rawMetadata merged with source history.

Move or preserve relations:
- AffiliateLink rows moved to canonical product or duplicated safely with conflict handling.
- ContentGeneration rows linked to canonical where appropriate.
- PlatformPost rows linked to canonical where appropriate.
- ShopeeAffiliateIngestion productId points to canonical where appropriate.
- ShopeeAffiliateSocialDraft productId/affiliateLinkId points to canonical where appropriate.
- duplicate Product rows are soft-deleted only, not hard-deleted.

5. Dashboard UI:
Add page/panel:
```text
/dashboard/products/deduplication
```

UI states:
- empty: no duplicate groups.
- loading.
- error.
- scan running.
- groups list with candidate products.
- score/reason display.
- canonical picker.
- merge confirmation.
- dismiss button.
- post-merge summary.

6. Tests:
Add/update:
```text
tests/services/ProductDeduplicationService.test.ts
tests/api/product-deduplication.test.ts
tests/components/product-deduplication-static.test.tsx
tests/security/product-deduplication-isolation.test.ts
```

Coverage:
- URL normalization.
- product ID extraction.
- duplicate group scoring.
- user isolation.
- no cross-user merge.
- canonical merge preserves affiliate links and metadata.
- duplicate products soft-deleted only.
- idempotent merge.
- safe error response/redaction.

7. Documentation:
Create:
```text
docs/runbooks/product-deduplication-engine.md
```

Include:
- dedupe signal explanation.
- safe merge policy.
- rollback/restore guidance.
- operator checklist.
- limitations.

8. start.sh:
Add source checks and marker:
```text
PRODUCT_DEDUPLICATION_ENGINE_CONFIGURED=true
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
- PRODUCT_DEDUPLICATION_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
3. Files reviewed
4. Files changed
5. Schema changes
6. Deduplication algorithm
7. API behavior
8. Dashboard behavior
9. Merge safety behavior
10. Commands run
11. Blocking issues
12. Remaining risks
13. Commit hash
14. PR status

Final line:
PRODUCT_DEDUPLICATION_READY=true or PRODUCT_DEDUPLICATION_READY=false
```
