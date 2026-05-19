# 023 — HyperFrames Template Marketplace Lite Prompt

Use after phases 021–022 are stable. This phase adds template discovery and preset UX, not paid marketplace mechanics.

```text
You are working on cvsz/zsp-aitool.

Phase:
023 — HyperFrames Template Marketplace Lite.

Mode:
Production-safe HyperFrames UX expansion. Add curated templates/presets and discovery UX without weakening render guardrails.

Main objective:
Create a lightweight HyperFrames template library that helps users start from safe, reusable composition presets for Shopee affiliate content.

Required work:
1. Inventory existing HyperFrames templates, composition forms, render enqueue paths, and safety tests.
2. Add curated preset data using local/static templates or existing DB patterns.
3. Add template categories such as product showcase, discount alert, comparison, testimonial-style without fake review claims, and short-form social cut.
4. Add UI for template browse/search/filter under HyperFrames dashboard.
5. Add safe preview cards using next/image where images are needed.
6. Add script-to-composition handoff from selected template.
7. Add guardrails so templates cannot inject unsafe media URLs, internal paths, outputPath, /var/lib, secrets, or system controls.
8. Add tests for template inventory, no raw img, no dangerous copy, and render validation unchanged.
9. Update docs/runbooks/hyperframes-template-marketplace-lite.md.

Hard constraints:
- Do not add paid marketplace billing yet.
- Do not permit user-supplied executable code in templates.
- Do not expose local render paths.
- Do not use raw <img>; use next/image.
- Do not add systemd controls.
- Do not weaken HyperFrames quota, auth, tenant/org scope, or download token safety.
- No fake review or guaranteed income copy.

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
- template categories added
- HyperFrames safety behavior
- tests run
- commit hash
```
