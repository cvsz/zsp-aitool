# 017 — First 100 Users Growth Loop Prompt

Use this prompt only after `016-post-launch-monitoring-and-growth.prompt` is complete and post-launch monitoring is stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
017 — First 100 Users Growth Loop.

Mode:
Safe growth, onboarding, measurement, feedback, and conversion improvement only. Do not weaken security, compliance, privacy, or production stability. Do not make unsupported income claims or automate prohibited scraping.

Current baseline expected before this phase:
- READY_TO_LAUNCH=true.
- POST_LAUNCH_MONITORING_READY=true.
- npm ci passed.
- Prisma generate and validate passed.
- Typecheck passed.
- Test suite passed.
- Build passed without @next/next/no-img-element warnings.
- npm run health passed with 0 failures.
- HyperFrames queue status is healthy.
- HyperFrames watchdog is healthy.
- Production runbooks exist.

Project context:
zsp-aitool is a Thai-first SaaS for Shopee Affiliate creators. It helps users save product data, manage affiliate links, generate AI promotional content, run OCR extraction, export content, find similar saved products, use a Chrome Extension MV3 for user-confirmed product capture, and create HyperFrames promotional videos.

Primary growth objective:
Acquire and activate the first 100 real users safely, with measurable onboarding signals, manual feedback loops, and compliance-safe positioning.

Hard constraints:
- Do not bypass Shopee CAPTCHA, login walls, anti-bot systems, or private endpoints.
- Do not automate mass scraping.
- Do not collect private Shopee user data.
- Do not generate fake reviews.
- Do not invent product specifications.
- Do not make unsupported income, medical, financial, legal, or exaggerated claims.
- Keep affiliate disclosure visible where relevant.
- Do not expose secrets, DATABASE_URL, tokens, outputPath, /var/lib, stack traces, or internal paths.
- Do not use dangerouslySetInnerHTML.
- Do not use raw <img> in Next.js app/components; use next/image.
- Do not add UI controls that directly start/stop/restart/enable/disable systemd.
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions.
- Do not run npm audit fix --force.
- Keep postbuild and scripts/fix-next-server-chunks.sh intact.
- Use prisma migrate deploy, not prisma migrate dev, on production.

Main objective:
Create and implement a first-100-users growth operating system that improves activation without risky automation.

Growth principles:
- Manual-first until signals are clear.
- Privacy-preserving analytics.
- Thai-first messaging.
- Clear affiliate disclosure.
- No fake proof, fake reviews, or exaggerated earning promises.
- Optimize for user activation: product saved → affiliate link added → AI content generated → content exported/shared → optional HyperFrames render.

Target user profile:
- Thai Shopee Affiliate creators.
- Small sellers/creators managing product posts manually.
- Users who need faster Facebook/Instagram/Threads/X captions.
- Users who want to turn saved products into short promotional videos.
- Users who prefer Thai UI and clear step-by-step workflows.

Core activation milestones:
1. User registers/logs in.
2. User adds first product.
3. User adds or confirms affiliate link.
4. User generates first AI post.
5. User copies or exports generated content.
6. User creates first HyperFrames script/composition.
7. User completes or reviews first render.
8. User returns within 7 days.

Allowed implementation areas:

1. Growth documentation
Create or update:
- docs/runbooks/first-100-users-growth-loop.md
- docs/runbooks/user-feedback-playbook.md
- docs/runbooks/onboarding-activation-checklist.md

Include:
- first 7 days launch plan
- first 30 days growth loop
- first 100 users acquisition channels
- manual outreach scripts in Thai
- feedback questions in Thai
- activation metrics
- retention metrics
- content quality checklist
- affiliate compliance checklist
- privacy boundaries

2. Dashboard onboarding improvements
Small UI improvements are allowed if safe:
- clearer onboarding checklist
- activation milestone cards
- CTA order: Add product → Generate AI content → Export/copy → HyperFrames
- empty states with Thai guidance
- affiliate disclosure reminders
- no raw JSON or internal diagnostics

3. Landing page growth polish
Small safe copy improvements:
- clearer value proposition
- Thai creator-focused copy
- 3 sample workflows
- compliance-safe benefits
- no guaranteed income claims
- no fake testimonials unless clearly sample/demo
- no unsupported platform claims

4. Feedback loop
Add documentation or safe UI copy for feedback collection:
- Thai feedback questions
- activation friction form guidance
- manual interview script
- bug report template
- feature request template

Do not add external analytics SDKs unless explicitly requested.
If adding analytics planning only, document event names without implementing tracking.
If adding analytics code, it must be privacy-preserving, config-gated, and tested.

