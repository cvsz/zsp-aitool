# 016 — Post-Launch Monitoring and Growth Prompt

Use this prompt only after `015-production-launch-polish.prompt` returns `READY_TO_LAUNCH=true` and the production VM verification remains green.

```text
You are working on cvsz/zsp-aitool.

Phase:
016 — Post-Launch Monitoring and Growth.

Mode:
Post-launch operations, monitoring, feedback, and safe growth only. Do not introduce risky product features or infrastructure changes unless a real incident requires a minimal stabilization fix.

Current baseline expected before this phase:
- READY_TO_LAUNCH=true.
- READY_TO_DEPLOY=true.
- npm ci passed.
- Prisma generate and validate passed.
- Typecheck passed.
- Test suite passed.
- Build passed without @next/next/no-img-element warnings.
- npm run health passed with 0 failures and 0 warnings.
- HyperFrames queue status is healthy.
- HyperFrames watchdog is healthy.
- Production service zsp-aitool is active.
- HyperFrames worker service is active/enabled only when real production rendering is intentionally enabled.

Project context:
zsp-aitool is a Thai-first SaaS for Shopee Affiliate workflows with product capture, affiliate link management, AI promotional content generation, OCR, export, similar products, Chrome Extension MV3, HyperFrames Studio/rendering, operator dashboards, and admin foundation.

Read before acting:
- AGENTS.md
- .faf
- SECURITY.md
- README.md
- CONTRIBUTING.md
- docs/runbooks/production-launch.md
- docs/hyperframes-render-worker.md
- docs/prompts/005-final-full-repo-production-readiness.prompt.md
- docs/prompts/015-production-launch-polish.prompt.md

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
- Do not commit local .env, .env.bak, backups, __pycache__, logs, database dumps, generated secrets, or production exports.

Main objective:
Create a safe post-launch operating system for zsp-aitool: monitor health, queue, worker, errors, user onboarding, early feedback, and growth signals without weakening production safety.

Allowed changes:
1. Documentation/runbook improvements
   - Add or update a post-launch monitoring runbook.
   - Add daily/weekly operator checklist.
   - Add incident triage checklist.
   - Add HyperFrames queue/watchdog response guide.
   - Add user feedback collection workflow.
   - Add growth experiment backlog.

2. Safe monitoring scripts
   - Add read-only scripts only.
   - Scripts may run health, queue status, watchdog, route smoke checks, disk summary, and journal summaries.
   - Scripts must not mutate production data.
   - Scripts must not expose secrets.
   - Scripts must not start/stop/restart/enable/disable systemd unless explicitly named as a manual rollback runbook command in docs, not executed by automation.

3. Safe npm scripts
   - Add npm convenience scripts only if helpful.
   - Preserve existing scripts.
   - Keep package.json valid JSON and no duplicate script keys.
   - Keep postbuild intact.

4. Admin/operator visibility polish
   - Improve read-only status language if needed.
   - Add safe monitoring links or documentation references.
   - Do not add dangerous controls.
   - Do not expose internal paths, secrets, or raw DB internals.

5. Growth and onboarding documentation
   - Add first 7 days launch plan.
   - Add first 100 users checklist.
   - Add user onboarding funnel review checklist.
   - Add feedback questions in Thai.
   - Add affiliate compliance reminder.
   - Add safe content quality checklist.

6. Post-launch analytics planning
   - Document analytics events to add later without implementing invasive tracking now.
   - If adding code, keep it privacy-preserving and opt-in/config-gated.
   - Do not collect private Shopee user data.
   - Do not store secrets or personal data unnecessarily.

Review scope:
- docs/runbooks/**
- docs/prompts/**
- README.md
- SECURITY.md if incident/security reporting wording changes
- CONTRIBUTING.md if operational workflow changes
- scripts/** only for read-only monitoring helpers
- package.json only if adding scripts
- src/app/dashboard/admin/** only if copy/read-only links need small polish
- src/app/dashboard/hyperframes/ops/** only if copy/read-only links need small polish

Recommended new files if useful:
- docs/runbooks/post-launch-monitoring.md
- docs/runbooks/incident-response.md
- docs/runbooks/growth-feedback-loop.md
- scripts/post-launch/status-summary.sh
- scripts/post-launch/smoke-routes.sh

Post-launch monitoring checklist to include:
Daily:
- git status --short
- npm run health
- npm run hyperframes:queue-status
- npm run hyperframes:worker:watchdog
- systemctl is-active zsp-aitool
- systemctl is-active zsp-hyperframes-worker
- systemctl is-enabled zsp-hyperframes-worker
- journalctl -u zsp-aitool -n 120 -l --no-pager
- journalctl -u zsp-hyperframes-worker -n 120 -l --no-pager
- df -h

Weekly:
- npm ci
- npm run prisma:generate
- npx prisma validate
- npm run typecheck
- npm run test
- npm run build
- npm run health
- npx prisma migrate status --schema prisma/schema.prisma
- review failed render count
- review failed login/auth reports
- review user feedback
- review onboarding funnel gaps

HyperFrames incident thresholds:
- pending queue rising unexpectedly
- running jobs stuck
- staleRunning > 0
- failedLast24h increasing
- free disk below configured threshold
- worker inactive when renderEnabled=true
- service disabled unexpectedly
- repeated render CLI failures

Recommended operator response:
- capture queue status
- capture watchdog output
- capture journal summary
- do not expose local paths to users
- recover stale jobs only through safe script/runbook
- disable real worker only through explicit operator command when needed
- keep cleanup dry-run unless deletion is deliberately confirmed

Growth checklist:
- define target user: Shopee Affiliate creator in Thailand
- verify landing page message in Thai
- prepare 3 sample workflows: product capture → AI post, OCR → product save, product → HyperFrames render
- collect first 10 feedback sessions
- track friction points manually first
- prioritize fixes by activation impact and safety risk
- do not make unsupported income claims
- do not generate fake product reviews
- keep affiliate disclosure visible

Required pre-clean check:
Run:

git status --short

If untracked temporary or sensitive files exist, do not commit them. Examples:
- .env.bak.*
- *.sql
- *.sql.gz
- __pycache__/
- .npm/_logs/
- local screenshots/log dumps

Remove local temporary files if present:

shred -u .env.bak.* 2>/dev/null || rm -f .env.bak.*
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

Production VM monitoring checks, only on the real production VM:

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

df -h
journalctl -u zsp-aitool -n 120 -l --no-pager
journalctl -u zsp-hyperframes-worker -n 120 -l --no-pager

If production has pending migrations:
Use only:

npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma migrate status --schema prisma/schema.prisma
npm run health

Do not use prisma migrate dev on production.

Environment interpretation:
- If PostgreSQL is unavailable in Codex/container, report DB-dependent checks as WARN/SKIP, not PASS.
- If systemd is unavailable because PID 1 is not systemd, report systemd checks as WARN/SKIP, not PASS.
- If Cloudflare challenge blocks external probes in Codex/container, report as environment warning.
- If a real package, schema, typecheck, test, build, health, security, image lint, UI safety, worker, or queue issue fails, fix it before finishing.

Fix policy:
If issues are found:
1. Make the smallest safe patch.
2. Preserve current architecture.
3. Add/update regression tests.
4. Rerun required verification.
5. Commit with one of:
   - docs: add post-launch monitoring runbook
   - ops: add post-launch monitoring summary
   - test: add post-launch safety coverage
   - fix: stabilize post-launch monitoring

Do not bundle unrelated feature work.

Final response format:
Return exactly these sections:

1. Overall verdict
- PASS / WARN / FAIL
- POST_LAUNCH_MONITORING_READY=true/false
- READY_FOR_GROWTH_LOOP=true/false

2. Summary
- concise explanation of monitoring/growth work performed

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
- privacy/growth data boundaries

7. Monitoring checklist table
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
- route smoke
- zsp-aitool service
- HyperFrames queue
- HyperFrames watchdog
- HyperFrames worker service
- disk status
- logs/journal review
- static safety scan
- image lint / next-image
- incident runbook
- growth feedback loop

8. Commands run
- include exact commands and PASS/WARN/FAIL

9. Blocking issues
- list or “None”

10. Environment-only warnings
- list Codex/container-only warnings

11. Remaining post-launch risks
- list real residual risks, if any

12. Commit hash
- commit hash if committed
- “No commit created” if no changes

13. PR status
- PR created / not created

Final line:
POST_LAUNCH_MONITORING_READY=true or POST_LAUNCH_MONITORING_READY=false
```
