# Mobile PWA + Chrome Extension Polish Runbook

## Scope
- Mobile dashboard journeys: product capture/import, generator, OCR, similar, settings, HyperFrames.
- Chrome Extension MV3 capture/import safety.
- Extension payload validation + user-facing import state copy.

## Mobile UX inventory
- Primary mobile nav lives in `src/components/layout/MobileNav.tsx`.
- Key pages covered for responsive access:
  - `/dashboard/products/new`
  - `/dashboard/generator`
  - `/dashboard/ocr`
  - `/dashboard/similar`
  - `/dashboard/settings`
  - `/dashboard/hyperframes`

## Extension MV3 safety rules
- Keep permissions minimal: `storage`, `activeTab` only.
- Host permissions limited to Shopee Thailand pages used by user-initiated capture.
- Do not add `<all_urls>` or broad wildcard host permissions.
- Capture only visible product data after explicit user action.
- Never collect private user profile/order/payment/cookie/token data.

## Import API safety
- Endpoint: `POST /api/products/extension-import`.
- Requires auth and server-side Zod validation.
- Reject invalid payloads with controlled `422` response and safe Thai copy.
- Do not trust payload userId; always use authenticated user from server session.
- Return user-facing import state message prompting manual review before publishing.

## PWA metadata/icons note
- Add PWA metadata/icons only when app-level manifest + icon assets are fully wired.
- Keep this phase production-safe by avoiding partial PWA rollout.
