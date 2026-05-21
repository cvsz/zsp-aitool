# 039 — Production DB Schema Drift Repair Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool`.

```text
You are working on cvsz/zsp-aitool.

Phase:
039 — Production DB Schema Drift Repair and Drift Prevention.

Priority:
Critical.

Problem context:
A production import command failed with:

Invalid `prisma.user.findUnique()` invocation
The column `User.planTier` does not exist in the current database.

A temporary importer bypass was added by resolving user ID with a narrow raw query, but the real production issue is database schema drift. Fix drift permanently and add prevention checks.

Primary objective:
Repair PostgreSQL schema drift safely so the real production database matches Prisma expectations without dropping production data.

Hard constraints:
- Do not drop production tables.
- Do not truncate production data.
- Do not reset the database.
- Do not use `prisma migrate reset`.
- Do not use `prisma db push --force-reset`.
- Do not expose `DATABASE_URL` or secrets in logs.
- Use production-safe migrations or explicit repair scripts only.
- Preserve all existing Product, AffiliateLink, User, UserSetting, ShopeeAffiliateIngestion, HyperFrames, ContentHistory, and billing data.

Review first:
- prisma/schema.prisma
- prisma/migrations/**
- scripts/db/check-user-settings-schema.ts
- scripts/health-zsp-aitool.sh
- scripts/db/import-csv-to-products.ts
- package.json
- start.sh
- README.md
- docs/runbooks/production-db-drift.md if present

Required work:
1. Audit Prisma schema vs production-sensitive drift risks.
2. Identify all `User` fields expected by Prisma that may be missing from DB, especially `planTier`.
3. Create a production-safe migration or drift repair SQL/script using `ADD COLUMN IF NOT EXISTS` and safe defaults/backfills.
4. Extend drift checker to cover critical columns for `User`, `UserSetting`, `Product`, `AffiliateLink`, `ShopeeAffiliateIngestion`, and `APIUsageLog`.
5. Add npm script such as `db:schema-drift-check:all` or upgrade existing `db:schema-drift-check` to check all critical tables.
6. Update health script to run the expanded read-only drift check when DB is reachable.
7. Update start.sh to fail clearly when drift remains after migrations.
8. Add tests for the drift checker ensuring it checks `User.planTier` and does not print `DATABASE_URL`.
9. Update docs/runbooks/production-db-drift.md with exact production repair flow and rollback notes.

Suggested production-safe SQL pattern:

```sql
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "planTier" TEXT;
UPDATE "User" SET "planTier" = 'FREE' WHERE "planTier" IS NULL;
ALTER TABLE "User" ALTER COLUMN "planTier" SET DEFAULT 'FREE';
ALTER TABLE "User" ALTER COLUMN "planTier" SET NOT NULL;
```

Adjust type/default based on actual Prisma schema and generated enum mapping.

Safety acceptance criteria:
- All schema repair is additive or safe backfill only.
- No data loss.
- Drift check returns PASS when required columns exist.
- Drift check returns FAIL with clear missing-table/missing-column details when drift exists.
- Drift check never prints secrets or raw database URLs.
- Importer no longer relies on schema drift workaround as the only solution.
- start.sh final success implies drift check passed.

Verification commands:
```bash
git status --short
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npx prisma migrate status --schema prisma/schema.prisma
npm run db:schema-drift-check
npm run typecheck
npm run test
npm run build
npm run health
```

Production verification:
```bash
cd ~/zsp-aitool
bash start.sh
psql "$DATABASE_URL" -c 'select "planTier", count(*) from "User" group by "planTier";'
```

Recommended commits:
- `fix(db): repair production user plan tier drift`
- `test(db): cover schema drift checker`
- `docs(db): add production schema drift runbook`

Final response format:
1. Overall verdict
- PASS / WARN / FAIL
- DB_SCHEMA_DRIFT_REPAIRED=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
3. Files reviewed
4. Files changed
5. Schema changes
6. Drift checker behavior
7. Production repair commands
8. Security/data-safety behavior
9. Commands run
10. Blocking issues
11. Remaining risks
12. Commit hash
13. PR status

Final line:
DB_SCHEMA_DRIFT_REPAIRED=true or DB_SCHEMA_DRIFT_REPAIRED=false
```
