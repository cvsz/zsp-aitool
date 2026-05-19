# 028 — Production Backup, Restore, and Release Runbooks Prompt

Use after 027 is stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
028 — Production Backup, Restore, and Release Runbooks.

Mode:
Operational hardening. Add backup/restore/release documentation and safe scripts where appropriate. Do not introduce destructive defaults.

Main objective:
Make production backup, restore rehearsal, release verification, and rollback/roll-forward procedures reproducible and auditable.

Required work:
1. Inventory existing deployment scripts, start.sh, health checks, Prisma migrations, DB config, Docker/VM docs, and runbooks.
2. Add safe backup script if absent:
   - database dump with timestamp
   - no secrets printed
   - dry-run/info mode if useful
   - retention guidance, not blind deletion unless explicitly configured
3. Add restore rehearsal documentation with clear warnings.
4. Add release checklist that references start.sh, db:schema-drift-check, health, queue/watchdog, route smoke, and journal checks.
5. Add rollback/roll-forward guidance: prefer roll-forward migrations, do not drop newly added columns during incidents.
6. Add tests/static checks for script existence, no secret echo, no destructive defaults, and docs mention migrate deploy.
7. Update docs/runbooks/production-backup-restore.md and docs/runbooks/release-checklist.md.

Hard constraints:
- Do not delete production data by default.
- Do not include real credentials or DATABASE_URL output.
- Do not run restore automatically.
- Do not use prisma migrate dev on production.
- Do not weaken app services, auth, tenant isolation, or HyperFrames guardrails.

Verification:
- python3 -m json.tool package.json >/tmp/package-json-ok.json
- npm ci
- npm run prisma:generate
- npx prisma validate
- npm run db:schema-drift-check
- npm run typecheck
- npm run test
- npm run build
- npm run health
- npm run hyperframes:queue-status
- npm run hyperframes:worker:watchdog

Final response:
- PASS/WARN/FAIL
- files changed
- scripts added
- backup/restore safety behavior
- tests run
- commit hash
```
