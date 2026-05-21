# 039 — DB Schema Drift Repair Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool` after the current production build passes but before adding more large data features.

```text
You are working on cvsz/zsp-aitool.

Phase:
039 — Production DB Schema Drift Repair.

Priority:
Critical. A production command failed with Prisma schema drift: `The column User.planTier does not exist in the current database.` A temporary importer bypass was added, but the database/schema mismatch must be fixed permanently and safely.

Main objective:
Find and repair all Prisma-vs-PostgreSQL schema drift without data loss, then add drift checks that prevent this class of production issue from returning.

Current known symptom:
- Running `npm run db:import-csv-products -- --file /home/zeazdev/SP-Product-Feed-All-Global-Category.csv --user-email sea@zeaz.dev --apply` failed because Prisma attempted to select `User.planTier`, but the real DB table `User` did not contain `planTier`.
- A script workaround now resolves user ID with a raw query, but this is not the final fix.

Do not do:
- Do not drop production tables.
- Do not reset the database.
- Do not run `prisma migrate reset`.
- Do not delete migrations.
- Do not wipe Product, AffiliateLink, User, ContentGeneration, HyperFrames, Shopee, Marqeta, OCR, settings, or audit data.
- Do not change production port 3001.
- Do not weaken auth, org isolation, user isolation, security middleware, Shopee compliance, Marqeta sandbox-only guardrails, or HyperFrames controls.

Review first:
- `prisma/schema.prisma`
- `prisma/migrations/**`
- `scripts/db/check-user-settings-schema.ts`
- `scripts/db/import-csv-to-products.ts`
- `package.json`
- `start.sh`
- existing tests under `tests/scripts/**`, `tests/services/**`, `tests/api/**`, `tests/security/**`

Required audit:
1. Inspect Prisma schema for every model expected by production.
2. Inspect migrations for missing additions such as `User.planTier`.
3. Create a safe drift inspection script that checks actual DB columns for critical models:
   - User
   - Product
   - AffiliateLink
   - UserSetting
   - APIUsageLog
   - ShopeeAffiliateIngestion
   - ShopeeAffiliateSocialDraft
   - HyperFrameRenderJob
   - ContentTemplate
   - OCRJob
4. Compare actual columns with Prisma model fields that are required by app runtime.
5. Report missing columns, unexpected critical type mismatches, missing indexes, and missing unique constraints.

Implementation options:
Prefer a forward-only Prisma migration when possible.
If Prisma migration cannot safely represent a drift repair, add a carefully documented SQL repair migration. It must be idempotent where possible and safe on production.

Known repair candidate:
- Add missing `User.planTier` with default `FREE` if missing.
- Ensure the enum or database type needed by Prisma exists.
- Backfill existing rows safely.

Example shape, adapt to real schema/migration style:

```sql
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "planTier" "PlanTier" NOT NULL DEFAULT 'FREE';
```

Only use the exact SQL if it matches the real generated Prisma enum/table state.

Required code changes:
1. Extend the DB drift check script so it checks `User.planTier` and other critical columns.
2. Add tests for the drift check script.
3. Update `start.sh` so source/integrity/runtime checks catch `User.planTier` drift before long-running imports.
4. Keep the importer raw user-ID lookup if it improves drift tolerance, but document that the DB must still be repaired.
5. Add a runbook:
   - `docs/runbooks/db-schema-drift-repair.md`

Runbook must include:
- what drift was found.
- exact repair applied.
- how to verify.
- rollback considerations.
- no-data-loss policy.
- how to handle future drift.

Tests to add/update:
- `tests/scripts/db-schema-drift-check-static.test.ts`
- optional new file: `tests/scripts/db-critical-schema-drift-static.test.ts`
- any migration/static tests already used by repo conventions.

Test coverage:
- drift script references `User.planTier`.
- drift script checks required models/tables.
- drift script does not print `DATABASE_URL`.
- runbook documents no reset/no drop policy.
- start.sh includes the drift check and relevant marker.

Required commands:

```bash
git status --short
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm run prisma:generate
npx prisma validate
npx prisma migrate status --schema prisma/schema.prisma
npm run db:schema-drift-check
npm run typecheck
npm run test
npm run build
```

Production verification:

```bash
cd ~/zsp-aitool
bash start.sh
psql "$DATABASE_URL" -c 'select column_name from information_schema.columns where table_name = ''User'' and column_name = ''planTier'';'
npm run db:import-csv-products -- --file /home/zeazdev/SP-Product-Feed-All-Global-Category.csv --user-email sea@zeaz.dev --max-rows 10
```

Expected production result:
- `bash start.sh` passes.
- `User.planTier` exists.
- `npm run db:schema-drift-check` passes.
- dry-run or limited import no longer fails because of `User.planTier`.

Commit strategy:
- `fix(db): repair production schema drift`
- `test(db): cover critical schema drift checks`
- `docs(db): document production schema drift repair`

Final response format:
Return exactly:

1. Overall verdict
- PASS / WARN / FAIL
- DB_SCHEMA_DRIFT_REPAIRED=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Drift found
- table/column/index/type issues

3. Repair applied
- migration/script/runbook/start.sh updates

4. Files reviewed
- grouped list

5. Files changed
- file + reason

6. Migration details
- name, SQL/Prisma summary, data-safety notes

7. Verification table
Rows:
- Prisma generate
- Prisma validate
- migration status
- schema drift check
- typecheck
- tests
- build
- start.sh
- limited CSV import dry run

8. Commands run
- exact command + PASS/WARN/FAIL

9. Blocking issues
- list or None

10. Remaining risks
- list concrete residual risks

11. Commits
- hash and message

Final line:
DB_SCHEMA_DRIFT_REPAIRED=true or DB_SCHEMA_DRIFT_REPAIRED=false
```
