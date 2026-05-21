# Product Deduplication Engine Runbook

## Signals
- originalUrl exact match within same user
- Shopee item ID extracted from URL/raw metadata
- affiliate URL match without external expansion
- shop + normalized title + category

## Merge safety
- review-first workflow
- explicit canonical product required
- soft-delete duplicates only
- relation reassignment to canonical product
- never merge across users

## Rollback guidance
- inspect ProductDuplicateGroup and product rawMetadata.dedupeMergedInto
- restore soft-deleted products by clearing deletedAt

## Operator checklist
1. run scan endpoint
2. review groups and candidate IDs
3. choose canonical and merge
4. verify no cross-user data movement

## Limitations
- no network URL expansion
- conservative scoring can miss fuzzy near-duplicates
