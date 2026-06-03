SHELL := /bin/bash
.NOTPARALLEL:

# ──────────────────────────────────────────────────────
#  ZSP AI TOOL — Control Panel Makefile
#  All operations in one place. See `make help`.
# ──────────────────────────────────────────────────────

# ── Detect environment ────────────────────────────────
ENV_FILE := .env
ifeq (,$(wildcard $(ENV_FILE)))
  $(warning $(ENV_FILE) not found — run: make setup)
endif

# ──────────────────────────────────────────────────────
#  0. HELP
# ──────────────────────────────────────────────────────
.PHONY: help
help:
	@echo "╔══════════════════════════════════════════════════╗"
	@echo "║   ZSP AI TOOL — Control Panel                    ║"
	@echo "╠══════════════════════════════════════════════════╣"
	@echo "║ SETUP                                            ║"
	@echo "║   setup          — First-time: .env + install    ║"
	@echo "║   install        — npm install                    ║"
	@echo "║   ci             — npm ci (clean CI install)     ║"
	@echo "║                                                 ║"
	@echo "║ DEVELOPMENT                                      ║"
	@echo "║   dev            — Start Next.js dev server       ║"
	@echo "║   lint           — ESLint all source              ║"
	@echo "║   typecheck      — tsc --noEmit type check        ║"
	@echo "║                                                 ║"
	@echo "║ BUILD & DEPLOY                                   ║"
	@echo "║   build          — Production Next.js build       ║"
	@echo "║   start          — Start production server        ║"
	@echo "║                                                 ║"
	@echo "║ DOCKER                                           ║"
	@echo "║   docker-up      — docker compose up -d           ║"
	@echo "║   docker-down    — docker compose down            ║"
	@echo "║   docker-build   — docker compose build            ║"
	@echo "║   docker-logs    — tail docker logs               ║"
	@echo "║                                                 ║"
	@echo "║ DATABASE (Prisma)                                 ║"
	@echo "║   db-generate    — prisma generate                 ║"
	@echo "║   db-validate    — prisma validate                ║"
	@echo "║   db-migrate     — prisma migrate dev              ║"
	@echo "║   db-deploy      — prisma migrate deploy (prod)    ║"
	@echo "║   db-seed        — prisma db seed                 ║"
	@echo "║   db-reset       — prisma migrate reset            ║"
	@echo "║   db-studio      — prisma studio                  ║"
	@echo "║   db-drift       — check UserSetting schema drift  ║"
	@echo "║   db-backup      — pg_dump backup                 ║"
	@echo "║                                                 ║"
	@echo "║ TESTING                                           ║"
	@echo "║   test           — Run all tests                  ║"
	@echo "║   test-db        — Run DB-isolation tests          ║"
	@echo "║   test-all       — test + test-db                 ║"
	@echo "║   test-security  — Security test suite             ║"
	@echo "║   test-file F=…  — Run a single test file          ║"
	@echo "║                                                 ║"
	@echo "║ HYPERFRAMES                                       ║"
	@echo "║   hf-doctor      — Check render environment        ║"
	@echo "║   hf-worker      — Start render worker loop        ║"
	@echo "║   hf-worker-once — One-shot render                 ║"
	@echo "║   hf-smoke       — Smoke render test               ║"
	@echo "║   hf-enqueue     — Enqueue smoke job               ║"
	@echo "║   hf-status      — Render job status               ║"
	@echo "║   hf-queue       — Queue statistics                ║"
	@echo "║   hf-inventory   — List render artifacts           ║"
	@echo "║   hf-cleanup     — Clean old renders               ║"
	@echo "║   hf-recover     — Recover stale jobs              ║"
	@echo "║   hf-watchdog    — Watchdog check                  ║"
	@echo "║   hf-alerts      — Generate alerts                 ║"
	@echo "║   hf-diag        — Full diagnostics                ║"
	@echo "║   hf-rollback    — Safe rollback                   ║"
	@echo "║   hf-service-install  — Install systemd service    ║"
	@echo "║   hf-service-disable  — Disable worker service     ║"
	@echo "║   hf-service-status   — Worker systemd status      ║"
	@echo "║   hf-service-logs     — Worker journal logs        ║"
	@echo "║   hf-enable-real      — Enable real daemon         ║"
	@echo "║   hf-disable-real     — Disable real daemon        ║"
	@echo "║   hf-preflight        — Preflight checks           ║"
	@echo "║   hf-journal-summary  — Worker journal summary     ║"
	@echo "║   hf-cleanup-timer-install  — Install cleanup      ║"
	@echo "║   hf-cleanup-timer-disable  — Disable cleanup      ║"
	@echo "║   hf-cleanup-timer-status   — Cleanup timer status ║"
	@echo "║   hf-install-log-policy     — Log rotation policy  ║"
	@echo "║   hf-ci-mock               — CI mock run           ║"
	@echo "║   hf-ci-real               — CI real run           ║"
	@echo "║                                                 ║"
	@echo "║ AI & IMPORT WORKERS                               ║"
	@echo "║   ai-worker       — Content queue worker loop      ║"
	@echo "║   ai-worker-once  — One-shot content generation    ║"
	@echo "║   ai-queue-status — Content queue status           ║"
	@echo "║   csv-worker      — CSV import worker loop         ║"
	@echo "║   csv-worker-once — One-shot CSV import            ║"
	@echo "║   csv-status      — CSV import status              ║"
	@echo "║                                                 ║"
	@echo "║ MONITORING                                        ║"
	@echo "║   monitor            — Backend monitor              ║"
	@echo "║   monitor-timer-install  — Install monitor timer   ║"
	@echo "║   monitor-status        — Monitor timer status     ║"
	@echo "║   post-launch-status    — Post-launch status       ║"
	@echo "║   post-launch-smoke     — Route smoke test         ║"
	@echo "║                                                 ║"
	@echo "║ GIT & GPG                                          ║"
	@echo "║   gpg-setup      — Configure GPG signing           ║"
	@echo "║   gpg-test       — Test GPG signing                ║"
	@echo "║   gpg-status     — Show GPG config                 ║"
	@echo "║   commit M=...   — Signed commit (set M=message)   ║"
	@echo "║   push           — GPG-unlocked git push           ║"
	@echo "║   pull           — GPG-unlocked git pull           ║"
	@echo "║                                                 ║"
	@echo "║ CI & VERIFICATION                                  ║"
	@echo "║   ci-preflight  — Full local CI pipeline           ║"
	@echo "║   verify        — Full verification suite          ║"
	@echo "║   health        — Health check script              ║"
	@echo "║                                                 ║"
	@echo "║ UTILITIES                                          ║"
	@echo "║   extension-build   — Build Chrome extension       ║"
	@echo "║   codex-setup       — Codex environment setup      ║"
	@echo "║   codex-maintenance — Codex maintenance            ║"
	@echo "║   clean         — Clean build artifacts            ║"
	@echo "║   reset         — Full reset (clean + node_modules)║"
	@echo "╚════════════════════════════════════════════════════════════╝"


