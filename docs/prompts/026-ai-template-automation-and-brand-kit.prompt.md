# 026 — AI Template Automation and Brand Kit Prompt

Use after 025 is stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
026 — AI Template Automation and Brand Kit.

Mode:
Production-safe content workflow polish. Improve reusable prompts, brand settings, and generation guardrails without making unsupported claims.

Main objective:
Make AI content generation faster and more consistent through reusable templates, brand kit settings, safe defaults, and preview workflows.

Required work:
1. Inventory existing AI generator, prompt template, brand kit, product selector, tone/language/platform options, and generated content history.
2. Add or polish brand kit fields that already exist: colors, font preference, logo URL, watermark text, default CTA, default aspect ratio.
3. Add template presets and variable helper UX.
4. Add preview before save/copy/export where practical.
5. Add batch generation UX only if existing backend supports it safely.
6. Add guardrails for incomplete product data, affiliate disclosure, no fake reviews, no invented specs, and no guaranteed income claims.
7. Add tests for template safety, copy safety, schema drift compatibility, and no secret/path exposure.
8. Update docs/runbooks/ai-template-brand-kit.md.

Hard constraints:
- Do not add unsupported AI provider calls without env gating.
- Do not store raw secrets or API keys in UI.
- Do not invent product specs or reviews.
- Do not claim guaranteed revenue.
- Keep Shopee compliance copy visible.
- Keep tenant/org isolation unchanged.

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
- AI/template/brand kit behavior
- safety behavior
- tests run
- commit hash
```
