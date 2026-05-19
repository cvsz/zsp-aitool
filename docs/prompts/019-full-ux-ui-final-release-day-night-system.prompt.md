# 019 — Full UX/UI Final Release: All Menus, All Features, Day/Night/System + Background Color Select

Use this prompt after phases 014–018 are stable and production launch/post-launch runbooks are in place.

```text
You are working on cvsz/zsp-aitool.

Phase:
019 — Full UX/UI Final Release: All Menus, All Features, All Options, All Functions, Day/Night/System Theme, and Background Color Select.

Mode:
Final release UX/UI consolidation. Inventory first, then implement safe UI/UX, navigation, copy, accessibility, theme, background color selection, state handling, and documentation improvements. Do not change core backend behavior unless a tiny safe response-shaping fix is required for an existing UI contract.

Project context:
zsp-aitool is a Thai-first SaaS for Shopee Affiliate creators. It supports product capture, affiliate link management, AI promotional content generation, prompt templates, content history, OCR, similar products, CSV/TXT/Markdown export, Chrome Extension MV3, HyperFrames Studio/rendering, operator dashboards, admin foundation, post-launch monitoring, growth loops, and optional official Shopee Open API foundation.

Expected baseline:
- READY_TO_DEPLOY=true.
- READY_TO_LAUNCH=true.
- POST_LAUNCH_MONITORING_READY=true.
- FIRST_100_USERS_READY=true.
- Shopee Open API foundation is disabled by default unless official docs/credentials are complete.
- Tests/build/health are green.
- Build has no @next/next/no-img-element warnings.
- HyperFrames queue/watchdog are healthy in production.

Read before acting:
- AGENTS.md
- .faf
- README.md
- SECURITY.md
- CONTRIBUTING.md
- docs/prompts/014-full-ux-ui-redesign.prompt.md
- docs/prompts/015-production-launch-polish.prompt.md
- docs/prompts/016-post-launch-monitoring-and-growth.prompt.md
- docs/prompts/017-first-100-users-growth-loop.prompt.md
- docs/prompts/018-official-shopee-open-api-integration.prompt.md
- docs/runbooks/production-launch.md
- docs/runbooks/first-100-users-growth-loop.md if present
- docs/runbooks/shopee-open-api-managed-seller-kam.md
- docs/reference/shopee-open-api-developer-guide-v2.1.md
- docs/hyperframes-render-worker.md

Hard constraints:
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions.
- Do not run npm audit fix --force.
- Do not remove postbuild.
- Do not remove scripts/fix-next-server-chunks.sh.
- Do not weaken auth, tenant isolation, org isolation, admin gating, Shopee compliance, or HyperFrames guardrails.
- Do not bypass Shopee CAPTCHA, login walls, anti-bot systems, or private endpoints.
- Do not automate mass scraping.
- Do not collect private Shopee user data.
- Do not generate fake reviews.
- Do not invent product specifications.
- Do not make unsupported income, legal, financial, medical, or exaggerated claims.
- Keep affiliate disclosure visible where relevant.
- Do not expose secrets, DATABASE_URL, tokens, partner keys, access tokens, refresh tokens, outputPath, /var/lib, internal render paths, stack traces, or raw system diagnostics.
- Do not use dangerouslySetInnerHTML for user-controlled content.
- Do not use raw <img> in Next.js app/components; use next/image for user-facing images and thumbnails.
- Do not add UI controls that directly start, stop, restart, enable, or disable systemd services.
- Use prisma migrate deploy, not prisma migrate dev, on production.
- Background color selection must be cosmetic only, safe, allowlisted, accessible, and must never accept arbitrary CSS, arbitrary class names, arbitrary hex input, or remote style URLs.

Main objective:
Produce a final release-grade UX/UI pass that makes every menu, feature, option, state, and function discoverable, consistent, accessible, Thai-first, safe, production-polished, and theme-aware across light, dark, and system modes, with a safe background color selector for user preference.

Required workflow:
1. Inventory all app routes, dashboard routes, API-backed UI surfaces, feature entry points, sidebar links, mobile nav links, action buttons, forms, filters, settings, tabs, modals, empty states, loading states, error states, disabled states, success states, theme states, and background color states.
2. Create a UI coverage matrix before editing code.
3. Identify missing menu links, dead links, inconsistent labels, missing states, inaccessible controls, duplicate copy, unsafe copy, incomplete feature entry points, theme contrast problems, and background color contrast problems.
4. Patch only safe UX/UI issues.
5. Add static tests to prevent regressions.
6. Run full verification.

Theme requirements:
- Add or polish day/night/system appearance support if the project already has settings infrastructure.
- Theme options must be: light, dark, system.
- Add a safe background color selector with allowlisted options only.
- Background color options should include Thai labels and stable internal values, for example: default, slate, indigo, emerald, amber, rose, zinc, and neutral.
- Background color selection must work with light, dark, and system appearance modes.
- Persist appearance/background preference safely if existing settings support it; otherwise use localStorage with graceful fallback.
- System mode must respect prefers-color-scheme.
- No flash of unreadable UI on first load where reasonably avoidable.
- All shared UI primitives must work in light and dark modes and with all allowlisted background colors.
- Dashboard, products, AI, OCR, HyperFrames, admin, login/register, and landing pages must remain readable in light/dark/system and every allowlisted background color.
- Focus rings, disabled states, warnings, success, danger, badges, cards, tables, forms, and nav active states must have accessible contrast in both themes and against selected backgrounds.
- Do not introduce a heavy theme dependency unless already present.
- Prefer Tailwind dark: classes, CSS variables, data attributes, or a minimal theme provider.
- Never allow arbitrary CSS injection or arbitrary user-supplied color values.

UI inventory must include these menu/route groups:

Public/Auth:
- /
- /login
- /register

Dashboard Main:
- /dashboard
- /dashboard/products
- /dashboard/products/new
- /dashboard/products/[id]
- /dashboard/generator
- /dashboard/content-history
- /dashboard/templates
- /dashboard/ocr
- /dashboard/similar
- /dashboard/settings

Product/import features:
- manual product entry
- URL import
- browser extension payload import
- screenshot OCR import
- JSON import
- official Shopee Open API foundation status when configured/disabled
- affiliate link edit/confirm
- product image fallback
- product detail actions
- similar product refresh
- export actions

AI/content features:
- platform selector
- language selector
- tone selector
- content length/options
- product selector
- prompt template selector
- AI generation action
- batch generation if present
- generated content card
- copy action
- export action
- affiliate disclosure notice
- warning when product data is incomplete

Prompt templates:
- template list
- create/edit flow if present
- duplicate flow
- restore defaults
- variable helper
- preview panel
- validation messages

OCR:
- upload/dropzone
- OCR status
- confidence notice
- extracted text review
- save-as-product handoff
- warning that OCR can be inaccurate

Similar products:
- recommendation cards/table
- score badge
- reason display
- refresh action
- insufficient-data empty state

Exports:
- product CSV
- content CSV
- Markdown
- TXT
- safe export notes
- CSV formula injection warning/handling where relevant

HyperFrames:
- /dashboard/hyperframes
- /dashboard/hyperframes/renders
- /dashboard/hyperframes/batch
- /dashboard/hyperframes/ops
- /dashboard/hyperframes/ops/queue
- Studio composition form
- script generation
- script-to-composition
- render enqueue
- render history filters
- RenderJobCard
- capability flags: canDownload, canCancel, canRetry
- secure download action
- retry/cancel action copy
- thumbnail with next/image
- batch render validation/result panel
- operator status cards
- queue status cards
- watchdog/disk/stale warnings
- read-only/safe operator copy
- no systemd controls
- no outputPath or /var/lib exposure

Admin:
- /dashboard/admin
- /dashboard/admin/users
- /dashboard/admin/products
- /dashboard/admin/content
- /dashboard/admin/renders
- /dashboard/admin/system
- /dashboard/admin/audit-logs
- /dashboard/admin/settings
- AdminShell
- AdminMetricCard
- AdminStatusPanel
- AdminGuardNotice
- AdminPlaceholderTable
- aggregate-only overview
- gated/disabled state
- no raw emails/passwords/secrets/local paths
- no dangerous actions

Shopee Open API foundation:
- status copy for disabled mode
- setup docs link if present
- Managed Seller / Mall Seller / KAM guidance link
- no real calls if docs/credentials incomplete
- no seller password storage
- no scraping/private endpoint wording

Post-launch/growth:
- onboarding checklist
- first product CTA
- first AI generation CTA
- export/copy CTA
- optional HyperFrames CTA
- feedback loop copy
- compliance-safe copy
- no guaranteed income claims

Settings:
- profile/account display if present
- appearance setting: light/dark/system
- background color selector with allowlisted options and Thai labels
- safe integration settings copy if present
- affiliate/compliance settings if present
- no secret display

Shared component requirements:
Review/polish or add only if useful:
- src/components/ui/Button.tsx
- src/components/ui/Card.tsx
- src/components/ui/PageHeader.tsx
- src/components/ui/StatCard.tsx
- src/components/ui/StatusBadge.tsx
- src/components/ui/ModuleCard.tsx
- src/components/ui/AlertBanner.tsx
- src/components/ui/EmptyState.tsx
- src/components/ui/LoadingSpinner.tsx
- src/components/ui/Toast.tsx
- src/components/ui/DataTable.tsx
- src/components/ui/FormField.tsx
- src/components/ui/Tabs.tsx
- src/components/ui/CopyButton.tsx
- src/components/theme/ThemeProvider.tsx if needed
- src/components/theme/ThemeToggle.tsx if needed
- src/components/theme/BackgroundColorSelect.tsx if useful

Implementation tasks:

1. UI coverage matrix
Create or update:
- docs/runbooks/full-ux-ui-final-release-matrix.md

Include columns:
- Menu/Route
- Feature group
- Primary action
- Secondary actions
- Empty state
- Loading state
- Error state
- Disabled state
- Mobile ready
- Light mode ready
- Dark mode ready
- System mode ready
- Background color ready
- Security notes
- Remaining gap

2. Theme provider, theme toggle, and background color select
If not already present, implement minimal theme support:
- ThemeProvider or script that sets a root class/data-theme safely
- ThemeToggle with Thai labels: สว่าง / มืด / ตามระบบ
- BackgroundColorSelect with Thai labels and allowlisted values only
- Settings page appearance selector
- Settings page background color selector
- Optional header quick toggle if appropriate

Rules:
- Do not break SSR/build.
- Do not require secrets or external APIs.
- Do not store preference in DB unless existing settings model/API already supports it safely.
- localStorage is acceptable for UI-only preference.
- Use CSS variables, data attributes, or an allowlisted Tailwind class map.
- Do not interpolate arbitrary user input into className or style.
- Do not accept arbitrary hex/RGB/HSL/color strings from the user.
- All selected background options must preserve text contrast and focus visibility.

3. Navigation finalization
Polish:
- Sidebar menu labels
- Sidebar group ordering
- MobileNav actions
- active states
- disabled/upcoming state for unavailable features
- route-aware Header titles/subtitles

Ensure all major features are discoverable:
- products
- add product/import
- AI generator
- content history
- templates
- OCR
- similar products
- settings
- appearance day/night/system
- background color selector
- HyperFrames Studio/history/batch/ops/queue
- admin pages
- Shopee Open API setup/status docs link if present

4. All-feature page polish
For every dashboard page:
- clear PageHeader
- primary CTA
- secondary actions
- empty/loading/error states
- Thai-first microcopy
- compliance/safety note where relevant
- mobile responsive cards/tables
- light/dark/system contrast
- selected background contrast

5. Form and option polish
For every form/select/action:
- label is visible
- helper text is clear
- validation error is visible
- disabled state explains why
- no placeholder-only labels
- keyboard focus visible
- safe default values

6. Final safety copy
Check and fix copy that might imply:
- guaranteed income
- fake reviews
- automated scraping
- private endpoint usage
- unsupported Shopee access
- hidden automation

7. Tests
Add or update:
- tests/components/full-ux-ui-final-release-static.test.ts
- tests/components/theme-mode-static.test.ts
- tests/components/all-menu-coverage-static.test.ts
- tests/components/background-color-select-static.test.ts

Tests should check:
- Sidebar includes Main, HyperFrames, Admin groups
- MobileNav exists and links to core features
- Settings or header includes light/dark/system appearance labels
- Settings includes background color selector labels
- Background color selector uses allowlisted values only
- No arbitrary hex/RGB/HSL input field exists for background color
- Dashboard pages do not render raw JSON
- No raw <img> in src/app or src/components
- No dangerouslySetInnerHTML in src/app/dashboard or src/components
- No outputPath, /var/lib, DATABASE_URL in user-facing UI files
- No systemctl controls in UI files
- HyperFrames operator pages include read-only/safe wording
- Admin pages use gated shell
- Shopee Open API copy says disabled/foundation-only unless configured
- Growth copy has no guaranteed income claims

8. Documentation
Update when relevant:
- README.md UI/features section
- docs/runbooks/full-ux-ui-final-release-matrix.md
- docs/prompts index if present
- docs/runbooks/production-launch.md if launch smoke route list changed

Verification commands:
Run:

git status --short
git log --oneline -n 20
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health

Static scans:

grep -RniE "dangerouslySetInnerHTML|DATABASE_URL|sk-[A-Za-z0-9]|/var/lib|outputPath" src app components scripts prisma tests docs 2>/dev/null || true

grep -RniE "systemctl[[:space:]]+(start|stop|restart|enable|disable)" src/app src/components 2>/dev/null || true

grep -RniE "<img|img[[:space:]]+src" src/app src/components 2>/dev/null || true

grep -RniE "guaranteed income|guarantee income|รวยแน่นอน|รายได้แน่นอน|การันตีรายได้|รีวิวปลอม|fake review" src app components docs 2>/dev/null || true

grep -RniE "#[0-9a-fA-F]{3,8}|rgb\(|hsl\(|backgroundColor" src/app src/components 2>/dev/null || true

HyperFrames checks:

npm run hyperframes:queue-status || true
npm run hyperframes:worker:watchdog || true

Production VM checks only on real VM:

npx prisma migrate status --schema prisma/schema.prisma
systemctl is-active zsp-aitool
systemctl is-active zsp-hyperframes-worker
systemctl is-enabled zsp-hyperframes-worker
curl -I http://127.0.0.1:3001/
curl -I http://127.0.0.1:3001/login
curl -I http://127.0.0.1:3001/register
curl -I http://127.0.0.1:3001/dashboard
curl -I http://127.0.0.1:3001/dashboard/products
curl -I http://127.0.0.1:3001/dashboard/products/new
curl -I http://127.0.0.1:3001/dashboard/generator
curl -I http://127.0.0.1:3001/dashboard/content-history
curl -I http://127.0.0.1:3001/dashboard/templates
curl -I http://127.0.0.1:3001/dashboard/ocr
curl -I http://127.0.0.1:3001/dashboard/similar
curl -I http://127.0.0.1:3001/dashboard/settings
curl -I http://127.0.0.1:3001/dashboard/hyperframes
curl -I http://127.0.0.1:3001/dashboard/hyperframes/renders
curl -I http://127.0.0.1:3001/dashboard/hyperframes/batch
curl -I http://127.0.0.1:3001/dashboard/hyperframes/ops
curl -I http://127.0.0.1:3001/dashboard/hyperframes/ops/queue
curl -I http://127.0.0.1:3001/dashboard/admin

Environment interpretation:
- If PostgreSQL is unavailable in Codex/container, report DB-dependent checks as WARN/SKIP, not PASS.
- If systemd is unavailable because PID 1 is not systemd, report as WARN/SKIP, not PASS.
- If a route redirects because auth is required, that can be PASS if expected.
- If a route 404s because the menu links to a non-existent page, fix the menu or create a safe placeholder page.
- If Shopee endpoint docs are incomplete, keep official API implementation foundation-only and disabled.
- Any real package/schema/typecheck/test/build/health/security/image/theme/background color accessibility issue must be fixed.

Fix policy:
If issues are found:
1. Make the smallest safe patch.
2. Preserve architecture.
3. Add/update regression tests.
4. Rerun verification.
5. Commit with one of:
   - feat: finalize full UX UI release
   - feat: add day night system theme support
   - feat: add background color selector
   - test: add final UX UI menu coverage
   - docs: add final UX UI release matrix
   - fix: stabilize full UX UI final release

Do not bundle unrelated backend features.

Final response format:
Return exactly these sections:

1. Overall verdict
- PASS / WARN / FAIL
- FULL_UX_UI_FINAL_RELEASE_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
- concise explanation of final UI/theme/background/menu work performed

3. Files reviewed
- grouped by area

4. Files changed
- list files changed, or None

5. Schema changes
- describe changes, or No schema changes

6. Theme behavior
- light mode
- dark mode
- system mode
- background color selector
- allowlisted color options
- persistence strategy
- accessibility/contrast notes

7. Menu/feature coverage table
Columns:
- Menu group
- Routes/features
- Status
- Notes

Rows:
- Public/Auth
- Dashboard Main
- Products/Import
- AI/Content
- Templates
- OCR
- Similar/Export
- HyperFrames
- Admin
- Settings/Theme/Background
- Shopee Open API foundation
- Post-launch/Growth

8. Security/compliance behavior
- Shopee compliance
- affiliate disclosure
- claim safety
- auth/isolation unchanged
- admin/operator safety
- HyperFrames safety
- secret/path exposure
- image rendering safety
- background color input safety

9. Checklist table
Columns:
- Area
- Status
- Notes

Rows:
- package.json
- install
- Prisma generate
- Prisma validate
- typecheck
- tests
- build
- health
- route smoke
- static safety scan
- image lint / next-image
- theme light mode
- theme dark mode
- theme system mode
- background color selector
- mobile navigation
- all menu coverage
- HyperFrames queue
- HyperFrames watchdog

10. Commands run
- include exact commands and PASS/WARN/FAIL

11. Blocking issues
- list or None

12. Environment-only warnings
- list Codex/container-only warnings

13. Remaining risks
- list real residual risks, if any

14. Commit hash
- commit hash if committed
- No commit created if no changes

15. PR status
- PR created / not created

Final line:
FULL_UX_UI_FINAL_RELEASE_READY=true or FULL_UX_UI_FINAL_RELEASE_READY=false
```
