# Shopee Open API Integration Runbook (Foundation Only)

## Scope
This runbook covers **optional, disabled-by-default** Shopee Open API foundation setup for `zsp-aitool`.

## Eligibility notes (from July 2022 guide)
- Thailand Open API eligibility includes Mall sellers, non-mall managed sellers with KAM, and third-party partner platforms.
- OpenAPI onboarding is ongoing maintenance, not one-time setup.

## Developer account warning
Shopee Open Platform developer account is different from marketplace seller account. Never store seller or developer passwords in this app.

## Sandbox / test-stable flow
1. Register developer account
2. Shopee profile audit
3. Create app
4. Obtain credentials (+ optional webhook)
5. Test in sandbox/test-stable
6. Request Go-Live and obtain live partner credentials

## Environment variables
- `SHOPEE_OPEN_API_ENABLED=false`
- `SHOPEE_OPEN_API_ENV=sandbox|live`
- `SHOPEE_PARTNER_ID`
- `SHOPEE_PARTNER_KEY`
- `SHOPEE_API_BASE_URL`
- `SHOPEE_AUTH_BASE_URL`
- `SHOPEE_REDIRECT_URL`
- `SHOPEE_WEBHOOK_SECRET`

## Credential handling policy
- Keep partner key/webhook secret in environment/secret manager only.
- Do not persist partner key/client secret in database.
- Do not expose access/refresh tokens, partner key, or webhook secret in UI/API/logs.

## User review-before-save policy
Any official API import remains review-first: user must review/edit product fields before final save.

## Unsupported actions
- CAPTCHA bypass
- login wall bypass
- anti-bot bypass
- private/undocumented endpoint use
- mass scraping automation

## Troubleshooting checklist
- Confirm feature flag is intentionally enabled.
- Validate required env vars only when enabled.
- Verify sandbox base URLs and redirect URL.
- Check status API for `setupRequired` / `docsRequired` flags.

## Documentation gap before full implementation
Endpoint-level official Shopee Open Platform v2.0 docs are required for:
- exact auth URL format
- callback verification/signing details
- request/response schemas for product/order endpoints
- signature construction algorithm and per-endpoint parameters
