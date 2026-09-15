#!/usr/bin/env bash
# Ship the site to the home server over SSH.
#   deploy/push.sh you@your.static.ip
#
# Uploads to a timestamped directory and flips a symlink, so a half-finished
# transfer is never live and rolling back is one command.
set -euo pipefail

TARGET="${1:?usage: deploy/push.sh user@host [remote-root]}"
ROOT="${2:-/srv/tmualab}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date -u +%Y%m%d-%H%M%S)"

echo "→ checking the bank before shipping"
node "$REPO/tools/build-past.js" >/dev/null
node "$REPO/tools/check.js" | tail -2

echo "→ uploading to $TARGET:$ROOT/releases/$STAMP"
rsync -az --delete --delete-excluded \
  --exclude '.git'      --exclude 'dist'   --exclude 'node_modules' \
  --exclude 'deploy'    --exclude 'tools'  --exclude 'data' \
  --exclude 'README.md' --exclude '.DS_Store' \
  "$REPO"/ "$TARGET:$ROOT/releases/$STAMP/"

echo "→ going live"
ssh "$TARGET" "
  set -e
  ln -sfn '$ROOT/releases/$STAMP' '$ROOT/current.tmp'
  mv -Tf '$ROOT/current.tmp' '$ROOT/current'
  ls -1dt '$ROOT'/releases/*/ | tail -n +6 | xargs -r rm -rf
"
echo "✓ live: $STAMP  (rollback: ln -sfn \$ROOT/releases/<older> \$ROOT/current)"
