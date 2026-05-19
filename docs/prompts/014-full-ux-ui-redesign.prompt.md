# 014 — Full UX/UI Redesign Prompt

Use this prompt after the repository is stable, UI Phase 1–3 are merged, and the final UI/Admin/HyperFrames audit coverage exists.

```text
You are working on cvsz/zsp-aitool.

Phase:
014 — Full UX/UI Redesign and Design System Consolidation.

Mode:
Implement in safe, reviewable increments. Do not change backend behavior unless a UI contract requires a small safe response-shaping improvement.

Project context:
- zsp-aitool is a Thai-first SaaS for Shopee Affiliate workflows.
- Core features: auth, product library, affiliate links, product imports, AI content generation, prompt templates, content history, OCR, similar products, exports, Chrome Extension MV3, HyperFrames Studio, render history, secure downloads, worker watchdog, operator UI, and admin foundation.
- Current app already has a professional app shell, admin foundation, HyperFrames operator polish, and final UI/Admin/HyperFrames audit tests.

Hard constraints:
- Do not break existing routes.
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions.
- Do not run npm audit fix --force.
- Do not expose secrets, DATABASE_URL, tokens, stack traces, outputPath, /var/lib, or internal render paths.
- Do not use dangerouslySetInnerHTML for user-controlled content.
- Do not execute arbitrary user HTML.
- Do not add UI controls that directly start, stop, restart, enable, or disable systemd services.
- Keep postbuild and scripts/fix-next-server-chunks.sh intact.
- Preserve auth, user scoping, tenant isolation, org membership checks, and role checks.
- Keep HyperFrames guardrails intact.
- Keep tests deterministic.

UX/UI goals:
Create a cohesive premium SaaS experience across the whole product:
- consistent design tokens
- consistent card, table, form, badge, button, alert, tab, and empty-state patterns
- Thai-first user-facing copy
- strong visual hierarchy
- responsive mobile-first behavior
- accessible keyboard/focus states
- clear loading, error, empty, success, and disabled states
- no raw JSON in user-facing UI
- no unsafe internal/system details in UI
- professional admin/operator views
- polished HyperFrames workflows
- better onboarding and quick actions

Design language:
- clean enterprise SaaS
- slate/indigo base
- subtle gradients
- rounded-2xl/rounded-3xl cards
- soft borders and shadows
- clear active navigation state
- concise Thai microcopy
- accessible contrast
- no distracting animation
- no external UI library unless already installed or explicitly justified

Implementation scope:

1. Design system consolidation
Create or refine shared components:
- src/components/ui/Button.tsx
- src/components/ui/Card.tsx
- src/components/ui/PageHeader.tsx
- src/components/ui/StatCard.tsx
- src/components/ui/StatusBadge.tsx
- src/components/ui/ModuleCard.tsx
- src/components/ui/AlertBanner.tsx
- src/components/ui/EmptyState.tsx
- src/components/ui/LoadingSpinner.tsx
- src/components/ui/DataTable.tsx if useful
- src/components/ui/FormField.tsx if useful
- src/components/ui/Tabs.tsx if useful
- src/components/ui/CopyButton.tsx if useful

Rules:
- Tailwind-only.
- Typed props.
- Accessible labels and focus states.
- No unsafe HTML rendering.
- No dependency churn.

2. Layout polish
Refine:
- src/components/layout/AppLayout.tsx
- src/components/layout/Sidebar.tsx
- src/components/layout/Header.tsx
- src/components/layout/MobileNav.tsx

Requirements:
- consistent spacing across all dashboard pages
- route-aware titles/subtitles
- mobile navigation remains usable
- admin and HyperFrames groups remain visible/gated safely
- no route removal

3. Dashboard overview polish
Refine:
- src/app/dashboard/page.tsx

Add/ensure:
- KPI section
- quick actions
- recent activity safe placeholder or safe API-backed list
- product/content/render overview cards
- onboarding checklist for new users
- affiliate compliance notice
- no raw JSON

4. Product UX polish
Refine:
- src/app/dashboard/products/page.tsx
- src/app/dashboard/products/new/page.tsx
- src/app/dashboard/products/[id]/page.tsx
- product components under src/components/products

Improve:
- product cards
- import method selector
- review-before-save flow
- affiliate link display/editing
- image fallback state
- empty product library state
- validation error display

5. AI content UX polish
Refine:
- src/app/dashboard/generator/page.tsx
- src/app/dashboard/content-history/page.tsx
- AI/content components

Improve:
- platform selector
- tone/language selectors
- generated content cards
- affiliate disclosure visibility
- copy/export controls
- history filters
- empty/loading/error states

6. Prompt template UX polish
Refine:
- src/app/dashboard/templates/page.tsx
- template components

Improve:
- template list layout
- editor preview
- variable helper panel
- restore defaults flow
- duplicate flow
- validation messages

7. OCR UX polish
Refine:
- src/app/dashboard/ocr/page.tsx
- OCR components

Improve:
- upload/dropzone UI
- OCR confidence notice
- extracted text review
- save product handoff
- warning that OCR may be inaccurate

8. Similar products UX polish
Refine:
- src/app/dashboard/similar/page.tsx
- product detail similar widgets

Improve:
- recommendation cards
- score/reason display
- refresh action
- insufficient-data empty state

9. Export UX polish
Refine export panels/buttons where present.

Improve:
- clear CSV/TXT/Markdown actions
- filter hints
- safe export notices
- loading/error states

10. HyperFrames UX polish continuation
Refine:
- src/app/dashboard/hyperframes/page.tsx
- src/app/dashboard/hyperframes/renders/page.tsx
- src/app/dashboard/hyperframes/batch/page.tsx
- src/app/dashboard/hyperframes/ops/page.tsx
- src/app/dashboard/hyperframes/ops/queue/page.tsx
- src/components/hyperframes/*

Improve:
- consistent UI primitives
- status cards
- action bars
- capability flags display
- safe download/retry/cancel microcopy
- no internal path leakage
- no systemd controls

11. Admin UX polish continuation
Refine:
- src/app/dashboard/admin/**
- src/components/admin/**

Improve:
- gated state clarity
- aggregate-only cards
- placeholder tables
- safe admin status panels
- no raw user lists unless a properly gated and paginated API exists
- no dangerous actions

12. Landing/login/register polish
Refine:
- src/app/page.tsx
- src/app/login/page.tsx
- src/app/register/page.tsx

Improve:
- product positioning
- Thai-first conversion copy
- compliance-safe claims
- accessible auth forms
- responsive hero

13. Static safety tests
Add/update tests:
- no raw JSON in normal dashboard pages
- no dangerouslySetInnerHTML in src/app/dashboard or src/components
- no outputPath in UI components/pages
- no /var/lib in UI components/pages
- no DATABASE_URL in UI components/pages
- no direct systemctl controls in UI components/pages
- sidebar contains Main, HyperFrames, Admin groups
- mobile nav exists
- admin pages use gated shell
- HyperFrames pages use safe UI components
- RenderJobCard uses next/image

Suggested test file:
- tests/components/full-ux-ui-redesign-static.test.ts

14. Documentation
Update when relevant:
- README.md UI section
- docs/prompts/README.md if prompt index exists
- docs/hyperframes-render-worker.md only if operator behavior wording changes

Verification:
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health

Run if available:
npm run hyperframes:doctor
npm run hyperframes:worker:once
npm run hyperframes:queue-status || true
npm run hyperframes:worker:watchdog || true

Commit message:
feat: consolidate full UX UI redesign

Final response:
- Summary
- Files changed
- New/updated UI components
- Pages polished
- Security/access behavior
- Tests/checks run
- PASS/WARN/FAIL status
- Remaining warnings
- Commit hash
- READY_FOR_FINAL_REVIEW=true/false
```
