# Enterprise Readiness and Scale Plan (Phase 030)

Updated: 2026-05-20

## Scope and goal

This runbook documents the current enterprise readiness posture for **zsp-aitool** and provides a controlled scale-up plan without broad rewrites. It focuses on architecture, security, data lifecycle, operations, and release safety while preserving current guardrails:

- no breaking schema change in this phase,
- no weakening of auth/tenant/org controls,
- no HyperFrames safety regression,
- no production port/Cloudflare route change,
- no new external service unless config-gated.

---

## 1) Current architecture inventory

### Application and API surface
- Next.js App Router application with user dashboard, admin/operator surfaces, and API routes under `src/app/api`.
- Zod-backed request validation through route/service boundaries.
- Thai-first UI posture in dashboard flows.

### Data and persistence
- PostgreSQL with Prisma ORM (`prisma/schema.prisma`) covering users, org membership/RBAC, products, content generation, OCR jobs, HyperFrames render jobs, social export audit records, and feedback entities.
- Deterministic Prisma generation/validation scripts and schema drift checks.

### HyperFrames render subsystem
- Queue-backed render worker (`scripts/hyperframes/render-worker.ts`) with staged enablement.
- Guardrails documented: retry/backoff, stale job handling, pending/running caps, disk checks, safe output handling, dry-run cleanup defaults.
- Operator scripts: queue status, watchdog, cleanup, stale recovery, and health preflights.

### Browser extension and Shopee foundation
- Manifest V3 extension workspace under `extension/` for user-confirmed product collection.
- Shopee Open API foundation and runbooks present; policy boundaries restrict scraping bypass and undocumented endpoint usage.

### Admin/RBAC and operator posture
- Org roles (`VIEWER`, `EDITOR`, `ADMIN`) in Prisma model and app-level org-scoped flows.
- Admin/operator dashboards and controls tested with static and route-level security coverage.

### Runbooks, docs, and release operations
- Existing runbooks for release checklist, production launch, incident response, backup/restore, HyperFrames remediation, growth/onboarding, and DB drift.
- Scripted health checks and production-safe migration workflow (`prisma migrate deploy` guidance).

### Test and quality gates
- Strong Vitest coverage including auth middleware, tenant isolation, HyperFrames security, Shopee API config behavior, backup script checks, and runbook static coverage.
- Build/typecheck/health and HyperFrames operations checks wired in package scripts.

---

## 2) Enterprise readiness matrix

| Domain | Current status | Evidence in repo | Gaps / risks | Phase-031+ recommendation |
|---|---|---|---|---|
| Auth/session safety | **PARTIAL+** (good route gating, needs stronger session hardening SLOs) | Auth middleware tests; protected API patterns | Session expiry/rotation policy is not centrally documented with SLO and alert thresholds | Add auth/session SLO doc + security regression tests for idle/absolute timeout behavior |
| Tenant/org isolation | **GOOD** | Org role models, tenant isolation tests, org-scope render tests | Need periodic policy audit cadence to prevent future route drift | Add quarterly access review checklist and CI policy assertion snapshot |
| Admin/RBAC posture | **PARTIAL+** | Org roles in schema, admin/operator route tests and UI static checks | Fine-grained action auditability for admin changes can be expanded | Add admin action matrix + deny-by-default checklist and tests for privilege escalation attempts |
| Audit logs | **PARTIAL** | HyperFrames social export audit entities, operator-oriented history surfaces | No single normalized cross-domain audit taxonomy/runbook | Add unified audit event schema/versioning doc and retention controls |
| Privacy/data lifecycle | **PARTIAL+** | Soft-delete fields across major models, privacy/compliance docs | Data retention/deletion timelines not yet centralized by data class | Publish retention matrix + DSAR/export/delete operational playbook |
| Backup/restore | **GOOD-** | Backup/restore runbook + static tests, release checks | Recovery time objective (RTO) and recovery point objective (RPO) targets not explicitly versioned | Add RTO/RPO targets and quarterly restore drill sign-off template |
| Schema migration safety | **GOOD** | Prisma validate/generate, production-safe migrate deploy guidance, drift checks | Expand rollback simulation for multi-step migrations | Add migration rollout tiers (canary, hold, rollback) with sample checklists |
| Queue/worker operations | **GOOD-** | Worker docs, queue status/watchdog scripts, retry/backoff/stale recovery controls | Need explicit error budget and saturation alert thresholds | Define queue SLO (latency/failure) and paging triggers |
| HyperFrames storage/cleanup | **GOOD** | Cleanup dry-run defaults, path safety requirements, output safety checks | Add formal storage lifecycle budget (hot/warm/archive/delete) | Add storage budget policy + cleanup KPI dashboard definition |
| Observability | **PARTIAL** | Health script, watchdog checks, operational runbooks | No consolidated metrics catalog and owner map across web/API/worker | Add observability catalog (golden signals, metric owners, alert routing) |
| Incident response | **PARTIAL+** | Incident response runbook exists | Need severity rubric + communication templates per tenant impact | Add severity matrix and customer comm templates (Thai + English ops) |
| Support/onboarding | **PARTIAL+** | Onboarding/activation and feedback runbooks | Need enterprise support escalation ladder and SLA tiers | Add support policy matrix with first-response/resolve targets |
| Billing/quota readiness | **PARTIAL** | HyperFrames quota and billing-gate tests present | Missing documented billing ops lifecycle (grace, suspension, recovery) | Add quota/billing lifecycle runbook with reconciliation checks |
| Shopee API compliance | **GOOD-** | Shopee Open API config tests + integration runbooks + policy docs | Need periodic compliance attestation workflow | Add monthly compliance review checklist and extension permission recertification |

