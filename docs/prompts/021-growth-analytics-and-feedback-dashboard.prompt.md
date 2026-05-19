# 021 — Growth Analytics and Feedback Dashboard Prompt

Use after `020-production-db-schema-drift-hardening-and-settings-migration.prompt` is deployed and `npm run db:schema-drift-check` passes on production.

```text
You are working on cvsz/zsp-aitool.

Phase:
021 — Growth Analytics and Feedback Dashboard.

Mode:
Production-safe analytics and feedback UX. Add privacy-safe, first-party product analytics for activation visibility. Do not add invasive tracking, external analytics SDKs, or user surveillance.

Current baseline:
- Full production start passes.
- UserSetting schema drift check passes.
- Health passes with 0 failures and 0 warnings.
- HyperFrames queue/watchdog are healthy.
- Tests/build/typecheck pass.

Main objective:
Add a privacy-safe growth analytics and feedback dashboard that helps operators understand onboarding and activation without exposing secrets, raw private data, or sensitive user content.

Key metrics:
- registered users count
- products created count
- first product saved conversion
- AI generations count
- first AI generation conversion
- exports/copy actions count if event data exists
- HyperFrames render attempts/completions if event data exists
- feedback submissions count
- activation funnel summary
- recent aggregate activity

Hard constraints:
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions.
- Do not run npm audit fix --force.
- Do not remove postbuild or scripts/fix-next-server-chunks.sh.
- Do not weaken auth, tenant isolation, org isolation, admin gating, Shopee compliance, or HyperFrames guardrails.
- Do not add Google Analytics, Meta Pixel, TikTok Pixel, or external tracking SDKs unless disabled by default and config-gated.
- Do not collect private Shopee user data.
- Do not store raw prompts, private user content, tokens, partner keys, passwords, DATABASE_URL, outputPath, /var/lib, or stack traces in analytics.
- Admin analytics must be aggregate-first.
- Tenant/org analytics must respect tenant/org scope.
- No guaranteed income claims.

Implementation tasks:
1. Inventory existing models/events/logs that can support analytics.
2. Prefer existing data before adding schema.
3. If schema is needed, add minimal first-party tables for safe events and feedback.
4. Add a service layer: GrowthAnalyticsService and FeedbackService if needed.
5. Add admin/operator UI: `/dashboard/admin/analytics` if route pattern exists, otherwise add panel under `/dashboard/admin/system`.
6. Add a user-facing feedback CTA on dashboard with no sensitive fields.
7. Add tests for tenant/org isolation, admin gating, no secret/path exposure, no external tracking SDK, and aggregate-only admin analytics.
8. Add `docs/runbooks/growth-analytics-feedback.md`.

Verification:
- git status --short
- python3 -m json.tool package.json >/tmp/package-json-ok.json
- npm ci
- npm run prisma:generate
- npx prisma validate
- npx prisma migrate status --schema prisma/schema.prisma
- npm run db:schema-drift-check
- npm run typecheck
- npm run test
- npm run build
- npm run health
- npm run hyperframes:queue-status
- npm run hyperframes:worker:watchdog

Final response:
- verdict PASS/WARN/FAIL
- files changed
- schema changes
- analytics metrics added
- privacy/security behavior
- tests run
- production commands
- commit hash
```
