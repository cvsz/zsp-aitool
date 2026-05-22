# ZSP-AITOOL Release Readiness Report
Generated: 2026-05-22T11:00:53+00:00
Branch: main

## 1. Validation Run

> zsp-aitool@0.1.0 typecheck
> tsc --noEmit -p tsconfig.typecheck.json


> zsp-aitool@0.1.0 test
> vitest run tests/smoke.test.ts tests/branding.test.ts tests/middleware.auth.test.ts tests/api/products.test.ts tests/api/hyperframes-compose.test.ts tests/api/tenant-isolation.test.ts tests/api/product-import-routes.test.ts tests/api/content-workflow-hardening.test.ts tests/product-validation.test.ts tests/url-safety.test.ts tests/services/ProductService.hardening.test.ts tests/services/AIContentService.test.ts tests/services/ExportService.test.ts tests/services/AuthValidation.test.ts tests/services/ProductService.test.ts tests/services/OCRService.test.ts tests/services/SimilarProductService.test.ts tests/services/hyperframes-script-service.test.ts tests/lib.hyperframes-billing.test.ts tests/hyperframes-sanitize.test.ts tests/export-panel-security.test.ts tests/api/hyperframes-render.test.ts tests/api/hyperframes-render-history.test.ts tests/api/hyperframes-render-status.test.ts tests/api/hyperframes-render-retry.test.ts tests/api/hyperframes-render-download.test.ts tests/api/hyperframes-render-download-token.test.ts tests/api/hyperframes-render-share.test.ts tests/api/hyperframes-render-thumbnail.test.ts tests/api/hyperframes-render-batch.test.ts tests/api/hyperframes-render-metrics.test.ts tests/api/hyperframes-quota.test.ts tests/api/hyperframes-social-export.test.ts tests/api/hyperframes-variants.test.ts tests/api/hyperframes-org-scope.test.ts tests/api/hyperframes-operator-controls.test.ts tests/api/hyperframes-script.test.ts tests/api/hyperframes-billing-gates.test.ts tests/api/hyperframes-brand-kit.test.ts tests/hyperframes-worker.test.ts tests/hyperframes-render-safety.test.ts tests/hyperframes-render-validation.test.ts tests/hyperframes-render-command.test.ts tests/hyperframes-render-smoke.test.ts tests/hyperframes-enqueue-smoke-job.test.ts tests/hyperframes-worker-trial-script.test.ts tests/hyperframes-live-queue-trial-script.test.ts tests/hyperframes-watchdog.test.ts tests/hyperframes-safe-rollback.test.ts tests/hyperframes-cleanup-timer.test.ts tests/hyperframes-worker-alerts.test.ts tests/hyperframes-subtitles.test.ts tests/hyperframes-asset-fetch.test.ts tests/hyperframes-render-quality.test.ts tests/hyperframes-render-inventory.test.ts tests/hyperframes-templates.test.ts tests/hyperframes-template-marketplace.test.ts tests/components/hyperframes-template-browser-static.test.ts tests/components/hyperframes-render-history-static.test.ts tests/components/hyperframes-dashboard-render-button-static.test.ts tests/components/hyperframes-quota-static.test.ts tests/components/hyperframes-upgrade-cta.test.tsx tests/components/final-ui-admin-hyperframes-audit.test.ts tests/components/full-ux-ui-final-release-static.test.ts tests/components/theme-mode-static.test.ts tests/components/all-menu-coverage-static.test.ts tests/components/background-color-select-static.test.ts tests/security/hyperframes-security.test.ts tests/components/growth-copy-safety-static.test.ts tests/docs/growth-runbook-static.test.ts tests/lib/shopee-open-api-config.test.ts tests/services/ShopeeOpenApiService.test.ts tests/api/shopee-open-api-status.test.ts tests/components/shopee-open-api-import-static.test.ts tests/scripts/db-schema-drift-check-static.test.ts tests/api/admin-analytics.test.ts tests/api/feedback-api.test.ts tests/components/growth-analytics-feedback-static.test.ts tests/api/usage-summary.test.ts tests/components/mobile-nav-coverage-static.test.ts tests/security/extension-permissions.test.ts tests/docs/enterprise-readiness-scale-plan-static.test.ts tests/security/security-compliance-static-scans.test.ts tests/scripts/backup-db-static.test.ts tests/runbooks/backup-restore-release-static.test.ts tests/services/BudgetService.test.ts tests/lib/rate-limit-distributed.test.ts tests/lib/marqeta-config.test.ts tests/services/MarqetaCoreApiService.test.ts tests/api/marqeta-status.test.ts tests/docs/marqeta-runbook-static.test.ts tests/security/marqeta-secret-redaction-static.test.ts tests/api/auth-routes.test.ts tests/api/templates-crud.test.ts tests/api/ocr-routes.test.ts tests/api/ai-generate-routes.test.ts tests/api/settings-route.test.ts tests/api/export-routes-headers.test.ts tests/components/dashboard-pages-states.test.tsx tests/docs/high-priority-test-coverage-static.test.ts tests/scripts/db-critical-schema-drift-static.test.ts tests/services/BackendMonitorService.test.ts tests/api/admin-backend-status.test.ts tests/components/admin-backend-monitor-static.test.tsx tests/scripts/backend-monitor-static.test.ts tests/security/backend-monitor-redaction-static.test.ts tests/services/AdminAuditLogService.test.ts tests/api/admin-audit-logs.test.ts tests/components/admin-audit-logs-static.test.tsx tests/security/admin-audit-redaction.test.ts


 RUN  v4.1.6 /home/zeazdev/zsp-aitool

 ✓ tests/hyperframes-enqueue-smoke-job.test.ts (6 tests) 557ms
     ✓ refuses when render is disabled  476ms
