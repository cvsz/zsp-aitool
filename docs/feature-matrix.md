# zsp-aitool / cvsz/zsp-aitool Feature Matrix (Audit)

Last audited: 2026-05-17

## Legend
- **Implemented**: Feature exists and has route/service wiring.
- **Partial**: Exists but gaps in validation/error handling/tests/UX.
- **Missing**: Route or workflow named in scope does not exist.

## 1) Pages / Routes Matrix

| Feature | Route/API/File | User story | Status | Inputs | Outputs | DB tables | Validation present | Validation missing | Errors handled | Errors missing | Tests present | Tests missing | Recommended next action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Landing page | `/` (`src/app/page.tsx`) | Visitor sees product value and can navigate to auth/dashboard | Implemented | none | CTA/navigation UI | none direct | N/A | N/A | UI-level only | No explicit empty/error data states | smoke test only | page rendering assertions | Add route-specific UI tests |
| Dashboard home | `/dashboard` (`src/app/dashboard/page.tsx`) | Logged-in user sees overview actions | Implemented | session cookie | dashboard links/cards | Product, ContentGeneration (indirect) | auth guard in layout/util | no per-widget schema checks | fallback responses | detailed error toast differentiation | smoke | integration auth+data tests | Add dashboard integration test |
| Products list | `/dashboard/products` | User browses saved products | Implemented | query/filter (basic) | list of products | Product, ProductImage | API validation on server types | pagination/filter schema not explicit | API JSON error envelopes | per-filter validation errors | `tests/api/products.test.ts` | UI list tests with empty/loading | Add list UI tests + pagination |
| New product | `/dashboard/products/new` | User manually creates product | Implemented | form fields matching product schema | created product then redirect/list refresh | Product, ProductImage | `createProductSchema` | stricter currency enum/range | API catches and returns message | field-level error mapping | product API tests | form validation UX tests | Add client+server shared error mapping |
| Product detail | `/dashboard/products/[id]` | User views/edits single product | Implemented | id + patch payload | product detail/update/delete | Product, ProductImage, AffiliateLink | `updateProductSchema` | optimistic concurrency/versioning | not-found + generic failures | conflict/update race errors | ProductService tests | route handler tests for patch/delete edge cases | Add PATCH/DELETE API tests |
| Similar for product | `/dashboard/products/[id]/similar` | User sees related saved products | Implemented | product id | ranked similar products | SimilarProduct, Product | id route parsing | score threshold config schema | handles missing source | stale cache refresh errors | SimilarProductService tests | page-level sort/filter tests | Add UI tests and refresh controls |
| Generator | `/dashboard/generator` | User generates AI posts/captions | Implemented | platform/tone/lang/length/product | generated content versions | ContentGeneration, APIUsageLog | `aiGenerationInputSchema` | alignment with Prisma enums (case mismatch risk) | catches provider errors | structured provider error codes | AIContentService/PromptBuilder tests | API route tests for batch/single | Add API contract tests |
| Content history | `/dashboard/content-history` | User reviews prior generations | Implemented | user session, optional id | list/detail/delete history | ContentGeneration | auth/session checks | query param schema for pagination | basic try/catch JSON errors | soft-delete recovery paths | content-history APIs implicit | explicit tests for list/detail/delete | Add route tests |
| Templates | `/dashboard/templates` | User manages prompt templates | Implemented | template payload/update | CRUD + duplicate + restore defaults | ContentTemplate | `templatePayload`/update schemas | platform/tone/language typed alignment | not found + generic | duplicate-name conflict handling | TemplateRenderer tests | templates API tests | Add CRUD route tests |
| OCR page | `/dashboard/ocr` | User uploads screenshot for extraction | Implemented | base64 image + mime | extracted text + optional product save | OCRJob, Product | `extractOCRSchema` | additional mime whitelist/ratio checks | validation and provider errors | retry/backoff surfaced to UI | OCRService tests | API+UI OCR workflow test | Add end-to-end OCR workflow tests |
| Settings | `/dashboard/settings` | User sets defaults/provider prefs | Implemented | settings payload | persisted user settings | UserSetting | `settingsInputSchema` | reconcile with Prisma `UserSetting` fields | GET/PUT error envelope | migration for new settings fields | AuthValidation tests indirect | settings route tests | Add settings contract + migration checks |
| Similar global | `/dashboard/similar` | User explores recommendations across library | Implemented | user session | grouped similar candidates | SimilarProduct, Product | server-side auth | global filter validation | safe empty responses | ranking explanation gaps | SimilarProductService tests | page tests | Add UI tests |
| Login | `/login` | User authenticates | Implemented | email/password | httpOnly cookie + redirect | User | zod auth payload in route | brute-force/captcha config schema | invalid creds handled | lockout/rate-limit UX | AuthValidation tests | login page interaction test | Add UI + rate-limit tests |
| Register | `/register` | User creates account | Implemented | email/password/name | user record + session/cookie flow | User | zod auth payload | password policy complexity docs | duplicate email handled | email verification flow | AuthValidation tests | register page tests | Add verification roadmap |

## 2) API Routes Matrix

