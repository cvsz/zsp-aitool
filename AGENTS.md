# AGENTS.md — zsp-aitool / Studio

Repository: cvsz/zsp-aitool
Product: Thai-first Shopee Affiliate AI Studio / ZSP AI Tool
Local origin: http://127.0.0.1:3001
Public edge: https://studio.zeaz.dev

Cloudflare 403 challenge from studio.zeaz.dev is WARN, not application failure. Do not bypass Cloudflare Challenge.

## Stack
- **Frontend**: Next.js 15.5 App Router, React 18, Tailwind CSS 3
- **Backend**: Next.js API routes, Prisma 5.22 ORM
- **Database**: PostgreSQL 16 (docker-compose: postgres:16-alpine, local: psql 16.14)
- **Testing**: Vitest v4, 355 tests (110 files), jsdom env
- **Validation**: Zod schemas
- **Video**: HyperFrames render worker integration

## Database — 23 tables
User, Organization, OrgMembership, Product, ProductImage, ProductDuplicateGroup,
AffiliateLink, ContentGeneration, ContentTemplate, PromptPreset, PlatformPost,
OCRJob, SimilarProduct, AIContentQueueJob, CsvImportJob, APIUsageLog,
HyperFrameRenderJob, HyperFrameRenderShare, FeedbackSubmission, UserSetting,
ShopeeAffiliateIngestion, ShopeeAffiliateSocialDraft, _prisma_migrations

## API Modules
admin, auth, ai, products, templates, ocr, export, content-history,
hyperframes, imports, integrations (shopee), feedback, settings, usage

## Dashboard Pages
generator, products, templates, ocr, similar, export-center, content-history,
hyperframes (renders, batch, ops/queue), settings, shopee-affiliate, admin

## Hard rules
- Do not change production port 3001.
- Do not change Cloudflare, DNS, tunnel, or systemd config without explicit approval.
- Do not expose DATABASE_URL, secrets, tokens, API keys, /var/lib, outputPath, internal render paths, or raw stack traces.
- Do not use dangerouslySetInnerHTML for user-controlled content.
- Do not add frontend controls that run systemctl.
- Do not run npm audit fix --force.
- Do not upgrade Next.js or Prisma major versions without approval.
- All commits must use GPG signing via `scripts/git/gpg-loopback.sh commit -m "message"`.
  Do not run raw `git commit` — use the script to unlock the key with loopback pinentry.
- Use `scripts/git/gpg-loopback.sh push` and `scripts/git/gpg-loopback.sh pull` to unlock
  the GPG agent before the operation (push/pull don't sign but the agent must be warm).

## ECC Integration
ECC repo at `../ecc`. Skills (249) + MCP servers (27) configured in `~/.config/opencode/opencode.jsonc`.
ECC assets under `.agents/ecc-selected/`. Imports must follow `.agents/rules/20-ecc-integration.md`.
ECC is reference-only by default; do not load all assets into context.

## Verification (run after changes)
python3 -m json.tool package.json
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health
