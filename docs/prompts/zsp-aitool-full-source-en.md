# ZSP-AITool Full Source Prompt Pack

This is the English master prompt pack for generating, auditing, or extending `zsp-aitool` with an AI coding agent.

Repository:

```text
https://github.com/cvsz/zsp-aitool.git
```

Current product scope:

`zsp-aitool` is a Thai-first SaaS application for Shopee Affiliate workflows. It helps users save product data, manage affiliate links, generate AI promotional content, export content/products, run OCR extraction, find similar saved products, and create HyperFrames promotional video compositions and render jobs.

Use this prompt pack when you need a full-source generation baseline, a module-by-module rebuild, or a strict implementation plan for new agents.

---

## Global Rules for Every Prompt

```text
You are working on cvsz/zsp-aitool.

Follow AGENTS.md, .faf, SECURITY.md, README.md, and CONTRIBUTING.md.

Hard constraints:
- Do not bypass CAPTCHA.
- Do not bypass login walls.
- Do not bypass Shopee anti-bot systems.
- Do not use private or undocumented Shopee endpoints.
- Do not automate mass scraping.
- Product import must rely on user-provided data, official APIs where configured, or visible page data captured by the browser extension after user confirmation.
- Do not collect private user data from Shopee pages.
- Do not generate fake reviews.
- Do not invent product specifications.
- Do not make unsupported medical, financial, legal, or exaggerated product claims.
- AI-generated content must include affiliate disclosure where relevant.
- The user must be able to review and edit extracted product data before saving.
- Do not expose secrets, DATABASE_URL, tokens, stack traces, outputPath, /var/lib, or internal render directories.
- Do not use dangerouslySetInnerHTML for user-controlled content.
- Do not execute arbitrary user HTML.
- Do not add UI buttons that directly start, stop, restart, enable, or disable systemd services.
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions unless explicitly requested.
- Do not run npm audit fix --force.
- Keep postbuild and scripts/fix-next-server-chunks.sh intact.
- Use prisma migrate deploy, not prisma migrate dev, on production.

Implementation rules:
- Use clean modular architecture.
- Put shared utilities in src/lib.
- Put business logic in src/services.
- Put validation schemas in src/schemas.
- Put reusable UI components in src/components.
- Put API routes under src/app/api.
- Use Prisma for all database access.
- Use Zod for all external input validation.
- Use strict TypeScript.
- Avoid implicit any unless clearly justified.
- Keep API responses consistent.
- Keep frontend and backend types aligned.
- Generate complete files, not fragments.
- Do not leave TODO comments in core features.
- Preserve working code unless a change is necessary.
- Add or update tests for every behavior change.

Required verification for most changes:
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health

For HyperFrames/operator changes, also run when available:
npm run hyperframes:doctor
npm run hyperframes:worker:once
npm run hyperframes:cleanup-renders
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog

If PostgreSQL or systemd are unavailable in Codex/container, report those checks as WARN/SKIP. Do not mark them as PASS.
```

---

## Master Prompt: Complete Production-Ready Source Code

```text
You are a senior full-stack engineer and security-minded SaaS architect.

Generate the complete production-ready source code for a SaaS web app and browser extension named zsp-aitool.

Project goal:
zsp-aitool helps Shopee Affiliate users collect and save product information, manage affiliate links, generate AI promotional content, export content, run OCR extraction, find similar saved products, and create HyperFrames video compositions and render jobs.

Default user-facing language:
Thai. Code identifiers, file paths, API route names, database model names, and comments may remain English.

Tech stack:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Zod
- Next.js API routes
- Chrome Extension Manifest V3
- OpenAI-compatible AI provider abstraction
- Pluggable OCR provider abstraction
- Vitest
- Testing Library
- Docker Compose
- HyperFrames render worker
- systemd on the real production VM only

Core features:
1. User authentication
2. Thai-first SaaS dashboard
3. Product library
4. Product import by manual form, URL, browser extension payload, screenshot OCR, and JSON
5. Affiliate link management
6. AI content generator
7. Platform-specific post generation for Facebook, Instagram, Threads, X, blogs, SEO articles, captions, comment replies, and HyperFrames scripts
8. Prompt template management
9. Content history
10. OCR extraction workflow
11. Similar product recommendations from the user's saved products
12. Export as CSV, TXT, and Markdown
13. Chrome Extension Manifest V3 for one-click user-confirmed product collection
14. HyperFrames Studio
15. HyperFrames render queue, history, retry/cancel controls, secure downloads, thumbnails, shares, quotas, operator views, and watchdog tooling
16. Admin panel foundation with gated read-only aggregate views
17. Professional responsive app shell and operator-safe UI

Generate:
- Complete folder structure
- package.json with valid scripts and no duplicate keys
- .env.example
- Dockerfile
- docker-compose.yml
- Prisma schema and seed file
- API routes
- Service classes
- Validation schemas
- Frontend pages and components
- Chrome extension files
- HyperFrames worker scripts and safety helpers
- Admin foundation
- Tests
- README
- Security notes
- Production verification commands

Output format:
1. Start with the project tree.
2. Then provide each file with its path.
3. Use complete file contents.
4. Do not say "repeat similarly".
5. Do not omit core files.
6. Use placeholder API keys only in .env.example.
7. Make the app runnable locally.
8. Include verification commands.
```

