# `.zagents` — zsp-aitool Agent Control Pack

Target repository:
- `cvsz/zsp-aitool`
- local path: `~/zsp-aitool`
- local origin: `http://127.0.0.1:3001`
- public edge: `https://studio.zeaz.dev`

This folder is the local agent control layer for Antigravity/agy, Gemini CLI compatibility notes, Codex, Claude Code, ECC safety, full repo deep review, and `.zagents` integrity review.

## Required tree

```text
.zagents/
├── CHECKSUMS.sha256
├── GEMINI_CLI_COMMANDS.txt
├── README.md
├── README-omnibus.md
├── scripts
│   ├── zsp-agent-status.sh
│   └── zsp-deep-dive.sh
├── zsp-agent-omnibus-oneclick.sh
└── zsp-omnibus-init-safe.sh
```

## Refresh

```bash
cd ~/zsp-aitool
chmod +x .zagents/zsp-omnibus-init-safe.sh .zagents/zsp-agent-omnibus-oneclick.sh .zagents/scripts/*.sh
.zagents/zsp-omnibus-init-safe.sh
```

## Deep review

```bash
cd ~/zsp-aitool
.zagents/scripts/zsp-agent-status.sh
.zagents/scripts/zsp-deep-dive.sh
```

Reports are written to `.zagents/reports/`.

## First agy prompt

```text
Read GEMINI.md, AGENTS.md, CLAUDE.md, .zagents/README.md, and .zagents/README-omnibus.md.
Inspect current repo state only. Do not edit files.
Return: current repo state, agent config state, missing files/routes, safety risks, exact next action.
```

## Safety policy

This pack does not intentionally run production migrations, change Cloudflare/DNS/tunnel/systemd, expose secrets, execute ECC scripts automatically, bypass Cloudflare Challenge, bypass Shopee CAPTCHA/login/anti-bot protections, perform destructive cleanup, or auto-commit/auto-push.
