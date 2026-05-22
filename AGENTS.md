# AGENTS.md — zsp-aitool / ShopeeLeaz / Studio

Repository: cvsz/zsp-aitool
Product: Thai-first Shopee Affiliate AI Studio / ZSP AI Tool
Local origin: http://127.0.0.1:3001
Public edge: https://studio.zeaz.dev

Cloudflare 403 challenge from studio.zeaz.dev is WARN, not application failure. Do not bypass Cloudflare Challenge.

Hard rules:
- Do not change production port 3001.
- Do not change Cloudflare, DNS, tunnel, or systemd config without explicit approval.
- Do not expose DATABASE_URL, secrets, tokens, API keys, /var/lib, outputPath, internal render paths, or raw stack traces.
- Do not use dangerouslySetInnerHTML for user-controlled content.
- Do not add frontend controls that run systemctl.
- Do not run npm audit fix --force.
- Do not upgrade Next.js or Prisma major versions without approval.

Current target: UI Phase 2 — Admin Panel Foundation.

After changes run:
python3 -m json.tool package.json
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health

ECC is reference-only by default. Use .agents/rules/20-ecc-integration.md.
