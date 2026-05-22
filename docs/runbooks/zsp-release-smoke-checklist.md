# ZSP Release Smoke Checklist

## 1. Security & Config
- [ ] No `DATABASE_URL` or secrets leaked in logs or UI.
- [ ] No `dangerouslySetInnerHTML` usage.
- [ ] `systemctl` commands are not exposed in UI.
- [ ] Cloudflare tunnel and DNS settings untouched.

## 2. Build & Type Safety
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` succeeds without critical warnings.
- [ ] `npm run test` is 100% green.

## 3. Admin & Operator Panels (Phases 2 & 3)
- [ ] `/dashboard/admin` sub-routes are accessible by role.
- [ ] `/dashboard/hyperframes/ops` paths have no internal path leaks (`/var/lib`, `outputPath`).

## 4. Production Smoke
- [ ] Run `npx vitest run tests/scripts/db-critical-schema-drift-static.test.ts` to ensure DB sync.
- [ ] Verify `npm run health` returns 200 OK.
