# Local Start service
cd ~/zsp-aitool

# 0) Confirm this is real systemd VM
ps -p 1 -o comm=
systemctl is-system-running --no-pager || true

# 1) Pull latest production code
git status --short
git pull --rebase origin main

# 2) Clean temporary unsafe files only
shred -u .env.bak.* 2>/dev/null || rm -f .env.bak.*
find . -type d -name __pycache__ -prune -exec rm -rf {} +

# 3) Validate + install + Prisma
python3 -m json.tool package.json >/tmp/package-json-ok.json
npm ci
npm run prisma:generate
npx prisma validate

# 4) Check/apply production migrations
npx prisma migrate status --schema prisma/schema.prisma
npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma migrate status --schema prisma/schema.prisma

# 5) Full verification before start
npm run typecheck
npm run test
npm run build

# 6) Restart main app
sudo systemctl daemon-reload
sudo systemctl restart zsp-aitool
sudo systemctl enable zsp-aitool

# 7) Enable/start HyperFrames real worker only if production render is intended
grep '^HYPERFRAMES_RENDER_ENABLED=true' .env && sudo systemctl enable --now zsp-hyperframes-worker || echo "[SKIP] HyperFrames render not enabled in .env"

# 8) Production health checks
sudo systemctl status zsp-aitool --no-pager
sudo systemctl status zsp-hyperframes-worker --no-pager || true

npm run health
npm run hyperframes:doctor
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
npm run db:schema-drift-check

# 9) Local route smoke
curl -I http://127.0.0.1:3001/
curl -I http://127.0.0.1:3001/login
curl -I http://127.0.0.1:3001/register
curl -I http://127.0.0.1:3001/dashboard
curl -I http://127.0.0.1:3001/dashboard/products
curl -I http://127.0.0.1:3001/dashboard/generator
curl -I http://127.0.0.1:3001/dashboard/hyperframes
curl -I http://127.0.0.1:3001/dashboard/hyperframes/renders
curl -I http://127.0.0.1:3001/dashboard/hyperframes/batch
curl -I http://127.0.0.1:3001/dashboard/hyperframes/ops
curl -I http://127.0.0.1:3001/dashboard/admin

# 10) Live logs
sudo journalctl -u zsp-aitool -n 120 -l --no-pager
sudo journalctl -u zsp-hyperframes-worker -n 120 -l --no-pager || true
