# GitHub Branch Protection Runbook (main)

## Recommended protection rules for `main`

1. Require a pull request before merging.
2. Require at least 1 approving review.
3. Dismiss stale approvals when new commits are pushed.
4. Require status checks to pass before merge.
5. Disallow force pushes.
6. Disallow branch deletion.
7. Optionally require linear history.
8. Optionally require signed commits when organization policy supports it.

## Required status checks

Mark the following as **required**:

- `ci / validate`
- `ci / build`
- `security / static scan`
- `release-check`

These checks enforce Prisma/schema validation, typecheck, tests, build, static security scans, and release-readiness metadata checks.

## Administrative guidance

- Restrict who can push to `main`.
- Prefer merging via squash or rebase for clean history.
- Keep required checks aligned with `.github/workflows/*.yml` names.
- Re-validate branch rules after workflow renames.
