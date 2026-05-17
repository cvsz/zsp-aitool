# Release Notes - 2026-05-17

## Scope

Stabilization pass for production-readiness baseline.

## Changes

- Updated project status to reflect real full-stack state.
- Added API-level brute-force/rate-limit controls for auth.
- Added usage quota guards for AI/OCR endpoints.
- Expanded CI pipeline with Node setup, dependency install, Prisma flow validation, lint/typecheck/test/build.
- Added compliance + extension permission review document.

## Verification Results

- lint: not executed in this environment (dependency install blocked by registry policy)
- typecheck: not executed in this environment (dependency install blocked by registry policy)
- test: not executed in this environment (dependency install blocked by registry policy)
- build: not executed in this environment (dependency install blocked by registry policy)

## Notes

- Auth and usage limits are currently in-memory and should move to shared persistent storage for horizontal scaling.
- Daily budget enforcement requires persisted usage accounting in a follow-up change.
