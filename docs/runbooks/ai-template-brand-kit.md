# AI Template Automation and Brand Kit Runbook

## Scope inventory
- AI generator UI: `src/components/ai/ContentGeneratorForm.tsx`
- Batch generation API: `src/app/api/ai/generate-batch/route.ts`
- Prompt templates: `src/app/dashboard/templates/page.tsx`, `src/components/templates/*`, `src/services/PromptTemplateService.ts`
- Brand kit API/service/schema: `src/app/api/hyperframes/brand-kit/route.ts`, `src/services/hyperframes-brand-kit-service.ts`, `src/schemas/hyperframes-brand-kit.schema.ts`
- Content history: `src/app/dashboard/content-history/page.tsx`, `src/app/api/content-history/route.ts`

## Brand kit defaults (safe)
The dashboard templates page now supports editing and saving:
- `brandColors`
- `fontPreference`
- `logoUrl`
- `watermarkText`
- `defaultCTA`
- `defaultAspectRatio`

All writes use `/api/hyperframes/brand-kit` and keep existing URL/watermark sanitization.

## Template automation
- Added reusable template preset buttons for rapid draft creation.
- Added variable helper panel listing supported placeholders.
- Preview remains available before save.

## Generation guardrails
Visible safety copy now enforces workflow reminders:
- use factual product data only
- no fake reviews or invented specs
- no guaranteed-income claims
- affiliate disclosure required before save/copy/export

Batch generation UX is enabled only through existing safe backend (`versions` 1..5).

## Test focus
- Static safety regression test for brand kit fields and guardrail copy.
- Existing API/service safety checks remain in place for URL sanitization and output policy.
