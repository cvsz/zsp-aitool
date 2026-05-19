# 025 — Mobile PWA and Chrome Extension Polish Prompt

Use after 024 is stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
025 — Mobile PWA and Chrome Extension Polish.

Mode:
Production-safe UX polish for mobile and extension capture flows.

Main objective:
Make mobile dashboard flows and Chrome Extension MV3 product capture/import UX reliable, discoverable, and safe.

Required work:
1. Inventory mobile navigation, responsive dashboard pages, and extension import endpoints.
2. Polish mobile layouts for product capture, generator, OCR, similar products, settings, and HyperFrames pages.
3. Review extension manifest/content scripts/background/popup for MV3 compliance and minimal permissions.
4. Add safe extension payload validation and user-facing import state copy.
5. Add PWA-ready metadata/icons only if existing app structure supports it safely.
6. Add tests for responsive navigation coverage, extension endpoint validation, no secret exposure, and no broad permissions.
7. Update docs/runbooks/mobile-pwa-extension.md.

Hard constraints:
- Do not request excessive browser permissions.
- Do not scrape private Shopee pages or bypass anti-bot/login/CAPTCHA systems.
- Do not collect private Shopee user data.
- Do not expose tokens, cookies, local paths, outputPath, /var/lib, DATABASE_URL, or stack traces.
- Keep production routes and port unchanged.

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
- mobile/extension behavior
- security behavior
- tests run
- commit hash
```
