# 050 — CI/CD Hardening Prompt

Use this prompt in Codex Cloud for `cvsz/zsp-aitool` after the core product/import/monitoring features are stable.

```text
You are working on cvsz/zsp-aitool.

Phase:
050 — CI/CD Hardening.

Priority:
Critical for reliable releases. The repository needs GitHub Actions, required checks, deployment safety, branch protection guidance, and a production release checklist.

Primary objective:
Add a production-ready CI/CD hardening pack that validates code quality, typecheck, tests, Prisma schema, security/static checks, build, and deployment readiness before merge/release.

Hard constraints:
- Do not commit secrets.
- Do not print secrets in CI logs.
- Do not run destructive DB commands in CI.
- Do not deploy automatically to production unless explicitly configured and gated.
- Do not require unavailable secrets for PR validation.
- Keep CI deterministic and reasonably fast.
- Do not remove existing scripts or weaken test coverage.

Review first:
- package.json
- start.sh
- README.md
- AGENTS.md
- .github/** if present
- prisma/schema.prisma
- scripts/**
- tests/**
- docs/runbooks/**

Required work:
1. GitHub Actions workflows
Create/update:
```text
.github/workflows/ci.yml
.github/workflows/security.yml
.github/workflows/build.yml
.github/workflows/release-check.yml
```

CI should run on PR and main push:
- checkout.
- setup Node.
- npm ci.
- package.json JSON validation.
- npm run prisma:generate.
- npx prisma validate.
- npm run typecheck.
- npm run test.
- npm run build.

Security workflow:
- grep/static scans for secrets/path leakage.
- npm audit non-force with allowed policy, or document why warnings are non-blocking.
- check no .env committed.
- check no generated backup/secret files committed.

Release-check workflow:
- verify start.sh markers statically.
- verify runbooks/prompts exist.
- verify package scripts exist.
- optional artifact upload for test/build logs.

2. Branch protection docs
Create:
```text
docs/runbooks/github-branch-protection.md
```

Include recommended required checks:
- ci / typecheck.
- ci / tests.
- ci / build.
- security / static scan.
- release-check.
- require PR review before merge.
- disallow force push to main.
- require linear history if desired.
- require signed commits if organization policy supports it.

3. Deployment checklist
Create/update:
```text
docs/runbooks/production-deployment-checklist.md
```

Include:
- preflight.
- backup.
- git status.
- pull/rebase.
- npm ci.
- Prisma generate/validate/migrate deploy/status.
- typecheck/test/build.
- systemd restart/status.
- health.
- route smoke.
- rollback steps.
- log checks.

4. Local preflight script
Create/update:
```text
scripts/ci/local-preflight.sh
```

Runs:
- package JSON validation.
- npm run prisma:generate.
- npx prisma validate.
- npm run typecheck.
- npm run test.
- npm run build.

Add npm script:
```json
"ci:local-preflight": "bash scripts/ci/local-preflight.sh"
```

5. Tests/static validation
Add tests:
```text
tests/scripts/github-actions-static.test.ts
tests/docs/branch-protection-runbook-static.test.ts
tests/docs/deployment-checklist-static.test.ts
tests/security/ci-secret-scan-static.test.ts
```

Coverage:
- workflows exist.
- workflows run typecheck/test/build.
- no workflow prints env wholesale.
- no destructive DB reset commands.
- branch protection runbook lists required checks.
- deployment checklist includes backup/rollback.
- local-preflight script exists and is executable.

6. start.sh marker
Add source checks and final marker:
```text
CICD_HARDENING_CONFIGURED=true
```

Verification commands:
```bash
git status --short
python3 -m json.tool package.json >/tmp/package-json-ok.json
bash scripts/ci/local-preflight.sh
npm run typecheck
npm run test
npm run build
bash start.sh
```

Final response format:
1. Overall verdict
- PASS / WARN / FAIL
- CICD_HARDENING_READY=true/false
- READY_FOR_RELEASE=true/false

2. Summary
3. Files reviewed
4. Files changed
5. Workflow behavior
6. Branch protection guidance
7. Deployment checklist
8. Security behavior
9. Commands run
10. Blocking issues
11. Remaining risks
12. Commit hash
13. PR status

Final line:
CICD_HARDENING_READY=true or CICD_HARDENING_READY=false
```