stdout | tests/hyperframes-watchdog.test.ts > watchdog > ok empty queue
{
  "pending": 0,
  "running": 0,
  "completedLast24h": 0,
  "failedLast24h": 0,
  "oldestPendingCreatedAt": null,
  "oldestRunningStartedAt": null,
  "staleRunning": 0,
  "renderEnabled": true,
  "serviceActive": null,
  "serviceEnabled": true,
  "freeDiskMb": 420877
}

 ✓ tests/branding.test.ts (1 test) 552ms
     ✓ does not include deprecated product branding in product code paths  544ms
stdout | tests/hyperframes-render-smoke.test.ts > render smoke gates > refuses when render is disabled
[SKIP] HYPERFRAMES_RENDER_ENABLED is not true

stdout | tests/hyperframes-render-smoke.test.ts > render smoke gates > refuses when confirmation is missing
[SKIP] HYPERFRAMES_RENDER_SMOKE_CONFIRM must be YES

 ✓ tests/hyperframes-render-smoke.test.ts (3 tests) 755ms
     ✓ refuses when render is disabled  642ms
 ✓ tests/hyperframes-watchdog.test.ts (3 tests) 637ms
     ✓ ok empty queue  439ms
 ✓ tests/hyperframes-worker.test.ts (8 tests) 802ms
     ✓ keeps disabled worker path unchanged  568ms
 ✓ tests/api/hyperframes-compose.test.ts (7 tests) 271ms
 ✓ tests/api/hyperframes-render-download-token.test.ts (5 tests) 1248ms
     ✓ expired token rejected  1120ms
stdout | tests/hyperframes-worker-alerts.test.ts > worker-alerts > failed threshold triggers alert
[OK] Alert sent (failedLast24h>=3)

stdout | tests/hyperframes-worker-alerts.test.ts > worker-alerts > pending threshold triggers alert
[OK] Alert sent (pending>=10)

