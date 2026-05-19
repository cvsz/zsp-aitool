# Growth Analytics and Feedback Runbook

## Scope
Privacy-safe first-party growth analytics for activation and onboarding.

## Metrics
- registered users
- products created
- first product saved conversion
- AI generations
- first AI generation conversion
- export action counts (from `APIUsageLog.endpoint` prefixed `export:`)
- HyperFrames render attempts/completions
- feedback submissions
- activation funnel summary
- recent aggregate activity by date

## Data Safety
- Aggregate-first metrics only.
- No raw prompts, private content, API keys, partner keys, tokens, filesystem paths, or stack traces.
- No external tracking SDKs.

## APIs
- `GET /api/admin/analytics` (admin panel gated)
- `POST /api/feedback` (authenticated users)

## UI
- Admin view: `/dashboard/admin/analytics`
- User CTA: dashboard feedback card.

## Verification
Run standard production-safe checks and HyperFrames queue/watchdog commands.
