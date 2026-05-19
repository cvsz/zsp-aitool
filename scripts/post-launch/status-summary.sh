#!/usr/bin/env bash
set -euo pipefail

printf '\n=== ZSP Post-Launch Status Summary (read-only) ===\n'

printf '\n[1/6] App health\n'
npm run health || true

printf '\n[2/6] HyperFrames queue status\n'
npm run hyperframes:queue-status || true

printf '\n[3/6] HyperFrames watchdog\n'
npm run hyperframes:worker:watchdog || true

printf '\n[4/6] Disk usage\n'
df -h || true

if command -v systemctl >/dev/null 2>&1; then
  printf '\n[5/6] systemd unit status (active/enabled checks only)\n'
  systemctl is-active zsp-aitool || true
  systemctl is-active zsp-hyperframes-worker || true
  systemctl is-enabled zsp-hyperframes-worker || true
else
  printf '\n[5/6] systemctl not available in this environment\n'
fi

if command -v journalctl >/dev/null 2>&1; then
  printf '\n[6/6] Recent journals\n'
  journalctl -u zsp-aitool -n 40 -l --no-pager || true
  journalctl -u zsp-hyperframes-worker -n 40 -l --no-pager || true
else
  printf '\n[6/6] journalctl not available in this environment\n'
fi
