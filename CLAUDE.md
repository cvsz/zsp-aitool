# CLAUDE.md — zsp-aitool / ShopeeLeaz / Studio

Assist with cvsz/zsp-aitool.

Runtime:
- Local: http://127.0.0.1:3001
- Public: https://studio.zeaz.dev
- Cloudflare 403 challenge is WARN only. Do not bypass.

Hard constraints:
- Do not change port 3001 or Cloudflare/DNS/tunnel/systemd without explicit approval.
- Do not expose DATABASE_URL, secrets, tokens, /var/lib, outputPath, internal render paths, or stack traces.
- Do not use dangerouslySetInnerHTML for user-controlled content.
- Do not add UI controls that run systemctl.
- Do not run npm audit fix --force.
- Do not upgrade Next.js or Prisma major versions without approval.

Active goal: UI Phase 2 — Admin Panel Foundation.

Validation:
python3 -m json.tool package.json
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health

ECC selected assets may be used as reference only from .agents/ecc-selected. Do not load all ECC.
