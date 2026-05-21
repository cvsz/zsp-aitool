# ZSP-AITool

_Last updated: 2026-05-21_

ZSP-AITool is a Thai-first full-stack SaaS application for Shopee Affiliate workflows. It helps users collect product information, manage affiliate links, generate AI promotional content, export content and product data, run OCR extraction, find similar saved products, and create HyperFrames promotional video compositions and render jobs.

Production domain:

```text
https://studio.zeaz.dev
```

## Core Features

- User authentication
- Product library
- Product import by manual form, URL, browser extension payload, screenshot OCR, and JSON
- AI content generation for Facebook, Instagram, Threads, X, blogs, SEO articles, captions, and comment replies
- Platform-specific prompt/template management
- Content history
- OCR extraction workflow
- Similar product recommendations from the user’s saved products
- Affiliate link management
- Export as CSV, TXT, and Markdown
- Chrome Extension Manifest V3 for one-click product collection after user confirmation
- Thai-first responsive SaaS dashboard UI
- HyperFrames Studio for deterministic AI video composition
- HyperFrames render queue, history, retry/cancel controls, secure downloads, thumbnails, shares, quotas, operator views, and watchdog tooling

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Next.js API routes
- PostgreSQL
- Prisma
- Zod
- Vitest
- Testing Library
- Docker Compose
- Chrome Extension Manifest V3
- OpenAI-compatible AI provider abstraction
- Pluggable OCR provider abstraction
- HyperFrames render worker
- systemd on the production VM

## Repository Structure

```text
src/
  app/          # App Router pages and API routes
  components/   # Reusable UI, layout, dashboard, HyperFrames components
  lib/          # Shared utilities and infrastructure helpers
  schemas/      # Zod request/response schemas
  services/     # Business logic modules
  types/        # Shared TypeScript contracts
prisma/
  schema.prisma
  migrations/
  seed.ts
scripts/
  health-zsp-aitool.sh
  fix-next-server-chunks.sh
  hyperframes/
extension/
  # Chrome Extension MV3 workspace
docs/
  # Architecture, runbooks, prompt packs, release notes, and HyperFrames documentation
```

## Documentation Index

- Project status: `docs/project-status.md`
- Roadmap: `docs/roadmap.md`
- Production readiness checklist: `docs/production-readiness-checklist.md`
- HyperFrames worker operations: `docs/hyperframes-render-worker.md`
- Runbooks: `docs/runbooks/`
- Prompt packs: `docs/prompts/`

## Quick Start

```bash
npm install
cp .env.example .env
docker compose up -d db
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open:

```text
http://localhost:3001
```

## Environment

Copy `.env.example` to `.env` and configure values for your local environment.

Important local defaults:

- Keep real provider keys out of source control.
- Use mock AI/OCR providers in tests.
- Keep HyperFrames rendering disabled in generic local/Codex/container environments unless you are explicitly testing a controlled render path.
- Do not point development or Codex environments at a production database.

## Common Scripts

```bash
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health
```

Development:

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

Database:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run prisma:seed
```

HyperFrames:

```bash
npm run hyperframes:doctor
npm run hyperframes:worker:once
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
npm run hyperframes:cleanup-renders
npm run hyperframes:recover-stale-jobs
```

## HyperFrames Operations

HyperFrames rendering is designed to be explicit and guarded.

Key rules:

- Rendering should be disabled by default in Codex/CI/container environments.
- Production worker enablement is operator-controlled.
- Worker commands must use safe `bin` + `argv` execution.
- Queue limits, retry limits, disk checks, and stale job detection must stay enabled.
- Cleanup is dry-run by default.
- User-facing APIs and UI must never expose `outputPath`, `/var/lib`, or internal render work directories.

Useful production checks:

```bash
npm run hyperframes:doctor
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
systemctl is-active zsp-hyperframes-worker
```

## Deployment Verification

### Production launch checklist (recommended)

Use the launch-focused runbook for smoke checks, migration policy, and rollback guidance:

- `docs/runbooks/production-launch.md`

### Production server verification

Run these on the actual production machine where `zsp-aitool`, PostgreSQL, and the optional HyperFrames worker service are running:

```bash
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
```

If migrations are pending on production, apply them with:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma migrate status --schema prisma/schema.prisma
```

Do not use `prisma migrate dev` on production.

After a successful build, restart the production app service:

```bash
sudo systemctl restart zsp-aitool
sleep 5
npm run health
```

### Codex/CI/container verification

In Codex, CI, or generic containers:

- `systemctl` may be unavailable because systemd is not PID 1.
- `127.0.0.1:3001` may be unreachable because the production service is not running inside that environment.
- PostgreSQL may not be running locally.
- `https://studio.zeaz.dev/*` can return a Cloudflare challenge `403`, which is an environment/edge warning rather than an app failure.
- DB-dependent HyperFrames checks may need to be skipped or reported as warnings.

Baseline checks:

```bash
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health
```

## Security and Compliance Notes

- Product ingestion must use user-provided data, official APIs where configured, or user-visible data captured by the browser extension after user confirmation.
- Do not bypass CAPTCHA, login walls, Shopee anti-bot systems, or private/undocumented Shopee endpoints.
- Do not automate mass scraping.
- Do not generate fake reviews, unsupported product claims, fake scarcity, or invented specifications.
- Include affiliate disclosure where relevant.
- User-facing APIs must preserve auth, tenant isolation, org isolation, and safe response shaping.
- Do not expose secrets, `DATABASE_URL`, tokens, stack traces, `outputPath`, `/var/lib`, or internal render directories.

## Documentation

- `AGENTS.md` — operating rules for AI agents and Codex
- `SECURITY.md` — security policy and vulnerability handling
- `CONTRIBUTING.md` — contribution workflow and verification checklist
- `.faf` — persistent project context metadata
- `docs/hyperframes-render-worker.md` — HyperFrames worker and operator runbook
- `docs/runbooks/production-launch.md` — production launch smoke + rollback checklist

## License

This project is licensed under the MIT License. See `LICENSE` for details.
