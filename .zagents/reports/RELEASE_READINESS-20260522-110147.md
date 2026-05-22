# ZSP-AITOOL Release Readiness Report
Generated: 2026-05-22T11:01:47+00:00
Branch: main

## 1. Validation Run

> zsp-aitool@0.1.0 typecheck
> tsc --noEmit -p tsconfig.typecheck.json


> zsp-aitool@0.1.0 test
> vitest run tests/smoke.test.ts tests/branding.test.ts tests/middleware.auth.test.ts tests/api/products.test.ts tests/api/hyperframes-compose.test.ts tests/api/tenant-isolation.test.ts tests/api/product-import-routes.test.ts tests/api/content-workflow-hardening.test.ts tests/product-validation.test.ts tests/url-safety.test.ts tests/services/ProductService.hardening.test.ts tests/services/AIContentService.test.ts tests/services/ExportService.test.ts tests/services/AuthValidation.test.ts tests/services/ProductService.test.ts tests/services/OCRService.test.ts tests/services/SimilarProductService.test.ts tests/services/hyperframes-script-service.test.ts tests/lib.hyperframes-billing.test.ts tests/hyperframes-sanitize.test.ts tests/export-panel-security.test.ts tests/api/hyperframes-render.test.ts tests/api/hyperframes-render-history.test.ts tests/api/hyperframes-render-status.test.ts tests/api/hyperframes-render-retry.test.ts tests/api/hyperframes-render-download.test.ts tests/api/hyperframes-render-download-token.test.ts tests/api/hyperframes-render-share.test.ts tests/api/hyperframes-render-thumbnail.test.ts tests/api/hyperframes-render-batch.test.ts tests/api/hyperframes-render-metrics.test.ts tests/api/hyperframes-quota.test.ts tests/api/hyperframes-social-export.test.ts tests/api/hyperframes-variants.test.ts tests/api/hyperframes-org-scope.test.ts tests/api/hyperframes-operator-controls.test.ts tests/api/hyperframes-script.test.ts tests/api/hyperframes-billing-gates.test.ts tests/api/hyperframes-brand-kit.test.ts tests/hyperframes-worker.test.ts tests/hyperframes-render-safety.test.ts tests/hyperframes-render-validation.test.ts tests/hyperframes-render-command.test.ts tests/hyperframes-render-smoke.test.ts tests/hyperframes-enqueue-smoke-job.test.ts tests/hyperframes-worker-trial-script.test.ts tests/hyperframes-live-queue-trial-script.test.ts tests/hyperframes-watchdog.test.ts tests/hyperframes-safe-rollback.test.ts tests/hyperframes-cleanup-timer.test.ts tests/hyperframes-worker-alerts.test.ts tests/hyperframes-subtitles.test.ts tests/hyperframes-asset-fetch.test.ts tests/hyperframes-render-quality.test.ts tests/hyperframes-render-inventory.test.ts tests/hyperframes-templates.test.ts tests/hyperframes-template-marketplace.test.ts tests/components/hyperframes-template-browser-static.test.ts tests/components/hyperframes-render-history-static.test.ts tests/components/hyperframes-dashboard-render-button-static.test.ts tests/components/hyperframes-quota-static.test.ts tests/components/hyperframes-upgrade-cta.test.tsx tests/components/final-ui-admin-hyperframes-audit.test.ts tests/components/full-ux-ui-final-release-static.test.ts tests/components/theme-mode-static.test.ts tests/components/all-menu-coverage-static.test.ts tests/components/background-color-select-static.test.ts tests/security/hyperframes-security.test.ts tests/components/growth-copy-safety-static.test.ts tests/docs/growth-runbook-static.test.ts tests/lib/shopee-open-api-config.test.ts tests/services/ShopeeOpenApiService.test.ts tests/api/shopee-open-api-status.test.ts tests/components/shopee-open-api-import-static.test.ts tests/scripts/db-schema-drift-check-static.test.ts tests/api/admin-analytics.test.ts tests/api/feedback-api.test.ts tests/components/growth-analytics-feedback-static.test.ts tests/api/usage-summary.test.ts tests/components/mobile-nav-coverage-static.test.ts tests/security/extension-permissions.test.ts tests/docs/enterprise-readiness-scale-plan-static.test.ts tests/security/security-compliance-static-scans.test.ts tests/scripts/backup-db-static.test.ts tests/runbooks/backup-restore-release-static.test.ts tests/services/BudgetService.test.ts tests/lib/rate-limit-distributed.test.ts tests/lib/marqeta-config.test.ts tests/services/MarqetaCoreApiService.test.ts tests/api/marqeta-status.test.ts tests/docs/marqeta-runbook-static.test.ts tests/security/marqeta-secret-redaction-static.test.ts tests/api/auth-routes.test.ts tests/api/templates-crud.test.ts tests/api/ocr-routes.test.ts tests/api/ai-generate-routes.test.ts tests/api/settings-route.test.ts tests/api/export-routes-headers.test.ts tests/components/dashboard-pages-states.test.tsx tests/docs/high-priority-test-coverage-static.test.ts tests/scripts/db-critical-schema-drift-static.test.ts tests/services/BackendMonitorService.test.ts tests/api/admin-backend-status.test.ts tests/components/admin-backend-monitor-static.test.tsx tests/scripts/backend-monitor-static.test.ts tests/security/backend-monitor-redaction-static.test.ts tests/services/AdminAuditLogService.test.ts tests/api/admin-audit-logs.test.ts tests/components/admin-audit-logs-static.test.tsx tests/security/admin-audit-redaction.test.ts