# ──────────────────────────────────────────────────────
#  1. SETUP & INSTALL
# ──────────────────────────────────────────────────────
.PHONY: setup install ci

setup:
	@test -f .env || cp .env.example .env
	@echo "[OK] .env ready — edit it with your secrets"
	$(MAKE) install
	$(MAKE) db-generate
	$(MAKE) extension-build

install:
	npm install

ci:
	npm ci


# ──────────────────────────────────────────────────────
#  2. DEVELOPMENT
# ──────────────────────────────────────────────────────
.PHONY: dev lint typecheck

dev:
	npm run dev

lint:
	npm run lint

typecheck:
	npm run typecheck


# ──────────────────────────────────────────────────────
#  3. BUILD & DEPLOY
# ──────────────────────────────────────────────────────
.PHONY: build start

build:
	npm run build

start:
	npm run start


# ──────────────────────────────────────────────────────
#  4. DOCKER
# ──────────────────────────────────────────────────────
.PHONY: docker-up docker-down docker-build docker-logs

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-build:
	docker compose build

docker-logs:
	docker compose logs -f


# ──────────────────────────────────────────────────────
#  5. DATABASE (Prisma)
# ──────────────────────────────────────────────────────
.PHONY: db-generate db-validate db-migrate db-deploy db-seed db-reset db-studio db-drift db-backup

