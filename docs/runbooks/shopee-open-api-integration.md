# Shopee Open API Integration Runbook (Foundation)

## Scope
This runbook defines a safe, optional, disabled-by-default foundation for **official Shopee Open API only**.

## Eligibility and onboarding notes
- Thailand eligibility from guide: Mall sellers, non-mall managed sellers with KAM, and third-party partner platforms.
- OpenAPI is ongoing maintenance, not one-time setup.
- Developer account is different from Shopee seller account.
- Flow: register developer -> profile audit -> create app -> obtain credentials/webhook -> sandbox testing -> go-live request.

## Sandbox and go-live
- Start in sandbox/test-stable.
- Only move to live after Shopee approval and live partner credentials.

## Environment variables
- `SHOPEE_OPEN_API_ENABLED=false` (default)
- `SHOPEE_OPEN_API_ENV=sandbox|live`
- `SHOPEE_PARTNER_ID`
- `SHOPEE_PARTNER_KEY`
- `SHOPEE_API_BASE_URL`
- `SHOPEE_AUTH_BASE_URL`
- `SHOPEE_REDIRECT_URL`
- `SHOPEE_WEBHOOK_SECRET`

## Credential handling policy
- Never store partner key/client secret in database.
- Never log partner key, webhook secret, access token, refresh token.
- Keep credentials in runtime env/secret manager only.

## User review-before-save policy
- Imported product data must remain reviewable/editable before save.
- Existing manual/URL/extension/OCR/JSON modes stay unchanged.

## Unsupported actions
- CAPTCHA/login bypass
- anti-bot bypass
- private/undocumented endpoints
- mass scraping
- collecting private Shopee user data
- automated bulk import without explicit future approval

## Troubleshooting checklist
1. Confirm `SHOPEE_OPEN_API_ENABLED=false` in default environments.
2. If enabled, validate all required env values exist.
3. Verify status endpoint returns redacted configuration only.
4. Confirm no real network calls in unit tests.
5. Confirm no secret/token in logs/test output.

## Documentation gaps before full implementation
The current reference guide is orientation only. Add official endpoint-level docs before implementing:
- auth URL construction details and callback verification rules
- endpoint request/response schemas for products/orders
- exact signature algorithm payload composition per endpoint class
- token refresh lifecycle and error matrix
