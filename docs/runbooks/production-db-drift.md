# Production DB Schema Drift Runbook (UserSetting)

## Objective

Detect and safely repair schema drift for required `UserSetting` columns:

- `brandColors`
- `fontPreference`
- `logoUrl`
- `watermarkText`
- `defaultAspectRatio`
- `defaultCTA`

## Detection (Read-only)

Run the read-only check:

```bash
npm run db:schema-drift-check
```

Expected outcomes:

- `[PASS]` means all required columns exist.
- `[FAIL]` means drift exists and one or more columns are missing.

Notes:

- The check reads `information_schema.columns` only.
- It performs no writes and no schema mutation.
- It never prints `DATABASE_URL`.

## Safe Repair Policy

If drift is detected:

1. Confirm migration state:

```bash
npx prisma migrate status --schema prisma/schema.prisma
```

2. Apply migrations using deploy mode only:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
```

3. Re-run drift verification:

```bash
npm run db:schema-drift-check
```

4. Verify app health:

```bash
npm run health
```

## Migration Policy

- Do **not** use `prisma migrate dev` on production.
- Use committed SQL migrations under `prisma/migrations`.
- For additive drift repair, prefer `ADD COLUMN IF NOT EXISTS` where supported.
- Ensure defaults/backfill are applied before adding `NOT NULL` constraints.

## Rollback Notes

- Additive column migrations are generally forward-safe.
- If rollback is required, prefer application rollback first while keeping additive columns.
- Avoid destructive rollback SQL on production unless a dedicated maintenance window and backup restore plan are approved.
- If migration deploy fails mid-run, restore from latest verified backup and re-run deploy in a controlled window.
