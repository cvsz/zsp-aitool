# 030 — Enterprise Readiness and Scale Plan Prompt

Use after 029 is stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
030 — Enterprise Readiness and Scale Plan.

Mode:
Architecture and production readiness planning with small safe implementation patches only where low-risk. Do not perform large rewrites in one phase.

Main objective:
Prepare zsp-aitool for controlled SaaS scaling by documenting and validating enterprise readiness across architecture, observability, data lifecycle, compliance, scaling, support, and release operations.

Required work:
1. Inventory current architecture: Next.js app, Prisma/PostgreSQL, HyperFrames worker, extension, Shopee foundation, admin, runbooks, tests, and deployment scripts.
2. Create enterprise readiness matrix covering:
   - auth/session safety
   - tenant/org isolation
   - admin/RBAC posture
   - audit logs
   - privacy/data lifecycle
   - backup/restore
   - schema migration safety
   - queue/worker operations
   - HyperFrames storage and cleanup
   - observability
   - incident response
   - support/onboarding
   - billing/quota readiness
   - Shopee API compliance
3. Add missing docs/runbooks/enterprise-readiness-scale-plan.md.
4. Add static tests only if clear low-risk gaps exist.
5. Identify next milestone backlog with phases 031+ but do not implement broad rewrites.

Hard constraints:
- Do not introduce breaking schema changes.
- Do not weaken auth, tenant isolation, admin gating, Shopee compliance, or HyperFrames safety.
- Do not add external services unless disabled/config-gated.
- Do not expose secrets, local paths, raw logs, stack traces, outputPath, or /var/lib.
- Keep production port and Cloudflare routes unchanged.

Verification:
- python3 -m json.tool package.json >/tmp/package-json-ok.json
- npm ci
- npm run prisma:generate
- npx prisma validate
- npm run db:schema-drift-check
- npm run typecheck
- npm run test
- npm run build
- npm run health
- npm run hyperframes:queue-status
- npm run hyperframes:worker:watchdog

Final response:
- PASS/WARN/FAIL
- files changed
- enterprise readiness matrix summary
- next milestones
- tests run
- commit hash
```
