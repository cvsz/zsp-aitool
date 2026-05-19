# Security & Tenant/Org Isolation Audit (2026-05-19)

## Scope
- Auth middleware coverage across user-facing API routes.
- Product ownership and HyperFrameRenderJob ownership isolation.
- Org membership and role enforcement (VIEWER/EDITOR/ADMIN).
- Render history, detail, download, retry/cancel, operator flows.
- Public share/download token behavior.
- Dashboard server components and Prisma guard checks.
- Secret/path exposure checks (`outputPath`, `/var/lib`, stack traces, tokens).
- Filesystem safety in `src/lib/hyperframes` (traversal/symlink escape).

## Verdict
No critical isolation or direct file exposure vulnerabilities were identified in the audited HyperFrames/API paths. Existing tests already cover unauthenticated blocking, cross-user/cross-org isolation, role-gated mutation, and download/path-safety regression behavior.

## Evidence-driven checks executed
- `rg "outputPath|/var/lib|dangerouslySetInnerHTML|sendFile|createReadStream|readFile\(|path\.join\(|findUnique\(|orgId|retry|cancel|download" src -n`
- Full mandatory validation pipeline:
  - `npm ci`
  - `npm run prisma:generate`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`
  - `npm run health`

## Key findings
1. Auth is enforced on sensitive render APIs and unauthorized requests return controlled responses.
2. Cross-user job access resolves to `404` in tested routes.
3. Cross-org access is blocked when membership is missing.
4. Org role enforcement blocks `VIEWER` mutation actions; mutable operations require elevated role.
5. Download APIs avoid leaking local filesystem paths and defend traversal/symlink escape.
6. Shared/public token routes are constrained to completed artifacts and return controlled not-found for invalid states.
7. Filesystem access under `src/lib/hyperframes` routes through guard helpers that validate resolved artifact paths.

## Notes
- `npm run build` reports non-blocking lint warnings unrelated to access control.
- `npm run health` reported environment/systemd and Cloudflare-edge warnings expected in non-production container contexts.
