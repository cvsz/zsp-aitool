# Product Import Workflow Deep Review (Current State)

Date: 2026-05-17  
Scope: `/dashboard/products`, `/dashboard/products/new`, `/dashboard/products/[id]`, `/api/products*`, Prisma Product-related models.

## 1) Product import current-state report

### Summary
The implementation has a usable baseline for manual creation, URL import, JSON import, extension import, list/detail display, and soft-delete filtering. However, it is currently **demo-mode oriented** and not production-safe for multi-user ownership, duplicate control consistency, or robust import UX.

### Workflow-by-workflow findings

1. **Manual product creation**
   - Frontend has a minimal form with title/original URL/price and posts directly to `/api/products`.
   - No user-facing success/error/loading states are shown; form resets regardless of API result.
   - Backend validates via Zod schema and stores Decimal via Prisma.

2. **Import from product URL**
   - API accepts `originalUrl` with URL validation and checks duplicate only against active (`deletedAt: null`) rows for `(userId, originalUrl)`.
   - If duplicate exists, returns `{ duplicate: true, product }`; otherwise returns a draft note requiring manual confirmation.
   - No extraction logic is performed (compliance-safe), but no frontend review UI is wired to consume draft vs duplicate states.

3. **Import from JSON**
   - API validates payload shape and product fields with Zod.
   - Service does `Promise.all(create)` and does not pre-check duplicates; DB unique constraint may fail mid-batch.
   - No partial-success reporting contract for mixed valid/duplicate rows.

4. **Browser extension import**
   - API requires `visibleDataOnly: true` and validates key fields.
   - Route auto-fills missing `price/currency/images` defaults and creates immediately.
   - No “review before save” API stage for extension payload despite compliance requirement.

5. **Product image handling**
   - Image URL array validated as `.url().max(2000)`.
   - On update with `images`, existing product images are soft-deleted, then new ones created.
   - No host/protocol restrictions, duplicate image de-duplication, or file-type sanity checks.

6. **Affiliate URL handling**
   - Product has `affiliateUrl` string and dedicated PATCH endpoint for update.
   - Separate `AffiliateLink` model exists but product update path does not create/sync affiliate link records.
   - No platform/tracking metadata handling in product endpoint path.

7. **Duplicate product prevention**
   - Schema has `@@unique([userId, originalUrl])` and service checks duplicate only in URL import path.
   - Direct create, JSON import, and extension import can still hit unique-constraint errors without normalized URL matching.
   - Duplicate detection is exact-string match only (no canonicalization).

8. **Product validation before save**
   - Zod validation exists for create/update/import routes and URL fields.
   - Price/rating bounds exist; soldCount integer/non-negative.
   - Missing advanced validation: normalized currency enum, stricter URL domain policy, price decimal precision guard before Prisma.

9. **Product list and detail display**
   - List page server-renders products and has basic empty state text.
   - Detail page shows title/price/url/description with 404 fallback.
   - No loading skeleton/error boundary UX, no image gallery, no affiliate-link emphasis, no import provenance.

## 2) Edge cases list

- URL canonicalization mismatch (query params, trailing slash, fragments, `http` vs `https`) causing near-duplicates.
- JSON import with one duplicate among many causing entire `Promise.all` reject and no partial diagnostics.
- Currency strings beyond expected set (e.g., lowercase, malformed symbols).
- Price values with excessive precision or number representation edge cases from JS float -> Decimal.
- Extension payload with `price: 0` default accepted as real product when source omitted price.
- Soft-deleted product with same URL blocks re-create due to DB unique on `(userId, originalUrl)`.
- Update operation soft-deletes images first; if product update fails later, images can remain deleted.
- API routes without consistent try/catch around Zod parse return framework-level 500 on parse failure in some routes.

## 3) Missing validations

- URL normalization/canonicalization before duplicate check and persistence.
- Additional URL safety checks (protocol allowlist, optional domain restrictions depending on business policy).
- Image URL MIME/extension/protocol checks beyond generic URL format.
- Affiliate URL business rules (e.g., affiliate-domain allowlist, prevent setting same as original URL if disallowed).
- Decimal precision guardrails before Prisma conversion.
- Batch JSON import row-level validation/reporting schema for partial success.
- “needs_review” state workflow for URL/extension imports before persistent create.

