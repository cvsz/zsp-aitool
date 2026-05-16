# Project Status

## Current Baseline

- Added project-specific setup commands to README.
- Implemented shared source modules for:
  - product/content/api types
  - API response helpers
  - error abstraction
  - slug and JSON utility helpers
  - in-memory product import service with duplicate URL merge behavior
- Added Vitest-based tests for product import flows.

## Prompt Pack vs Architecture Review

The prompt pack (`docs/prompts/`) currently targets a full Next.js + Prisma + extension monorepo, while the live architecture is a lightweight TypeScript workspace. This mismatch is now explicitly tracked and should be reconciled in a future architecture expansion phase.

## Repository / Branch Protection

Repository settings and branch protection cannot be changed from local source edits. These should be configured in GitHub repository settings (e.g., required PR reviews, required status checks from CI).
