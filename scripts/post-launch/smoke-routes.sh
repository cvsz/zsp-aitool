#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:3001}"

routes=(
  "/"
  "/dashboard"
  "/dashboard/products"
  "/dashboard/generator"
  "/dashboard/hyperframes"
  "/dashboard/hyperframes/renders"
  "/dashboard/hyperframes/ops"
  "/dashboard/admin"
)

echo "Running read-only route smoke checks against: ${BASE_URL}"
for route in "${routes[@]}"; do
  echo "\n==> ${BASE_URL}${route}"
  curl -I --max-time 15 "${BASE_URL}${route}" || true
done
