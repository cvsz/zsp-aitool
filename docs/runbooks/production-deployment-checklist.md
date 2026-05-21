# Production Deployment Checklist

## 1) Preflight

- Confirm maintenance window and rollback owner.
- Confirm current branch/tag and target commit hash.
- Confirm `.env` values are present only on server and not changed unexpectedly.

## 2) Backup

- Run database backup using approved runbook.
- Verify backup artifact exists and is restorable.

## 3) Git state and sync

```bash
git status --short
git fetch origin main
git pull --rebase origin main
```

## 4) Build and validation

```bash
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate
npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma migrate status --schema prisma/schema.prisma
npm run typecheck
npm run test
npm run build
```

## 5) Service restart and health

```bash
sudo systemctl restart zsp-aitool
sudo systemctl status zsp-aitool --no-pager
sudo systemctl restart zsp-hyperframes-worker
sudo systemctl status zsp-hyperframes-worker --no-pager
npm run health
```

## 6) Route smoke checks

- `/`
- `/dashboard`
- `/dashboard/products`
- `/dashboard/admin`
- `/dashboard/hyperframes`

## 7) Log checks

```bash
sudo journalctl -u zsp-aitool --since "30 minutes ago" -l --no-pager
sudo journalctl -u zsp-hyperframes-worker --since "30 minutes ago" -l --no-pager
```

## 8) Rollback steps

1. Identify failing component (app-only or app+DB).
2. Revert app to previous known-good commit.
3. If needed, restore DB from verified backup according to downtime policy.
4. Re-run health and smoke checks.
5. Record incident timeline and preventive actions.
