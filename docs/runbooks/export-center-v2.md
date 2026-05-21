# Export Center v2 Runbook

Export Center v2 provides authenticated, user-scoped exports for Products, Affiliate Links, Shopee social drafts, and Content History.

## Endpoints

- `GET /api/export/v2/products`
- `GET /api/export/v2/affiliate-links`
- `GET /api/export/v2/social-drafts`
- `GET /api/export/v2/content-history`
- `POST /api/export/v2/jobs`
- `GET /api/export/v2/jobs`
- `GET /api/export/v2/jobs/[id]`
- `GET /api/export/v2/jobs/[id]/download`

## Security

- Requires auth via `withAuth`.
- Scoped by `userId`.
- CSV formula cells are escaped by shared CSV utility.
- Internal job `outputPath` is never exposed.
