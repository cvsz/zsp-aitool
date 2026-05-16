# ZSP AI Tool

ZSP AI Tool is an AI-native workspace for structured prompt packs, persistent project context, automation scaffolds, and full-stack app generation workflows.

## Quick Start

```bash
git clone git@github.com:cvsz/zsp-aitool.git
cd zsp-aitool
npm install
npm run typecheck
npm run test
npm run build
```

## Project-Specific Setup

```bash
# 1) Install dependencies
npm install

# 2) Validate architecture-aligned prompt docs before coding
npm run typecheck

# 3) Run module tests for import logic and shared utilities
npm run test

# 4) Build distributable TypeScript output
npm run build
```

## Repository Contents

- Persistent project context with `.faf`
- Agent instructions in `AGENTS.md`
- Full prompt pack under `docs/prompts/`
- Architecture and roadmap documentation
- TypeScript source modules under `src/`
- Vitest test suite under `tests/`

## Documentation

- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Prompt Pack](docs/prompts/README.md)
- [Security Policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)
