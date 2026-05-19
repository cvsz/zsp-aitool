# 020 — Production DB Schema Drift Hardening and Settings Migration Prompt

Use this prompt after `019-full-ux-ui-final-release-day-night-system.prompt` is deployed and production has shown any Prisma/UserSetting schema drift warning.

```text
You are working on cvsz/zsp-aitool.

Phase:
020 — Production DB Schema Drift Hardening and Settings Migration.

Mode:
Production stabilization only. Do not add new product features. Fix schema drift prevention, verification, repair documentation, and safe production migration flow.

Current baseline:
- 019 Full UX/UI Final Release + background color selector has been deployed.
- Production app starts successfully.
- npm ci passed.
- Prisma generate and validate passed.
- typecheck passed.
- tests passed.
- build passed.
- health passed with 0 failures.
- HyperFrames queue/watchdog are healthy.
- Production `zsp-aitool` service and `zsp-hyperframes-worker` are active.
- A production DB drift warning appeared for `UserSetting` fields even though `npx prisma migrate status` reported database schema up to date.

Known drift examples seen in production/test stdout:
- `UserSetting.brandColors` missing
- `UserSetting.fontPreference` missing

Main objective:
Make `UserSetting` schema drift impossible to miss, safe to diagnose, and safe to repair without weakening production safety.

Hard constraints:
- Do not change production port 3001.
- Do not change Cloudflare routes.
- Do not upgrade Next.js or Prisma major versions.
- Do not run `npm audit fix --force`.
- Do not remove `postbuild`.
- Do not remove `scripts/fix-next-server-chunks.sh`.
- Do not expose `DATABASE_URL`, secrets, tokens, partner keys, outputPath, `/var/lib`, or stack traces in user-facing UI/API/logs.
- Do not mutate production DB from health checks.
- Do not use `prisma migrate dev` on production.
- Use `prisma migrate deploy` on production.
- Do not weaken auth, tenant isolation, org isolation, admin gating, Shopee compliance, or HyperFrames guardrails.
- Keep background color selection cosmetic, allowlisted, and safe.

Review before changing:
- prisma/schema.prisma
- prisma/migrations/**
- package.json
- scripts/health-zsp-aitool.sh
- scripts/** existing DB/check patterns
- tests/** existing script/static test patterns
- README.md
- docs/runbooks/**
- docs/prompts/019-full-ux-ui-final-release-day-night-system.prompt.md

Required `UserSetting` fields to validate against Prisma schema:
- id
- userId
- defaultLanguage
- defaultTone
- defaultPlatform
- affiliateDisclosure
- defaultHashtags
- ctaStyle
- subscriptionPlan
- brandColors
- fontPreference
- logoUrl
- watermarkText
- defaultAspectRatio
- defaultCTA
- createdAt
- updatedAt
- deletedAt

Implementation tasks:

1. Audit Prisma schema and migrations
- Confirm `UserSetting` contains every required field above.
- Inspect existing migrations to determine which migration should have created each field.
- Identify whether migrations are missing, incomplete, or if production drift likely came from manual DB changes / historical migration mismatch.
- Do not guess: document what was found.

2. Add a production-safe Prisma migration if needed
If a proper migration is missing or incomplete:
- Add a migration under `prisma/migrations/` that safely creates missing `UserSetting` columns.
- Use SQL that is safe for existing production data.
- Prefer `ADD COLUMN IF NOT EXISTS` where supported.
- Preserve defaults/nullability consistent with Prisma schema.
- Do not drop data.
- Do not rename/drop columns without explicit proof.

Target safe SQL shape for production drift repair if needed:

```sql
ALTER TABLE "UserSetting"
ADD COLUMN IF NOT EXISTS "brandColors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "fontPreference" TEXT,
ADD COLUMN IF NOT EXISTS "logoUrl" TEXT,
ADD COLUMN IF NOT EXISTS "watermarkText" TEXT,
ADD COLUMN IF NOT EXISTS "defaultAspectRatio" TEXT,
ADD COLUMN IF NOT EXISTS "defaultCTA" TEXT;
```

Only include fields that are actually required and consistent with current Prisma schema.

3. Add read-only schema drift check script
Create one of:
- `scripts/db/check-user-settings-schema.ts`
- `scripts/db/check-schema-drift.ts`

Requirements:
- Read-only.
- Uses Prisma/DB connection safely.
- Checks `information_schema.columns` for required `UserSetting` columns.
- Verifies expected DB types/nullability where practical.
- Prints `[OK]`, `[WARN]`, `[FAIL]` markers.
- Prints a clear list of missing columns.
- Never prints `DATABASE_URL` or credentials.
- Exits `0` when all required columns exist.
- Exits non-zero when drift exists.
- Handles DB unavailable as `[FAIL]` or clearly marked environment failure.

4. Add package script
Update `package.json`:

```json
"db:schema-drift-check": "tsx scripts/db/check-user-settings-schema.ts"
```

or the matching filename.

Rules:
- Keep package.json valid JSON.
- Do not duplicate script keys.
- Keep `postbuild` intact.
- Keep existing test command coverage intact.

5. Add tests
Add or update tests to cover:
- drift-check script exists
- package.json contains `db:schema-drift-check`
- script checks all required `UserSetting` columns:
  - brandColors
  - fontPreference
  - logoUrl
  - watermarkText
  - defaultAspectRatio
  - defaultCTA
- script does not print or hardcode `DATABASE_URL`
- script does not include destructive SQL such as DROP TABLE, DROP COLUMN, TRUNCATE, DELETE FROM
- migration/runbook mentions production uses `prisma migrate deploy`, not `migrate dev`

Suggested tests:
- `tests/db/user-settings-schema-drift-static.test.ts`
- `tests/scripts/db-schema-drift-check-static.test.ts`

6. Update health script only if safe
Optional:
- Update `scripts/health-zsp-aitool.sh` to call `npm run db:schema-drift-check`.

Rules if added:
- It must be read-only.
- It must not mutate DB.
- It must clearly report a health failure if required columns are missing.
- It must avoid secret output.
- If DB is intentionally unavailable in Codex/container, report as environment warning only if that matches existing health behavior; in production, missing DB/check failure should fail health.

7. Add production runbook
Create or update:
- `docs/runbooks/production-db-drift.md`

Include:
- symptoms: Prisma missing column errors
- affected model: `UserSetting`
- required fields checklist
- how to run `npm run db:schema-drift-check`
- how to inspect `information_schema`
- production migration policy: use `npx prisma migrate deploy`, never `migrate dev`
- emergency hotfix SQL with `ADD COLUMN IF NOT EXISTS`
- post-fix restart and verification commands
- journal checks for no new Prisma errors
- rollback notes: do not drop new columns during incident; roll forward with a corrective migration
- safety notes: never print `DATABASE_URL` or secrets

8. Add docs prompt/index updates if pattern exists
If `docs/prompts` has an index/README, add `020` entry.

Required verification commands:
Run:

```bash
git status --short
git log --oneline -n 20
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npm run db:schema-drift-check
npm run typecheck
npm run test
npm run build
npm run health
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```

Static safety scans:

```bash
grep -RniE "DATABASE_URL|sk-[A-Za-z0-9]|SHOPEE_PARTNER_KEY|SHOPEE_WEBHOOK_SECRET" scripts src app components tests docs prisma 2>/dev/null || true

