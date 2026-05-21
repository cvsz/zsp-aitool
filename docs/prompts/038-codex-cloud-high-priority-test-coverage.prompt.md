# 038 — Codex Cloud High-Priority Test Coverage Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool`.

Priority:
High. This is a test-coverage hardening pass for core API contracts and dashboard reliability.

Objective:
Find existing tests, update weak/stale tests, and add missing high-priority tests for auth routes, templates CRUD, OCR, AI generation, settings, exports, and dashboard UI states.

```text
You are working on cvsz/zsp-aitool.

Phase:
038 — High-Priority API/UI Test Coverage Hardening.

Mode:
Find / Update / Missing. First audit current coverage. Reuse and improve existing test files when present. Add missing tests only where coverage is absent or materially incomplete. Keep changes focused on tests and any small testability helpers required to make tests stable.

Current project context:
- Next.js App Router app.
- TypeScript.
- Vitest test runner.
- React Testing Library/jsdom is available.
- Prisma is used for PostgreSQL.
- Existing npm scripts include `npm run test`, `npm run typecheck`, `npm run build`, `npm run health`, and HyperFrames checks.
- Do not change production port 3001.
- Do not weaken auth, tenant isolation, org isolation, rate limiting, HyperFrames safety, Shopee safety, Marqeta sandbox-only safety, or security middleware.
````
Primary task list:
1. Auth route integration tests:
   - `/api/auth/register`
   - `/api/auth/login`
   - `/api/auth/logout`
   - `/api/auth/me`
2. Templates API CRUD tests:
   - `GET /api/templates`
   - `POST /api/templates`
   - `GET /api/templates/[id]`
   - `PATCH /api/templates/[id]`
   - `DELETE /api/templates/[id]`
   - existing duplicate / restore-defaults behavior if routes exist.
3. OCR API route tests:
   - `/api/ocr/extract`
   - `/api/ocr/[id]`
4. AI generate + batch route contract tests:
   - `/api/ai/generate`
   - `/api/ai/generate-batch`
5. Settings route tests:
   - `/api/settings`
6. Export route tests for headers/content types:
   - `/api/export/products.csv`
   - `/api/export/content.csv`
   - `/api/export/content.md`
   - `/api/export/content/[id].txt`
7. UI tests for dashboard pages:
   - empty states
   - loading states
   - error states
   - auth/redirect-safe behavior where applicable.

Find/update/audit instructions:
1. Search existing files under `tests/**` for auth, templates, OCR, AI, settings, export, dashboard, and UI static tests.
2. If a suitable test file exists, update it rather than duplicating coverage.
3. If a test file is missing, create a focused one using the naming plan below.
4. Keep tests deterministic. Mock DB/services/fetch/session/auth where necessary.
5. Avoid external network calls.
6. Avoid real OpenAI, OCR provider, Shopee, Marqeta, Cloudflare, or social platform calls.
7. Avoid real browser credential, cookie, localStorage, sessionStorage, or token leakage.
8. Do not test by relying on production secrets.
9. Do not add flaky timing-based tests.
10. Keep test output free of secrets and local filesystem internals.

Preferred new/updated test files:

```text
tests/api/auth-routes.test.ts
tests/api/templates-crud.test.ts
tests/api/ocr-routes.test.ts
tests/api/ai-generate-routes.test.ts
tests/api/settings-route.test.ts
tests/api/export-routes-headers.test.ts
tests/components/dashboard-pages-states.test.tsx
tests/docs/high-priority-test-coverage-static.test.ts
```

If existing file names are already present and better aligned with repo conventions, use them instead and explain why.

Auth route integration tests:
Cover:
- register rejects invalid email/password payloads with safe validation errors.
- register creates a user or delegates to auth service with normalized email.
- duplicate email is rejected safely.
- login rejects invalid payloads.
- login rejects bad credentials with safe generic message.
- login success sets the expected auth cookie/session response behavior without exposing token material in JSON.
- logout clears cookie/session.
- `/api/auth/me` returns 401 when unauthenticated.
- `/api/auth/me` returns safe user shape when authenticated.
- no password hash, raw password, token secret, session secret, or stack trace in responses.

Templates API CRUD tests:
Cover:
- unauthenticated access is rejected where auth is required.
- list returns only authenticated user's templates.
- create validates required fields.
- create stores safe fields only.
- read/update/delete enforces ownership.
- update rejects mutation of immutable fields such as `id`, `userId`, `createdAt`.
- delete is soft-delete if repo convention uses `deletedAt`.
- duplicate route preserves safe fields and changes ownership/metadata correctly if route exists.
- restore-defaults route is covered if route exists.
- no cross-tenant leakage.

OCR API route tests:
Cover:
- unauthenticated extraction is rejected.
- invalid upload/payload returns 400/422.
- supported input contract returns deterministic mocked result.
- OCR job lookup returns 401/404 appropriately.
- OCR response does not include provider secrets, local temp paths, or raw stack traces.
- large/unsupported file or MIME type is handled safely.

AI generate + batch route contract tests:
Cover:
- unauthenticated requests are rejected.
- invalid payloads fail validation.
- single generate route returns stable contract shape when service is mocked.
- batch route accepts valid batch payload and returns stable list/job shape.
- provider failures return safe shaped errors.
- quota/billing/rate-limit behavior is preserved if existing project logic has it.
- no prompt provider keys or raw stack traces are leaked.

Settings route tests:
Cover:
- unauthenticated rejected.
- GET returns defaults when settings row is absent.
- PATCH/PUT validates payload.
- updates only allowed settings fields.
- rejects unknown fields.
- preserves user scoping.
- no schema-drift-sensitive full-row assumptions if avoidable.

Export route header/content-type tests:
Cover:
- CSV routes set `Content-Type` compatible with CSV.
- Markdown route sets a markdown/text content type.
- TXT route sets text/plain.
- `Content-Disposition` filename is safe and stable where applicable.
- unauthenticated exports are rejected where required.
- CSV content escapes cells that could trigger spreadsheet formula injection.
- exported data is scoped to authenticated user.
- empty exports return header-only or documented empty-safe output.

Dashboard UI state tests:
Target pages/components that already exist. Prefer component tests or static tests based on current repo style.
Cover:
- dashboard products empty state.
- dashboard products loading state.
- dashboard products error state.
- dashboard templates empty/loading/error state.
- dashboard OCR empty/loading/error state.
- dashboard generator validation/error state.
- dashboard settings loading/error state.
- dashboard Shopee Affiliate empty/loading/error state.
- HyperFrames dashboard empty/loading/error state if easy and non-flaky.
- no component tries to call real external services in tests.

Package script update:
- Add new test files to `package.json` `scripts.test` so `npm run test` runs them.
- Do not remove existing tests from the list.
- Do not rename existing npm scripts unless absolutely necessary.

Documentation:
Create or update:

```text
docs/testing/high-priority-api-ui-coverage.md
```

Include:
- coverage matrix.
- files added/updated.
- routes covered.
- remaining gaps.
- how to run focused tests.
- how to run full suite.

Verification commands:
Run all relevant commands and capture pass/fail:

```bash
git status --short
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm run typecheck
npx vitest run \
  tests/api/auth-routes.test.ts \
  tests/api/templates-crud.test.ts \
  tests/api/ocr-routes.test.ts \
  tests/api/ai-generate-routes.test.ts \
  tests/api/settings-route.test.ts \
  tests/api/export-routes-headers.test.ts \
  tests/components/dashboard-pages-states.test.tsx \
  tests/docs/high-priority-test-coverage-static.test.ts
npm run test
npm run build
```

If a proposed file name does not exist because you updated an existing file instead, run the actual file names you touched.

Quality bar:
- Tests must be meaningful, not snapshot-only padding.
- Tests must fail before the relevant contract exists and pass after implementation.
- Tests must assert response status, response shape, headers, and security-sensitive omissions where applicable.
- No external network calls.
- No secrets in test fixtures.
- No local path leakage assertions should allow `/home/`, `/var/lib/`, `.env`, or provider key names in API output.
- Keep mocks minimal and close to route boundaries.

Allowed production-code changes:
Small, targeted changes are allowed only if needed to make route contracts testable or fix discovered bugs. Examples:
- export a pure helper.
- add safe response shaping.
- fix missing content type.
- fix auth guard leak.
- fix validation schema.
- fix soft-delete scoping.

Forbidden production-code changes:
- No large refactors.
- No Next.js/Prisma major upgrades.
- No new external provider integrations.
- No billing or auth model rewrite.
- No disabling middleware.
- No weakening security checks.
- No test-only branches in production behavior.

Recommended commit strategy:
Use small commits:
- `test(auth): cover auth route contracts`
- `test(templates): cover template CRUD API`
- `test(ocr): cover OCR API contracts`
- `test(ai): cover generation route contracts`
- `test(settings): cover settings route contract`
- `test(export): cover export headers and content types`
- `test(dashboard): cover empty loading error states`
- `docs(testing): document high priority API UI coverage`

Final response format:
Return exactly these sections:

1. Overall verdict
- PASS / WARN / FAIL
- HIGH_PRIORITY_TEST_COVERAGE_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Audit summary
- existing tests found
- tests updated
- tests added
- still missing

3. Files reviewed
- grouped by API/UI/docs/package

4. Files changed
- list each file and reason

5. Route coverage matrix
Columns:
- Area
- Route/component
- Test file
- Covered cases
- Status

Rows:
- auth register
- auth login
- auth logout
- auth me
- templates list/create/read/update/delete
- template duplicate/restore if present
- OCR extract/job lookup
- AI generate
- AI generate-batch
- settings GET/PATCH
- export products CSV
- export content CSV
- export content Markdown
- export content TXT
- dashboard products states
- dashboard templates states
- dashboard OCR states
- dashboard generator states
- dashboard settings states
- dashboard Shopee states
- HyperFrames dashboard states if touched

6. Security assertions added
- list token/password/session/secret/path/no-cross-user/no-formula-injection assertions

7. Commands run
- exact commands and PASS/WARN/FAIL

8. Failing tests fixed
- list or None

9. Blocking issues
- list or None

10. Remaining risks
- list concrete gaps

11. Commits
- list commit hashes and messages

12. PR status
- created / not created

Final line:
HIGH_PRIORITY_TEST_COVERAGE_READY=true or HIGH_PRIORITY_TEST_COVERAGE_READY=false

## Codex Cloud split prompts
Use these when the master prompt is too large. Run them as separate Codex tasks against the same branch or sequential branches.

### Prompt A — Auth route integration tests

```text
In cvsz/zsp-aitool, audit and add/update tests for /api/auth/register, /api/auth/login, /api/auth/logout, and /api/auth/me. Cover invalid payloads, duplicate register, bad credentials, success response/cookie behavior, logout clearing behavior, unauthenticated /me, authenticated safe user shape, and no password/token/session secret leakage. Prefer tests/api/auth-routes.test.ts unless an existing auth API test file is more appropriate. Add the test file to package.json scripts.test without removing existing tests. Run typecheck, focused auth tests, and npm run test. Commit as test(auth): cover auth route contracts.
```

### Prompt B — Templates API CRUD tests

```text
In cvsz/zsp-aitool, audit and add/update tests for Templates API CRUD: GET/POST /api/templates and GET/PATCH/DELETE /api/templates/[id]. Include duplicate and restore-defaults routes if present. Cover auth required, ownership isolation, validation, create/list/read/update/delete, immutable field protection, soft-delete if applicable, and no cross-user leakage. Prefer tests/api/templates-crud.test.ts. Add to package.json scripts.test. Run typecheck, focused template tests, and npm run test. Commit as test(templates): cover template CRUD API.
```

### Prompt C — OCR API route tests

```text
In cvsz/zsp-aitool, audit and add/update tests for /api/ocr/extract and /api/ocr/[id]. Mock OCR services/providers; never call external OCR. Cover unauthenticated access, invalid payload/MIME/file handling, deterministic success shape, job lookup, 404/401 behavior, and no provider secret/temp path/stack trace leakage. Prefer tests/api/ocr-routes.test.ts. Add to package.json scripts.test. Run typecheck, focused OCR tests, and npm run test. Commit as test(ocr): cover OCR API contracts.
```

### Prompt D — AI generate + batch route contract tests

```text
In cvsz/zsp-aitool, audit and add/update tests for /api/ai/generate and /api/ai/generate-batch. Mock generation services/providers; never call real OpenAI or external AI APIs. Cover unauthenticated access, invalid payloads, valid single-generation response shape, valid batch response shape, provider failure safe errors, quota/rate-limit behavior if present, and no provider key/raw stack leakage. Prefer tests/api/ai-generate-routes.test.ts. Add to package.json scripts.test. Run typecheck, focused AI route tests, and npm run test. Commit as test(ai): cover generation route contracts.
```

### Prompt E — Settings route tests

```text
In cvsz/zsp-aitool, audit and add/update tests for /api/settings. Cover unauthenticated rejection, GET defaults when no settings row exists, PATCH/PUT validation, allowed fields only, unknown field rejection, user scoping, schema-drift-safe behavior where possible, and no secret/path leakage. Prefer tests/api/settings-route.test.ts. Add to package.json scripts.test. Run typecheck, focused settings tests, and npm run test. Commit as test(settings): cover settings route contract.
```

### Prompt F — Export headers/content-type tests

```text
In cvsz/zsp-aitool, audit and add/update tests for /api/export/products.csv, /api/export/content.csv, /api/export/content.md, and /api/export/content/[id].txt. Cover auth requirements, user scoping, correct Content-Type, safe Content-Disposition filenames, empty export behavior, CSV formula-injection escaping, and no local path/secrets in response content. Prefer tests/api/export-routes-headers.test.ts. Add to package.json scripts.test. Run typecheck, focused export tests, and npm run test. Commit as test(export): cover export headers and content types.
```

### Prompt G — Dashboard UI empty/loading/error state tests

```text
In cvsz/zsp-aitool, audit and add/update dashboard UI tests for empty/loading/error states. Target dashboard products, templates, OCR, generator, settings, Shopee Affiliate, and HyperFrames pages/components where feasible. Prefer deterministic component or static tests using existing repo patterns. Mock fetch/services. Do not call external APIs. Assert user-visible empty/loading/error copy, disabled state where relevant, and no secret/local path leakage. Prefer tests/components/dashboard-pages-states.test.tsx or update existing component static tests. Add to package.json scripts.test. Run typecheck, focused UI tests, and npm run test. Commit as test(dashboard): cover dashboard empty loading error states.
```

### Prompt H — Test coverage documentation and package verification

```text
In cvsz/zsp-aitool, create/update docs/testing/high-priority-api-ui-coverage.md with a coverage matrix for auth, templates, OCR, AI generate/batch, settings, exports, and dashboard UI states. Confirm all new test files are included in package.json scripts.test. Run python3 -m json.tool package.json, npm run typecheck, npm run test, and npm run build. Fix only test/doc/package issues. Commit as docs(testing): document high priority API UI coverage.
```
