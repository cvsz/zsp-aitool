# ZSP-AITool Full Source Code Design

## 1) System Overview

ZSP-AITool is a Thai-first SaaS platform for Shopee Affiliate workflows.

Primary domains:
- Identity and tenant isolation
- Product ingestion (manual, URL, extension payload, OCR, JSON)
- AI content generation and prompt templates
- Affiliate-link management
- Export and content history
- HyperFrames composition/render workflow
- Admin/operator observability

Tech stack:
- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Zod schemas for external-input validation
- Vitest + Testing Library

## 2) Source Tree and Ownership

```text
src/
  app/                    # Next.js routes + API routes (delivery layer)
    api/                  # HTTP entrypoints, auth checks, response normalization
    dashboard/            # Thai-first SaaS UI pages
  components/             # Reusable UI components (cards, layout, tables)
  lib/                    # Shared primitives (auth, db, security, helpers)
    hyperframes/          # render config, queue guards, download-token, org-access
  schemas/                # Zod input/output contracts
  services/               # Business logic orchestration
prisma/
  schema.prisma           # Data model and persistence contracts
  seed.ts                 # deterministic seed for local/dev bootstrap
tests/                    # Unit/integration/security regressions
extension/                # Chrome extension (Manifest V3)
docs/                     # Architecture, worker notes, prompt packs
```

Design rule: keep HTTP/request concerns in `src/app/api`, business logic in `src/services`, validation in `src/schemas`, and low-level primitives in `src/lib`.

## 3) Layered Architecture

### Presentation Layer
- `src/app/**/page.tsx`: pages and route-level composition.
- `src/components/**`: reusable visual building blocks.
- Thai-first labels, empty/loading/error states.

### API Layer
- `src/app/api/**/route.ts`: authenticated request handling.
- Each route validates payloads with Zod schemas.
- Consistent response envelope for success/failure.

### Service Layer
- `src/services/**`: domain workflows:
  - Product lifecycle
  - Content generation orchestration
  - HyperFrames quota and job orchestration
  - Export/report generation

### Core Library Layer
- `src/lib/**`: infrastructure and shared concerns:
  - Prisma client access
  - Auth/session helpers
  - Org/user scoping helpers
  - HyperFrames render command construction (vectorized bin+argv)
  - Download token signing/verification and path safety

### Data Layer
- Prisma models define source of truth for:
  - Users, organizations, memberships/roles
  - Products and product metadata
  - Prompt templates and generated content history
  - HyperFrames render jobs/history
  - Audit and operator records

## 4) Key Domain Flows

### A) Product Import
1. UI submits manual/URL/JSON/OCR input.
2. API validates with Zod.
3. Service normalizes fields and enforces user ownership.
4. Prisma persists scoped product record.
5. UI shows editable review before final save.

### B) AI Content Generation
1. User picks platform + tone + language + optional custom prompt.
2. API validates and resolves prompt template.
3. Service calls AI provider abstraction (mockable in tests).
4. Result saved into content history (scoped by `userId`).
5. Response includes affiliate disclosure-compatible output.

### C) HyperFrames Render
1. API receives composition/render request.
2. Service enforces feature gate, quota, and queue limits.
3. Render command built as vectorized `bin` + `argv`.
4. Job status transitions tracked in DB (`PENDING` → `RUNNING` → terminal).
5. Downloads served through secure route with token + path/symlink/traversal checks.

## 5) Security and Multi-Tenancy

- Every user-facing API requires auth unless explicitly public.
- Queries are always scoped by authenticated `userId` and optional org membership.
- Cross-user/cross-org lookups return controlled denial (preferably 404).
- No secret exposure in API output or UI.
- No shell-concatenated render commands.
- No unsafe HTML execution for user-controlled content.

## 6) Testing Strategy

Test categories:
- Unit tests for services and utilities.
- Route tests for auth and validation behavior.
- Security regression tests:
  - unauthenticated access
  - cross-user/cross-org data isolation
  - path traversal / symlink escape on artifact downloads
  - internal path leakage (`outputPath`, `/var/lib`)
  - CSV injection and SSRF-sensitive boundaries

External dependencies (AI/OCR/network-heavy) must be mocked.

## 7) Local Runtime Design

- `.env.example` defines required runtime variables.
- `docker-compose.yml` provisions app + db for local boot.
- Prisma generation/validation gates type-safe data access.
- Health checks and scripts support safe operational diagnostics.

## 8) Extension Integration Boundary

Chrome Extension (Manifest V3) must only collect user-confirmed, visible product data and send payloads through documented app APIs. No private/undocumented Shopee endpoints and no anti-bot bypass behavior.

## 9) Change Guidelines

- Preserve public APIs unless refactor is justified and coordinated.
- Keep changes small and reviewable.
- Update docs and tests with behavior changes.
- Prefer explicit types and server-side validation.