| API area | Route(s) | Status | Key notes |
|---|---|---|---|
| Auth | `/api/auth/login`, `/register`, `/logout`, `/me` | Implemented | Cookie/session auth + password hashing; `/me` exists for session introspection. |
| Products CRUD | `/api/products`, `/api/products/[id]` | Implemented | list/create/get/update/delete wired to Product services. |
| Product import | `/api/products/import-url`, `/import-json`, `/extension-import` | Implemented | URL parser + JSON bulk + extension payload (`visibleDataOnly: true`). |
| Affiliate links | `/api/products/[id]/affiliate-link` | Implemented | patch affiliate URL on product/link records. |
| AI generation | `/api/ai/generate` | Implemented | single generation using provider abstraction + safety. |
| Batch generation | `/api/ai/generate-batch` | Implemented | batch mode with bounded versions/input validation. |
| OCR | `/api/ocr/extract`, `/api/ocr/[id]` | Implemented | create OCR job and fetch job detail. |
| Similar products | `/api/products/[id]/similar`, `/similar-refresh` | Implemented | get cached/derived similar set + refresh compute. |
| Templates | `/api/templates`, `/api/templates/[id]`, `/duplicate`, `/restore-defaults` | Implemented | CRUD + helper endpoints. |
| Content history | `/api/content-history`, `/api/content-history/[id]` | Implemented | list/detail/delete generation history. |
| Export | `/api/export/products.csv`, `/content.csv`, `/content.md`, `/content/[id].txt` | Implemented | CSV/Markdown/TXT export endpoints. |
| Settings | `/api/settings` | Implemented | GET/PUT user settings via schema validation. |

## 3) Core Feature Audit

| Core feature | Status | Primary modules |
|---|---|---|
| Product import from URL | Implemented | `product-import-service`, `import-url` route |
| Product import from JSON | Implemented | `import-json` route + product schema |
| Extension import | Implemented | `extension-import` route + `extension/*` MV3 client |
| Manual product creation | Implemented | products POST + new product page |
| Product listing/detail | Implemented | products routes/pages + ProductService |
| Affiliate link management | Implemented | affiliate-link route + Product fields |
| AI content generation | Implemented | AIContentService, provider abstraction, generate route |
| Batch generation | Implemented | generate-batch route + AIContentService |
| Content history | Implemented | content-history routes/pages |
| Templates | Implemented | PromptTemplateService + template routes/pages |
| Prompt presets | **Partial** | Prisma model exists but limited exposed API/workflow |
| OCR extraction | Implemented | OCRService + OCR provider abstraction |
| Similar recommendation | Implemented | SimilarProductService + similar routes/pages |
| Platform posts | **Partial** | Prisma model exists; dedicated API/UI workflow limited |
| Export CSV/Markdown/TXT | Implemented | ExportService + export routes |
| User settings | Implemented | settings route/page + UserSettingService |
| Usage logging | **Partial** | APIUsageLog model exists; coverage by all providers/routes unclear |

## 4) Options / Enums Audit

- **Prisma enums defined**: `Platform {FACEBOOK, INSTAGRAM, THREADS, X}`, `Tone {CASUAL, FRIENDLY, PROFESSIONAL, SALES, REVIEW}`, `Language {TH, EN}`, `JobStatus {PENDING, PROCESSING, COMPLETED, FAILED}`.
- **Risk**: Zod/API layer also defines lower-case and extended values (`blog`, `seo_article`, `comment`, etc.) for AI generation that do not map 1:1 to Prisma enums.
- **Action**: Introduce explicit enum mappers (API <-> domain <-> Prisma) and contract tests.

## 5) Tests Coverage Snapshot

Present:
- `tests/api/products.test.ts`
- `tests/services/ProductService.test.ts`
- `tests/services/OCRService.test.ts`
- `tests/services/SimilarProductService.test.ts`
- `tests/services/ExportService.test.ts`
- `tests/services/AIContentService.test.ts`
- `tests/services/PromptBuilder.test.ts`
- `tests/services/TemplateRenderer.test.ts`
- `tests/services/AuthValidation.test.ts`
- `tests/components/ProductCard.test.tsx`
- `tests/smoke.test.ts`

Missing/high-priority:
- Auth route integration tests (login/register/logout/me).
- Templates API CRUD tests.
- OCR API route tests.
- AI generate + batch route contract tests.
- Settings route tests.
- Export route tests for headers/content types.
- UI tests for dashboard pages (empty/loading/error states).

## 6) Prioritized Action List

1. **P0: Enum contract unification** between Prisma, schemas, and UI (prevent invalid persisted states).
2. **P0: Add API contract tests** for auth, AI, OCR, templates, settings, exports.
3. **P1: Complete PromptPreset workflow** (API + UI + service) to match database model.
4. **P1: Complete PlatformPost workflow** (create/list/status update + optional publish hooks).
5. **P1: Expand error taxonomy** with stable machine-readable error codes per route.
6. **P2: Add pagination/filter schemas** for list endpoints (`products`, `history`, `similar`).
7. **P2: Improve UI resilience** for empty/loading/retry states across dashboard routes.
8. **P2: Verify APIUsageLog coverage** across AI/OCR/export endpoints and document retention policy.
