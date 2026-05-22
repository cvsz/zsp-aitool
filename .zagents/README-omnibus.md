# README-omnibus — zsp-aitool Full Agent Suite

## Purpose

This omnibus pack standardizes local agent behavior for `zsp-aitool` and keeps operational agent scripts under `.zagents`.

It complements:
- `GEMINI.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.agents/`
- `.codex/`
- `.claude/`

## Source-of-truth order

1. `GEMINI.md`
2. `AGENTS.md`
3. `CLAUDE.md`
4. `.zagents/README.md`
5. `.zagents/README-omnibus.md`
6. `.agents/rules/*`
7. `.agents/workflows/*`

If rules conflict, use the stricter safety rule.

## Repo baseline

Expected stack: Next.js App Router, React 18, TypeScript, Prisma/PostgreSQL, Zod, Tailwind CSS, Vitest, HyperFrames scripts/workers.

Local URL: `http://127.0.0.1:3001`
Public URL: `https://studio.zeaz.dev`
Cloudflare Challenge `403` from the public URL is `WARN`, not application failure.

## Validation suite

```bash
python3 -m json.tool package.json
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health
```

Optional HyperFrames validation:

```bash
npm run hyperframes:doctor
npm run hyperframes:queue-status
npm run hyperframes:worker:watchdog
```

## ECC policy

ECC is reference-only. Do not blindly import the full ECC repository, run unknown ECC scripts, or let ECC override `GEMINI.md`, `AGENTS.md`, or `CLAUDE.md`.

## Commit recommendation

```bash
git add .zagents
git add AGENTS.md CLAUDE.md .agents .codex .claude 2>/dev/null || true
git commit -m "chore: refresh zsp agent control pack"
git push
```
