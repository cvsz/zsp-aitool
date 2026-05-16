# Agent Instructions for ZSP AI Tool

## Operating Mode

You are working inside the `ZSP AI Tool` repository.

Before making changes, read:

1. `.faf`
2. `README.md`
3. `docs/architecture.md`
4. `docs/prompts/README.md`
5. The relevant prompt file under `docs/prompts/`

## Engineering Rules

- Keep changes small, reviewable, and consistent with the repository architecture.
- Create missing files when a prompt requires them.
- Modify existing files only when needed.
- Do not remove working code unless necessary.
- Keep documentation synchronized with implementation.
- Use conventional commits.
- Summarize changed files after editing.

## Prompt Pack Usage

The project prompt pack is stored under `docs/prompts/`.

Use the step-by-step prompt sequence for controlled module generation.
Use the full-source prompt pack for one-shot planning or completeness validation.

## Completion Checklist

Before finalizing any change, verify:

- Required files exist.
- Imports are valid.
- Types are consistent.
- Documentation reflects the code.
- CI-relevant files remain valid.
- No local-only files are included.

