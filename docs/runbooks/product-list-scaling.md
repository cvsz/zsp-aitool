# Product List Scaling Runbook

`PRODUCT_LIST_SCALING_CONFIGURED=true`

## API Query Parameters
- `page` (default `1`)
- `pageSize` (default `25`, max `100`)
- `q` (searches title, shopName, category, originalUrl)
- `category`
- `shopName`
- `source` (from `rawMetadata.source`)
- `hasAffiliateUrl` (`true`/`false`)
- `sortBy` (`createdAt` | `title` | `price`)
- `sortDir` (`asc` | `desc`)

## Response Shape
`/api/products` returns paginated data with `items`, `pagination`, and `filters`.

## Index Rationale
Added user-scoped indexes for frequent filters and sorting paths:
- `(userId, createdAt, id)` for stable paginated sorting
- `(userId, shopName)` for shop filtering
- `(userId, affiliateUrl)` for affiliate presence checks

## Dashboard Behavior
- Server-driven pagination only (no unbounded in-memory product rendering)
- Search/filter/sort controls map to URL query params
- Loading/empty/error states are explicit
- Product count summary shown from API pagination metadata

## Operational Guidance for Large Imports
- Keep page size at 25 or 50 for day-to-day use
- Use 100 only for narrow filters
- Prefer filtering by `source`, `shopName`, and `category` for million-row feeds
- Do not add unbounded `findMany` product queries in routes/services
