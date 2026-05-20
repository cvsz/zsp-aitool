# Security Policy

## Supported Project Scope

This policy applies to the `cvsz/zsp-aitool` repository and the ZSP-AITool SaaS application, including:

- Next.js application routes and API routes
- Prisma/PostgreSQL data access
- Chrome Extension Manifest V3 product collection workflow
- AI/OCR provider abstractions
- Product import/export workflows
- HyperFrames composition, render history, secure downloads, and worker/operator tooling
- Admin/operator dashboard surfaces
- Deployment and maintenance scripts in `scripts/` and `deploy/`

## Reporting Vulnerabilities

Please do not disclose sensitive security findings in public issues.

Use GitHub private vulnerability reporting if enabled for this repository, or contact the repository owner directly.

When reporting, include:

- Affected component or route
- Reproduction steps
- Expected vs actual behavior
- Impact assessment
- Relevant logs or screenshots with secrets redacted
- Suggested mitigation, if known

Do not include live credentials, private API tokens, session cookies, or production database dumps in the report.

## GitHub Security Advisories

This repository uses GitHub Security Advisories for coordinated disclosure, fix tracking, and CVE publication when needed.

Maintainers should use this process:

1. Create a **draft private advisory** in the repository Security tab.
2. Add affected package/component metadata and impacted version ranges.
3. Grant access only to the minimum required maintainers/collaborators.
4. Link the remediation pull request and keep discussion in the private advisory thread.
5. Merge the fix, update release notes/changelog, and prepare user-facing mitigation guidance.
6. Publish the advisory and request a CVE through GitHub if the impact warrants one.

For reporters, prefer GitHub private vulnerability reporting over public issues to avoid unintentional disclosure.

## Security Principles

ZSP-AITool follows these security principles:

- Least privilege for data access and operational actions
- Authentication for user-facing APIs unless intentionally public
- Tenant/user isolation for products, content, exports, render jobs, and history
- Organization membership and role checks for org-scoped data
- Safe defaults for Codex/CI/container environments
- No sensitive filesystem path exposure in API responses or UI
- No arbitrary user HTML execution
- Reviewable production-impacting changes

## Shopee Affiliate Compliance

Product collection and import features must not:

- Bypass CAPTCHA
- Bypass login walls
- Bypass Shopee anti-bot systems
- Use private or undocumented Shopee endpoints
- Automate mass scraping
- Collect private user data from Shopee pages

Allowed product import sources:

- User-entered manual form data
- User-provided URLs, with safe validation
- Browser extension payloads based on visible page data after user confirmation
- User-provided screenshots processed by OCR
- User-provided JSON
- Official APIs where configured and permitted

AI-generated content must not invent product specifications, fake reviews, unsupported claims, fake scarcity, or unsupported medical/financial/legal claims. Affiliate disclosure must be included where relevant.

## Secrets and Sensitive Data

Never commit or expose:

- API keys
- `DATABASE_URL`
- OAuth tokens
- Session secrets
- JWT secrets
- Cloudflare tokens
- Webhook secrets
- Raw stack traces containing sensitive context
- Production database dumps
- Local `.env` files

Secrets must be configured through environment variables, deployment secret stores, or provider-specific secret managers.

## API and Data Access Requirements

- User-facing APIs must validate input with Zod or an equivalent schema.
- Database access must use Prisma.
- Product, content, export, render, and history data must be scoped by authenticated `userId`.
- Org-scoped data must require org membership.
- `VIEWER`, `EDITOR`, and `ADMIN` roles must be enforced where org roles are present.
- Cross-user and cross-org resource lookups should return controlled denials, preferably `404` for resource lookup endpoints.
- API responses must not expose `outputPath`, `/var/lib`, internal render work directories, secrets, or stack traces.

## HyperFrames Security Requirements

HyperFrames render and artifact handling must follow these rules:

- Rendering must stay disabled in Codex/CI/container environments unless tests explicitly mock the render path.
- Production worker enablement must be explicit and operator-controlled.
- Worker commands must use vectorized `bin` + `argv` execution. Do not shell-concatenate render commands.
- Enforce max pending jobs, max running jobs, max attempts, retry backoff, disk checks, and stale running job detection.
- Cleanup must be dry-run by default.
- Cleanup must never escape `HYPERFRAMES_OUTPUT_DIR`.
- Artifact downloads must verify that the resolved file path is inside `HYPERFRAMES_OUTPUT_DIR`.
- Block path traversal and symlink escape.
- Do not expose local paths in user-facing API responses or UI.
- Do not execute arbitrary user HTML.
- Do not use `dangerouslySetInnerHTML` for user-controlled content.

## Operational Security

Production operations should use:

```bash
npm run health
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
npx prisma migrate status --schema prisma/schema.prisma
```

For production migrations, use only:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
```

Do not use `prisma migrate dev` on production.

Codex/CI/container environments may not have systemd, PostgreSQL, ffmpeg, or the HyperFrames CLI. In those environments, systemd and DB-dependent checks should be treated as `SKIP`/`WARN` when the failure is environmental.

## Dependency Security

- Do not run `npm audit fix --force`.
- Do not upgrade Next.js or Prisma major versions unless explicitly requested and reviewed.
- Keep security overrides documented in `package.json`.
- Validate `package.json` after edits:

```bash
python3 -m json.tool package.json >/tmp/package-json-ok.json
```

## Validation Before Security-Sensitive Merges

For security-sensitive changes, run:

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

## Response Process

1. Triage the report.
2. Identify affected components and data exposure risk.
3. Reproduce in a safe environment.
4. Prepare a minimal fix.
5. Add or update regression tests.
6. Validate using the commands above.
7. Document the remediation.
8. Release or deploy the fix through the normal review process.


## Abuse Prevention and Safe Error Handling

- Rate-limit controls must return safe error envelopes without stack traces or internal paths.
- User-facing errors must not include `DATABASE_URL`, API keys, tokens, `/var/lib`, or raw exception stacks.
- Preserve abuse controls on OCR/AI/import routes and keep user-confirmation gates for product data ingestion.

## Static Security Regression Checks

Security static scan coverage is maintained by:

- `tests/security/security-compliance-static-scans.test.ts`

This regression test blocks:

- secrets in UI files
- `outputPath` or `/var/lib` exposure in user-facing app/components
- direct systemd control actions in user-facing UI
- raw `<img>` in Next app/components
- `dangerouslySetInnerHTML` in app/components
- guaranteed income/fake-review copy in user-facing surfaces

Operational procedure details: `docs/runbooks/security-compliance-abuse-prevention.md`.
