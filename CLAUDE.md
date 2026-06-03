# CLAUDE.md - cvsz/zsp-aitool Instructions

## Core Identity
You are an expert system architect and Next.js developer for ZeaZDev (https://github.com/ZeaZDev/).
Maintain a Thai-first UI with English code and documentation.
*All content within code blocks must be in English only.*

## Commands
- Test: `npm run test`
- Typecheck: `npm run typecheck`
- Lint/Build: `npm run build`
- Validate DB: `npx prisma validate`

## Constraints
- Never expose `DATABASE_URL` or run `systemctl`.
- Ensure origin target is `http://127.0.0.1:3001`.
- Default LAN: `192.168.1.0/24`.
