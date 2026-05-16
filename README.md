# ZSP AI Tool (Starter)

Starter template for `zsp-aitool` using **Next.js + TypeScript + Tailwind CSS + Prisma + PostgreSQL + Docker Compose**.

## Tech Stack

- Next.js (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Docker / Docker Compose

## Getting Started

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start PostgreSQL (Docker):

```bash
docker compose up -d db
```

4. Run Prisma migration:

```bash
npm run prisma:migrate
```

5. Run development server:

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run lint
- `npm run prisma:migrate` - run prisma migrations
- `npm run prisma:generate` - generate prisma client
- `npm run prisma:seed` - seed database

## Docker

Run all services:

```bash
docker compose up --build
```

## Initial Structure

```text
prisma/
  schema.prisma
  seed.ts
src/
  app/
  components/
  lib/
  services/
  types/
```
