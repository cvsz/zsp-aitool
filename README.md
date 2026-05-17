# zsp-aitool

zsp-aitool is a Thai-first full-stack SaaS foundation for Shopee Affiliate workflows. This initial baseline sets up the core project structure so future tasks can safely add features module by module.

## Included in this initial foundation

- Next.js App Router + TypeScript strict mode
- Tailwind CSS setup
- Prisma + PostgreSQL setup
- Dockerfile + docker-compose.yml
- Environment template (`.env.example`)
- Shared types and utility modules under `src/types` and `src/lib`
- Test scaffold (Vitest + Testing Library)

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Zod
- Vitest
- Docker Compose

## Quick start

```bash
npm install
cp .env.example .env
docker compose up -d db
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open http://localhost:3001

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Project structure

```text
src/
  app/          # App Router pages + API routes
  components/   # Reusable UI + feature components
  lib/          # Shared utilities / infrastructure helpers
  schemas/      # Zod schemas
  services/     # Business logic modules
  types/        # Shared TypeScript contracts
prisma/
  schema.prisma
  seed.ts
extension/
  # Chrome Extension MV3 workspace
```

## Environment

Copy `.env.example` and set values for your local machine.

## Notes

- User-facing UI defaults to Thai (`lang="th"`).
- Product ingestion must use user-provided or user-visible data only.
- AI/OCR providers are abstracted and can be mocked in tests.