5. Growth experiment backlog
Create prioritized backlog:
- onboarding checklist A/B copy
- sample product templates
- content quality presets
- prompt template starter packs
- HyperFrames demo composition templates
- referral/waitlist idea, documentation only unless explicitly requested
- Chrome extension onboarding guide

6. Monitoring and success metrics
Document metrics:
- visits to register
- registration completion
- first product saved
- first affiliate link saved
- first AI generation
- first content export/copy
- first render queued
- first render completed
- 1-day return
- 7-day return
- feedback submitted

7. Safety tests
Add or update static tests if UI/docs are changed:
- no guaranteed income claims in landing/dashboard copy
- no fake review wording
- affiliate disclosure language present where relevant
- no raw <img>
- no dangerouslySetInnerHTML
- no outputPath, /var/lib, DATABASE_URL in UI files
- no systemctl controls in UI

Suggested tests:
- tests/components/growth-copy-safety-static.test.ts
- tests/docs/growth-runbook-static.test.ts if docs tests pattern exists

Review scope:
- README.md
- docs/runbooks/**
- docs/prompts/**
- src/app/page.tsx
- src/app/dashboard/page.tsx
- src/app/dashboard/products/**
- src/app/dashboard/generator/**
- src/app/dashboard/hyperframes/**
- src/components/ui/**
- src/components/layout/**
- src/components/products/**
- src/components/hyperframes/**
- package.json only if adding tests/scripts

Required pre-clean check:
Run:

git status --short

If untracked temporary or sensitive files exist, do not commit them:
- .env.bak.*
- *.sql
- *.sql.gz
- __pycache__/
- .npm/_logs/
- local screenshots/log dumps
- production exports

Remove local temporary files if present:

shred -u .env.bak.* 2>/dev/null || rm -f .env.bak.*
find . -type d -name __pycache__ -prune -exec rm -rf {} +

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

grep -RniE "guaranteed income|guarantee income|รวยแน่นอน|รายได้แน่นอน|การันตีรายได้|รีวิวปลอม|fake review" src app components docs 2>/dev/null || true

HyperFrames verification:
Run when available:

npm run hyperframes:doctor
npm run hyperframes:worker:once
npm run hyperframes:queue-status || true
npm run hyperframes:worker:watchdog || true

Production VM checks only on the real production VM:

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
curl -I https://studio.zeaz.dev/
curl -I https://studio.zeaz.dev/dashboard

Environment interpretation:
- If PostgreSQL is unavailable in Codex/container, report DB-dependent checks as WARN/SKIP, not PASS.
- If systemd is unavailable because PID 1 is not systemd, report as WARN/SKIP, not PASS.
- If Cloudflare challenge blocks external probes in Codex/container, report as environment warning.
- If real package/schema/typecheck/test/build/health/security/image lint/copy safety issue fails, fix it before finishing.

Fix policy:
If issues are found:
1. Make the smallest safe patch.
2. Preserve architecture.
3. Add/update regression tests.
4. Rerun verification.
5. Commit with one of:
   - docs: add first 100 users growth loop
   - feat: improve activation onboarding
   - test: add growth copy safety coverage
   - fix: stabilize first 100 users growth loop

Do not bundle unrelated feature work.

Final response format:
Return exactly these sections:

1. Overall verdict
- PASS / WARN / FAIL
- FIRST_100_USERS_READY=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
- concise explanation of growth loop work performed

3. Files reviewed
- grouped by area

4. Files changed
- list files changed, or “None”

5. Schema changes
- describe changes, or “No schema changes”

6. Security/compliance behavior
- Shopee compliance
- affiliate disclosure
- claim safety
- privacy boundaries
- auth/isolation unchanged
- HyperFrames safety unchanged

7. Growth checklist table
Columns:
- Area
- Status
- Notes

Rows:
- target user definition
- activation milestones
- onboarding checklist
- landing copy
- dashboard activation CTAs
- feedback questions
- growth experiment backlog
- first 7 days plan
- first 30 days plan
- first 100 users plan
- compliance copy safety
- analytics/privacy plan
- tests
- build
- health
- HyperFrames queue
- watchdog

8. Commands run
- include exact commands and PASS/WARN/FAIL

9. Blocking issues
- list or “None”

10. Environment-only warnings
- list Codex/container-only warnings

11. Remaining growth risks
- list real residual risks, if any

12. Commit hash
- commit hash if committed
- “No commit created” if no changes

13. PR status
- PR created / not created

Final line:
FIRST_100_USERS_READY=true or FIRST_100_USERS_READY=false
```
