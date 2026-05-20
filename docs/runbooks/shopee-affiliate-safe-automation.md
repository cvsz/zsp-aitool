# Shopee Affiliate Safe Automation Runbook

## Automation levels
- Manual link paste (user initiated)
- CSV/report upload preview (user initiated)
- Extension capture (explicit click initiated)
- Optional local folder import watch (operator enabled, default disabled)
- Future Open API scheduled sync (official credentials/documentation required)

## Safe manual link pipeline
1. User opens `https://affiliate.shopee.co.th/` manually.
2. User pastes affiliate/product link into zsp-aitool.
3. Server validates HTTPS + allowlisted Shopee hosts only.
4. Server creates `pending_review` draft payload and returns review response.
5. Save/import happens only after explicit user approval flow.

## Safe CSV/report pipeline
1. User exports report from Shopee Affiliate portal.
2. User uploads CSV to preview endpoint.
3. Server validates size/row limits and UTF-8 parse.
4. Server rejects rows containing formula-like prefixes (`=`, `+`, `-`, `@`, tab, carriage return).
5. Server returns preview, rejected row indexes, and pending review counts.

## Optional local folder watcher policy
- Disabled by default.
- Env gates:
  - `SHOPEE_AFFILIATE_IMPORT_WATCH_ENABLED=false`
  - `SHOPEE_AFFILIATE_IMPORT_DIR=storage/imports/shopee-affiliate`
- Folder path must remain inside app-controlled storage.
- Never accept browser profile exports, cookies, passwords, or sessions.
- Move files into review/archive/error folders after processing.

## Extension capture policy
- Trigger only from explicit user click.
- No cookies/session/password/localStorage capture.
- No background scraping.
- Payload is validated with same URL safety policy as manual paste.

## Open API future sync path
- Keep Open API auth flow separate from Affiliate Portal login.
- No fake OAuth, no token conversion from browser sessions.
- Enable scheduled sync only when official partner credentials and docs are available.

## Forbidden automation
- Automated portal login.
- Private dashboard scraping.
- Private/undocumented endpoint calls.
- CAPTCHA/login-wall bypass.
- Mass scraping or bulk covert extraction.

## Troubleshooting
- URL rejected: verify HTTPS and Shopee host allowlist.
- CSV rejected: reduce file size/rows and remove formula prefixes.
- Auth error: verify user is logged in before import endpoints.

## Production env variables
- `SHOPEE_AFFILIATE_AUTH_URL`
- `SHOPEE_AFFILIATE_IMPORT_WATCH_ENABLED`
- `SHOPEE_AFFILIATE_IMPORT_DIR`

## Rollback notes
- Disable watcher flag.
- Revert ingestion route changes.
- Keep manual-safe portal mode and Open API separation active.
