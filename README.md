# ZSP AI Tool

ZSP AI Tool is an AI-assisted workspace for product content operations: collect product data, run OCR, generate marketing copy with configurable AI providers, manage prompt templates, export content, and track generation history.

---

## Project Overview

ZSP AI Tool combines a **Next.js web dashboard** and a **Chrome Extension (MV3)** to support a compliant product-content workflow:

1. Capture product information (manual entry/import/extension-assisted import).
2. Extract text from product images (OCR pipeline with provider abstraction).
3. Generate platform-specific content using pluggable AI providers.
4. Store, review, export, and reuse generated assets.
5. Keep architecture prompt-driven and AI-friendly with persistent repo context (`.faf`, docs/prompts).

---

## Features

- Authentication (register/login/logout + current user endpoint)
- Product management (create/list/update/delete, import JSON/URL, extension import)
- Similar product discovery and refresh
- Prompt template management (CRUD, duplicate, restore defaults)
- AI content generation (single and batch endpoints)
- OCR extraction endpoint with provider abstraction and mock provider support
- Content history tracking
- Export as CSV / Markdown / Text
- Dashboard pages for products, generator, templates, OCR, settings, and history
- Chrome Extension (MV3) for compliant, user-confirmed page-visible product capture
- Test suite for services, components, and APIs (Vitest + Testing Library)

---

## Tech Stack

### Application
- Next.js (App Router)
- React 18
- TypeScript (strict)
- Tailwind CSS
- Zod (schema validation)

### Data & ORM
- PostgreSQL
- Prisma ORM

### Tooling & Quality
- Vitest
- Testing Library + JSDOM
- ESLint

### Extension
- Chrome Extension Manifest V3
- Vite + TypeScript

### Runtime & Delivery
- Docker / Docker Compose

---

## Folder Structure

```text
zsp-aitool/
├─ src/
│  ├─ app/                  # Next.js pages + API routes
│  ├─ components/           # UI and feature components
│  ├─ services/             # domain services (AI/OCR/product/template/export)
│  ├─ lib/                  # shared utilities and infrastructure helpers
│  ├─ schemas/              # Zod schemas
│  ├─ types/                # shared TS types
│  ├─ hooks/                # custom hooks
│  └─ middleware/           # auth middleware
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ extension/               # Chrome Extension (MV3)
├─ tests/                   # unit/integration tests
├─ docs/                    # architecture, roadmap, prompts
├─ docker-compose.yml
└─ README.md
```

---

## Local Setup

### 1) Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose
- PostgreSQL (or use Docker service below)

### 2) Install dependencies

```bash
npm install
```

### 3) Create environment file

```bash
cp .env.example .env
```

### 4) Start database

```bash
docker compose up -d db
```

### 5) Generate Prisma client + migrate + seed

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 6) Start dev server

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## Environment Variables

Copy from `.env.example` and adjust values for your environment:

```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=ZSP AI Tool
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Auth
AUTH_SECRET=replace-with-a-strong-random-secret
DEFAULT_USER_EMAIL=demo@zsp.local

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zsp_aitool?schema=public

# Prisma
SHADOW_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/zsp_aitool_shadow?schema=public

# AI Provider
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

---

## Database Setup

### Option A: Docker (recommended)

```bash
docker compose up -d db
```

### Option B: Local PostgreSQL

1. Create database `zsp_aitool`
2. Update `DATABASE_URL` in `.env`
3. (Optional) Create shadow database for migrations and set `SHADOW_DATABASE_URL`

---

## Prisma Migration

```bash
npm run prisma:migrate
```

This runs `prisma migrate dev` and applies local schema changes.

---

## Seed Command

```bash
npm run prisma:seed
```

This runs the TypeScript seed script at `prisma/seed.ts`.

---

## Run Development Server

```bash
npm run dev
```

---

## Run Tests

```bash
npm run test
```

Optional additional checks:

```bash
npm run lint
npm run typecheck
```

---

## Run with Docker Compose

Run full stack:

```bash
docker compose up --build
```

Stop and remove:

```bash
docker compose down
```

---

## Chrome Extension Setup

1. Build extension:

```bash
cd extension
npm install
npm run build
```

2. Open Chrome at `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select `extension/dist`

The extension captures only user-visible product data from supported pages and requires user confirmation before sending data to this app.

---

## AI Provider Setup

Current built-in provider path is OpenAI-compatible:

- Set `OPENAI_API_KEY`
- Set `OPENAI_BASE_URL` (default: `https://api.openai.com/v1`)
- Set `OPENAI_MODEL` (example: `gpt-4o-mini`)

The service abstraction in `src/services/ai/` allows swapping providers with compatible implementations.

---

## OCR Provider Setup

OCR is implemented with a provider abstraction (`src/services/ocr/`).

- `OCRProvider` defines the interface.
- `MockOCRProvider` is available for development/testing.
- Configure your production OCR provider implementation by adding a new provider class and wiring it via service configuration.

---

## Affiliate Compliance Notes

- Use only publicly visible product information.
- Do not scrape private user data.
- Do not bypass login walls, CAPTCHAs, or access controls.
- Keep user-confirmation flow before importing data.
- Add clear affiliate disclosures in generated content where required by platform and law.
- Respect each marketplace’s terms of service and robot/content policies.

---

## Security Notes

- Set a strong `AUTH_SECRET` in production.
- Never commit `.env` or raw secrets.
- Validate all API inputs (Zod schemas are already used in multiple modules).
- Prefer server-side secret handling; do not expose provider keys to client runtime.
- Review `SECURITY.md` and rotate keys if leakage is suspected.

---

## Troubleshooting

### Prisma connection errors
- Ensure DB is running: `docker compose ps`
- Confirm `DATABASE_URL` credentials/port
- Re-run `npm run prisma:generate`

### Migration fails due to shadow DB
- Create shadow DB manually or update `SHADOW_DATABASE_URL`
- For local-only quick flow, ensure the URL points to a valid writable database

### Extension import not reaching app
- Verify `NEXT_PUBLIC_API_BASE_URL`
- Check extension options/config
- Confirm the app is reachable from browser context

### AI generation fails
- Confirm API key and base URL
- Check model name availability for your provider account
- Inspect API logs/network responses

### Test failures in fresh environment
- Run `npm install`
- Re-run `npm run test`
- Ensure Node version compatibility

---

## Deployment Guide

### 1) Prepare production env
- Set production `.env` values
- Harden `AUTH_SECRET`
- Point `DATABASE_URL` to managed PostgreSQL

### 2) Build app

```bash
npm ci
npm run prisma:generate
npm run build
```

### 3) Run migrations on production DB

```bash
npx prisma migrate deploy
```

### 4) Start application

```bash
npm run start
```

### 5) Optional container deployment
- Build image from `Dockerfile`
- Deploy with your orchestrator (Docker Compose, ECS, Kubernetes, etc.)
- Inject secrets via secret manager (not plaintext env files in repo)

### 6) Post-deploy checks
- Health-check landing page and key API routes
- Validate DB connectivity
- Validate AI/OCR service calls
- Confirm extension import path (if enabled in production)

---

## Future Roadmap

- Additional AI providers and routing strategy
- Production OCR provider integrations
- Queue-based async generation/processing
- Role-based access control and team workspaces
- Observability dashboard (usage, costs, latency)
- Stronger compliance automation for affiliate disclosures
- More import connectors and platform adapters

---

## คู่มือการใช้งาน (ภาษาไทย)

### ภาพรวมการใช้งาน

`zsp-aitool` เป็นเครื่องมือช่วยงานคอนเทนต์สินค้า โดย flow หลักคือ:

1. เพิ่มข้อมูลสินค้า (พิมพ์เอง / import / ผ่าน Chrome Extension)
2. ใช้ OCR ดึงข้อความจากรูปสินค้า
3. สร้างข้อความการตลาดด้วย AI ตามแพลตฟอร์ม
4. ตรวจแก้ผลลัพธ์ และ export ออกเป็นไฟล์

### ขั้นตอนเริ่มต้นแบบเร็ว

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

จากนั้นเข้า `http://localhost:3000`

### การใช้งาน Chrome Extension (สรุป)

1. ไปที่โฟลเดอร์ `extension` แล้ว build
2. โหลด `extension/dist` ผ่าน `chrome://extensions`
3. เปิดหน้าสินค้าที่ต้องการ
4. ให้ผู้ใช้ตรวจสอบข้อมูลก่อนกดยืนยันส่งเข้าแอป

### หมายเหตุสำคัญ

- ต้องใช้งานตามข้อกำหนดของแพลตฟอร์มและกฎหมายที่เกี่ยวข้อง
- ห้ามเก็บข้อมูลส่วนตัวที่ไม่จำเป็น
- ควรใส่ disclosure เมื่อลิงก์มี affiliate

---

## License

MIT
