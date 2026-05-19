# 005 — Final Full Repo Production Readiness Prompt

Use this prompt for the final full-repository verification pass after UI, Admin, and HyperFrames polish phases are merged.

```text
You are working on cvsz/zsp-aitool.

Phase:
005 — Final Full Repo Production Readiness.

Mode:
Review and verify first. Do not change code unless you find a blocking production-readiness issue.

Project context:
- zsp-aitool is a Thai-first SaaS for Shopee Affiliate workflows.
- Core modules include auth, product library, affiliate links, imports, AI content generation, OCR, exports, Chrome Extension MV3, HyperFrames Studio, render history, secure downloads, worker watchdog, operator UI, and admin foundation.
- Follow AGENTS.md, .faf, SECURITY.md, README.md, and CONTRIBUTING.md.

Hard constraints:
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions.
- Do not run npm audit fix --force.
- Do not expose secrets, DATABASE_URL, tokens, stack traces, outputPath, /var/lib, or internal render paths.
- Do not use dangerouslySetInnerHTML for user-controlled content.
- Do not execute arbitrary user HTML.
- Do not add UI buttons that directly start/stop/restart/enable/disable systemd services.
- Keep postbuild and scripts/fix-next-server-chunks.sh intact.
- Keep HyperFrames guardrails intact.
- Use prisma migrate deploy, not prisma migrate dev, on production.

Review scope:
1. Repository health
   - git status clean or clearly explain local changes
   - package.json valid JSON
   - no duplicate package scripts
   - package-lock in sync
   - no obvious committed secrets

2. Docs/governance
   - .faf
   - AGENTS.md
   - SECURITY.md
   - README.md
   - CONTRIBUTING.md
   - LICENSE
   - docs/hyperframes-render-worker.md
   - docs/prompts/* if present

3. Prisma/database
   - prisma/schema.prisma validates
   - migrations are coherent
   - production migration command documented
   - no prisma migrate dev recommendation for production

4. App/API safety
   - auth required for user-facing APIs unless intentionally public
   - user scoping preserved
   - org membership and role checks preserved where org scope exists
   - cross-user/cross-org access blocked without existence leakage
   - response shaping safe

5. Admin foundation
   - admin routes build
   - admin pages use shared gated shell or equivalent guard
   - admin API uses auth and ADMIN_PANEL_ENABLED or role gating
   - admin API returns aggregate-only data
   - no raw users/emails/secrets/local paths exposed
   - no dangerous admin actions from UI

6. HyperFrames safety
   - render disabled in Codex/container unless tests mock the path
   - worker command uses vectorized bin + argv, not shell-concatenated render commands
   - queue limits enforced
   - max attempts enforced
   - stale running detection present
   - disk checks present
   - cleanup dry-run default
   - artifact download blocks traversal and symlink escape
   - outputPath and /var/lib are not exposed to UI/API consumers
   - operator UI is read-only/safe and has no systemd controls

7. UI readiness
   - Thai-first dashboard UI
   - professional app shell builds
   - admin pages build
   - HyperFrames Studio/Batch/Ops/Queue pages build
   - render history pages build
   - no raw JSON in normal dashboard UI
   - no dangerouslySetInnerHTML for user-controlled content
   - thumbnails use next/image, not raw img

Required commands:

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

Run when environment supports DB/worker checks:

npm run hyperframes:doctor
npm run hyperframes:worker:once
npm run hyperframes:cleanup-renders
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog

Production-only checks when running on the real VM:

npx prisma migrate status --schema prisma/schema.prisma
systemctl is-active zsp-aitool
systemctl is-active zsp-hyperframes-worker
systemctl is-enabled zsp-hyperframes-worker
curl -I http://127.0.0.1:3001/dashboard
curl -I http://127.0.0.1:3001/dashboard/hyperframes
curl -I http://127.0.0.1:3001/dashboard/hyperframes/renders
curl -I http://127.0.0.1:3001/dashboard/hyperframes/ops
curl -I http://127.0.0.1:3001/dashboard/admin

Static safety scans:

grep -RniE "dangerouslySetInnerHTML|DATABASE_URL|sk-[A-Za-z0-9]|/var/lib|outputPath" src app components scripts prisma tests docs 2>/dev/null || true
grep -RniE "systemctl[[:space:]]+(start|stop|restart|enable|disable)" src/app src/components 2>/dev/null || true

Interpretation rules:
- If PostgreSQL is unavailable in Codex/container, report DB-dependent HyperFrames commands as WARN/SKIP, not PASS.
- If systemd is unavailable because PID 1 is not systemd, report systemd checks as WARN/SKIP, not PASS.
- If Cloudflare challenge blocks external health probes in Codex/container, report as environment warning.
- If a real code/schema/package/typecheck/test/build/security issue fails, fix it before finishing.
- If production has unapplied migrations, recommend and run only when authorized:
  npx prisma migrate deploy --schema prisma/schema.prisma

If fixes are required:
- make the smallest safe fix
- add/update regression tests
- rerun required checks
- commit with a conventional commit message, for example:
  fix: stabilize production readiness

Final response format:
- Overall verdict
- Files reviewed
- Files changed, if any
- Schema changes or confirmation no schema changes were needed
- Security/access behavior
- Checklist table with PASS/WARN/FAIL
- Commands run
- Blocking issues
- Environment-only warnings
- Remaining risks
- Commit hash if committed
- PR status if created
- READY_TO_DEPLOY=true/false
- READY_FOR_NEXT_PHASE=true/false
```
