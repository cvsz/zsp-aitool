#!/usr/bin/env bash
set -Eeuo pipefail

python3 -m json.tool package.json >/tmp/package-json-ok.json
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
