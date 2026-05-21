# DB Schema Drift Repair Runbook

## Incident summary

Production drift was identified when Prisma attempted to read `User.planTier` and PostgreSQL returned that the column did not exist. This caused importer flows that touched `User` through Prisma Client to fail.

## Drift found

- Missing column: `User.planTier`.
- Potential related risk: missing critical columns/indexes in runtime tables (`User`, `Product`, `AffiliateLink`, `UserSetting`, `APIUsageLog`, `ShopeeAffiliateIngestion`, `ShopeeAffiliateSocialDraft`, `HyperFrameRenderJob`, `ContentTemplate`, `OCRJob`).

## Repair applied

1. Applied forward-only migration `20260521093000_add_user_plan_tier`:
   - Creates enum `PlanTier` if missing.
   - Adds `User.planTier` with `NOT NULL DEFAULT 'FREE'` using `ADD COLUMN IF NOT EXISTS`.
2. Extended `scripts/db/check-user-settings-schema.ts` into a critical schema drift check for columns, critical type checks, and key constraints.
3. Added startup guard marker and enforced schema drift check execution in `start.sh`.

## No-data-loss policy

- no-data-loss
- Do not drop tables.
- Do not reset the database.
- Do not run prisma migrate reset.
- Do not delete migration history.

## Verification steps

Run:

```bash
npm run prisma:generate
npx prisma validate
npx prisma migrate status --schema prisma/schema.prisma
npm run db:schema-drift-check
```

For direct SQL verification:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'User'
  AND column_name = 'planTier';
```

## Rollback considerations

- Preferred rollback is forward-fix only (new migration) to preserve data.
- Do not remove `User.planTier` after app code has been deployed expecting it.
- If drift check fails post-deploy, stop writes, inspect failing table/column/index, and ship a follow-up idempotent repair migration.

## Preventing future drift

- Keep `npm run db:schema-drift-check` in startup/integrity pipelines.
- Treat drift check failures as blocking for production rollout.
- Prefer forward-only idempotent repair migrations for incident response.
- Keep raw-query importer fallbacks limited to resilience only; database repair remains mandatory.
