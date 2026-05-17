# Browser Extension Integration Review (cvsz/zsp-aitool)

Date: 2026-05-17
Scope:
- Extension MV3 package
- `POST /api/products/extension-import`
- Product validation + duplicate handling + auth + CORS + error behavior

## Executive Summary

Status: **Partially ready for internal demo, not production-ready**.

The repository includes an MV3 extension and a backend endpoint for extension import. The extension has an explicit user-triggered flow and confirmation before send, which aligns with non-hidden collection requirements. However, there are important gaps in auth, CORS handling, input mapping compatibility, endpoint defaults, and privacy hardening.

## Extension Readiness Report

### What is good

1. User action is required to collect data (`Collect Product`) and send data (`Confirm & Send`).
2. Popup supports review/edit before submit.
3. Content script extracts visible DOM text/images from the active page only.
4. Extension docs explicitly state compliance constraints (no bypass/private API/hidden collection).

### Readiness blockers

1. **Over-broad host permissions** (`https://*/*`) are unnecessary and raise privacy/security risk.
2. **API payload mismatch**: extension sends `{ pageUrl, imageUrls, price:string }`, API expects nested `payload` with `{ originalUrl, images, price:number, visibleDataOnly:true }`.
3. **No robust error parsing**: API error surfaces as raw body text; no structured UX mapping.
4. **Token storage in `chrome.storage.sync`** may sync across browser profile and devices; this is weaker than `session/local` with explicit user warning.
5. **No endpoint default prefill** to required production endpoint at runtime (only placeholder text in HTML).

## API Compatibility Review

### `POST /api/products/extension-import`

Current behavior:
- Parses with `extensionImportSchema`.
- Writes product using `productService.importFromExtension(...)`.
- Uses fallback demo user (`DEFAULT_USER_ID ?? "demo-user"`) instead of request auth context.

Compatibility issues:
1. API expects `{ payload: {...} }`; extension sends flat object.
2. API requires `visibleDataOnly: true`; extension does not send it.
3. API requires numeric price; extension keeps price as free-form string.
4. API has no explicit route-level `try/catch` for Zod errors, so invalid payload can produce generic 500 in production handler behavior depending on framework error boundary.

## Validation, Duplicate, Images, Auth, CORS

### Product validation
- Zod schema is strict enough for core fields, including URL/image limits and bounds.
- But extension pipeline currently cannot satisfy schema without transformation.

### Duplicate product handling
- `importByUrl` has duplicate detection, but `importFromExtension` does not call this path and always creates product.
- No merge-or-needs-review behavior for extension import in DB-backed service.

### Product image import
- API accepts image URLs and stores as ProductImage records.
- Extension currently collects all `<img>` URLs then truncates to 10; this can include unrelated page assets (icons, avatars, trackers), increasing noise/privacy risk.

### Auth/token behavior
- Web app has session auth utilities and middleware elsewhere, but extension-import route currently uses demo user fallback.
- Extension sends Bearer token, but route does not verify/use it.
- This is a critical mismatch: token is requested from user but effectively unused.

### CORS behavior
- No explicit CORS policy is set on extension-import route.
- If endpoint is called cross-origin from extension context, behavior depends on deployment layer defaults. This is fragile.

### Error messages
- Extension error shows `API error (status): raw body`.
- Route returns `{ ok:true }` on success but no standardized typed error envelope from explicit handler.
- UX lacks field-level guidance for common failures (invalid URL, auth expired, duplicate found, etc.).

## Privacy/Security Findings

1. Host permissions are too wide for stated use-case.
2. Collected images are broad and may include non-product assets.
3. Token handling lacks lifecycle controls (no rotation hint, expiration UX, or scoped token requirement).
4. Endpoint auth is effectively bypassed by demo fallback user behavior.
5. No explicit CORS allowlist for extension origin(s).

## Required Implementation Fixes

Priority P0 (must fix before production):
1. **Enforce auth on extension-import route** using validated session/token user identity; remove demo fallback for this route.
2. **Align payload contract**:
   - Option A: map extension payload to API schema in extension client.
   - Option B: accept extension-native schema server-side and transform internally.
3. **Add duplicate handling** in `importFromExtension` (by `userId + originalUrl`) with clear response (`duplicate`, `updated`, `created`, `needs_review`).
4. **Set explicit CORS policy** for allowed origins and methods for extension use-case.

Priority P1:
5. Reduce `host_permissions` to Shopee domains only (remove `https://*/*`).
6. Default API endpoint to `https://studio.zeaz.dev/api/products/extension-import` in stored settings and options UI (still user-editable).
7. Add structured error contract and user-facing localized messages.
8. Filter image extraction to product gallery selectors first; allow manual add/remove in popup.

Priority P2:
9. Improve token storage model (document risk, prefer short-lived scoped tokens; optionally use `chrome.storage.local` and explicit “remember token” toggle).
10. Add audit logging for extension imports (source, timestamp, userId, import result) without storing private browsing data.

## UX Flow Review vs Requirements

Requirement mapping:
- User confirmation before import: **PASS**
- No hidden scraping: **PASS** (user-triggered from popup)
- No bypassing login/CAPTCHA/anti-bot/private APIs: **PASS in intent**, but should add technical guardrails + docs in code comments/tests.
- Only visible/user-selected data: **PARTIAL** (visible DOM yes, but image collection overly broad).
- Never collect private user data: **PARTIAL** (current selectors avoid obvious private data, but broad image harvesting can unintentionally include unrelated assets).
- Do not hardcode tokens: **PASS**
- Endpoint configurable with target URL: **PASS/PARTIAL** (configurable yes, not defaulted in storage).

## Recommended Test Plan

### Unit tests
1. Extension payload mapper (string price -> normalized numeric + currency extraction).
2. Schema validation for extension payload happy/invalid cases.
3. Duplicate merge behavior in ProductService extension import path.

### API tests
1. `401` when token missing/invalid.
2. `422` on invalid payload.
3. `201` created on new product.
4. `200` duplicate/merged response path with deterministic status field.
5. CORS preflight `OPTIONS` behavior with allowed/disallowed origins.

### Extension integration tests (manual/E2E)
1. Collect on a Shopee product page with visible fields present.
2. Review/edit draft then confirm send.
3. Invalid endpoint, network failure, 401, 422, 409 duplicate handling.
4. Token save/clear behavior and recovery UX.
5. Verify only intended fields are sent (inspect request payload in DevTools).

### Security/privacy checks
1. Manifest permission review gate in CI (fail build on wildcard host permission).
2. Static check ensuring no hardcoded tokens/endpoints in code paths.
3. Validate telemetry/logging excludes PII and full browsing history.

