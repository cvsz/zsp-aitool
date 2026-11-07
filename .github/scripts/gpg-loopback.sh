#!/bin/bash
# GPG wrapper for loopback pinentry mode.
# Reads passphrase from GPG_PASSPHRASE env var and passes via fd 3.
# Works on GitHub-hosted runners (checked into repo at .github/scripts/gpg-loopback.sh).
if [ -n "${GPG_PASSPHRASE:-}" ]; then
  exec gpg --batch --no-tty --pinentry-mode loopback --passphrase-fd 3 "$@" 3<<< "$GPG_PASSPHRASE"
else
  exec gpg --batch --no-tty --pinentry-mode loopback "$@"
fi