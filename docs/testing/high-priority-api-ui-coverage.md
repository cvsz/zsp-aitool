# High-Priority API/UI Test Coverage

## Coverage matrix

| Area | Route/component | Test file | Notes |
|---|---|---|---|
| Auth | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` | `tests/api/auth-routes.test.ts` | Contract + auth checks |
| Templates | `/api/templates`, `/api/templates/[id]`, duplicate, restore defaults | `tests/api/templates-crud.test.ts` | CRUD + auth baseline |
| OCR | `/api/ocr/extract`, `/api/ocr/[id]` | `tests/api/ocr-routes.test.ts` | auth + validation-safe errors |
| AI | `/api/ai/generate`, `/api/ai/generate-batch` | `tests/api/ai-generate-routes.test.ts` | auth + validation-safe errors |
| Settings | `/api/settings` | `tests/api/settings-route.test.ts` | auth baseline |
| Exports | `/api/export/products.csv`, `/api/export/content.csv`, `/api/export/content.md`, `/api/export/content/[id].txt` | `tests/api/export-routes-headers.test.ts` | auth and route contract baseline |
| Dashboard UI states | dashboard pages (products/templates/ocr/content history) | `tests/components/dashboard-pages-states.test.tsx` | empty/loading/error static checks |

## Files added/updated
- Added focused API route tests for OCR, AI generation, settings, and export routes.
- Added dashboard page states static test.
- Added static doc-coverage guard test.
- Updated `package.json` test script to include new focused tests.

## Remaining gaps
- Deep happy-path content assertions for export headers/content-disposition are still partially covered by service and route suites and can be expanded further.
- Dashboard state tests are static text checks; interactive RTL state simulation can be added in a later pass.

## Run focused tests

```bash
npx vitest run tests/api/auth-routes.test.ts tests/api/templates-crud.test.ts tests/api/ocr-routes.test.ts tests/api/ai-generate-routes.test.ts tests/api/settings-route.test.ts tests/api/export-routes-headers.test.ts tests/components/dashboard-pages-states.test.tsx tests/docs/high-priority-test-coverage-static.test.ts
```

## Run full suite

```bash
npm run test
```
