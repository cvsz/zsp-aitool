# Security Review — cvsz/zsp-aitool
Date: 2026-05-17
Reviewer: Codex

## Scope
- Next.js app routes
- API routes
- auth/session
- Prisma queries
- product import (manual/JSON/extension/URL)
- OCR
- AI generation
- export endpoints
- settings
- environment variables
- production deployment assumptions

## Findings

### 1) CRITICAL — Broken authorization across most product/AI/settings/OCR/template endpoints
- **Issue**: Multiple APIs hardcode `process.env.DEFAULT_USER_ID ?? "demo-user"` or `DEFAULT_USER_EMAIL` instead of authenticating request sessions. This collapses multi-tenant isolation.
- **Exploit scenario**: Any unauthenticated caller can read/write demo user data, import products, generate content, update product records, and potentially overwrite shared settings or OCR jobs.
- **Affected files**:
  - `src/app/api/products/route.ts`
  - `src/app/api/products/[id]/route.ts`
  - `src/app/api/products/import-url/route.ts`
  - `src/app/api/products/import-json/route.ts`
  - `src/app/api/products/extension-import/route.ts`
  - `src/app/api/ai/generate/route.ts`
  - `src/app/api/ai/generate-batch/route.ts`
  - `src/app/api/settings/route.ts`
  - `src/services/OCRService.ts`
  - `src/app/api/templates/*` + `src/services/PromptTemplateService.ts`
  - `src/app/api/content-history/*`
- **Recommended fix**:
  1. Apply `withAuth` (or equivalent) to all data APIs.
  2. Remove fallback demo identity from runtime API logic.
  3. Enforce userId in every query and mutation (including template and OCR job access).
  4. Migrate template storage from in-memory global store to Prisma with `userId` ownership.
- **Regression tests**:
  - Unauthorized requests return 401 on all protected routes.
  - User A cannot read/update/delete user B products, content history, templates, settings, OCR jobs.
  - APIs reject requests when no session cookie exists.

### 2) HIGH — Content-history endpoints leak cross-user data and allow cross-user delete
- **Issue**: `/api/content-history` lists all rows without user filter. `/api/content-history/[id]` fetches and deletes by id only.
- **Exploit scenario**: Attacker can enumerate IDs and read/delete other users’ generated content.
- **Affected files**:
  - `src/app/api/content-history/route.ts`
  - `src/app/api/content-history/[id]/route.ts`
- **Recommended fix**: Require auth and enforce `where: { id, userId }` plus soft delete.
- **Regression tests**: Cross-user GET/DELETE should return 404/403.

### 3) HIGH — Export endpoints trust spoofable `x-user-id` header
- **Issue**: Export APIs authenticate by caller-controlled header and only verify user exists.
- **Exploit scenario**: Attacker sets another user ID in header to exfiltrate product/content export.
- **Affected files**:
  - `src/app/api/export/products.csv/route.ts`
  - `src/app/api/export/content.csv/route.ts`
  - `src/app/api/export/content.md/route.ts`
  - `src/app/api/export/content/[id].txt/route.ts`
- **Recommended fix**: Use session-based auth and ignore user-id headers from clients.
- **Regression tests**: Header spoofing must not grant access; authenticated owner can export only own data.

### 4) HIGH — SSRF/network abuse controls missing in URL import flow
- **Issue**: URL input only validates syntax; there is no host/IP allow/deny policy, DNS/IP checks, timeout, size limit, or content-type validation.
- **Exploit scenario**: If URL fetch is added/extended, attackers can target internal metadata and RFC1918 ranges.
- **Affected files**:
  - `src/app/api/products/import-url/route.ts`
  - `src/schemas/product.schema.ts`
  - `src/services/ProductService.ts` (importByUrl)
- **Recommended fix**:
  1. Add SSRF-safe URL validator (block localhost, 127/8, 10/8, 172.16/12, 192.168/16, 169.254/16, metadata IPs).
  2. Resolve DNS and re-check final IP post-redirect.
  3. Enforce strict timeout, max bytes, max redirects, and content-type allowlist.
- **Regression tests**: blocked URL fixtures for private/link-local/metadata addresses; timeout and oversize response tests.

