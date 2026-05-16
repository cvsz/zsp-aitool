# Architecture

## Overview

`ZSP AI Tool` is a ZeaZDev ai-tooling repository.

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
| Core | Main project logic |
| Docs | Architecture, roadmap, prompt pack, and operational notes |
| Prompt Pack | AI coding instructions and project-generation workflows |
| CI | Validation and automation |

## Prompt-Driven Development Flow

1. Read `.faf`.
2. Read `AGENTS.md`.
3. Select a prompt from `docs/prompts/`.
4. Generate or modify a focused module.
5. Validate imports, types, tests, and documentation.
6. Commit with a conventional commit message.

