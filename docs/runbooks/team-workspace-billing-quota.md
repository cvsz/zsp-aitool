# Team Workspace, Billing, and Quota Runbook

## Scope
This runbook documents currently supported usage, quota, and plan visibility for `zsp-aitool` without enabling real payment capture.

## Current model inventory
- User plan tier is stored on `User.planTier` (`FREE`, `PRO`, `TEAM`, `ENTERPRISE`).
- Team/workspace membership and role isolation are enforced by `OrgMembership` and `OrgRole` (`VIEWER`, `EDITOR`, `ADMIN`).
- HyperFrames quota and plan gates are enforced by `enforceRenderLimits` and `HyperFramesQuotaService` before enqueue/retry.
- API usage exports are counted through `APIUsageLog` with `endpoint` namespace prefixes.

## User-facing visibility
- `/dashboard/settings` loads `/api/usage/summary`.
- It displays aggregate-only cards for:
  - AI generations
  - Products
  - Exports
  - OCR jobs
  - HyperFrames renders
  - HyperFrames storage used / quota
  - HyperFrames monthly remaining quota
- It also shows workspace membership count and explicit note that no real payment capture is enabled on this surface.

## Admin visibility (aggregate only)
- Admin analytics shows aggregate counts for:
  - total users/products/AI generations
  - exports actions
  - HyperFrames attempts and completions
- No raw content, render output paths, secret tokens, or private payload fields are exposed.

## Security and isolation expectations
- Every usage API must be authenticated with `withAuth`.
- Org-scoped resources require membership validation and role checks.
- Cross-org/cross-user access should return controlled denial (`404` where appropriate).
- Never expose `outputPath`, `/var/lib`, keys, tokens, or filesystem internals.

## Explicit non-goals
- No credit-card collection.
- No third-party billing provider checkout flow in this phase.
- No unsupported claims about automated invoicing/subscriptions.
