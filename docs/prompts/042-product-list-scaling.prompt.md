# 042 — Product List Scaling Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool` after CSV import jobs are durable or while imports are still manageable.

```text
You are working on cvsz/zsp-aitool.

Phase:
042 — Product List Scaling for Large Imported Datasets.

Priority:
High. Large Shopee product feeds can create thousands to millions of Product rows. The dashboard and API must stay fast, paginated, searchable, and safe.

Primary objective:
Upgrade Product list API and dashboard so `/dashboard/products` remains fast and usable with 100k+ products.

Hard constraints:
- Do not load all products into memory.
- Do not return unbounded product lists.
- Do not expose other users' products.
- Do not weaken auth or tenant isolation.
- Do not remove existing product features.
- Do not drop product data.
- Avoid breaking existing API contracts unless tests and docs are updated.

Review first:
- prisma/schema.prisma
- src/app/api/products/route.ts
- src/app/api/products/[id]/route.ts
- src/app/dashboard/products/**
- src/components/products/**
- src/services/ProductService.ts
- tests/api/products.test.ts
- tests/services/ProductService.test.ts
- tests/product-validation.test.ts
- tests/components/**product**
- package.json
- start.sh

Required work:

1. API pagination/filtering
Update product list API to support:
- `page`
- `pageSize`
- `q` search
- `category`
- `shopName`
- `source`
- `hasAffiliateUrl`
- `sortBy`
- `sortDir`

Return shape:
```ts
{
  ok: true,
  data: {
    items: ProductSummary[],
    pagination: {
      page: number,
      pageSize: number,
      total: number,
      totalPages: number,
      hasNextPage: boolean,
      hasPrevPage: boolean
    },
    filters: {...}
  }
}
```

Default pageSize should be safe such as 25 or 50. Max pageSize should be capped, e.g. 100.

2. Database indexes
Add safe indexes if missing:
- `Product(userId, createdAt)` already likely exists.
- Ensure useful indexes for category/search/filter patterns.
- Consider indexes on `shopName`, `affiliateUrl`, `deletedAt`, and raw metadata source only if feasible.
- Do not add expensive unbounded text indexes without evaluating DB cost.

3. ProductService
Add a stable method such as:
```ts
listProductsPaginated(userId, filters)
```

Must enforce userId and deletedAt null.

4. Dashboard UI
Update `/dashboard/products`:
- pagination controls.
- search box with debounce or explicit search button.
- category/shop filters.
- sort controls.
- page size selector.
- empty state.
- loading state.
- error state.
- product count summary.
- import source metadata display where safe.
- do not render huge arrays.

5. Bulk operations
Add only if safe and small:
- bulk archive selected products.
- bulk delete soft-delete only.
- select current page only.
- confirmation required.

6. Tests
Add/update:
```text
tests/api/products-pagination.test.ts
tests/services/ProductService.pagination.test.ts
tests/components/products-list-scaling-static.test.tsx
tests/security/products-user-isolation-static.test.ts
```

Coverage:
- unauthenticated rejected.
- page/pageSize validated and capped.
- user scoping.
- deleted products excluded.
- search filters title/shop/category/originalUrl where intended.
- sort stable.
- response includes pagination metadata.
- dashboard has empty/loading/error states.
- no unbounded `findMany` without `take` on product list path.

7. Documentation
Create/update:
```text
docs/runbooks/product-list-scaling.md
```

Include:
- API query params.
- page size limits.
- DB index rationale.
- dashboard behavior.
- large import operational guidance.

8. start.sh
Add source checks and final marker:
```text
PRODUCT_LIST_SCALING_CONFIGURED=true
```

Verification commands:
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
- PRODUCT_LIST_SCALING_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
3. Files reviewed
4. Files changed
5. API behavior
6. DB/index changes
7. Dashboard behavior
8. Security/isolation behavior
9. Commands run
10. Blocking issues
11. Remaining risks
12. Commit hash
13. PR status

Final line:
PRODUCT_LIST_SCALING_READY=true or PRODUCT_LIST_SCALING_READY=false
```
