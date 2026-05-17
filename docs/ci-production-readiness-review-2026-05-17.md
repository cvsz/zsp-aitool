# CI/CD and Production Readiness Review (2026-05-17)

Repository: `cvsz/zsp-aitool`

## Executed checks

- `npm ci` → **failed** (package-lock out of sync with package.json)
- `npm install` → resolved lock mismatch locally
- `npm run prisma:generate` → pass
- `npm run typecheck` → pass
- `npm run test` → pass
- `npm run build` (+ `postbuild`) → pass
- `npm run health` → pass with warnings expected for non-prod environment

## Findings by requested area

### 1) package.json scripts

- `build`: uses `NODE_ENV=production next build` (good for production parity).
- `postbuild`: runs chunk link fix script (present and executable).
- `start`: `next start` is standard.
- `typecheck`: dedicated tsconfig, CI-friendly.
- `test`: currently only runs `tests/smoke.test.ts`; expand over time for meaningful CI confidence.
- `health`: environment-aware and already avoids hard-failing on Cloudflare/systemd/port-3001 limitations.
- Prisma scripts:
  - `prisma:generate` good.
  - `prisma:migrate:deploy` production-safe migration command.
  - `prisma:seed` uses Prisma seed hook with `tsx prisma/seed.ts` (good).

### 2) package-lock consistency

- `npm ci` currently fails due lock mismatch (missing several transitive dependencies in lock file).
- Impact: CI job fails at install stage before any validation steps.
- Action: regenerate lock (`npm install`) and commit updated `package-lock.json`.

### 3) Prisma migration flow

- CI currently runs:
  - `prisma:generate`
  - `prisma:migrate:deploy`
  - `prisma:seed`
- This flow is correct for deploy-style validation and does not require shadow DB.
- `SHADOW_DATABASE_URL` in CI env is currently unnecessary for deploy flow.

### 4) seed flow using tsx

- Seed configured through Prisma block in package.json: `"seed": "tsx prisma/seed.ts"`.
- CI compatibility: good, provided `DATABASE_URL` is valid and DB is reachable.

### 5) GitHub Actions workflow

- Current workflow is single-job and always provisions Postgres.
- Recommendation: split into two jobs:
  1. **fast-checks** (no DB): install, lint, typecheck, test, build, health
  2. **db-checks** (optional/conditional): postgres service + prisma deploy + seed
- Benefit: CI still validates non-DB paths even if service startup has transient issues.

### 6) environment variables

Minimum CI-safe env:
- `AUTH_SECRET`
- `OPENAI_API_KEY` (placeholder acceptable for tests/build if provider calls are mocked)
- `DATABASE_URL` only for DB job

Production-required env (from `.env.example` + runtime expectations):
- `NEXT_PUBLIC_APP_URL=https://studio.zeaz.dev`
- `NEXT_PUBLIC_API_BASE_URL=https://studio.zeaz.dev/api`
- `DATABASE_URL` (prod Postgres)
- `AUTH_SECRET` (strong)
- AI/OCR provider keys as applicable

### 7) DB service in CI

- Current Postgres service config is valid.
- To satisfy “DB checks should only run when Postgres is available”:
  - keep Prisma commands only in DB job
  - gate DB steps with readiness check (`pg_isready`) and clear failure message

### 8) public URL checks

- Health script already treats Cloudflare challenge responses as warnings.
- During this run, public endpoints returned HTTP 503 and were warnings, not hard failures.
- Recommendation: in CI, avoid making public URL checks blocking.

### 9) systemd checks

- Health script already skips when `systemctl`/systemd is unavailable.
- This is aligned with “CI must not require systemd”.

### 10) production-only vs CI-safe checks

- **CI-safe**: lint, typecheck, tests, build, postbuild symlink check, non-blocking health checks.
- **Production-only**: `systemctl status zsp-aitool.service`, localhost service curl on `127.0.0.1:3001`, strict DB migration status, stricter endpoint SLI checks.

## Recommended GitHub Actions YAML (concept)

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  fast-checks:
    runs-on: ubuntu-latest
    env:
      AUTH_SECRET: ci-secret
      OPENAI_API_KEY: ci-placeholder
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
      - run: npm run health

  db-checks:
    runs-on: ubuntu-latest
    needs: fast-checks
    services:
      db:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: zsp_aitool
        options: >-
          --health-cmd "pg_isready -U postgres -d zsp_aitool"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/zsp_aitool?schema=public
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run prisma:generate
      - run: npm run prisma:migrate:deploy
      - run: npm run prisma:seed
```

## Deploy checklist (production)

1. Pull target commit/tag.
2. `npm ci`
3. `npm run prisma:generate`
4. `npm run build`
5. `npm run prisma:migrate:deploy`
6. restart `zsp-aitool.service`
7. run `npm run health`
8. verify:
   - `systemctl status zsp-aitool.service --no-pager`
   - `curl -I http://127.0.0.1:3001`
   - `curl -I https://studio.zeaz.dev/`

## Rollback checklist

1. keep previous build artifact or previous git tag ready.
2. rollback code/artifact.
3. restart `zsp-aitool.service`.
4. verify health/local/public endpoints.
5. if DB migration introduced incompatibility, apply planned backward migration strategy (or restore DB snapshot).

## Local/CI/Production commands summary

### Local dev

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### CI

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run health
# DB job only:
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
```

### Production

```bash
npm ci
npm run prisma:generate
npm run build
npm run prisma:migrate:deploy
sudo systemctl restart zsp-aitool.service
npm run health
```
