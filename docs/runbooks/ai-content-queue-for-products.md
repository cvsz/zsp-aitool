# AI Content Queue for Products

This runbook covers queue-backed AI content generation from imported products.

## Safety controls
- Auth required for all queue APIs.
- Jobs are scoped by `userId` and product ownership.
- Budget is checked before enqueue and processing.
- Unsafe claims are rejected.
- Provider errors are returned as safe summaries.

## Worker
- Run once: `npm run ai:content-worker:once`
- Run daemon loop: `npm run ai:content-worker`
- Queue status: `npm run ai:content-queue-status`

## API endpoints
- `POST /api/ai/content-queue`
- `GET /api/ai/content-queue`
- `GET /api/ai/content-queue/[id]`
- `POST /api/ai/content-queue/[id]/cancel`
- `POST /api/ai/content-queue/[id]/retry`
- `POST /api/products/bulk-generate-content`

AI_CONTENT_QUEUE_CONFIGURED=true