Legend:
- **GOOD** = production-ready baseline in place with evidence.
- **GOOD- / PARTIAL+** = mostly ready but needs formalization and SLO/audit depth.
- **PARTIAL** = implemented pieces exist but enterprise operating model incomplete.

---

## 3) Data lifecycle and compliance guardrails (no-code policy baseline)

1. **Classification**: define data classes (identity, content, media artifacts, operational logs, billing records).
2. **Retention**: assign retention windows per class and legal basis; default to minimization.
3. **Deletion**: standardize soft-delete and hard-delete escalation with auditable approvals.
4. **Exportability**: maintain user-scoped export pathways (CSV/TXT/Markdown where applicable).
5. **Sensitive output controls**: preserve existing restriction against exposing `outputPath`, `/var/lib`, stack traces, or secrets in user-facing channels.

---

## 4) Enterprise operations checklist additions

For each release candidate:

1. Verify auth and tenant regression suite passes.
2. Verify backup snapshot and restore validation status is current.
3. Verify Prisma drift/migration checks pass in CI and staging.
4. Verify HyperFrames queue status and watchdog posture are healthy.
5. Verify incident contacts and runbook links are current.
6. Verify Shopee API compliance checklist is completed.

---

## 5) Milestone backlog proposal (031+)

### Phase 031 — Observability and SLO baseline
- Deliver consolidated metrics catalog for web/API/worker.
- Define SLOs: auth availability, render queue latency, error-rate budgets.
- Add alert severity mapping and owner routing.

### Phase 032 — Audit and compliance hardening
- Unified audit event taxonomy + schema versioning.
- Central retention policy document and DSAR workflow.
- Monthly Shopee compliance attestation process.

### Phase 033 — Data lifecycle and restore drills
- Formal RTO/RPO objectives.
- Scheduled backup/restore drills with evidence capture.
- Migration rollback simulation checklist for complex releases.

### Phase 034 — Support and enterprise operations
- Support tiers and SLA policy.
- Escalation ladder and customer communication templates.
- Operator readiness dashboard for release-go/no-go.

### Phase 035 — Billing/quota operational maturity
- Quota lifecycle runbook (warning, grace, enforce, recover).
- Billing reconciliation and anomaly checks.
- Enterprise plan controls with config-gated rollout.

---

## 6) Non-goals for Phase 030

- No major schema redesign.
- No queue engine rewrite.
- No external observability vendor lock-in during this phase.
- No production networking or Cloudflare route changes.

