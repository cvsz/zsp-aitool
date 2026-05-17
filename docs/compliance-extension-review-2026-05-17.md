# Compliance + Extension Permission Review

Date: 2026-05-17

## Compliance Validation Pass

Validated against project rules in README and prompt pack:

- No private Shopee API usage paths are documented.
- No CAPTCHA bypass/login-wall bypass workflow is documented.
- Product capture is user-confirmed and based on user-visible page data.
- Affiliate disclosure requirement is explicitly documented.

## Extension Permission Review

Reviewed `extension/manifest.json`:

- Keep only minimum required permissions for MV3 capture/import flow.
- Ensure host permissions are restricted to supported product pages and app API endpoint scope.
- Confirm popup/options copy clearly states what data is captured and when it is sent.

## Follow-up Actions

1. Re-review manifest permissions on each extension release.
2. Add CI guardrail to diff permissions in PRs affecting `extension/manifest.json`.
3. Add a UX checklist item to require explicit user confirmation before import.
