# 024 — Team Workspace, Billing, and Quota Polish Prompt

Use after 023 is stable. This phase polishes visibility and guardrails; it does not implement real payment processing unless existing infrastructure already exists.

```text
You are working on cvsz/zsp-aitool.

Phase:
024 — Team Workspace, Billing, and Quota Polish.

Mode:
Production-safe SaaS operations polish. Improve workspace/team, plan, usage, and quota UX while preserving tenant/org isolation.

Main objective:
Make org/team usage, plan limits, HyperFrames quota, AI generation limits, and upgrade guidance visible and safe for users/admins.

Required work:
1. Inventory existing user/org/tenant/subscription/quota models and HyperFrames billing gates.
2. Add or polish usage cards for AI generations, products, exports, OCR, HyperFrames renders, and storage where data exists.
3. Add team/workspace copy and placeholders only if membership/RBAC is not yet implemented.
4. Add plan/limit visibility without claiming unsupported billing features.
5. Add admin aggregate usage panel without raw private content.
6. Add tests for tenant isolation, no cross-org usage leakage, no secret/path exposure, and quota gate preservation.
7. Update docs/runbooks/team-workspace-billing-quota.md.

Hard constraints:
- Do not add real payment capture without explicit approved billing provider integration.
- Do not expose raw emails/passwords/tokens/private user content.
- Do not weaken auth, tenant/org isolation, admin gating, or HyperFrames quota checks.
- No guaranteed income claims.
- Keep production port/Cloudflare routes unchanged.

Verification:
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
- schema changes
- quota/plan behavior
- security/isolation behavior
- tests run
- commit hash
```