stdout | tests/hyperframes-worker-alerts.test.ts > worker-alerts > webhook body shape safe and no local path leakage
[OK] Alert sent (pending>=10)

 ✓ tests/hyperframes-worker-alerts.test.ts (6 tests) 385ms
 ✓ tests/security/security-compliance-static-scans.test.ts (2 tests) 305ms
 ✓ tests/hyperframes-render-inventory.test.ts (5 tests) 279ms
 ✓ tests/api/hyperframes-render-status.test.ts (3 tests) 405ms
     ✓ returns safe JSON when enabled  325ms
 ✓ tests/api/ocr-routes.test.ts (2 tests) 457ms
     ✓ invalid payload returns safe validation response  372ms
 ✓ tests/api/product-import-routes.test.ts (4 tests) 80ms
 ✓ tests/security/hyperframes-security.test.ts (8 tests) 150ms
 ✓ tests/api/hyperframes-script.test.ts (9 tests) 190ms
 ✓ tests/url-safety.test.ts (9 tests) 193ms
 ✓ tests/api/hyperframes-render-metrics.test.ts (4 tests) 185ms
 ✓ tests/api/content-workflow-hardening.test.ts (6 tests) 131ms
 ✓ tests/api/hyperframes-render-history.test.ts (4 tests) 136ms
 ✓ tests/api/ai-generate-routes.test.ts (2 tests) 121ms
 ✓ tests/api/hyperframes-render-share.test.ts (6 tests) 77ms
 ✓ tests/hyperframes-live-queue-trial-script.test.ts (6 tests) 133ms
 ✓ tests/api/hyperframes-render.test.ts (8 tests) 144ms
 ✓ tests/hyperframes-safe-rollback.test.ts (4 tests) 120ms
 ✓ tests/api/tenant-isolation.test.ts (6 tests) 109ms
 ✓ tests/api/hyperframes-render-download.test.ts (7 tests) 134ms
 ✓ tests/api/hyperframes-render-retry.test.ts (7 tests) 114ms
 ✓ tests/api/hyperframes-render-batch.test.ts (5 tests) 121ms
 ✓ tests/api/hyperframes-brand-kit.test.ts (4 tests) 56ms
 ✓ tests/lib/rate-limit-distributed.test.ts (5 tests) 109ms
 ✓ tests/hyperframes-worker-trial-script.test.ts (9 tests) 121ms
 ✓ tests/services/hyperframes-script-service.test.ts (3 tests) 84ms
 ✓ tests/api/hyperframes-social-export.test.ts (4 tests) 91ms
 ✓ tests/api/marqeta-status.test.ts (2 tests) 99ms
 ✓ tests/api/hyperframes-operator-controls.test.ts (6 tests) 74ms
 ✓ tests/services/MarqetaCoreApiService.test.ts (3 tests) 44ms
 ✓ tests/hyperframes-asset-fetch.test.ts (7 tests) 165ms
 ✓ tests/api/auth-routes.test.ts (4 tests) 63ms
 ✓ tests/product-validation.test.ts (5 tests) 62ms
 ✓ tests/api/hyperframes-org-scope.test.ts (3 tests) 81ms
 ✓ tests/api/hyperframes-billing-gates.test.ts (3 tests) 110ms
 ✓ tests/scripts/db-schema-drift-check-static.test.ts (3 tests) 54ms
 ✓ tests/hyperframes-render-validation.test.ts (2 tests) 49ms
 ✓ tests/hyperframes-template-marketplace.test.ts (3 tests) 39ms
 ✓ tests/components/final-ui-admin-hyperframes-audit.test.ts (7 tests) 62ms
 ✓ tests/api/hyperframes-quota.test.ts (2 tests) 69ms
 ✓ tests/api/shopee-open-api-status.test.ts (2 tests) 50ms
 ✓ tests/components/shopee-open-api-import-static.test.ts (2 tests) 15ms
 ✓ tests/api/feedback-api.test.ts (2 tests) 42ms
 ✓ tests/api/export-routes-headers.test.ts (1 test) 72ms
 ✓ tests/api/admin-analytics.test.ts (2 tests) 36ms
 ✓ tests/api/hyperframes-variants.test.ts (3 tests) 117ms
 ✓ tests/services/BudgetService.test.ts (11 tests) 110ms
 ✓ tests/components/hyperframes-render-history-static.test.ts (1 test) 26ms
 ✓ tests/hyperframes-templates.test.ts (9 tests) 77ms
 ✓ tests/api/hyperframes-render-thumbnail.test.ts (4 tests) 149ms
 ✓ tests/runbooks/backup-restore-release-static.test.ts (2 tests) 18ms
 ✓ tests/services/ShopeeOpenApiService.test.ts (3 tests) 25ms
 ✓ tests/hyperframes-render-quality.test.ts (3 tests) 36ms
 ✓ tests/hyperframes-sanitize.test.ts (10 tests) 54ms
 ✓ tests/hyperframes-cleanup-timer.test.ts (3 tests) 38ms
 ✓ tests/lib.hyperframes-billing.test.ts (3 tests) 61ms
 ✓ tests/components/background-color-select-static.test.ts (2 tests) 39ms
 ✓ tests/api/usage-summary.test.ts (1 test) 67ms
 ✓ tests/api/settings-route.test.ts (1 test) 38ms
 ✓ tests/middleware.auth.test.ts (1 test) 32ms
 ✓ tests/api/templates-crud.test.ts (2 tests) 103ms
 ✓ tests/hyperframes-subtitles.test.ts (5 tests) 81ms
 ✓ tests/components/hyperframes-quota-static.test.ts (1 test) 13ms
 ✓ tests/components/theme-mode-static.test.ts (1 test) 17ms
 ✓ tests/components/dashboard-pages-states.test.tsx (1 test) 24ms
 ✓ tests/services/ExportService.test.ts (1 test) 33ms
 ✓ tests/security/backend-monitor-redaction-static.test.ts (1 test) 29ms
 ✓ tests/services/ProductService.hardening.test.ts (1 test) 75ms
 ✓ tests/components/hyperframes-dashboard-render-button-static.test.ts (1 test) 30ms
 ✓ tests/lib/marqeta-config.test.ts (4 tests) 80ms
 ✓ tests/api/products.test.ts (1 test) 45ms
 ✓ tests/docs/high-priority-test-coverage-static.test.ts (1 test) 36ms
 ✓ tests/api/admin-backend-status.test.ts (2 tests) 140ms
 ✓ tests/lib/shopee-open-api-config.test.ts (3 tests) 41ms
 ✓ tests/scripts/backup-db-static.test.ts (3 tests) 50ms
 ✓ tests/security/marqeta-secret-redaction-static.test.ts (1 test) 24ms
 ✓ tests/components/hyperframes-upgrade-cta.test.tsx (1 test) 25ms
 ✓ tests/services/AuthValidation.test.ts (2 tests) 46ms
 ✓ tests/services/BackendMonitorService.test.ts (1 test) 19ms
 ✓ tests/components/growth-analytics-feedback-static.test.ts (2 tests) 22ms
 ✓ tests/hyperframes-render-command.test.ts (2 tests) 44ms
 ✓ tests/services/OCRService.test.ts (2 tests) 57ms
 ✓ tests/services/AIContentService.test.ts (1 test) 21ms
 ✓ tests/components/growth-copy-safety-static.test.ts (2 tests) 24ms
 ✓ tests/security/extension-permissions.test.ts (2 tests) 44ms
 ✓ tests/docs/growth-runbook-static.test.ts (1 test) 37ms
 ✓ tests/components/full-ux-ui-final-release-static.test.ts (2 tests) 23ms
 ✓ tests/export-panel-security.test.ts (2 tests) 19ms
 ✓ tests/components/all-menu-coverage-static.test.ts (2 tests) 19ms
 ✓ tests/services/ProductService.test.ts (1 test) 32ms
 ✓ tests/components/hyperframes-template-browser-static.test.ts (1 test) 18ms
 ✓ tests/hyperframes-render-safety.test.ts (1 test) 31ms
 ✓ tests/api/admin-audit-logs.test.ts (1 test) 94ms
 ✓ tests/docs/marqeta-runbook-static.test.ts (1 test) 45ms
 ✓ tests/scripts/backend-monitor-static.test.ts (1 test) 23ms
 ✓ tests/services/AdminAuditLogService.test.ts (1 test) 41ms
 ✓ tests/scripts/db-critical-schema-drift-static.test.ts (3 tests) 29ms
 ✓ tests/smoke.test.ts (1 test) 74ms
 ✓ tests/components/admin-backend-monitor-static.test.tsx (1 test) 25ms
 ✓ tests/security/admin-audit-redaction.test.ts (1 test) 20ms
 ✓ tests/docs/enterprise-readiness-scale-plan-static.test.ts (1 test) 62ms
 ✓ tests/services/SimilarProductService.test.ts (1 test) 35ms
 ✓ tests/components/mobile-nav-coverage-static.test.ts (1 test) 35ms
 ✓ tests/components/admin-audit-logs-static.test.tsx (1 test) 15ms

 Test Files  110 passed (110)
      Tests  355 passed (355)
   Start at  11:01:01
   Duration  69.11s (transform 12.56s, setup 47.78s, import 36.50s, tests 13.12s, environment 276.55s)


> zsp-aitool@0.1.0 build
> NODE_ENV=production next build

   ▲ Next.js 15.5.18
   - Environments: .env

   Creating an optimized production build ...
 ✓ Compiled successfully in 32.4s
   Linting and checking validity of types ...
   Collecting page data ...
