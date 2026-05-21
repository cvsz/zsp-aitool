# Shopee Social Drafts DB Runbook

SHOPEE_SOCIAL_DRAFTS_DB_FINAL_CONFIGURED=true

- Drafts are persisted in `ShopeeAffiliateSocialDraft`.
- Version history is stored in `ShopeeAffiliateSocialDraftVersion`.
- Draft API is user-scoped and requires auth.
- Copy action only updates status and copiedAt; no external social publish call is made.