---

## Prompt 1 — Database and Prisma Schema

```text
Create the complete PostgreSQL + Prisma database schema for zsp-aitool.

Entities:
- User
- Organization
- OrgMembership
- Product
- ProductImage
- AffiliateLink
- ContentGeneration
- ContentTemplate
- PromptPreset
- OCRJob
- SimilarProduct
- PlatformPost
- UserSetting
- APIUsageLog
- HyperFrameScriptGeneration
- HyperFrameRenderJob
- HyperFrameRenderShare
- HyperFrameSocialExportAuditEvent

Requirements:
- User can own many products, content generations, prompt templates, OCR jobs, affiliate links, and render jobs.
- Organization can own shared HyperFrames render jobs through orgId.
- OrgMembership must enforce org role: VIEWER, EDITOR, ADMIN.
- Product stores title, price, currency, originalUrl, affiliateUrl, shopName, rating, soldCount, description, category, rawMetadata, and soft delete.
- ContentGeneration stores platform, tone, language, prompt, JSON output, token usage, status, and soft delete.
- OCRJob stores image URL, extracted text, confidence, status, errorMessage, raw result, and user scope.
- SimilarProduct links source product and related product with score and reason.
- HyperFrameRenderJob stores status, userId, optional orgId, optional productId, compositionHtml, compositionMetadata, outputPath, outputUrl, outputSizeBytes, attempts, locks, timestamps, and soft delete.
- outputPath may exist in the database for worker internals but must never be exposed through user-facing UI/API responses.
- Include indexes for userId, orgId, productId, platform, status, createdAt, deletedAt, and originalUrl where appropriate.
- Use enums for platform, tone, language, job status, plan tier, render status, and org role.
- Include seed data for demo products, Thai prompt templates, user settings, and safe sample content history.

Generate:
- prisma/schema.prisma
- prisma/seed.ts
- migration guidance
- production migration warning: use prisma migrate deploy only on production
```

---

## Prompt 2 — Backend API and Services

```text
Generate the complete backend API for zsp-aitool using Next.js App Router API routes with TypeScript.

Required modules:
- Auth APIs
- Product APIs
- AI generation and content history APIs
- Prompt template APIs
- OCR APIs
- Export APIs
- HyperFrames APIs
- Admin overview API

Services:
- ProductService
- AIContentService
- OCRService
- ExportService
- PromptTemplateService
- TemplateRenderer
- SimilarProductService
- HyperFrames render/history/download services
- AdminOverviewService

Rules:
- Use withAuth for protected APIs.
- Scope user data by authenticated userId.
- Scope org data by org membership.
- Enforce org roles where applicable.
- Validate all external input with Zod.
- Return consistent success/failure JSON.
- Do not expose outputPath, /var/lib, secrets, DATABASE_URL, or stack traces.
- Use 404-style denial for cross-user or cross-org resource lookup where appropriate.
- Do not call real AI/OCR/HyperFrames external tools in unit tests.
```

---

## Prompt 3 — AI Content Generator

```text
Create the full AI content generation module for zsp-aitool.

Requirements:
- Create AIProvider interface.
- Create OpenAI-compatible provider.
- Create MockAIProvider for tests/local development.
- Create prompt builder functions.
- Add safety rules to prevent fake claims and invented specs.
- Add affiliate disclosure where relevant.
- Support Thai and English.
- Support multiple content variations.
- Store every generation in the database.
- Return structured JSON with headline, caption, hashtags, CTA, disclosure, and warnings.
- Include tests that never call real AI APIs.
```

---

## Prompt 4 — Frontend Dashboard and Professional UI

```text
Generate the complete Thai-first frontend dashboard for zsp-aitool.

Required pages:
- Landing page
- Login
- Register
- Dashboard overview
- Product library
- Product detail
- Add/import product
- AI content generator
- Content history
- Prompt templates
- OCR tools
- Similar products
- Settings
- HyperFrames Studio
- HyperFrames render history
- HyperFrames batch render
- HyperFrames ops
- HyperFrames operator queue
- Admin overview
- Admin users
- Admin products
- Admin content
- Admin renders
- Admin system
- Admin audit logs
- Admin settings

UI requirements:
- Thai-first user-facing copy.
- Professional SaaS layout.
- Responsive desktop sidebar and mobile navigation.
- Sticky header with current section label.
- Dashboard KPI cards.
- Quick action cards.
- Loading states.
- Empty states.
- Error states.
- Accessible focus states.
- No raw JSON in normal dashboard UI.
- No outputPath, /var/lib, DATABASE_URL, or secrets in UI.
- No dangerouslySetInnerHTML for user-controlled content.
- Use next/image for thumbnails.
```

---

## Prompt 5 — Chrome Extension Manifest V3