grep -RniE "DROP[[:space:]]+TABLE|DROP[[:space:]]+COLUMN|TRUNCATE|DELETE[[:space:]]+FROM" scripts/db prisma/migrations tests docs 2>/dev/null || true

grep -RniE "prisma migrate dev" scripts docs README.md CONTRIBUTING.md 2>/dev/null || true
```

Interpretation:
- Docs may mention forbidden commands only as “do not use” warnings.
- Migration files may include safe ALTER statements.
- No script should print secrets.
- The drift check must be read-only.

Production verification commands:
Run on real production VM:

```bash
cd ~/zsp-aitool

git pull --rebase origin main
npm ci
npm run prisma:generate
npx prisma validate
npx prisma migrate status --schema prisma/schema.prisma
npx prisma migrate deploy --schema prisma/schema.prisma
npm run db:schema-drift-check
sudo systemctl restart zsp-aitool
sleep 3
npm run health
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog

sudo journalctl -u zsp-aitool --since "30 minutes ago" -l --no-pager \
  | grep -iE "UserSetting|brandColors|fontPreference|logoUrl|watermarkText|defaultAspectRatio|defaultCTA|prisma:error" \
  || echo "[OK] no new UserSetting drift errors"

systemctl --failed --no-pager
systemctl is-system-running --no-pager || true
```

Environment interpretation:
- If PostgreSQL is unavailable in Codex/container, report DB-dependent checks as WARN/SKIP, not PASS.
- If systemd is unavailable because PID 1 is not systemd, report systemd checks as WARN/SKIP, not PASS.
- In production, DB schema drift is a real FAIL until fixed.
- If existing migration history says up-to-date but columns are missing, classify as schema drift and fix with a corrective migration or documented emergency SQL.

Fix policy:
If issues are found:
1. Make the smallest safe patch.
2. Preserve architecture.
3. Add/update tests.
4. Rerun verification.
5. Commit with one of:
   - `fix: harden production schema drift checks`
   - `fix: add UserSetting schema drift migration`
   - `test: add schema drift safety coverage`
   - `docs: add production DB drift runbook`

Do not bundle unrelated product/UI feature work.

Final response format:
Return exactly these sections:

1. Overall verdict
- PASS / WARN / FAIL
- DB_SCHEMA_DRIFT_HARDENED=true/false
- READY_FOR_NEXT_PHASE=true/false

2. Summary
- concise explanation of drift checks/migration/runbook work

3. Files reviewed
- grouped by area

4. Files changed
- list files changed, or None

5. Schema changes
- describe migration/SQL changes, or No schema changes

6. Drift check behavior
- required columns checked
- read-only behavior
- error output shape
- secret redaction behavior

7. Production repair guidance
- migrate deploy command
- drift-check command
- emergency SQL if needed
- journal verification command

8. Security behavior
- no secret output
- no destructive SQL
- no production mutation from health script except explicit migration deploy

9. Checklist table
Columns:
- Area
- Status
- Notes

Rows:
- Prisma schema
- Prisma migrations
- UserSetting required columns
- drift check script
- package script
- tests
- health integration
- runbook
- install
- Prisma generate
- Prisma validate
- db:schema-drift-check
- typecheck
- tests
- build
- health
- HyperFrames queue
- HyperFrames watchdog
- production journal check

10. Commands run
- include exact commands and PASS/WARN/FAIL

11. Blocking issues
- list or None

12. Environment-only warnings
- list Codex/container-only warnings

13. Remaining risks
- list real residual risks, if any

14. Commit hash
- commit hash if committed
- No commit created if no changes

15. PR status
- PR created / not created

Final line:
DB_SCHEMA_DRIFT_HARDENED=true or DB_SCHEMA_DRIFT_HARDENED=false
```
