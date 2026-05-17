#!/usr/bin/env bash
set -euo pipefail

if [ ! -d ".next/server/chunks" ]; then
  echo "No .next/server/chunks directory found; skipping"
  exit 0
fi

for f in .next/server/chunks/*.js; do
  [ -f "$f" ] || continue
  ln -sf "chunks/$(basename "$f")" ".next/server/$(basename "$f")"
done

echo "Linked Next.js server chunks into .next/server"