db-generate:
	npm run prisma:generate

db-validate:
	npx prisma validate

db-migrate:
	npm run prisma:migrate

db-deploy:
	npm run prisma:migrate:deploy

db-seed:
	npm run prisma:seed

db-reset:
	npx prisma migrate reset

db-studio:
	npx prisma studio

db-drift:
	npm run db:schema-drift-check

db-backup:
	bash scripts/ops/backup-db.sh


# ──────────────────────────────────────────────────────
#  6. TESTING
# ──────────────────────────────────────────────────────
.PHONY: test test-db test-all test-security test-file

test:
	npm run test

test-db:
	npm run test:db

test-all:
	npm run test:all

test-security:
	npm run test:security

test-file:
	@test -n "$(F)" || (echo "Usage: make test-file F=tests/path/to/file.test.ts" && exit 1)
	npx vitest run $(F)


# ──────────────────────────────────────────────────────
#  7. HYPERFRAMES
# ──────────────────────────────────────────────────────
.PHONY: hf-doctor hf-worker hf-worker-once hf-smoke hf-enqueue
.PHONY: hf-status hf-queue hf-inventory hf-cleanup hf-recover
.PHONY: hf-watchdog hf-alerts hf-diag hf-rollback
.PHONY: hf-service-install hf-service-disable hf-service-status hf-service-logs
.PHONY: hf-enable-real hf-disable-real hf-preflight hf-journal-summary
.PHONY: hf-cleanup-timer-install hf-cleanup-timer-disable hf-cleanup-timer-status
.PHONY: hf-install-log-policy hf-ci-mock hf-ci-real

hf-doctor:
	npm run hyperframes:doctor

hf-worker:
	npm run hyperframes:worker

hf-worker-once:
	npm run hyperframes:worker:once

hf-smoke:
	npm run hyperframes:render-smoke

hf-enqueue:
	npm run hyperframes:enqueue-smoke-job

hf-status:
	npm run hyperframes:render-job-status

hf-queue:
	npm run hyperframes:queue-status

hf-inventory:
	npm run hyperframes:render-inventory

hf-cleanup:
	npm run hyperframes:cleanup-renders

hf-recover:
	npm run hyperframes:recover-stale-jobs

hf-watchdog:
	npm run hyperframes:worker:watchdog

hf-alerts:
	npm run hyperframes:worker:alerts

hf-diag:
	bash scripts/hyperframes/diag.sh

hf-rollback:
	bash scripts/hyperframes/safe-rollback.sh

hf-service-install:
	bash scripts/hyperframes/install-worker-service.sh

hf-service-disable:
	bash scripts/hyperframes/disable-worker-service.sh

hf-service-status:
	bash scripts/hyperframes/worker-status.sh

hf-service-logs:
	bash scripts/hyperframes/worker-logs.sh

hf-enable-real:
	bash scripts/hyperframes/enable-real-worker-daemon.sh

hf-disable-real:
	bash scripts/hyperframes/disable-real-worker-daemon.sh

hf-preflight:
	bash scripts/hyperframes/persistent-worker-preflight.sh

hf-journal-summary:
	bash scripts/hyperframes/worker-journal-summary.sh

hf-cleanup-timer-install:
	bash scripts/hyperframes/install-cleanup-timer.sh

hf-cleanup-timer-disable:
	bash scripts/hyperframes/disable-cleanup-timer.sh

hf-cleanup-timer-status:
	bash scripts/hyperframes/cleanup-timer-status.sh

hf-install-log-policy:
	bash scripts/hyperframes/install-worker-log-policy.sh

hf-ci-mock:
	bash scripts/hyperframes/ci-mock.sh

hf-ci-real:
	bash scripts/hyperframes/ci-real.sh


