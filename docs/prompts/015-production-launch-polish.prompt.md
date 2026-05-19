# 015 — Production Launch Polish Prompt

Use this prompt only after `005-final-full-repo-production-readiness.prompt` returns `READY_TO_DEPLOY=true` or after the production VM verification is green.

```text
You are working on cvsz/zsp-aitool.

Phase:
015 — Production Launch Polish.

Mode:
Launch-polish only. Do not start new feature work. Review first, then make only small, low-risk improvements that improve launch clarity, operator safety, user onboarding, documentation, or final smoke-test confidence.

Current baseline expected before this phase:
- READY_TO_DEPLOY=true from final production readiness.
- npm ci passed.
- Prisma generate and validate passed.
- Typecheck passed.
- Test suite passed.
- Build passed without @next/next/no-img-element warnings.
- npm run health passed with 0 failures.
- HyperFrames queue status is healthy.
- HyperFrames watchdog is healthy.
- Production service zsp-aitool is active.
- HyperFrames worker service is active/enabled only when production explicitly wants real rendering.

Project context:
zsp-aitool is a Thai-first SaaS for Shopee Affiliate workflows with product capture, affiliate link management, AI promotional content generation, OCR, export, similar products, Chrome Extension MV3, HyperFrames Studio/rendering, operator dashboards, and admin foundation.

Read before acting:
- AGENTS.md
- .faf
- SECURITY.md
- README.md
- CONTRIBUTING.md
- docs/prompts/005-final-full-repo-production-readiness.prompt.md
- docs/prompts/014-full-ux-ui-redesign.prompt.md
- docs/hyperframes-render-worker.md

Hard constraints:
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions.
- Do not run npm audit fix --force.
- Do not remove postbuild.
- Do not remove scripts/fix-next-server-chunks.sh.
- Do not weaken auth, tenant isolation, org isolation, admin gating, or HyperFrames guardrails.
- Do not expose secrets, DATABASE_URL, tokens, stack traces, outputPath, /var/lib, or internal render paths in UI/API responses.
- Do not use dangerouslySetInnerHTML for user-controlled content.
- Do not execute arbitrary user HTML.
- Do not use raw <img> in Next.js app/components; use next/image for user-facing images and thumbnails.
- Do not add UI controls that directly start, stop, restart, enable, or disable systemd services.
- Use prisma migrate deploy, not prisma migrate dev, on production.
- Do not commit local .env, .env.bak, backups, __pycache__, logs, database dumps, or generated secrets.

Main objective:
Prepare zsp-aitool for a safe production launch by polishing launch-facing UX, onboarding guidance, runbooks, smoke checks, and release documentation while preserving existing working behavior.

Allowed changes:
1. Landing page and auth polish
   - Improve Thai-first launch copy.
   - Make product positioning clearer.
   - Ensure compliance-safe claims.
   - Improve login/register microcopy and empty/error states.
   - Do not change auth logic unless fixing a real bug.

2. Dashboard onboarding polish
   - Improve onboarding checklist.
   - Add safe launch checklist copy.
   - Improve quick action labels.
   - Add affiliate disclosure reminders.
   - No raw JSON or internal diagnostics in normal user UI.

3. Admin/operator launch clarity
   - Improve read-only operator explanations.
   - Improve admin gated copy.
   - Add clear “monitor-only from UI” wording.
   - Link to safe runbook routes/docs where appropriate.
   - Do not add dangerous actions.
   - Do not add systemd controls to UI.

4. HyperFrames launch polish
   - Improve safe render workflow copy.
   - Improve empty states for render history and queue.
   - Improve retry/cancel/download microcopy.
   - Keep secure downloads and outputPath redaction intact.
   - Keep worker commands vectorized.
   - Keep cleanup dry-run default.

5. Documentation and runbook polish
   - README launch checklist.
   - docs/hyperframes-render-worker.md launch smoke section if needed.
   - docs/runbooks/production-launch.md if missing and useful.
   - docs/prompts index/update if present.
   - Include rollback commands and migration policy.

6. Final smoke route checklist
   - Add a launch smoke checklist doc or script only if simple and safe.
   - It may curl public/local pages and API auth-denial paths.
   - It must not expose secrets.
   - It must not mutate production data unless explicitly named as a smoke mutation and safely gated.

7. Final static safety tests
   Add/update tests only if needed for launch polish:
   - no raw <img> in src/app or src/components
   - no dangerouslySetInnerHTML in user-facing UI
   - no outputPath, /var/lib, DATABASE_URL in UI files
   - no direct systemctl controls in UI
   - landing/auth/dashboard pages contain Thai-first launch copy
   - operator/admin pages include read-only/safe wording

Review scope:
- src/app/page.tsx
- src/app/login/page.tsx
- src/app/register/page.tsx
- src/app/dashboard/page.tsx
- src/app/dashboard/hyperframes/**
- src/app/dashboard/admin/**
- src/components/ui/**
- src/components/layout/**
- src/components/hyperframes/**
- src/components/admin/**
- README.md
- SECURITY.md if launch notes affect reporting/security
- docs/hyperframes-render-worker.md
- docs/runbooks/** if present
- package.json only if adding a safe script/test

Required pre-clean check:
Run:

git status --short

If untracked temporary or sensitive files exist, do not commit them. Examples to remove or ignore locally:
- .env.bak.*
- *.sql
- *.sql.gz
- __pycache__/
- .npm/_logs/
- local screenshots/log dumps

If `.env.bak.*` exists, delete it safely:

shred -u .env.bak.* 2>/dev/null || rm -f .env.bak.*

If Python cache exists, remove it:

find . -type d -name __pycache__ -prune -exec rm -rf {} +

Then re-run:

git status --short

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

Static scans:

grep -RniE "dangerouslySetInnerHTML|DATABASE_URL|sk-[A-Za-z0-9]|/var/lib|outputPath" src app components scripts prisma tests docs 2>/dev/null || true

grep -RniE "systemctl[[:space:]]+(start|stop|restart|enable|disable)" src/app src/components 2>/dev/null || true

grep -RniE "<img|img[[:space:]]+src" src/app src/components 2>/dev/null || true

HyperFrames verification:
Run when available:

npm run hyperframes:doctor
npm run hyperframes:worker:once
npm run hyperframes:queue-status || true
npm run hyperframes:worker:watchdog || true

Production VM launch smoke checks, only on the real production VM:

npx prisma migrate status --schema prisma/schema.prisma
systemctl is-active zsp-aitool
systemctl is-active zsp-hyperframes-worker
systemctl is-enabled zsp-hyperframes-worker
curl -I http://127.0.0.1:3001/
curl -I http://127.0.0.1:3001/dashboard
curl -I http://127.0.0.1:3001/dashboard/products
curl -I http://127.0.0.1:3001/dashboard/generator
curl -I http://127.0.0.1:3001/dashboard/hyperframes
curl -I http://127.0.0.1:3001/dashboard/hyperframes/renders
curl -I http://127.0.0.1:3001/dashboard/hyperframes/ops
curl -I http://127.0.0.1:3001/dashboard/admin
curl -I https://studio.zeaz.dev/
curl -I https://studio.zeaz.dev/dashboard

If production has pending migrations:
Use only:

npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma migrate status --schema prisma/schema.prisma
npm run health

Rollback guidance to keep in docs, not execute unless explicitly asked:

sudo systemctl restart zsp-aitool
sudo systemctl stop zsp-hyperframes-worker && sudo systemctl disable zsp-hyperframes-worker
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog

Environment interpretation:
- If PostgreSQL is unavailable in Codex/container, report DB-dependent checks as WARN/SKIP, not PASS.
- If systemd is unavailable because PID 1 is not systemd, report systemd checks as WARN/SKIP, not PASS.
- If Cloudflare challenge blocks external probes in Codex/container, report as environment warning.
- If a real package, schema, typecheck, test, build, health, security, image lint, or UI safety issue fails, fix it before finishing.

Fix policy:
If issues are found:
1. Make the smallest safe patch.
2. Preserve current architecture.
3. Add/update regression tests.
4. Rerun required verification.
5. Commit with one of:
   - feat: polish production launch UX
   - docs: add production launch runbook
   - test: add production launch safety coverage
   - fix: stabilize production launch readiness

Do not bundle unrelated feature work.

Final response format:
Return exactly these sections:

1. Overall verdict
- PASS / WARN / FAIL
- READY_TO_LAUNCH=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
- concise explanation of launch polish performed

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
- admin/operator safety
- HyperFrames artifact safety
- sensitive data exposure
- image rendering safety

7. Launch checklist table
Columns:
- Area
- Status
- Notes

Rows:
- git clean state
- package.json
- install
- Prisma generate
- Prisma validate
- migrations
- typecheck
- tests
- build
- health
- landing/auth UX
- dashboard onboarding
- product/AI/OCR launch UX
- HyperFrames launch UX
- admin/operator launch UX
- static safety scan
- image lint / next-image
- HyperFrames queue status
- HyperFrames watchdog
- production route smoke
- rollback/runbook docs

8. Commands run
- include exact commands and PASS/WARN/FAIL

9. Blocking issues
- list or “None”

10. Environment-only warnings
- list Codex/container-only warnings

11. Remaining launch risks
- list real residual risks, if any

12. Commit hash
- commit hash if committed
- “No commit created” if no changes

13. PR status
- PR created / not created

Final line:
READY_TO_LAUNCH=true or READY_TO_LAUNCH=false
```