[1m[30m[46m RUN [49m[39m[22m [36mv4.1.6 [39m[90m/home/zeazdev/zsp-aitool[39m

 [32m✓[39m tests/branding.test.ts [2m([22m[2m1 test[22m[2m)[22m[33m 656[2mms[22m[39m
     [33m[2m✓[22m[39m does not include deprecated product branding in product code paths [33m 634[2mms[22m[39m
[90mstdout[2m | tests/hyperframes-watchdog.test.ts[2m > [22m[2mwatchdog[2m > [22m[2mok empty queue
[22m[39m{
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
  "freeDiskMb": 420874
}

[90mstdout[2m | tests/hyperframes-render-smoke.test.ts[2m > [22m[2mrender smoke gates[2m > [22m[2mrefuses when render is disabled
[22m[39m[SKIP] HYPERFRAMES_RENDER_ENABLED is not true

[90mstdout[2m | tests/hyperframes-render-smoke.test.ts[2m > [22m[2mrender smoke gates[2m > [22m[2mrefuses when confirmation is missing
[22m[39m[SKIP] HYPERFRAMES_RENDER_SMOKE_CONFIRM must be YES

 [32m✓[39m tests/hyperframes-watchdog.test.ts [2m([22m[2m3 tests[22m[2m)[22m[33m 1010[2mms[22m[39m
     [33m[2m✓[22m[39m ok empty queue [33m 833[2mms[22m[39m
 [32m✓[39m tests/hyperframes-render-smoke.test.ts [2m([22m[2m3 tests[22m[2m)[22m[33m 1592[2mms[22m[39m
     [33m[2m✓[22m[39m refuses when render is disabled [33m 1414[2mms[22m[39m
 [32m✓[39m tests/hyperframes-enqueue-smoke-job.test.ts [2m([22m[2m6 tests[22m[2m)[22m[33m 929[2mms[22m[39m
     [33m[2m✓[22m[39m refuses when render is disabled [33m 794[2mms[22m[39m
 [32m✓[39m tests/hyperframes-worker.test.ts [2m([22m[2m8 tests[22m[2m)[22m[33m 2290[2mms[22m[39m
     [33m[2m✓[22m[39m keeps disabled worker path unchanged [33m 1766[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-compose.test.ts [2m([22m[2m7 tests[22m[2m)[22m[33m 490[2mms[22m[39m
     [33m[2m✓[22m[39m returns controlled validation error for unsafe media URL [33m 358[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-render-download-token.test.ts [2m([22m[2m5 tests[22m[2m)[22m[33m 1243[2mms[22m[39m
     [33m[2m✓[22m[39m expired token rejected [33m 1116[2mms[22m[39m
[90mstdout[2m | tests/hyperframes-worker-alerts.test.ts[2m > [22m[2mworker-alerts[2m > [22m[2mfailed threshold triggers alert
[22m[39m[OK] Alert sent (failedLast24h>=3)

[90mstdout[2m | tests/hyperframes-worker-alerts.test.ts[2m > [22m[2mworker-alerts[2m > [22m[2mpending threshold triggers alert
[22m[39m[OK] Alert sent (pending>=10)

[90mstdout[2m | tests/hyperframes-worker-alerts.test.ts[2m > [22m[2mworker-alerts[2m > [22m[2mwebhook body shape safe and no local path leakage
[22m[39m[OK] Alert sent (pending>=10)

 [32m✓[39m tests/hyperframes-worker-alerts.test.ts [2m([22m[2m6 tests[22m[2m)[22m[33m 513[2mms[22m[39m
 [32m✓[39m tests/security/security-compliance-static-scans.test.ts [2m([22m[2m2 tests[22m[2m)[22m[33m 345[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-render-status.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 281[2mms[22m[39m
 [32m✓[39m tests/api/ocr-routes.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 269[2mms[22m[39m
 [32m✓[39m tests/hyperframes-render-inventory.test.ts [2m([22m[2m5 tests[22m[2m)[22m[33m 334[2mms[22m[39m
 [32m✓[39m tests/api/product-import-routes.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 212[2mms[22m[39m
 [32m✓[39m tests/security/hyperframes-security.test.ts [2m([22m[2m8 tests[22m[2m)[22m[32m 284[2mms[22m[39m
 [32m✓[39m tests/api/content-workflow-hardening.test.ts [2m([22m[2m6 tests[22m[2m)[22m[32m 174[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-script.test.ts [2m([22m[2m9 tests[22m[2m)[22m[32m 212[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-render-metrics.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 221[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-render-history.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 173[2mms[22m[39m
 [32m✓[39m tests/url-safety.test.ts [2m([22m[2m9 tests[22m[2m)[22m[32m 157[2mms[22m[39m
 [32m✓[39m tests/api/ai-generate-routes.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 197[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-render-share.test.ts [2m([22m[2m6 tests[22m[2m)[22m[32m 156[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-render.test.ts [2m([22m[2m8 tests[22m[2m)[22m[32m 124[2mms[22m[39m
 [32m✓[39m tests/hyperframes-live-queue-trial-script.test.ts [2m([22m[2m6 tests[22m[2m)[22m[32m 218[2mms[22m[39m
 [32m✓[39m tests/hyperframes-safe-rollback.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 199[2mms[22m[39m
 [32m✓[39m tests/api/tenant-isolation.test.ts [2m([22m[2m6 tests[22m[2m)[22m[33m 308[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-render-download.test.ts [2m([22m[2m7 tests[22m[2m)[22m[32m 100[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-render-retry.test.ts [2m([22m[2m7 tests[22m[2m)[22m[32m 126[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-render-batch.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 111[2mms[22m[39m
 [32m✓[39m tests/lib/rate-limit-distributed.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 101[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-brand-kit.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 164[2mms[22m[39m
 [32m✓[39m tests/hyperframes-worker-trial-script.test.ts [2m([22m[2m9 tests[22m[2m)[22m[32m 174[2mms[22m[39m
 [32m✓[39m tests/services/hyperframes-script-service.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 85[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-social-export.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 91[2mms[22m[39m
 [32m✓[39m tests/api/marqeta-status.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 63[2mms[22m[39m
 [32m✓[39m tests/services/MarqetaCoreApiService.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 43[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-operator-controls.test.ts [2m([22m[2m6 tests[22m[2m)[22m[32m 167[2mms[22m[39m
 [32m✓[39m tests/hyperframes-asset-fetch.test.ts [2m([22m[2m7 tests[22m[2m)[22m[32m 168[2mms[22m[39m
 [32m✓[39m tests/api/auth-routes.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 90[2mms[22m[39m
 [32m✓[39m tests/product-validation.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 139[2mms[22m[39m
 [32m✓[39m tests/hyperframes-render-validation.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 60[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-org-scope.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 140[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-billing-gates.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 168[2mms[22m[39m
 [32m✓[39m tests/scripts/db-schema-drift-check-static.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 55[2mms[22m[39m
 [32m✓[39m tests/hyperframes-template-marketplace.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 50[2mms[22m[39m
 [32m✓[39m tests/components/final-ui-admin-hyperframes-audit.test.ts [2m([22m[2m7 tests[22m[2m)[22m[32m 41[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-quota.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 76[2mms[22m[39m
 [32m✓[39m tests/components/shopee-open-api-import-static.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 44[2mms[22m[39m
 [32m✓[39m tests/api/export-routes-headers.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 109[2mms[22m[39m
 [32m✓[39m tests/api/shopee-open-api-status.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 64[2mms[22m[39m
 [32m✓[39m tests/api/feedback-api.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 69[2mms[22m[39m
 [32m✓[39m tests/api/admin-analytics.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 60[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-variants.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 83[2mms[22m[39m
 [32m✓[39m tests/components/hyperframes-render-history-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 16[2mms[22m[39m
 [32m✓[39m tests/services/BudgetService.test.ts [2m([22m[2m11 tests[22m[2m)[22m[32m 113[2mms[22m[39m
 [32m✓[39m tests/hyperframes-render-quality.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 30[2mms[22m[39m
 [32m✓[39m tests/runbooks/backup-restore-release-static.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 44[2mms[22m[39m
 [32m✓[39m tests/hyperframes-templates.test.ts [2m([22m[2m9 tests[22m[2m)[22m[32m 104[2mms[22m[39m
 [32m✓[39m tests/api/hyperframes-render-thumbnail.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 71[2mms[22m[39m
 [32m✓[39m tests/services/ShopeeOpenApiService.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 43[2mms[22m[39m
 [32m✓[39m tests/hyperframes-sanitize.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 39[2mms[22m[39m
 [32m✓[39m tests/hyperframes-cleanup-timer.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 21[2mms[22m[39m
 [32m✓[39m tests/components/background-color-select-static.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 33[2mms[22m[39m
 [32m✓[39m tests/lib.hyperframes-billing.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 17[2mms[22m[39m
 [32m✓[39m tests/api/usage-summary.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 38[2mms[22m[39m
 [32m✓[39m tests/hyperframes-subtitles.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 45[2mms[22m[39m
 [32m✓[39m tests/api/settings-route.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 71[2mms[22m[39m
 [32m✓[39m tests/api/templates-crud.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 89[2mms[22m[39m
 [32m✓[39m tests/middleware.auth.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 35[2mms[22m[39m
 [32m✓[39m tests/components/hyperframes-quota-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 16[2mms[22m[39m
 [32m✓[39m tests/components/dashboard-pages-states.test.tsx [2m([22m[2m1 test[22m[2m)[22m[32m 30[2mms[22m[39m
 [32m✓[39m tests/components/theme-mode-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 25[2mms[22m[39m
 [32m✓[39m tests/services/ExportService.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 19[2mms[22m[39m
 [32m✓[39m tests/services/ProductService.hardening.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 30[2mms[22m[39m
 [32m✓[39m tests/security/backend-monitor-redaction-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 61[2mms[22m[39m
 [32m✓[39m tests/api/products.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 33[2mms[22m[39m
 [32m✓[39m tests/lib/marqeta-config.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 30[2mms[22m[39m
 [32m✓[39m tests/components/hyperframes-dashboard-render-button-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 37[2mms[22m[39m
 [32m✓[39m tests/api/admin-backend-status.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 221[2mms[22m[39m
 [32m✓[39m tests/docs/high-priority-test-coverage-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 39[2mms[22m[39m
 [32m✓[39m tests/lib/shopee-open-api-config.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 34[2mms[22m[39m
 [32m✓[39m tests/security/marqeta-secret-redaction-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 42[2mms[22m[39m
 [32m✓[39m tests/components/hyperframes-upgrade-cta.test.tsx [2m([22m[2m1 test[22m[2m)[22m[32m 31[2mms[22m[39m
 [32m✓[39m tests/scripts/backup-db-static.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 77[2mms[22m[39m
 [32m✓[39m tests/services/AuthValidation.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 31[2mms[22m[39m
 [32m✓[39m tests/services/BackendMonitorService.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 15[2mms[22m[39m
 [32m✓[39m tests/hyperframes-render-command.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 45[2mms[22m[39m
 [32m✓[39m tests/components/growth-analytics-feedback-static.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 21[2mms[22m[39m
 [32m✓[39m tests/services/OCRService.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 30[2mms[22m[39m
 [32m✓[39m tests/components/growth-copy-safety-static.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 19[2mms[22m[39m
 [32m✓[39m tests/services/AIContentService.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 27[2mms[22m[39m
 [32m✓[39m tests/components/full-ux-ui-final-release-static.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 57[2mms[22m[39m
 [32m✓[39m tests/docs/growth-runbook-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 26[2mms[22m[39m
 [32m✓[39m tests/services/ProductService.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 30[2mms[22m[39m
 [32m✓[39m tests/security/extension-permissions.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 24[2mms[22m[39m
 [32m✓[39m tests/export-panel-security.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 41[2mms[22m[39m
 [32m✓[39m tests/components/all-menu-coverage-static.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 79[2mms[22m[39m
 [32m✓[39m tests/components/hyperframes-template-browser-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 55[2mms[22m[39m
 [32m✓[39m tests/api/admin-audit-logs.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 16[2mms[22m[39m
 [32m✓[39m tests/scripts/db-critical-schema-drift-static.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 21[2mms[22m[39m
 [32m✓[39m tests/docs/marqeta-runbook-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 14[2mms[22m[39m
 [32m✓[39m tests/scripts/backend-monitor-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 65[2mms[22m[39m
 [32m✓[39m tests/hyperframes-render-safety.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 16[2mms[22m[39m
 [32m✓[39m tests/smoke.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 15[2mms[22m[39m
 [32m✓[39m tests/services/AdminAuditLogService.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 190[2mms[22m[39m
 [32m✓[39m tests/security/admin-audit-redaction.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 76[2mms[22m[39m
 [32m✓[39m tests/components/admin-backend-monitor-static.test.tsx [2m([22m[2m1 test[22m[2m)[22m[32m 14[2mms[22m[39m
 [32m✓[39m tests/components/admin-audit-logs-static.test.tsx [2m([22m[2m1 test[22m[2m)[22m[32m 30[2mms[22m[39m
 [32m✓[39m tests/docs/enterprise-readiness-scale-plan-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 101[2mms[22m[39m
 [32m✓[39m tests/components/mobile-nav-coverage-static.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 16[2mms[22m[39m
 [32m✓[39m tests/services/SimilarProductService.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 27[2mms[22m[39m

[2m Test Files [22m [1m[32m110 passed[39m[22m[90m (110)[39m
[2m      Tests [22m [1m[32m355 passed[39m[22m[90m (355)[39m
[2m   Start at [22m 11:01:59
[2m   Duration [22m 82.05s[2m (transform 17.42s, setup 57.03s, import 45.16s, tests 17.86s, environment 321.67s)[22m


> zsp-aitool@0.1.0 build
> NODE_ENV=production next build

   ▲ Next.js 15.5.18
   - Environments: .env

   Creating an optimized production build ...
 ✓ Compiled successfully in 27.0s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/91) ...
   Generating static pages (22/91) 
   Generating static pages (45/91) 
   Generating static pages (68/91) 
 ✓ Generating static pages (91/91)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                                              Size  First Load JS
┌ ○ /                                                                   207 B         106 kB
├ ○ /_not-found                                                         365 B         103 kB
├ ƒ /api/admin/analytics                                                365 B         103 kB
├ ƒ /api/admin/audit-logs                                               365 B         103 kB
├ ƒ /api/admin/audit-logs/[id]                                          365 B         103 kB
├ ƒ /api/admin/backend/status                                           365 B         103 kB
├ ƒ /api/admin/observability/events                                     365 B         103 kB
├ ƒ /api/admin/observability/summary                                    365 B         103 kB
├ ƒ /api/admin/overview                                                 365 B         103 kB
├ ƒ /api/ai/content-queue                                               365 B         103 kB
├ ƒ /api/ai/content-queue/[id]                                          365 B         103 kB
├ ƒ /api/ai/content-queue/[id]/cancel                                   365 B         103 kB
├ ƒ /api/ai/content-queue/[id]/retry                                    365 B         103 kB
├ ƒ /api/ai/generate                                                    365 B         103 kB
├ ƒ /api/ai/generate-batch                                              365 B         103 kB
├ ƒ /api/auth/login                                                     365 B         103 kB
├ ƒ /api/auth/logout                                                    365 B         103 kB
├ ƒ /api/auth/me                                                        365 B         103 kB
├ ƒ /api/auth/register                                                  365 B         103 kB
├ ƒ /api/content-history                                                365 B         103 kB
├ ƒ /api/content-history/[id]                                           365 B         103 kB
├ ƒ /api/export/content.csv                                             365 B         103 kB
├ ƒ /api/export/content.md                                              365 B         103 kB
├ ƒ /api/export/content/[id].txt                                        365 B         103 kB
├ ƒ /api/export/products.csv                                            365 B         103 kB
├ ƒ /api/export/v2/affiliate-links                                      365 B         103 kB
├ ƒ /api/export/v2/content-history                                      365 B         103 kB
├ ƒ /api/export/v2/jobs                                                 365 B         103 kB
├ ƒ /api/export/v2/jobs/[id]                                            365 B         103 kB
├ ƒ /api/export/v2/jobs/[id]/download                                   365 B         103 kB
├ ƒ /api/export/v2/products                                             365 B         103 kB
├ ƒ /api/export/v2/social-drafts                                        365 B         103 kB
├ ƒ /api/feedback                                                       365 B         103 kB
├ ƒ /api/hyperframes                                                    365 B         103 kB
├ ƒ /api/hyperframes/brand-kit                                          365 B         103 kB
├ ƒ /api/hyperframes/compose                                            365 B         103 kB
├ ƒ /api/hyperframes/operator/jobs/[id]/cancel                          365 B         103 kB
├ ƒ /api/hyperframes/operator/jobs/[id]/recover-stale                   365 B         103 kB
├ ƒ /api/hyperframes/operator/queue                                     365 B         103 kB
├ ƒ /api/hyperframes/quota                                              365 B         103 kB
├ ƒ /api/hyperframes/render                                             365 B         103 kB
├ ƒ /api/hyperframes/render/[id]                                        365 B         103 kB
├ ƒ /api/hyperframes/render/[id]/cancel                                 365 B         103 kB
├ ƒ /api/hyperframes/render/[id]/download                               365 B         103 kB
├ ƒ /api/hyperframes/render/[id]/download-token                         365 B         103 kB
├ ƒ /api/hyperframes/render/[id]/retry                                  365 B         103 kB
├ ƒ /api/hyperframes/render/[id]/share                                  365 B         103 kB
├ ƒ /api/hyperframes/render/[id]/thumbnail                              365 B         103 kB
├ ƒ /api/hyperframes/render/batch                                       365 B         103 kB
├ ƒ /api/hyperframes/render/history                                     365 B         103 kB
├ ƒ /api/hyperframes/render/limits                                      365 B         103 kB
├ ƒ /api/hyperframes/render/metrics                                     365 B         103 kB
├ ƒ /api/hyperframes/render/quota                                       365 B         103 kB
├ ƒ /api/hyperframes/render/share/[token]                               365 B         103 kB
├ ƒ /api/hyperframes/render/status                                      365 B         103 kB
├ ƒ /api/hyperframes/script                                             365 B         103 kB
├ ƒ /api/hyperframes/script-to-composition                              365 B         103 kB
├ ƒ /api/hyperframes/share/[token]                                      365 B         103 kB
├ ƒ /api/hyperframes/social-export                                      365 B         103 kB
├ ƒ /api/hyperframes/variants                                           365 B         103 kB
├ ƒ /api/imports/csv-products                                           365 B         103 kB
├ ƒ /api/imports/csv-products/[id]                                      365 B         103 kB
├ ƒ /api/imports/csv-products/[id]/cancel                               365 B         103 kB
├ ƒ /api/imports/csv-products/[id]/retry                                365 B         103 kB
├ ƒ /api/integrations/marqeta/status                                    365 B         103 kB
├ ƒ /api/integrations/shopee/affiliate-csv-preview                      365 B         103 kB
├ ƒ /api/integrations/shopee/affiliate-ingestions                       365 B         103 kB
├ ƒ /api/integrations/shopee/affiliate-ingestions/[id]/approve          365 B         103 kB
├ ƒ /api/integrations/shopee/affiliate-ingestions/[id]/import           365 B         103 kB
├ ƒ /api/integrations/shopee/affiliate-ingestions/[id]/reject           365 B         103 kB
├ ƒ /api/integrations/shopee/affiliate-ingestions/[id]/social-drafts    365 B         103 kB
├ ƒ /api/integrations/shopee/affiliate-ingestions/social-drafts/copy    365 B         103 kB
├ ƒ /api/integrations/shopee/affiliate-manual-import                    365 B         103 kB
├ ƒ /api/integrations/shopee/social-drafts                              365 B         103 kB
├ ƒ /api/integrations/shopee/social-drafts/[id]                         365 B         103 kB
├ ƒ /api/integrations/shopee/social-drafts/[id]/archive                 365 B         103 kB
├ ƒ /api/integrations/shopee/social-drafts/[id]/copy                    365 B         103 kB
├ ƒ /api/integrations/shopee/status                                     365 B         103 kB
├ ƒ /api/ocr/[id]                                                       365 B         103 kB
├ ƒ /api/ocr/extract                                                    365 B         103 kB
├ ƒ /api/products                                                       365 B         103 kB
├ ƒ /api/products/[id]                                                  365 B         103 kB
├ ƒ /api/products/[id]/affiliate-link                                   365 B         103 kB
├ ƒ /api/products/[id]/similar                                          365 B         103 kB
├ ƒ /api/products/[id]/similar-refresh                                  365 B         103 kB
├ ƒ /api/products/bulk-generate-content                                 365 B         103 kB
├ ƒ /api/products/deduplication/groups                                  365 B         103 kB
├ ƒ /api/products/deduplication/groups/[id]/dismiss                     365 B         103 kB
├ ƒ /api/products/deduplication/groups/[id]/merge                       365 B         103 kB
├ ƒ /api/products/deduplication/scan                                    365 B         103 kB
├ ƒ /api/products/extension-import                                      365 B         103 kB
├ ƒ /api/products/import-json                                           365 B         103 kB
├ ƒ /api/products/import-url                                            365 B         103 kB
├ ƒ /api/settings                                                       365 B         103 kB
├ ƒ /api/templates                                                      365 B         103 kB
├ ƒ /api/templates/[id]                                                 365 B         103 kB
├ ƒ /api/templates/[id]/duplicate                                       365 B         103 kB
├ ƒ /api/templates/restore-defaults                                     365 B         103 kB
├ ƒ /api/usage/summary                                                  365 B         103 kB
├ ○ /dashboard                                                        5.61 kB         111 kB
├ ƒ /dashboard/admin                                                    207 B         106 kB
├ ƒ /dashboard/admin/analytics                                          207 B         106 kB
├ ƒ /dashboard/admin/audit-logs                                         207 B         106 kB
├ ƒ /dashboard/admin/backend-monitor                                    207 B         106 kB
├ ƒ /dashboard/admin/content                                            207 B         106 kB
├ ƒ /dashboard/admin/observability                                      207 B         106 kB
├ ƒ /dashboard/admin/products                                           207 B         106 kB
├ ƒ /dashboard/admin/renders                                            207 B         106 kB
├ ƒ /dashboard/admin/settings                                           207 B         106 kB
├ ƒ /dashboard/admin/system                                             207 B         106 kB
├ ƒ /dashboard/admin/users                                              207 B         106 kB
├ ○ /dashboard/content-history                                        3.39 kB         106 kB
├ ○ /dashboard/export-center                                            207 B         106 kB
├ ○ /dashboard/generator                                              19.6 kB         122 kB
├ ○ /dashboard/hyperframes                                               6 kB         130 kB
├ ○ /dashboard/hyperframes/batch                                      2.62 kB         108 kB
├ ○ /dashboard/hyperframes/ops                                         2.5 kB         108 kB
├ ○ /dashboard/hyperframes/ops/queue                                  2.03 kB         108 kB
├ ○ /dashboard/hyperframes/renders                                    4.21 kB         112 kB
├ ○ /dashboard/ocr                                                    1.69 kB         104 kB
├ ƒ /dashboard/products                                                 176 B         111 kB
├ ƒ /dashboard/products/[id]                                            207 B         106 kB
├ ƒ /dashboard/products/[id]/similar                                    365 B         103 kB
├ ƒ /dashboard/products/deduplication                                   911 B         103 kB
├ ○ /dashboard/products/new                                           2.77 kB         105 kB
├ ○ /dashboard/settings                                               3.35 kB         106 kB
├ ƒ /dashboard/shopee-affiliate                                       6.64 kB         112 kB
├ ○ /dashboard/similar                                                2.28 kB         105 kB
├ ○ /dashboard/templates                                               3.3 kB         119 kB
├ ○ /login                                                              776 B         103 kB
└ ○ /register                                                           817 B         103 kB
+ First Load JS shared by all                                          102 kB
  ├ chunks/1255-b28ea36bf0cdbd65.js                                   46.2 kB
  ├ chunks/4bd1b696-f785427dddbba9fb.js                               54.2 kB
  └ other shared chunks (total)                                       1.93 kB

Route (pages)                                                            Size  First Load JS
─ ○ /404 (751 ms)                                                       484 B        83.4 kB
+ First Load JS shared by all                                         82.9 kB
  ├ chunks/framework-f31701c9d93f12a4.js                              44.8 kB
  ├ chunks/main-6f797f1073f75477.js                                   36.2 kB
  └ other shared chunks (total)                                        1.9 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> zsp-aitool@0.1.0 postbuild
> bash scripts/fix-next-server-chunks.sh

Linked Next.js server chunks into .next/server

> zsp-aitool@0.1.0 health
> bash scripts/health-zsp-aitool.sh

[OK] package.json is valid JSON
[OK] scripts/fix-next-server-chunks.sh exists
[OK] scripts/fix-next-server-chunks.sh is executable
[OK] Next.js server chunk symlink exists for 7372.js
[OK] No old branding references found in app/runtime files
[OK] Port 3001 is listening; checking local endpoints
[OK] http://127.0.0.1:3001 returned HTTP 200
[OK] http://127.0.0.1:3001/dashboard returned HTTP 200
[OK] http://127.0.0.1:3001/dashboard/products returned HTTP 307
[OK] https://studio.zeaz.dev/ returned HTTP 200
[OK] https://studio.zeaz.dev/dashboard returned HTTP 200
[OK] https://studio.zeaz.dev/dashboard/products returned HTTP 307
[OK] zsp-aitool service is active
[OK] Prisma migration status check passed
[OK] UserSetting schema drift check passed
[OK] Health check completed with 0 failures and 0 warning(s).

## 2. Deep Dive Scan
# ZSP-AITOOL Full Repo + .zagents Deep Review

Generated: 2026-05-22T11:05:49+00:00
Root: /home/zeazdev/zsp-aitool

## 1. Git state
- origin	git@github.com:cvsz/zsp-aitool.git (fetch)
- origin	git@github.com:cvsz/zsp-aitool.git (push)
```text
 M start.sh
?? docs/runbooks/zsp-release-smoke-checklist.md
```

## 2. Package baseline
- OK: package.json is valid JSON
- name: zsp-aitool
- version: 0.1.0
- dependency next: 15.5.18
- dependency react: 18.3.1
- dependency react-dom: 18.3.1
- dependency @prisma/client: ^5.22.0
- dependency zod: ^3.23.8

### Key scripts
- OK: dev
- OK: build
- OK: start
- OK: typecheck
- OK: test
- OK: health
- OK: prisma:generate
- OK: hyperframes:doctor
- OK: hyperframes:queue-status
- OK: hyperframes:worker:watchdog
- OK: ci:local-preflight
- OK: postbuild preserves scripts/fix-next-server-chunks.sh

## 3. Instruction docs
- OK: GEMINI.md
- OK: AGENTS.md
- OK: CLAUDE.md
- OK: .zagents/README.md
- OK: .zagents/README-omnibus.md
- OK: .zagents/GEMINI_CLI_COMMANDS.txt

## 4. .zagents integrity
- OK: .zagents/CHECKSUMS.sha256
- OK: .zagents/GEMINI_CLI_COMMANDS.txt
- OK: .zagents/README.md
- OK: .zagents/README-omnibus.md
- OK: .zagents/scripts/zsp-agent-status.sh
- OK: .zagents/scripts/zsp-deep-dive.sh
- OK: .zagents/zsp-agent-omnibus-oneclick.sh
- OK: .zagents/zsp-omnibus-init-safe.sh

### Checksum validation
- GEMINI_CLI_COMMANDS.txt: OK
- README.md: OK
- README-omnibus.md: OK
- scripts/zsp-agent-status.sh: OK
- scripts/zsp-deep-dive.sh: FAILED
- zsp-agent-omnibus-oneclick.sh: OK
- zsp-omnibus-init-safe.sh: OK
- sha256sum: WARNING: 1 computed checksum did NOT match

## 5. Agent directories
- OK: .agents
- OK: .agents/rules
- OK: .agents/workflows
- OK: .codex
- OK: .claude
- OK: .zagents/scripts

## 6. Security static scan
- OK: no dangerouslySetInnerHTML under src
src/app/api/hyperframes/render/[id]/download/route.ts:55:    const code = error instanceof Error ? error.message : "DOWNLOAD_TOKEN_INVALID";
src/app/api/hyperframes/render/[id]/download/route.ts:56:    if (code === "DOWNLOAD_TOKEN_INVALID" || code === "DOWNLOAD_TOKEN_EXPIRED") return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired download token" } }, { status: 401 });
src/app/api/hyperframes/render/[id]/download/route.ts:63:    const code = error instanceof Error ? error.message : "DOWNLOAD_TOKEN_INVALID";
src/app/api/hyperframes/render/[id]/download/route.ts:64:    if (code === "DOWNLOAD_TOKEN_INVALID" || code === "DOWNLOAD_TOKEN_EXPIRED") return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired download token" } }, { status: 401 });
src/app/api/hyperframes/render/[id]/download-token/route.ts:30:    return NextResponse.json({ ok: false, error: { code: "TOKEN_CONFIG_INVALID", message: "Signed downloads are unavailable" } }, { status: 503 });
src/services/BackendMonitorService.ts:24:    .replace(/(DATABASE_URL|API_KEY|TOKEN|SECRET|PASSWORD)\s*=\s*[^\s]+/gi, "$1=[REDACTED]")
src/services/shopee-open-api-client.ts:16:const SECRET_PATTERNS = [/partner[_-]?key/gi, /webhook[_-]?secret/gi, /access[_-]?token/gi, /refresh[_-]?token/gi];
src/services/shopee-open-api-client.ts:20:  for (const pattern of SECRET_PATTERNS) {
src/services/UserSettingService.ts:8:  openai: "OPENAI_API_KEY",
src/lib/shopee/open-api-config.ts:12:  SHOPEE_PARTNER_KEY?: string;
src/lib/shopee/open-api-config.ts:16:  SHOPEE_WEBHOOK_SECRET?: string;
src/lib/shopee/open-api-config.ts:44:  "SHOPEE_PARTNER_KEY",
src/lib/shopee/open-api-config.ts:48:  "SHOPEE_WEBHOOK_SECRET"
src/lib/shopee/open-api-config.ts:91:    partnerKey: normalizeValue(env.SHOPEE_PARTNER_KEY),
src/lib/shopee/open-api-config.ts:95:    webhookSecret: normalizeValue(env.SHOPEE_WEBHOOK_SECRET),
src/lib/observability/logger.ts:7:const SECRET_PATTERNS: RegExp[] = [
src/lib/observability/logger.ts:16:  return SECRET_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, "[REDACTED]"), value);
src/lib/env.ts:5:  DATABASE_URL: z.string().url(),
src/lib/env.ts:7:  OPENAI_API_KEY: z.string().min(1).optional(),
src/lib/env.ts:16:  DATABASE_URL: process.env.DATABASE_URL,
src/lib/env.ts:18:  OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
src/lib/rate-limit.ts:37:  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
src/lib/hyperframes/render-metrics.ts:26:  const expected = process.env.HYPERFRAMES_INTERNAL_TOKEN;
src/lib/hyperframes/download-token.ts:31:    secret: process.env.HYPERFRAMES_DOWNLOAD_TOKEN_SECRET ?? "",
src/lib/hyperframes/download-token.ts:32:    ttlSeconds: Number.parseInt(process.env.HYPERFRAMES_DOWNLOAD_TOKEN_TTL_SECONDS ?? "300", 10) || 300,
src/lib/hyperframes/download-token.ts:37:  if (!cfg.secret) throw new Error("DOWNLOAD_TOKEN_SECRET_MISSING");
src/lib/hyperframes/download-token.ts:51:  if (!cfg.secret) throw new Error("DOWNLOAD_TOKEN_SECRET_MISSING");
src/lib/hyperframes/download-token.ts:53:  if (!payloadSegment || !signature) throw new Error("DOWNLOAD_TOKEN_INVALID");
src/lib/hyperframes/download-token.ts:59:    throw new Error("DOWNLOAD_TOKEN_INVALID");
src/lib/hyperframes/download-token.ts:66:    throw new Error("DOWNLOAD_TOKEN_INVALID");
src/lib/hyperframes/download-token.ts:69:  if (!payload.jobId || !payload.userId || !payload.exp || !payload.nonce) throw new Error("DOWNLOAD_TOKEN_INVALID");
src/lib/hyperframes/download-token.ts:70:  if (payload.exp <= Math.floor(Date.now() / 1000)) throw new Error("DOWNLOAD_TOKEN_EXPIRED");
src/lib/auth.ts:18:  const secret = process.env.AUTH_SECRET;
src/lib/auth.ts:20:    throw new Error("AUTH_SECRET is not configured");
src/lib/marqeta/config.ts:3:const schema = z.object({ MARQETA_ENABLED: z.string().optional().default("false"), MARQETA_ENV: z.string().optional().default("sandbox"), MARQETA_BASE_URL: z.string().optional().default(SANDBOX_BASE_URL), MARQETA_APPLICATION_TOKEN: z.string().optional().default(""), MARQETA_ADMIN_ACCESS_TOKEN: z.string().optional().default(""), MARQETA_CONNECTIVITY_CHECK_ENABLED: z.string().optional().default("false"), MARQETA_TIMEOUT_MS: z.string().optional().default("10000"), MARQETA_MAX_RETRIES: z.string().optional().default("2") });
src/lib/marqeta/config.ts:7:export function loadMarqetaConfig(env: NodeJS.ProcessEnv = process.env): MarqetaConfig { const parsed = schema.parse(env); const marqetaEnv = parsed.MARQETA_ENV.trim().toLowerCase(); if (marqetaEnv !== "sandbox") throw new MarqetaConfigError("MARQETA_ENV only supports sandbox in this phase"); const baseUrl = parsed.MARQETA_BASE_URL.trim(); if (!baseUrl.startsWith("https://")) throw new MarqetaConfigError("MARQETA_BASE_URL must use HTTPS"); if (baseUrl !== SANDBOX_BASE_URL) throw new MarqetaConfigError("MARQETA_BASE_URL must equal sandbox URL in this phase"); const timeoutMs = Number(parsed.MARQETA_TIMEOUT_MS); const maxRetries = Number(parsed.MARQETA_MAX_RETRIES); if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) throw new MarqetaConfigError("MARQETA_TIMEOUT_MS is invalid"); if (!Number.isInteger(maxRetries) || maxRetries < 0 || maxRetries > 5) throw new MarqetaConfigError("MARQETA_MAX_RETRIES is invalid"); return { enabled: parseBoolean(parsed.MARQETA_ENABLED), env: "sandbox", baseUrl, applicationToken: parsed.MARQETA_APPLICATION_TOKEN.trim() || null, adminAccessToken: parsed.MARQETA_ADMIN_ACCESS_TOKEN.trim() || null, connectivityCheckEnabled: parseBoolean(parsed.MARQETA_CONNECTIVITY_CHECK_ENABLED), timeoutMs, maxRetries }; }
src/app/api/hyperframes/render/history/route.ts:65:        const canDownload = job.status === "COMPLETED" && Boolean(job.outputPath);
src/app/api/hyperframes/render/[id]/route.ts:21:  const canDownload = job.status === "COMPLETED" && Boolean(job.outputPath);
src/app/api/hyperframes/render/[id]/download/route.ts:29:  if (!job.outputPath) return NextResponse.json({ ok: false, error: { code: "ARTIFACT_GONE", message: "Render artifact is no longer available" } }, { status: 410 });
src/app/api/hyperframes/render/[id]/download/route.ts:34:    artifactPath = await resolveRenderArtifactPath(config.outputDir, job.outputPath, config.maxOutputMb);
src/app/api/hyperframes/render/[id]/retry/route.ts:34:    data: { status: RenderJobStatus.PENDING, errorMessage: null, failedAt: null, completedAt: null, startedAt: null, lockedAt: null, lockedBy: null, outputPath: null, outputUrl: null },
src/app/api/hyperframes/render/[id]/share/route.ts:22:  if (job.status !== "COMPLETED" || !job.outputPath) return NextResponse.json({ ok: false, error: { code: "RENDER_NOT_READY", message: "Render is not completed" } }, { status: 409 });
src/app/api/hyperframes/render/share/[token]/route.ts:20:  if (job.status !== "COMPLETED" || !job.outputPath) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
src/app/api/hyperframes/render/share/[token]/route.ts:24:    artifactPath = await resolveRenderArtifactPath(config.outputDir, job.outputPath, config.maxOutputMb);
src/app/api/hyperframes/share/[token]/route.ts:17:  if (job.status!=="COMPLETED" || !job.outputPath) return NextResponse.json({ok:false,error:{code:"NOT_FOUND",message:"Not found"}},{status:404});
src/app/api/hyperframes/share/[token]/route.ts:20:  try { artifactPath = await resolveRenderArtifactPath(config.outputDir, job.outputPath, config.maxOutputMb); }
src/app/dashboard/admin/page.tsx:35:          <AdminMetricCard label="Watchdog Queue" value={summary.ops.hyperframesQueue.watchdogConfigured ? "กำหนดค่าแล้ว" : "ยังไม่กำหนด"} note="ไม่มีปุ่ม systemctl บน UI" />
src/app/dashboard/hyperframes/ops/queue/page.tsx:21:  const warnings = useMemo(() => !status ? ["ไม่มี systemctl controls ใน UI"] : ["ไม่มี systemctl controls ใน UI", status.staleRunning > 0 ? `พบ stale running ${status.staleRunning} งาน` : "ไม่พบ stale running", "การ recover/cleanup ต้องทำผ่าน operator script ที่มี confirmation gate"], [status]);

## 7. Dangerous command pattern scan
### Strict Checks (src/app, src/components)
- OK: no dangerous commands in UI code

### Documentation & Runbooks (INFO)
- [INFO] docs/prompts/015-production-launch-polish.prompt.md:44:- Do not run npm audit fix --force.
- [INFO] docs/prompts/015-production-launch-polish.prompt.md:53:- Use prisma migrate deploy, not prisma migrate dev, on production.
- [INFO] docs/prompts/015-production-launch-polish.prompt.md:204:npx prisma migrate deploy --schema prisma/schema.prisma
- [INFO] docs/prompts/015-production-launch-polish.prompt.md:211:sudo systemctl stop zsp-hyperframes-worker && sudo systemctl disable zsp-hyperframes-worker
- [INFO] docs/prompts/zsp-aitool-step-by-step-th.md:47:- ห้าม npm audit fix --force
- [INFO] docs/prompts/zsp-aitool-step-by-step-th.md:49:- Production ใช้ prisma migrate deploy เท่านั้น ห้าม prisma migrate dev
- [INFO] docs/prompts/zsp-aitool-step-by-step-th.md:173:- ห้าม npm audit fix --force
- [INFO] docs/prompts/zsp-aitool-step-by-step-th.md:229:ใช้ npx prisma migrate deploy --schema prisma/schema.prisma เท่านั้น ห้าม prisma migrate dev บน production
- [INFO] docs/prompts/zsp-aitool-step-by-step-th.md:686:npx prisma migrate deploy --schema prisma/schema.prisma
- [INFO] docs/prompts/032-shopee-affiliate-portal-integration-polish.prompt.md:55:- Do not run npm audit fix --force.
- [INFO] docs/prompts/017-first-100-users-growth-loop.prompt.md:48:- Do not run npm audit fix --force.
- [INFO] docs/prompts/017-first-100-users-growth-loop.prompt.md:50:- Use prisma migrate deploy, not prisma migrate dev, on production.
- [INFO] docs/prompts/016-post-launch-monitoring-and-growth.prompt.md:46:- Do not run npm audit fix --force.
- [INFO] docs/prompts/016-post-launch-monitoring-and-growth.prompt.md:55:- Use prisma migrate deploy, not prisma migrate dev, on production.
- [INFO] docs/prompts/016-post-launch-monitoring-and-growth.prompt.md:254:npx prisma migrate deploy --schema prisma/schema.prisma
- [INFO] docs/prompts/020-production-db-schema-drift-hardening-and-settings-migration.prompt.md:38:- Do not run `npm audit fix --force`.
- [INFO] docs/prompts/020-production-db-schema-drift-hardening-and-settings-migration.prompt.md:44:- Use `prisma migrate deploy` on production.
- [INFO] docs/prompts/020-production-db-schema-drift-hardening-and-settings-migration.prompt.md:155:- migration/runbook mentions production uses `prisma migrate deploy`, not `migrate dev`
- [INFO] docs/prompts/020-production-db-schema-drift-hardening-and-settings-migration.prompt.md:182:- production migration policy: use `npx prisma migrate deploy`, never `migrate dev`
- [INFO] docs/prompts/020-production-db-schema-drift-hardening-and-settings-migration.prompt.md:238:npx prisma migrate deploy --schema prisma/schema.prisma
- [INFO] docs/prompts/021-growth-analytics-and-feedback-dashboard.prompt.md:40:- Do not run npm audit fix --force.
- [INFO] docs/prompts/005-final-full-repo-production-readiness.prompt.md:61:- Do not run npm audit fix --force.
- [INFO] docs/prompts/005-final-full-repo-production-readiness.prompt.md:73:- Use prisma migrate deploy, not prisma migrate dev, on production.
- [INFO] docs/prompts/005-final-full-repo-production-readiness.prompt.md:260:npx prisma migrate deploy --schema prisma/schema.prisma
- [INFO] docs/prompts/014-full-ux-ui-redesign.prompt.md:24:- Do not run npm audit fix --force.
- [INFO] docs/prompts/033-shopee-affiliate-automation-safe-ingestion.prompt.md:89:- Do not run npm audit fix --force.
- [INFO] docs/prompts/036-shopee-affiliate-persist-social-drafts.prompt.md:61:- Do not run `npm audit fix --force`.
- [INFO] docs/prompts/036-shopee-affiliate-persist-social-drafts.prompt.md:154:Use `npx prisma migrate deploy --schema prisma/schema.prisma` in production only.
- [INFO] docs/prompts/018-official-shopee-open-api-integration.prompt.md:48:- Do not run npm audit fix --force.
- [INFO] docs/prompts/018-official-shopee-open-api-integration.prompt.md:50:- Use prisma migrate deploy, not prisma migrate dev, on production.
- [INFO] docs/prompts/zsp-aitool-full-source-en.md:46:- Do not run npm audit fix --force.
- [INFO] docs/prompts/zsp-aitool-full-source-en.md:48:- Use prisma migrate deploy, not prisma migrate dev, on production.
- [INFO] docs/prompts/zsp-aitool-full-source-en.md:215:- production migration warning: use prisma migrate deploy only on production
- [INFO] docs/prompts/zsp-aitool-full-source-en.md:502:npx prisma migrate deploy --schema prisma/schema.prisma
- [INFO] docs/prompts/019-full-ux-ui-final-release-day-night-system.prompt.md:48:- Do not run npm audit fix --force.
- [INFO] docs/prompts/019-full-ux-ui-final-release-day-night-system.prompt.md:63:- Use prisma migrate deploy, not prisma migrate dev, on production.
- [INFO] docs/prompts/029-security-compliance-and-abuse-prevention.prompt.md:36:- Do not run npm audit fix --force.
- [INFO] docs/hyperframes-render-worker.md:119:sudo systemctl enable zsp-hyperframes-worker
- [INFO] docs/hyperframes-render-worker.md:120:sudo systemctl start zsp-hyperframes-worker
- [INFO] docs/hyperframes-render-worker.md:139:sudo systemctl stop zsp-hyperframes-worker
- [INFO] docs/hyperframes-render-worker.md:140:sudo systemctl disable zsp-hyperframes-worker
- [INFO] docs/hyperframes-render-worker.md:206:- When `HYPERFRAMES_RENDER_ENABLED=true`, the script calls `systemctl start`, sleeps for the trial window, requires the service to remain active, then stops the service.
- [INFO] docs/hyperframes-render-worker.md:210:- The script does not call `systemctl enable` and does not modify `.env`.
- [INFO] docs/hyperframes-render-worker.md:223:sudo systemctl stop zsp-hyperframes-worker
- [INFO] docs/hyperframes-render-worker.md:224:sudo systemctl disable zsp-hyperframes-worker
- [INFO] docs/hyperframes-render-worker.md:246:- No `systemctl enable` calls.
- [INFO] docs/hyperframes-render-worker.md:283:4. Runs `systemctl daemon-reload` and `systemctl start`.
- [INFO] docs/hyperframes-render-worker.md:299:sudo systemctl stop zsp-hyperframes-worker || true
- [INFO] docs/hyperframes-render-worker.md:353:sudo systemctl stop zsp-hyperframes-worker
- [INFO] docs/hyperframes-render-worker.md:354:sudo systemctl disable zsp-hyperframes-worker
- [INFO] docs/production-readiness-checklist.md:127:- [ ] **Required before launch**: ใช้ `prisma migrate deploy` ในขั้น deploy production
- [INFO] docs/runbooks/production-deployment-checklist.md:29:npx prisma migrate deploy --schema prisma/schema.prisma
- [INFO] docs/runbooks/production-backup-restore.md:9:- production migration ใช้ `npx prisma migrate deploy --schema prisma/schema.prisma` เท่านั้น
- [INFO] docs/runbooks/production-backup-restore.md:62:npx prisma migrate deploy --schema prisma/schema.prisma
- [INFO] docs/runbooks/production-launch.md:44:npx prisma migrate deploy --schema prisma/schema.prisma
- [INFO] docs/runbooks/production-launch.md:61:sudo systemctl stop zsp-hyperframes-worker && sudo systemctl disable zsp-hyperframes-worker
- [INFO] docs/runbooks/production-db-drift.md:46:npx prisma migrate deploy --schema prisma/schema.prisma
- [INFO] docs/runbooks/security-compliance-abuse-prevention.md:22:- no direct `systemctl start|stop|restart|enable|disable` controls in UI
- [INFO] docs/runbooks/enterprise-readiness-scale-plan.md:43:- Scripted health checks and production-safe migration workflow (`prisma migrate deploy` guidance).
- [INFO] docs/runbooks/release-checklist.md:32:npx prisma migrate deploy --schema prisma/schema.prisma

### Other files
./.gemini/commands/admin-phase.toml:16:- Do not run npm audit fix --force.
./.gemini/commands/hyperframes-phase.toml:18:- Do not run npm audit fix --force.
./AGENTS.md:16:- Do not run npm audit fix --force.
./README.md:206:npx prisma migrate deploy --schema prisma/schema.prisma
./GEMINI.md:107:npm audit fix --force
./GEMINI.md:111:rm -rf /
./GEMINI.md:112:sudo systemctl start ...
./GEMINI.md:113:sudo systemctl stop ...
./GEMINI.md:114:sudo systemctl enable ...
./GEMINI.md:115:sudo systemctl disable ...
./GEMINI.md:116:terraform apply
./GEMINI.md:117:tofu apply
./GEMINI.md:118:prisma migrate deploy
./.faf:104:  - "Do not run npm audit fix --force."
./.faf:108:  - "Use prisma migrate deploy, not prisma migrate dev, on production."
./SECURITY.md:140:npx prisma migrate deploy --schema prisma/schema.prisma
./SECURITY.md:149:- Do not run `npm audit fix --force`.
./CLAUDE.md:15:- Do not run npm audit fix --force.
./tests/hyperframes-live-queue-trial-script.test.ts:23:    expect(source).not.toContain("systemctl enable");
./tests/hyperframes-live-queue-trial-script.test.ts:37:    expect(source).toContain("systemctl stop \"${SERVICE_NAME}\"");
./tests/runbooks/backup-restore-release-static.test.ts:7:    expect(doc).toContain("npx prisma migrate deploy --schema prisma/schema.prisma");
./tests/hyperframes-worker-trial-script.test.ts:28:    expect(source).not.toContain("systemctl enable");
./tests/hyperframes-worker-trial-script.test.ts:35:    expect(source).toContain('systemctl stop "${SERVICE_NAME}" || warn');
./tests/hyperframes-worker-trial-script.test.ts:41:    const startIndex = source.indexOf('systemctl start "${SERVICE_NAME}"');
./CONTRIBUTING.md:155:npx prisma migrate deploy --schema prisma/schema.prisma
./package.json:13:    "prisma:migrate:deploy": "prisma migrate deploy",
./scripts/monitor/install-backend-monitor-timer.sh:54:systemctl enable --now "${SERVICE_NAME}.timer"
./scripts/monitor/install-backend-monitor-timer.sh:55:systemctl start "${SERVICE_NAME}.service" || true
./scripts/hyperframes/disable-cleanup-timer.sh:13:sudo systemctl stop "${TIMER_NAME}" || warn "Timer stop returned non-zero"
./scripts/hyperframes/disable-cleanup-timer.sh:14:sudo systemctl stop "${SERVICE_NAME}" || warn "Service stop returned non-zero"
./scripts/hyperframes/disable-cleanup-timer.sh:17:sudo systemctl disable "${TIMER_NAME}" || warn "Timer disable returned non-zero"
./scripts/hyperframes/enable-real-worker-daemon.sh:109:sudo systemctl enable --now "$SERVICE_NAME"
./scripts/hyperframes/persistent-worker-preflight.sh:154:echo "  sudo systemctl stop zsp-hyperframes-worker && sudo systemctl disable zsp-hyperframes-worker"
./scripts/hyperframes/disable-worker-service.sh:21:sudo systemctl stop "${SERVICE_NAME}" || warn "Stop returned non-zero (possibly not running)"
./scripts/hyperframes/disable-worker-service.sh:24:sudo systemctl disable "${SERVICE_NAME}" || warn "Disable returned non-zero (possibly not enabled)"
./scripts/hyperframes/safe-rollback.sh:40:systemctl stop "${SERVICE_NAME}" || warn "service stop returned non-zero"
./scripts/hyperframes/safe-rollback.sh:41:systemctl disable "${SERVICE_NAME}" || warn "service disable returned non-zero"
./scripts/hyperframes/safe-rollback.sh:72:sudo systemctl stop "${SERVICE_NAME}" || warn "${SERVICE_NAME} was not active"
./scripts/hyperframes/safe-rollback.sh:73:sudo systemctl disable "${SERVICE_NAME}" || warn "${SERVICE_NAME} was not enabled"
./scripts/hyperframes/worker-trial.sh:73:      systemctl stop "${SERVICE_NAME}" || warn "Failed to stop ${SERVICE_NAME}"
./scripts/hyperframes/worker-trial.sh:98:systemctl start "${SERVICE_NAME}"
./scripts/hyperframes/disable-real-worker-daemon.sh:15:sudo systemctl stop "$SERVICE_NAME" || warn "$SERVICE_NAME was not active"
./scripts/hyperframes/disable-real-worker-daemon.sh:16:sudo systemctl disable "$SERVICE_NAME" || warn "$SERVICE_NAME was not enabled"
./scripts/hyperframes/live-queue-trial.sh:65:    systemctl stop "${SERVICE_NAME}" || warn "Failed to stop ${SERVICE_NAME}"
./scripts/hyperframes/live-queue-trial.sh:98:systemctl start "${SERVICE_NAME}"
./scripts/hyperframes/live-queue-trial.sh:126:systemctl stop "${SERVICE_NAME}"
./scripts/hyperframes/install-cleanup-timer.sh:35:  sudo systemctl enable --now "${TIMER_NAME}"
./.agents/rules/00-zsp-constitution.md.bak.20260522-001848:11:6. Do not run `npm audit fix --force`.
./.agents/rules/00-zsp-constitution.md:20:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:130:- [INFO] docs/prompts/015-production-launch-polish.prompt.md:44:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:131:- [INFO] docs/prompts/015-production-launch-polish.prompt.md:53:- Use prisma migrate deploy, not prisma migrate dev, on production.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:132:- [INFO] docs/prompts/015-production-launch-polish.prompt.md:204:npx prisma migrate deploy --schema prisma/schema.prisma
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:133:- [INFO] docs/prompts/015-production-launch-polish.prompt.md:211:sudo systemctl stop zsp-hyperframes-worker && sudo systemctl disable zsp-hyperframes-worker
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:134:- [INFO] docs/prompts/zsp-aitool-step-by-step-th.md:47:- ห้าม npm audit fix --force
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:135:- [INFO] docs/prompts/zsp-aitool-step-by-step-th.md:49:- Production ใช้ prisma migrate deploy เท่านั้น ห้าม prisma migrate dev
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:136:- [INFO] docs/prompts/zsp-aitool-step-by-step-th.md:173:- ห้าม npm audit fix --force
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:137:- [INFO] docs/prompts/zsp-aitool-step-by-step-th.md:229:ใช้ npx prisma migrate deploy --schema prisma/schema.prisma เท่านั้น ห้าม prisma migrate dev บน production
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:138:- [INFO] docs/prompts/zsp-aitool-step-by-step-th.md:686:npx prisma migrate deploy --schema prisma/schema.prisma
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:139:- [INFO] docs/prompts/032-shopee-affiliate-portal-integration-polish.prompt.md:55:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:140:- [INFO] docs/prompts/017-first-100-users-growth-loop.prompt.md:48:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:141:- [INFO] docs/prompts/017-first-100-users-growth-loop.prompt.md:50:- Use prisma migrate deploy, not prisma migrate dev, on production.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:142:- [INFO] docs/prompts/016-post-launch-monitoring-and-growth.prompt.md:46:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:143:- [INFO] docs/prompts/016-post-launch-monitoring-and-growth.prompt.md:55:- Use prisma migrate deploy, not prisma migrate dev, on production.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:144:- [INFO] docs/prompts/016-post-launch-monitoring-and-growth.prompt.md:254:npx prisma migrate deploy --schema prisma/schema.prisma
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:145:- [INFO] docs/prompts/020-production-db-schema-drift-hardening-and-settings-migration.prompt.md:38:- Do not run `npm audit fix --force`.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:146:- [INFO] docs/prompts/020-production-db-schema-drift-hardening-and-settings-migration.prompt.md:44:- Use `prisma migrate deploy` on production.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:147:- [INFO] docs/prompts/020-production-db-schema-drift-hardening-and-settings-migration.prompt.md:155:- migration/runbook mentions production uses `prisma migrate deploy`, not `migrate dev`
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:148:- [INFO] docs/prompts/020-production-db-schema-drift-hardening-and-settings-migration.prompt.md:182:- production migration policy: use `npx prisma migrate deploy`, never `migrate dev`
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:149:- [INFO] docs/prompts/020-production-db-schema-drift-hardening-and-settings-migration.prompt.md:238:npx prisma migrate deploy --schema prisma/schema.prisma
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:150:- [INFO] docs/prompts/021-growth-analytics-and-feedback-dashboard.prompt.md:40:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:151:- [INFO] docs/prompts/005-final-full-repo-production-readiness.prompt.md:61:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:152:- [INFO] docs/prompts/005-final-full-repo-production-readiness.prompt.md:73:- Use prisma migrate deploy, not prisma migrate dev, on production.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:153:- [INFO] docs/prompts/005-final-full-repo-production-readiness.prompt.md:260:npx prisma migrate deploy --schema prisma/schema.prisma
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:154:- [INFO] docs/prompts/014-full-ux-ui-redesign.prompt.md:24:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:155:- [INFO] docs/prompts/033-shopee-affiliate-automation-safe-ingestion.prompt.md:89:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:156:- [INFO] docs/prompts/036-shopee-affiliate-persist-social-drafts.prompt.md:61:- Do not run `npm audit fix --force`.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:157:- [INFO] docs/prompts/036-shopee-affiliate-persist-social-drafts.prompt.md:154:Use `npx prisma migrate deploy --schema prisma/schema.prisma` in production only.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:158:- [INFO] docs/prompts/018-official-shopee-open-api-integration.prompt.md:48:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:159:- [INFO] docs/prompts/018-official-shopee-open-api-integration.prompt.md:50:- Use prisma migrate deploy, not prisma migrate dev, on production.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:160:- [INFO] docs/prompts/zsp-aitool-full-source-en.md:46:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:161:- [INFO] docs/prompts/zsp-aitool-full-source-en.md:48:- Use prisma migrate deploy, not prisma migrate dev, on production.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:162:- [INFO] docs/prompts/zsp-aitool-full-source-en.md:215:- production migration warning: use prisma migrate deploy only on production
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:163:- [INFO] docs/prompts/zsp-aitool-full-source-en.md:502:npx prisma migrate deploy --schema prisma/schema.prisma
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:164:- [INFO] docs/prompts/019-full-ux-ui-final-release-day-night-system.prompt.md:48:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:165:- [INFO] docs/prompts/019-full-ux-ui-final-release-day-night-system.prompt.md:63:- Use prisma migrate deploy, not prisma migrate dev, on production.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:166:- [INFO] docs/prompts/029-security-compliance-and-abuse-prevention.prompt.md:36:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:167:- [INFO] docs/hyperframes-render-worker.md:119:sudo systemctl enable zsp-hyperframes-worker
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:168:- [INFO] docs/hyperframes-render-worker.md:120:sudo systemctl start zsp-hyperframes-worker
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:169:- [INFO] docs/hyperframes-render-worker.md:139:sudo systemctl stop zsp-hyperframes-worker
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:170:- [INFO] docs/hyperframes-render-worker.md:140:sudo systemctl disable zsp-hyperframes-worker
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:171:- [INFO] docs/hyperframes-render-worker.md:206:- When `HYPERFRAMES_RENDER_ENABLED=true`, the script calls `systemctl start`, sleeps for the trial window, requires the service to remain active, then stops the service.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:172:- [INFO] docs/hyperframes-render-worker.md:210:- The script does not call `systemctl enable` and does not modify `.env`.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:173:- [INFO] docs/hyperframes-render-worker.md:223:sudo systemctl stop zsp-hyperframes-worker
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:174:- [INFO] docs/hyperframes-render-worker.md:224:sudo systemctl disable zsp-hyperframes-worker
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:175:- [INFO] docs/hyperframes-render-worker.md:246:- No `systemctl enable` calls.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:176:- [INFO] docs/hyperframes-render-worker.md:283:4. Runs `systemctl daemon-reload` and `systemctl start`.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:177:- [INFO] docs/hyperframes-render-worker.md:299:sudo systemctl stop zsp-hyperframes-worker || true
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:178:- [INFO] docs/hyperframes-render-worker.md:353:sudo systemctl stop zsp-hyperframes-worker
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:179:- [INFO] docs/hyperframes-render-worker.md:354:sudo systemctl disable zsp-hyperframes-worker
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:180:- [INFO] docs/production-readiness-checklist.md:127:- [ ] **Required before launch**: ใช้ `prisma migrate deploy` ในขั้น deploy production
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:181:- [INFO] docs/runbooks/production-deployment-checklist.md:29:npx prisma migrate deploy --schema prisma/schema.prisma
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:182:- [INFO] docs/runbooks/production-backup-restore.md:9:- production migration ใช้ `npx prisma migrate deploy --schema prisma/schema.prisma` เท่านั้น
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:183:- [INFO] docs/runbooks/production-backup-restore.md:62:npx prisma migrate deploy --schema prisma/schema.prisma
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:184:- [INFO] docs/runbooks/production-launch.md:44:npx prisma migrate deploy --schema prisma/schema.prisma
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:185:- [INFO] docs/runbooks/production-launch.md:61:sudo systemctl stop zsp-hyperframes-worker && sudo systemctl disable zsp-hyperframes-worker
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:186:- [INFO] docs/runbooks/production-db-drift.md:46:npx prisma migrate deploy --schema prisma/schema.prisma
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:187:- [INFO] docs/runbooks/security-compliance-abuse-prevention.md:22:- no direct `systemctl start|stop|restart|enable|disable` controls in UI
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:188:- [INFO] docs/runbooks/enterprise-readiness-scale-plan.md:43:- Scripted health checks and production-safe migration workflow (`prisma migrate deploy` guidance).
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:189:- [INFO] docs/runbooks/release-checklist.md:32:npx prisma migrate deploy --schema prisma/schema.prisma
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:192:./.gemini/commands/admin-phase.toml:16:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:193:./.gemini/commands/hyperframes-phase.toml:18:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:194:./AGENTS.md:16:- Do not run npm audit fix --force.
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:195:./README.md:206:npx prisma migrate deploy --schema prisma/schema.prisma
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:196:./GEMINI.md:107:npm audit fix --force
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:197:./GEMINI.md:111:rm -rf /
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:198:./GEMINI.md:112:sudo systemctl start ...
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:199:./GEMINI.md:113:sudo systemctl stop ...
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:200:./GEMINI.md:114:sudo systemctl enable ...
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:201:./GEMINI.md:115:sudo systemctl disable ...
./.zagents/reports/ZSP_DEEP_DIVE_REPORT-20260522-110549.md:202:./GEMINI.md:116:terraform apply
- OK: no obvious dangerous command patterns found elsewhere

## 8. UI Phase 1 files
- OK: src/components/layout/AppLayout.tsx
- OK: src/components/layout/Sidebar.tsx
- OK: src/components/layout/Header.tsx
- OK: src/components/layout/MobileNav.tsx
- OK: src/app/dashboard/page.tsx

## 9. UI Phase 2 Admin routes
- OK: src/app/dashboard/admin/page.tsx
- OK: src/app/dashboard/admin/users/page.tsx
- OK: src/app/dashboard/admin/products/page.tsx
- OK: src/app/dashboard/admin/content/page.tsx
- OK: src/app/dashboard/admin/renders/page.tsx
- OK: src/app/dashboard/admin/system/page.tsx
- OK: src/app/dashboard/admin/audit-logs/page.tsx
- OK: src/app/dashboard/admin/settings/page.tsx

## 10. UI Phase 3 HyperFrames routes
- OK: src/app/dashboard/hyperframes/page.tsx
- OK: src/app/dashboard/hyperframes/renders/page.tsx
- OK: src/app/dashboard/hyperframes/batch/page.tsx
- OK: src/app/dashboard/hyperframes/ops/page.tsx
- OK: src/app/dashboard/hyperframes/ops/queue/page.tsx

## 11. Dashboard route tree
```text
src/app/dashboard/admin/analytics/page.tsx
src/app/dashboard/admin/audit-logs/page.tsx
src/app/dashboard/admin/backend-monitor/page.tsx
src/app/dashboard/admin/content/page.tsx
src/app/dashboard/admin/observability/page.tsx
src/app/dashboard/admin/page.tsx
src/app/dashboard/admin/products/page.tsx
src/app/dashboard/admin/renders/page.tsx
src/app/dashboard/admin/settings/page.tsx
src/app/dashboard/admin/system/page.tsx
src/app/dashboard/admin/users/page.tsx
src/app/dashboard/content-history/page.tsx
src/app/dashboard/export-center/page.tsx
src/app/dashboard/generator/page.tsx
src/app/dashboard/hyperframes/batch/page.tsx
src/app/dashboard/hyperframes/ops/page.tsx
src/app/dashboard/hyperframes/ops/queue/page.tsx
src/app/dashboard/hyperframes/page.tsx
src/app/dashboard/hyperframes/renders/page.tsx
src/app/dashboard/ocr/page.tsx
src/app/dashboard/page.tsx
src/app/dashboard/products/deduplication/page.tsx
src/app/dashboard/products/[id]/page.tsx
src/app/dashboard/products/[id]/similar/page.tsx
src/app/dashboard/products/new/page.tsx
src/app/dashboard/products/page.tsx
src/app/dashboard/settings/page.tsx
src/app/dashboard/shopee-affiliate/page.tsx
src/app/dashboard/similar/page.tsx
src/app/dashboard/templates/page.tsx
```

## 12. Root clutter
```text
AGENTS.md
CLAUDE.md
CONTRIBUTING.md
docker-compose.yml
Dockerfile
ECC_REVIEW_REPORT.md
.editorconfig
.env
.env.example
.eslintignore
.eslintrc.json
.faf
GEMINI.md
.gitignore
LICENSE
next.config.js
next.config.ts
next-env.d.ts
package.json
package-lock.json
postcss.config.js
README.md
SECURITY.md
skills-lock.json
start.sh
start.sh.bak.20260522-103151
tailwind.config.ts
tsconfig.json
tsconfig.typecheck.json
tsconfig.typecheck.tsbuildinfo
vitest.config.ts
zsp-agent-status.sh
ZSP_DEEP_DIVE_REPORT.md
zsp-deep-dive.sh
```

## 13. Recommended next action
- Next: run full validation and production smoke review.

## 3. Checklist Verification
- OK: docs/runbooks/zsp-release-smoke-checklist.md exists
