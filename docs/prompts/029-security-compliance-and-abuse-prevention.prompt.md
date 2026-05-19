# 029 — Security, Compliance, and Abuse Prevention Prompt

Use after 028 is stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
029 — Security, Compliance, and Abuse Prevention.

Mode:
Production hardening. Improve static checks, abuse prevention, policy-safe copy, and operational safeguards without blocking legitimate use.

Main objective:
Strengthen security/compliance coverage across auth, tenant isolation, exports, Shopee compliance, HyperFrames, admin pages, logs, and user-generated content handling.

Required work:
1. Inventory existing SECURITY.md, auth middleware, admin gates, tenant/org isolation tests, export safety tests, HyperFrames security tests, Shopee compliance tests, and static scans.
2. Add or improve static tests for:
   - no secrets in UI
   - no raw outputPath or /var/lib exposure
   - no dangerous systemd controls in UI
   - no raw <img> in Next app/components
   - no dangerouslySetInnerHTML for user-controlled content
   - no guaranteed income/fake review/scraping claims
3. Add or improve server-side validation for high-risk inputs where gaps exist.
4. Add rate-limit/abuse-prevention docs or tests if existing infrastructure supports it.
5. Add safe error response shaping: no stack traces, no secrets, no internal paths.
6. Update SECURITY.md and docs/runbooks/security-compliance-abuse-prevention.md.

Hard constraints:
- Do not weaken auth, admin gating, tenant/org isolation, Shopee compliance, or HyperFrames guardrails.
- Do not add invasive tracking.
- Do not expose private data or secrets.
- Do not use external scanners that require secrets or external services unless disabled/config-gated.
- Do not run npm audit fix --force.
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
- security/compliance improvements
- tests run
- residual risks
- commit hash
```