```text
Generate a complete Chrome Extension Manifest V3 source code for zsp-aitool.

Compliance:
- Only extract visible page information from the page the user actively opens.
- Do not bypass login, CAPTCHA, rate limits, or hidden APIs.
- Do not collect private user data.
- Ask for user confirmation before sending data to the web app.
- Let users review and edit extracted data before saving.

Files:
- extension/package.json
- extension/manifest.json
- extension/vite.config.ts
- extension/src/popup.html
- extension/src/popup.ts
- extension/src/popup.css
- extension/src/content-script.ts
- extension/src/background.ts
- extension/src/options.html
- extension/src/options.ts
- extension/src/api-client.ts
- extension/src/types.ts
- extension/README.md
```

---

## Prompt 6 — Product Import, OCR, Similar Product, and Export

```text
Generate product import, OCR, similar product, and export modules for zsp-aitool.

Rules:
- Normalize product title, price, currency, URLs, images, and metadata.
- Detect duplicates within the same user scope.
- Let users review and edit before saving.
- Validate with Zod.
- Store raw metadata safely.
- Use pluggable OCR provider and MockOCRProvider.
- Recommend similar products only from the authenticated user's saved product library unless official API integration is configured.
- Export only authenticated user's data.
- Protect CSV formula injection.
```

---

## Prompt 7 — HyperFrames Production-Safe Render System

```text
Generate the HyperFrames video composition and render system for zsp-aitool.

Safety requirements:
- Rendering disabled by default in Codex/CI/container unless tests mock the render path.
- Production worker enablement must be explicit and operator-controlled.
- Worker command must use vectorized bin + argv execution.
- Do not shell-concatenate render commands.
- Enforce max pending jobs, max running jobs, max attempts, retry backoff, disk checks, and stale running job detection.
- Cleanup dry-run default.
- Cleanup must never escape HYPERFRAMES_OUTPUT_DIR.
- Artifact downloads must validate resolved path inside HYPERFRAMES_OUTPUT_DIR.
- Block path traversal.
- Block symlink escape.
- Validate file is regular and content type/extension is allowed.
- User-facing APIs and UI must never expose outputPath, /var/lib, or internal render work directories.
- Operator UI is read-only/safe and must not directly control systemd.

Tests:
- disabled worker path
- command vector builder
- render smoke gates
- queue limits
- max attempts
- artifact traversal block
- symlink escape block
- no outputPath in history payload
- no /var/lib in UI
- no dangerouslySetInnerHTML
```

---

## Prompt 8 — Admin Panel Foundation

```text
Generate a professional admin panel foundation for zsp-aitool.

Routes:
- /dashboard/admin
- /dashboard/admin/users
- /dashboard/admin/products
- /dashboard/admin/content
- /dashboard/admin/renders
- /dashboard/admin/system
- /dashboard/admin/audit-logs
- /dashboard/admin/settings

API:
- GET /api/admin/overview

Rules:
- Auth required.
- Use role gating if available.
- If role system is unclear, gate with ADMIN_PANEL_ENABLED=false by default.
- Return aggregate-only data.
- Do not expose raw user lists, emails, passwords, secrets, local paths, outputPath, or stack traces.
- No dangerous admin actions.
- No systemd controls in UI.
- Use Thai-first UI copy.
```

---

## Prompt 9 — Tests and Security Regression Suite

```text
Create or update the test suite for zsp-aitool.

Coverage:
- services
- API routes
- tenant isolation
- org isolation
- HyperFrames render safety
- HyperFrames artifact downloads
- HyperFrames worker guardrails
- HyperFrames UI static safety
- Admin UI/API static safety
- Dashboard shell static safety
- Final UI/Admin/HyperFrames audit

Security regression coverage:
- unauthenticated access
- cross-user access
- cross-org access
- path traversal
- symlink escape
- outputPath leakage
- /var/lib leakage
- DATABASE_URL leakage
- unsafe HTML execution
- SSRF protection
- CSV formula injection
```

---

## Prompt 10 — Production Readiness and Deployment

```text
Create the final production readiness and deployment guide for zsp-aitool.

Required production commands:
cd ~/zsp-aitool
git pull --rebase origin main
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog

If migrations are pending on production:
npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma migrate status --schema prisma/schema.prisma

Do not use prisma migrate dev on production.
```

---

## Final Verification Prompt

```text
Perform final full-repo production readiness verification for cvsz/zsp-aitool.

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
npm run hyperframes:doctor
npm run hyperframes:worker:once
npm run hyperframes:queue-status || true
npm run hyperframes:worker:watchdog || true

grep -RniE "dangerouslySetInnerHTML|DATABASE_URL|sk-[A-Za-z0-9]|/var/lib|outputPath" src app components scripts prisma tests docs 2>/dev/null || true
grep -RniE "systemctl[[:space:]]+(start|stop|restart|enable|disable)" src/app src/components 2>/dev/null || true

Report:
- Overall verdict
- Files reviewed
- Files changed
- Schema changes
- Security/access behavior
- Checklist table with PASS/WARN/FAIL
- Commands run
- Blocking issues
- Environment-only warnings
- Remaining risks
- Commit hash
- PR status
- READY_TO_DEPLOY=true/false
- READY_FOR_NEXT_PHASE=true/false
```