# ──────────────────────────────────────────────────────
#  8. AI & IMPORT WORKERS
# ──────────────────────────────────────────────────────
.PHONY: ai-worker ai-worker-once ai-queue-status csv-worker csv-worker-once csv-status

ai-worker:
	npm run ai:content-worker

ai-worker-once:
	npm run ai:content-worker:once

ai-queue-status:
	npm run ai:content-queue-status

csv-worker:
	npm run imports:csv-products:worker

csv-worker-once:
	npm run imports:csv-products:worker:once

csv-status:
	npm run imports:csv-products:status


# ──────────────────────────────────────────────────────
#  9. MONITORING
# ──────────────────────────────────────────────────────
.PHONY: monitor monitor-timer-install monitor-status post-launch-status post-launch-smoke

monitor:
	npm run monitor:backend

monitor-timer-install:
	bash scripts/monitor/install-backend-monitor-timer.sh

monitor-status:
	bash scripts/monitor/backend-monitor-status.sh

post-launch-status:
	bash scripts/post-launch/status-summary.sh

post-launch-smoke:
	bash scripts/post-launch/smoke-routes.sh


# ──────────────────────────────────────────────────────
#  10. GIT & GPG
# ──────────────────────────────────────────────────────
.PHONY: gpg-setup gpg-test gpg-status commit push pull

GPG_SCRIPT := bash scripts/git/gpg-loopback.sh

gpg-setup:
	$(GPG_SCRIPT) setup

gpg-test:
	$(GPG_SCRIPT) test

gpg-status:
	$(GPG_SCRIPT) status

commit:
	@test -n "$(M)" || (echo "Usage: make commit M=\"your message\"" && exit 1)
	$(GPG_SCRIPT) commit -m "$(M)"

push:
	$(GPG_SCRIPT) push

pull:
	$(GPG_SCRIPT) pull


# ──────────────────────────────────────────────────────
#  11. CI & VERIFICATION
# ──────────────────────────────────────────────────────
.PHONY: ci-preflight verify health

ci-preflight:
	bash scripts/ci/local-preflight.sh

verify:
	@echo "=== Verification Suite ==="
	@python3 -m json.tool package.json > /dev/null && echo "[OK] package.json" || echo "[FAIL] package.json"
	$(MAKE) db-generate
	$(MAKE) db-validate
	$(MAKE) typecheck
	$(MAKE) test
	$(MAKE) build
	$(MAKE) health

health:
	npm run health


# ──────────────────────────────────────────────────────
#  12. UTILITIES
# ──────────────────────────────────────────────────────
.PHONY: extension-build codex-setup codex-maintenance clean reset

extension-build:
	@echo "[EXTENSION] Building Chrome extension..."
	cd extension && npm install && npm run build

codex-setup:
	bash scripts/codex/setup.sh

codex-maintenance:
	bash scripts/codex/maintenance.sh

clean:
	rm -rf .next out coverage
	rm -f *.tsbuildinfo
	rm -rf extension/dist extension/.vite
	@echo "[OK] Build artifacts cleaned"

reset: clean
	rm -rf node_modules extension/node_modules
	@echo "[OK] node_modules removed — run 'make setup' to reinstall"

# ──────────────────────────────────────────────────────
#  11. HYBRID PLUGIN INTEGRATION (PHASE 53)
# ──────────────────────────────────────────────────────
.PHONY: plugin-list plugin-validate plugin-sync plugin-health plugin-render-cloudflare plugin-evidence phase53-validate

plugin-list:
	bash scripts/plugins/plugin-list.sh

plugin-validate:
	bash scripts/plugins/plugin-validate.sh

plugin-sync:
	bash scripts/plugins/plugin-sync.sh

plugin-health:
	bash scripts/plugins/plugin-health.sh

plugin-render-cloudflare:
	bash scripts/plugins/plugin-render-cloudflare.sh

plugin-evidence:
	bash scripts/plugins/plugin-evidence.sh

phase53-validate: plugin-validate plugin-list plugin-render-cloudflare plugin-evidence
	@echo "[OK] Phase 53 Hybrid Plugin Integration valid."
