# 005 — Final Full Repo Production Readiness + UX/UI Completion Audit

Use this prompt after the full UX/UI redesign phases are merged and before starting new feature work.

```text
You are working on cvsz/zsp-aitool.

Phase:
005 — Final Full Repo Production Readiness + UX/UI Completion Audit

Mode:
Review first. Do not change code unless you find a real blocking issue.
If fixes are needed, make the smallest safe patch, add/update regression tests, rerun verification, and commit.

Project context:
zsp-aitool is a Thai-first SaaS for Shopee Affiliate workflows.

Current completed phases:
- 014.1 UI primitives polish
- 014.2 Dashboard overview UX polish
- 014.3 Product + AI + OCR UX polish
- 014.4 HyperFrames/Admin UX consistency pass
- 014.5 Static safety tests + final verification

Core modules:
- Authentication
- Product library
- Product import: manual, URL, extension payload, OCR screenshot, JSON
- Affiliate link management
- AI content generation
- Prompt templates
- Content history
- OCR workflow
- Similar products
- CSV/TXT/Markdown export
- Chrome Extension Manifest V3
- Thai-first dashboard
- HyperFrames Studio
- Render history
- Secure render downloads
- Batch render
- Worker watchdog
- Operator UI
- Admin foundation
- Full UX/UI design system

Read before acting:
- AGENTS.md
- .faf
- SECURITY.md
- README.md
- CONTRIBUTING.md
- docs/prompts/014-full-ux-ui-redesign.prompt.md
- docs/prompts/005-final-full-repo-production-readiness.prompt.md
- docs/hyperframes-render-worker.md

Hard constraints:
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions.
- Do not run npm audit fix --force.
- Do not remove postbuild.
- Do not remove scripts/fix-next-server-chunks.sh.
- Do not expose secrets, DATABASE_URL, tokens, stack traces, outputPath, /var/lib, or internal render paths.
- Do not use dangerouslySetInnerHTML for user-controlled content.
- Do not execute arbitrary user HTML.
- Do not add UI controls that directly start, stop, restart, enable, or disable systemd services.
- Do not use raw <img> in Next.js app/components. Use next/image for user-facing images and thumbnails, with width/height and alt text. Use unoptimized only when appropriate for internal/API-served thumbnails.
- Treat @next/next/no-img-element warnings as issues to fix before final PASS.
- Keep HyperFrames guardrails intact.
- Keep admin gating intact.
- Keep auth/user/org isolation intact.
- Use prisma migrate deploy, not prisma migrate dev, on production.

Main objective:
Perform a complete production-readiness audit after the full UX/UI redesign and make only necessary stabilization fixes.

Review scope:

1. Repository health
- git status
- package.json valid JSON
- no duplicate package scripts
- package-lock in sync
- postbuild preserved
- fix-next-server-chunks.sh preserved
- no obvious secrets committed

2. Design system and UI
Review:
- src/components/ui/*
- src/components/layout/*
- src/app/page.tsx
- src/app/login/page.tsx
- src/app/register/page.tsx
- src/app/dashboard/page.tsx

Check:
- consistent professional SaaS visual system
- Thai-first user-facing copy
- responsive layout
- accessible focus states
- loading/error/empty states
- no raw JSON in normal UI
- no sensitive marker exposure
- mobile nav works
- sidebar has Main, HyperFrames, Admin groups
- no raw <img>; user-facing images use next/image
- no @next/next/no-img-element build warnings remain

3. Product + AI + OCR UX
Review:
- src/app/dashboard/products/**
- src/app/dashboard/generator/**
- src/app/dashboard/content-history/**
- src/app/dashboard/templates/**
- src/app/dashboard/ocr/**
- src/app/dashboard/similar/**
- related components and services

Check:
- product import keeps review-before-save behavior
- no Shopee CAPTCHA/login/anti-bot/private endpoint bypass
- AI content shows affiliate disclosure where relevant
- no fake reviews or invented specs
- OCR UI warns that OCR can be inaccurate
- exports remain scoped and safe
- no raw internal metadata shown to normal users
- product images and previews use next/image where rendered in Next.js UI

4. HyperFrames UX and safety
Review:
- src/app/dashboard/hyperframes/**
- src/components/hyperframes/**
- src/app/api/hyperframes/**
- src/lib/hyperframes/**
- scripts/hyperframes/**

Check:
- Studio, Render History, Batch, Ops, Queue pages are polished
- operator UI is read-only/safe
- no direct systemd controls in UI
- render command remains vectorized bin + args
- no shell-concatenated render command
- queue limits preserved
- max attempts preserved
- retry backoff preserved
- disk checks preserved
- stale running detection preserved
- cleanup dry-run default preserved
- secure download blocks traversal and symlink escape
- no outputPath or /var/lib in UI/API response shaping
- RenderJobCard uses next/image, not raw img
- all render thumbnails/previews avoid raw <img>

5. Admin foundation
Review:
- src/app/dashboard/admin/**
- src/components/admin/**
- src/app/api/admin/**
- src/services/admin-overview-service.ts
- src/lib/admin/access.ts

Check:
- admin pages use gated shell
- admin API uses auth
- admin API is gated by ADMIN_PANEL_ENABLED or equivalent
- admin overview remains aggregate-only
- no raw user emails/passwords/secrets exposed
- no dangerous admin actions
- no systemd controls

6. Auth, tenant, org isolation
Review critical APIs and tests:
- auth middleware
- product APIs
- content APIs
- export APIs
- HyperFrames render/history/download/retry/cancel APIs
- org scope tests

Check:
- auth required for protected APIs
- user data scoped by userId
- org data requires membership
- VIEWER/EDITOR/ADMIN behavior preserved where implemented
- cross-user/cross-org access blocked without existence leakage
- controlled 404/403 behavior preserved

7. Tests and static safety
Ensure these areas are covered:
- UI static safety
- dashboard shell safety
- final UI/Admin/HyperFrames audit
- HyperFrames security
- auth/tenant/org isolation
- artifact path safety
- CSV formula injection
- SSRF/url safety
- no raw <img> in src/app or src/components
- next/image usage for RenderJobCard and thumbnail components

Add/update tests only if coverage is missing.

Required static scans:
Run these and inspect results:

grep -RniE "dangerouslySetInnerHTML|DATABASE_URL|sk-[A-Za-z0-9]|/var/lib|outputPath" src app components scripts prisma tests docs 2>/dev/null || true

grep -RniE "systemctl[[:space:]]+(start|stop|restart|enable|disable)" src/app src/components 2>/dev/null || true

grep -RniE "<img|img[[:space:]]+src" src/app src/components 2>/dev/null || true

Interpretation:
- Mentions inside docs/security/tests/server-only scripts can be acceptable when they are safety rules or regression checks.
- User-facing UI/API response shaping must not expose sensitive values.
- Direct systemd controls in UI are not acceptable.
- Raw <img> inside src/app or src/components is not acceptable for final PASS; replace with next/image.

Required verification commands:
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

HyperFrames verification:
Run when available:

npm run hyperframes:doctor
npm run hyperframes:worker:once
npm run hyperframes:queue-status || true
npm run hyperframes:worker:watchdog || true

Production VM checks only when actually running on the production VM:

npx prisma migrate status --schema prisma/schema.prisma
systemctl is-active zsp-aitool
systemctl is-active zsp-hyperframes-worker
systemctl is-enabled zsp-hyperframes-worker

curl -I http://127.0.0.1:3001/dashboard
curl -I http://127.0.0.1:3001/dashboard/products
curl -I http://127.0.0.1:3001/dashboard/generator
curl -I http://127.0.0.1:3001/dashboard/hyperframes
curl -I http://127.0.0.1:3001/dashboard/hyperframes/renders
curl -I http://127.0.0.1:3001/dashboard/hyperframes/ops
curl -I http://127.0.0.1:3001/dashboard/admin

If production has pending migrations:
Use only:

npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma migrate status --schema prisma/schema.prisma

Do not use prisma migrate dev on production.

Environment interpretation rules:
- If PostgreSQL is unavailable in Codex/container, report DB-dependent HyperFrames commands as WARN/SKIP, not PASS.
- If systemd is unavailable because PID 1 is not systemd, report systemd checks as WARN/SKIP, not PASS.
- If Cloudflare challenge blocks external health probes in Codex/container, report as environment warning.
- If a real package, schema, typecheck, test, build, health, auth, isolation, security, image lint, or UI safety issue fails, fix it before finishing.

Fix policy:
If issues are found:
1. Make the smallest safe patch.
2. Preserve current architecture.
3. Add/update regression tests.
4. Rerun required verification.
5. Commit with one of:
   - fix: stabilize production readiness
   - fix: use next image for UI thumbnails
   - test: complete UX UI safety coverage
   - docs: align production readiness notes

Do not bundle unrelated feature work.

Final response format:
Return exactly these sections:

1. Overall verdict
- PASS / WARN / FAIL
- READY_TO_DEPLOY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
- concise explanation of what was reviewed and fixed

3. Files reviewed
- grouped by area

4. Files changed
- list files changed, or “None”

5. Schema changes
- describe changes, or “No schema changes”

6. Security/access behavior
- auth
- user isolation
- org isolation
- admin gating
- HyperFrames artifact safety
- sensitive data exposure
- image rendering safety

7. Checklist table
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
- dashboard UI
- product UX
- AI/OCR UX
- HyperFrames UI
- Admin UI
- image lint / next/image
- auth isolation
- org isolation
- static safety scan
- HyperFrames queue status
- HyperFrames watchdog
- production service checks

8. Commands run
- include exact commands and PASS/WARN/FAIL

9. Blocking issues
- list or “None”

10. Environment-only warnings
- list Codex/container-only warnings

11. Remaining risks
- list real residual risks, if any

12. Commit hash
- commit hash if committed
- “No commit created” if no changes

13. PR status
- PR created / not created

Final line:
READY_TO_DEPLOY=true or READY_TO_DEPLOY=false
```
