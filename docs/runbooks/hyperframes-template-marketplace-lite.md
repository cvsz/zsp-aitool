# HyperFrames Template Marketplace Lite

## Objective

Provide curated, safe composition presets for Shopee affiliate workflows without exposing render internals or weakening existing queue/auth/quota controls.

## Included template categories

- product showcase
- discount alert
- comparison
- testimonial-style (safe copy only, no fake reviews)
- short-form social cut

## Safety guardrails

- Presets are local/static metadata only (no executable code payloads).
- Preview assets are local `next/image` static files under `public/images/hyperframes`.
- Unsafe strings are blocked in preset content (for example: `outputPath`, `/var/lib`, `systemctl`, `file://`, `process.env`, `secret`).
- Render enqueue path remains `/api/hyperframes/render` with existing auth, tenant/org scope, quota, and validation unchanged.
- Template handoff only sets safe form defaults (`platform`, `aspectRatio`, `durationSeconds`, `caption/scriptSeed`).

## UX flow

1. User opens `/dashboard/hyperframes`.
2. User browses/searches/filters Template Marketplace Lite cards.
3. User selects a template; form auto-fills safe defaults.
4. User reviews/edits composition script text and submits render through existing guarded API.

## Validation checklist

- `npm run prisma:generate`
- `npx prisma validate`
- `npm run db:schema-drift-check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run health`
- `npm run hyperframes:queue-status`
- `npm run hyperframes:worker:watchdog`
