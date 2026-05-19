# 022 — Official Shopee Open API Foundation Polish Prompt

Use after phase 021 is stable. This phase must remain official-API-only and disabled by default unless approved credentials and official endpoint documentation are available.

```text
You are working on cvsz/zsp-aitool.

Phase:
022 — Official Shopee Open API Foundation Polish.

Mode:
Compliance-safe integration polish. Do not scrape. Do not bypass login, CAPTCHA, anti-bot systems, or private endpoints.

Main objective:
Improve the official Shopee Open API foundation UX, configuration validation, status copy, setup docs, and safe import handoff while keeping live API calls disabled unless official credentials and docs are complete.

Required work:
1. Review existing Shopee Open API config, service, status endpoint, UI copy, docs, and tests.
2. Ensure all config is disabled by default and environment-gated.
3. Add or polish status UI for:
   - disabled/foundation-only mode
   - sandbox-ready mode
   - missing credentials
   - Managed Seller / Mall Seller / KAM blocked state
   - live-ready state only when all required env values exist
4. Add safe setup checklist links to docs/runbooks/shopee-open-api-managed-seller-kam.md and official reference docs if present.
5. Add validation tests for no scraping/private endpoint wording and no seller password storage.
6. Add API/service tests for status behavior without making real network calls.
7. Keep affiliate disclosure and claim-safety copy visible where relevant.

Hard constraints:
- Do not implement scraping.
- Do not automate Shopee login.
- Do not store seller passwords.
- Do not invent official endpoint details.
- Do not make real API calls in tests.
- Do not expose partner keys, tokens, or webhook secrets.
- Do not weaken auth/tenant/admin gates.
- Keep production route/port unchanged.

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
- Shopee status behavior
- compliance behavior
- tests run
- commit hash
```
