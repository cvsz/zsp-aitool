# Architecture

## Overview

`ZSP AI Tool` is an AI-native tooling repository for persistent context, project prompt packs, and automation scaffolds.

## Context

ZSP AI Tool is an AI-native workspace for structured prompt packs, persistent project context, automation scaffolds, and full-stack app generation workflows.

## High-Level Structure

```text
zsp-aitool/
  .github/
  docs/
    prompts/
  README.md
  AGENTS.md
  .faf
```

## Design Principles

- Keep architecture simple and explicit.
- Prefer modular boundaries.
- Document key decisions.
- Make changes reviewable and reversible.
- Keep prompt-driven development aligned with implementation.

## Components

| Component | Responsibility |
|---|---|
| .faf | Persistent AI project context |
| AGENTS.md | Coding-agent operating instructions |
| docs/prompts | Project prompt pack and generation workflows |
| docs | Architecture, roadmap, and operational notes |
| CI | Validation and automation |

## Prompt-Driven Development Flow

1. Read `.faf`.
2. Read `AGENTS.md`.
3. Select a prompt from `docs/prompts/`.
4. Generate or modify a focused module.
5. Validate imports, types, tests, and documentation.
6. Commit with a conventional commit message.

