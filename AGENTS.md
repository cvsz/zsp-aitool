# Agent Instructions for ZSP AI Tool

## Project Context

You are working inside the `zsp-aitool` repository.

`zsp-aitool` is a Thai-first SaaS application for Shopee Affiliate workflows. It helps users save product information, manage affiliate links, generate AI promotional content, export content/products, run OCR extraction, find similar saved products, and create/render HyperFrames promotional videos.

Primary repository:

```text
https://github.com/cvsz/zsp-aitool.git
```

## Product Scope

Core product areas:

1. User authentication
2. Product library
3. Product import by manual form, URL, browser extension payload, screenshot OCR, and JSON
4. AI content generation
5. Platform-specific post generation
6. Prompt template management
7. Content history
8. OCR extraction workflow
9. Similar product recommendation from the user’s saved products
10. Affiliate link management
11. Export as CSV, TXT, and Markdown
12. Chrome Extension Manifest V3 for one-click product collection
13. Thai-first responsive SaaS dashboard UI
14. HyperFrames AI video composition and render workflow
15. HyperFrames render history, secure downloads, worker watchdog, operator tooling, and admin/operator dashboard surfaces

## Tech Stack

- Next.js App Router
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
- systemd-based production worker service on the real production VM only

## Files to Read Before Changes

Before making non-trivial changes, inspect the relevant files first. Start with:

1. `README.md`
2. `.env.example`
3. `package.json`
4. `prisma/schema.prisma`
5. `docs/architecture.md`, if present
6. `docs/hyperframes-render-worker.md`, for HyperFrames work
7. The relevant route/component/service/test files for the requested task

For prompt-pack work, also inspect `docs/prompts/` when present.

## Architecture Rules

- Use clean modular architecture.
- Put shared utilities in `src/lib`.
- Put business logic in `src/services`.
- Put validation schemas in `src/schemas`.
- Put reusable UI components in `src/components`.
- Put API routes under `src/app/api`.
- Use Prisma for all database access.
- Use Zod for all external input validation.
- Use strict TypeScript.
- Avoid `any` unless clearly justified.
- Keep API responses consistent.
- Keep frontend and backend types aligned.
- Generate complete files, not fragments.
- Always ensure imports point to real files.
- Always ensure Prisma models match service usage.
- Always ensure API request/response schemas match frontend calls.

## Security and Compliance Rules

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
- Do not expose secrets, API keys, `DATABASE_URL`, tokens, stack traces, or internal filesystem paths.
- Do not store secrets in the database as plain text.
- Do not hardcode API keys.
- Do not run `npm audit fix --force`.
- Do not upgrade Next.js or Prisma major versions unless explicitly requested.

## Auth, Tenant, and Org Isolation Rules

- Every user-facing API must require authentication unless intentionally public.
- Product, content, export, render, and history data must be scoped to the authenticated `userId`.
- Organization-scoped data must require org membership.
- Enforce org roles where present:
  - `VIEWER` can view allowed org data only.
  - `EDITOR` can create, retry, and cancel allowed org jobs.
  - `ADMIN` can manage allowed org resources.
- Cross-user and cross-org access must return a controlled denial, preferably `404` for resource lookup paths.
- Never leak whether another user’s or another org’s resource exists.

## HyperFrames Rules

- Keep HyperFrames rendering disabled in Codex/container environments unless a test explicitly mocks the render path.
- Production may run a real systemd worker daemon, but Codex must not start, stop, enable, or disable production services.
- Do not call `systemctl` in Codex unless guarded by a systemd availability check.
- If PID 1 is not systemd, systemd checks must be `SKIP`/`WARN`, not a failure.
- Render worker commands must use vectorized `bin` + `argv` execution. Do not use shell-concatenated render commands.
- Enforce max pending jobs, max running jobs, max attempts, retry backoff, disk checks, and stale job detection.
- Cleanup must be dry-run by default.
- Cleanup must never escape `HYPERFRAMES_OUTPUT_DIR`.
- Artifact download must validate:
  - resolved path is inside `HYPERFRAMES_OUTPUT_DIR`
  - symlink escape is blocked
  - traversal is blocked
  - file is regular
  - extension and content type are allowed
- User-facing APIs and UI must never expose `outputPath`, `/var/lib`, or internal render work directories.
- Do not execute arbitrary user HTML.
- Do not use `dangerouslySetInnerHTML` for user-controlled content.

## UI and Dashboard Rules

- User-facing UI must be Thai-first.
- Code comments, technical identifiers, route names, API names, and Prisma model names should remain English.
- Prefer professional SaaS UI patterns: clear hierarchy, responsive layouts, loading states, empty states, error states, and accessible focus styles.
- Do not render raw JSON to normal users unless it is an explicit developer/operator diagnostic surface.
- Admin/operator UI must be gated, role-aware, and safe by default.
- Do not add UI buttons that directly start, stop, enable, or disable systemd services.
- Destructive operator actions must require explicit confirmation and must preserve auditability.

## Package and Dependency Rules

- If `package.json` is edited, validate it with:

```bash
python3 -m json.tool package.json >/tmp/package-json-ok.json
```

- Keep exactly one canonical `scripts` object in `package.json`.
- Avoid duplicate script keys.
- Prefer `npm ci` when the lockfile is valid.
- Do not remove `postbuild`.
- Keep `scripts/fix-next-server-chunks.sh` behavior intact.
- Keep `postcss` pinned to the secure version already configured unless explicitly instructed otherwise.

## Testing Rules

- Add or update tests for every behavior change.
- Prefer deterministic tests.
- Do not call real AI, OCR, Shopee, ffmpeg, HyperFrames CLI, Cloudflare, payment, or social APIs in unit tests.
- Mock external providers and filesystem/network-heavy paths where possible.
- Keep security regression coverage for:
  - unauthenticated access
  - cross-user access
  - cross-org access
  - path traversal
  - symlink escape
  - `outputPath` leakage
  - `/var/lib` leakage
  - unsafe HTML execution
  - SSRF protections
  - CSV/formula injection

## Required Verification Before Final Response

Run the relevant subset for the task. For most changes, run:

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

For HyperFrames or operator changes, also run when available:

```bash
npm run hyperframes:doctor
npm run hyperframes:worker:once
npm run hyperframes:cleanup-renders
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```

If DB-dependent commands fail because PostgreSQL is unavailable in Codex/container, report them as `WARN`, not `PASS`.

If systemd commands fail because the environment is not booted with systemd, report them as `SKIP`/`WARN`, not `PASS`.

If a command fails due to a real code, schema, package, or test issue, fix it before finishing.

## Production Verification Notes

On the production VM, after pulling merged changes:

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

If `npm run health` reports unapplied Prisma migrations, use production-safe migration deployment only:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma migrate status --schema prisma/schema.prisma
```

Do not use `prisma migrate dev` on production.

## Change Management Rules

- Keep changes small, reviewable, and consistent with repository architecture.
- Create missing files when required.
- Modify existing files only when needed.
- Do not remove working code unless necessary.
- Preserve public APIs unless there is a clear reason to refactor.
- Keep documentation synchronized with implementation.
- Use conventional commits.
- Summarize changed files after editing.
- Do not bundle unrelated large phases into one change.

## Final Response Format

Every completed task response should include:

- Summary
- Files changed
- Schema changes or confirmation no schema change was needed
- Security/access behavior
- Tests/checks run
- Pass/fail/warn status
- Remaining warnings
- Commit hash
- PR status if created