## 4) Security & authorization risks

- Most product routes use `DEFAULT_USER_ID` fallback instead of authenticated user context.
- Ownership is enforced only by passing `userId` into service methods; if user identity source is static demo env, cross-user isolation is not real.
- Inconsistent error handling in import endpoints may leak unstructured errors.
- Potential stored unsafe URLs (original/affiliate/image) can lead to unsafe link rendering without rel/noopener policies in UI.

## 5) Recommended implementation plan

### Phase 1: Correctness and ownership (highest priority)
1. Replace `DEFAULT_USER_ID` usage in product APIs with authenticated user resolver (same pattern as settings API).
2. Add centralized API response + error wrapper for all product endpoints.
3. Introduce URL canonicalization utility in `src/lib` and apply to `originalUrl`, `affiliateUrl`, and image URLs.
4. Update duplicate strategy to check canonical URL and handle unique conflicts gracefully with structured `DUPLICATE_PRODUCT` errors.

### Phase 2: Import workflow hardening
1. Add a draft/review import flow (`pending`/`needs_review`) so extension and URL imports do not auto-persist final product.
2. Add JSON import result contract: `created[]`, `duplicates[]`, `invalid[]`.
3. Add transactional image replacement in update path to avoid partial state.
4. Add schema-level decimal precision checks and currency normalization.

### Phase 3: UX and compliance improvements
1. Add loading/empty/error/success states for product form/import form.
2. Show extracted/imported draft data in `/dashboard/products/new` for user confirmation before save.
3. Display product images + affiliate URL in detail page.
4. Add explicit compliance notices in UI for “user-provided/publicly visible data only.”

### Phase 4: Testing and regression safety
1. Add service-level tests for duplicate URL normalization, soft-delete behavior, and Decimal parsing.
2. Add route tests for auth ownership boundaries and error contracts.
3. Add UI tests for form validation states and import-review confirmation flow.

## 6) Test plan

- **Unit (schemas/lib/services)**
  - URL canonicalization cases (`http/https`, trailing slash, query ordering).
  - Decimal parser for valid/invalid precision and string/number inputs.
  - ProductService duplicate handling paths for create/import-json/import-url/import-extension.
  - Soft-delete + re-create behavior with unique constraints.

- **API integration**
  - `/api/products` create/list/get/update/delete with authenticated user context.
  - `/api/products/import-url` duplicate detection returning structured code.
  - `/api/products/import-json` mixed payload partial-success response.
  - `/api/products/extension-import` requires `visibleDataOnly` and returns draft for review.
  - `/api/products/[id]/affiliate-link` validation failures and ownership rejection.

- **UI tests (Testing Library)**
  - New product page renders manual/import sections and localized labels.
  - Manual form displays inline validation and network error feedback.
  - Import URL/JSON displays review state before final save.
  - Products list empty state and detail not-found state.

- **E2E smoke (optional)**
  - Create product -> list -> detail -> update affiliate link -> soft delete -> verify hidden from list.

## 7) Specific files that likely need changes

- `src/app/api/products/route.ts`
- `src/app/api/products/import-url/route.ts`
- `src/app/api/products/import-json/route.ts`
- `src/app/api/products/extension-import/route.ts`
- `src/app/api/products/[id]/route.ts`
- `src/app/api/products/[id]/affiliate-link/route.ts`
- `src/services/ProductService.ts`
- `src/schemas/product.schema.ts`
- `src/lib` (new URL normalization + decimal parsing helpers)
- `src/components/products/ProductForm.tsx`
- `src/components/products/ProductImportForm.tsx`
- `src/app/dashboard/products/new/page.tsx`
- `src/app/dashboard/products/[id]/page.tsx`
- `tests/api/products.test.ts`
- new tests under `tests/services/` and `tests/api/` for import edge cases
