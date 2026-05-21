# Project Status

## Snapshot (2026-05-21)

`zsp-aitool` is currently a full-stack Next.js + Prisma + Chrome Extension workspace with runnable APIs, dashboard pages, domain services, and automated tests.

Latest documentation refresh includes HyperFrames operator/runbook alignment, Shopee affiliate safe-ingestion coverage, and social-draft persistence rollout documentation.

## Completed Modules

- **Core app + architecture docs**: README, architecture docs, prompt pack, and system architecture baseline are present and aligned to the full-stack scope.
- **Auth**: register/login/logout/me endpoints, cookie session token flow, password hashing, and middleware.
- **Products**: CRUD + import-url + import-json + extension-import + affiliate-link update.
- **AI generation**: single and batch endpoints, provider abstraction, prompt builder, history persistence.
- **Templates**: CRUD, duplicate, and restore-defaults APIs + dashboard UI.
- **OCR**: provider abstraction with mock provider + extract and job lookup APIs.
- **Similar products**: lookup and refresh routes + service logic.
- **Export**: products CSV, content CSV/Markdown/TXT routes.
- **Dashboard UI**: products, generator, templates, OCR, history, similar, and settings pages.
- **Extension (MV3)**: content script + popup/options/background + app API client.
- **Testing**: service tests, API tests, and component tests via Vitest + Testing Library.

## Security, Compliance, and Controls (Current)

- Added auth endpoint request throttling to reduce brute-force abuse on `/api/auth/login` and `/api/auth/register`.
- Added AI/OCR per-minute quota guards at API level.
- Production readiness checklist exists and is now the canonical launch-gate artifact.

## CI Status (Current)

- CI now validates required docs/files.
- CI now validates Prisma flow (`prisma generate`, `prisma migrate`, `prisma seed`).
- CI runs lint, typecheck, tests, and build.

## Open Gaps Before Production

- Persisted/distributed rate-limit backend (Redis/edge) is still recommended over in-memory for multi-instance deployment.
- Daily AI budget enforcement is currently configuration-only (budget value exposed in env) and should be backed by persisted usage accounting + alerts.
- Several production-readiness checklist items remain operational tasks (backup drills, secret rotation, formal security monitoring/on-call process).

## Documentation Maintenance Status

- Canonical docs are now aligned to the latest workspace capabilities as of **2026-05-21**.
- `README.md`, roadmap, and release notes now reflect the newest runbooks and HyperFrames operational guardrails.
- Historical review documents (dated audits/reviews) are intentionally preserved as point-in-time artifacts.
