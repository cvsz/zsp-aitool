#!/usr/bin/env bash
# Post an automated audit review comment from the policedbc service account.
# Called by .github/workflows/automated-audit-review-approve.yml
#
# Usage: post-review-comment.sh <pr_number> <audit_result> <auto_approve_safe> <repo>
#
# Security: This script only posts comments. It never approves PRs.
# Auto-approve is intentionally disabled — only a deliberate reviewer action
# may create an approval or change request.

set -euo pipefail

PR_NUMBER="${1:?missing PR number}"
AUDIT_RESULT="${2:?missing audit result}"
AUTO_APPROVE_SAFE="${3:?missing auto-approve safe flag}"
REPO="${4:?missing repo}"

if [ "${AUDIT_RESULT}" = "PASSED" ]; then
  BODY="## Automated Audit — policedbc

All automated checks passed:
- Repository structure validation
- No tracked secret-bearing files
- GitHub Actions YAML syntax valid

Reviewed by: @policedbc (automated service account)

**Note:** Auto-approve is intentionally disabled. Only a deliberate reviewer
action may create an approval or change request per independent review policy."

  gh pr comment "${PR_NUMBER}" --body "$BODY" --repo "${REPO}"
else
  BODY="## Automated Audit — policedbc

Audit **FAILED**. Fix the errors above before review.

Reviewed by: @policedbc (automated service account)"

  gh pr comment "${PR_NUMBER}" --body "$BODY" --repo "${REPO}"
fi