### 5) MEDIUM — CSV injection risk in exports
- **Issue**: CSV serializer quotes fields but does not neutralize formula-leading characters (`=`, `+`, `-`, `@`, tab).
- **Exploit scenario**: Malicious product title/description triggers spreadsheet formula execution when exported file is opened.
- **Affected files**:
  - `src/lib/csv.ts`
  - `src/services/ExportService.ts`
- **Recommended fix**: Prefix dangerous-leading values with `'` before CSV escaping.
- **Regression tests**: Ensure exported cells beginning with formula characters are neutralized.

### 6) MEDIUM — Markdown export drops intended metadata and does not sanitize control content
- **Issue**: Markdown export currently maps only id/platform/output, omitting prompt/status/createdAt from selected data; output can include untrusted markdown content.
- **Exploit scenario**: Inconsistent exports; rendered markdown may contain misleading links/content in downstream viewers.
- **Affected files**:
  - `src/services/ExportService.ts`
  - `src/lib/markdown.ts`
- **Recommended fix**: Include all selected fields and sanitize/escape where needed per renderer policy.
- **Regression tests**: Snapshot tests for metadata preservation + escaping behavior.

### 7) MEDIUM — Template ownership missing (global in-memory store)
- **Issue**: Templates are process-global memory, no auth and no per-user ownership.
- **Exploit scenario**: One user can read/modify/delete templates created by others; data resets on restart.
- **Affected files**:
  - `src/services/PromptTemplateService.ts`
  - `src/app/api/templates/*`
- **Recommended fix**: Persist templates in DB with `userId`, soft delete, and authenticated CRUD.
- **Regression tests**: per-user isolation and persistence checks.

### 8) MEDIUM — AI safety controls partial and not consistently enforced at persistence layer
- **Issue**: `ContentSafety` helper exists but API paths shown do not enforce final safety policy/persistence checks, and generated content history persistence path is not wired in the reviewed routes.
- **Exploit scenario**: Prompt-injection-like product text can steer outputs; unsafe claims may still be returned/saved if not filtered before response/storage.
- **Affected files**:
  - `src/services/ai/ContentSafety.ts`
  - `src/app/api/ai/generate/route.ts`
  - `src/app/api/ai/generate-batch/route.ts`
  - `src/services/AIContentService.ts`
- **Recommended fix**: Centralize generation pipeline to always run content-safety + disclosure injection + policy validators before response/save.
- **Regression tests**: Known unsafe phrase fixtures should be flagged/rewritten and disclosure always present.

### 9) LOW — Session cookie setting is not awaited in auth routes
- **Issue**: `setSessionCookie` is async but not awaited in login/register handlers.
- **Exploit scenario**: Potential race/inconsistent cookie set behavior in edge cases.
- **Affected files**:
  - `src/app/api/auth/login/route.ts`
  - `src/app/api/auth/register/route.ts`
- **Recommended fix**: `await setSessionCookie(token)`.
- **Regression tests**: login/register integration asserts cookie presence deterministically.

### 10) LOW — Deployment assumptions documented but not enforced in code
- **Issue**: README notes Cloudflare challenge/systemd constraints; app lacks explicit runtime guards for trusted proxy headers, strict host checks, and production-safe defaults.
- **Exploit scenario**: Misconfiguration in production can weaken auth/rate-limit reliability.
- **Affected files**:
  - `README.md`
  - runtime config files (`src/lib/env.ts`, API auth/rate-limit paths)
- **Recommended fix**: Add explicit trusted proxy config, host allowlist, and security headers policy.
- **Regression tests**: e2e tests for forwarded IP handling and host validation.

## Secrets/config review
- No hardcoded API keys found in source files reviewed.
- `.env.example` keeps placeholders but includes production URL defaults; ensure this is intentional for contributors.
- CI uses placeholder secrets; safe for public workflow.

## Safe implementation order
1. **AuthN/AuthZ foundation**: protect all API routes with session auth, remove demo-user fallbacks, add user-scoped query helpers.
2. **Data ownership hardening**: content-history/templates/settings/OCR ownership enforcement + template DB migration.
3. **Export hardening**: replace `x-user-id` auth, add CSV injection mitigation, sanitize markdown/txt outputs.
4. **Input/SSRF defenses**: URL fetch guardrail package (DNS/IP checks, timeout, size/content-type, redirects), strict pagination/sort enums.
5. **AI policy enforcement**: single pipeline for prompt construction, safety checks, disclosure, persistence.
6. **Deployment controls**: proxy/host/security header configuration and production checklist automation.
