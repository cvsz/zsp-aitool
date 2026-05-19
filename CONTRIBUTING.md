# Contributing

Thank you for contributing to `zsp-aitool`.

This project is a Thai-first SaaS application for Shopee Affiliate workflows, AI promotional content generation, product management, OCR, exports, Chrome Extension MV3 collection, and HyperFrames video composition/render operations.

## Development Principles

- Keep changes small, focused, and reviewable.
- Use conventional commits.
- Preserve existing public APIs unless a refactor is clearly justified.
- Update documentation when behavior, routes, scripts, schemas, or operations change.
- Add or update tests for every behavior change.
- Do not remove working code unless necessary.
- Do not bundle unrelated phases into one pull request.

## Branching Workflow

1. Create a feature branch from `main`.
2. Keep the branch scoped to one feature, fix, or documentation update.
3. Run the required verification commands before opening a pull request.
4. Open a pull request with a clear summary, test results, and risk notes.
5. Merge only after review and successful checks.

Suggested branch names:

```text
feat/ui-app-shell
feat/hyperframes-retry-controls
fix/package-json-scripts
docs/security-policy
ops/hyperframes-cleanup-timer
```

## Commit Style

Use conventional commits where possible:

```text
feat: add HyperFrames render retry controls
fix: repair package scripts JSON
docs: update security policy
ops: add HyperFrames cleanup timer
test: add HyperFrames security regression suite
```

Optional scopes are welcome when useful:

```text
feat(hyperframes): add render history filters
fix(auth): block cross-org render access
docs(readme): update production verification
```

## Architecture Expectations

Follow the repository structure:

```text
src/app/api      # API routes
src/app          # App Router pages/layouts
src/components   # Reusable UI and feature components
src/lib          # Shared utilities and infrastructure helpers
src/services     # Business logic
src/schemas      # Zod validation schemas
prisma           # Prisma schema, migrations, seed
scripts          # Operational scripts
extension        # Chrome Extension MV3 workspace
docs             # Documentation and runbooks
```

Rules:

- Use Prisma for database access.
- Use Zod for external input validation.
- Keep frontend/backend types aligned.
- Prefer explicit TypeScript types.
- Avoid `any` unless justified.
- Keep imports pointing to real files.
- Keep UI Thai-first for user-facing surfaces.

## Security and Compliance Requirements

Contributions must preserve these rules:

- Do not bypass CAPTCHA, login walls, Shopee anti-bot systems, or private/undocumented Shopee endpoints.
- Do not automate mass scraping.
- Product import must rely on user-provided data, official APIs where configured, or visible page data captured by the browser extension after user confirmation.
- Do not collect private user data from Shopee pages.
- Do not generate fake reviews, fake scarcity, invented product specifications, or unsupported product claims.
- Include affiliate disclosure where relevant.
- Do not expose secrets, `DATABASE_URL`, tokens, stack traces, `outputPath`, `/var/lib`, or internal render directories.
- Do not use `dangerouslySetInnerHTML` for user-controlled content.
- Do not execute arbitrary user HTML.

## Auth, Tenant, and Org Isolation

Every relevant change must preserve:

- Authentication for user-facing APIs unless intentionally public.
- User scoping for products, content, exports, render jobs, and history.
- Organization membership checks for org-scoped resources.
- Role enforcement where org roles exist:
  - `VIEWER` can view allowed org data only.
  - `EDITOR` can create/retry/cancel allowed org jobs.
  - `ADMIN` can manage allowed org resources.
- Controlled denial for cross-user and cross-org resource lookups, preferably `404` for lookup paths.

## HyperFrames Contribution Rules

For HyperFrames worker, queue, artifact, and operator changes:

- Keep render disabled in Codex/CI/container unless a test explicitly mocks the render path.
- Do not start, stop, enable, or disable production systemd services from Codex or app UI.
- Guard any `systemctl` usage with a systemd availability check.
- Use vectorized `bin` + `argv` execution for render commands.
- Do not shell-concatenate render commands.
- Preserve queue limits, retry limits, stale job detection, disk checks, and output validation.
- Cleanup must be dry-run by default.
- Artifact handling must block path traversal and symlink escape.
- User-facing APIs/UI must not expose local artifact paths.

## Required Verification

For most changes, run:

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

For HyperFrames/operator changes, also run when available:

```bash
npm run hyperframes:doctor
npm run hyperframes:worker:once
npm run hyperframes:cleanup-renders
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```

In Codex/CI/container environments, DB-dependent or systemd-dependent checks may be `SKIP`/`WARN` if PostgreSQL or systemd is unavailable. Real code, schema, package, typecheck, test, or build failures must be fixed.

## Production Migration Policy

On production, use:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma migrate status --schema prisma/schema.prisma
```

Do not use `prisma migrate dev` on production.

## Pull Request Checklist

- [ ] Purpose is clear
- [ ] Changes are scoped and reviewable
- [ ] Documentation updated if behavior or operations changed
- [ ] Prisma schema and migrations are safe, if changed
- [ ] Auth/user/org isolation preserved
- [ ] No secrets or local paths exposed
- [ ] HyperFrames guardrails preserved, if relevant
- [ ] `package.json` is valid JSON, if touched
- [ ] Tests added or updated for behavior changes
- [ ] Verification commands run and results included
- [ ] Remaining warnings are documented

## Pull Request Summary Template

```text
Summary
- ...

Files changed
- ...

Security/access behavior
- ...

Tests/checks run
- ...

Warnings/risks
- ...

Commit
- ...
```
