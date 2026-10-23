#!/usr/bin/env bash
# Builds a reference copy of the site from an earlier commit into .work/before (served on 8811):
# the hub suite compares /resources' head with it, and checks/lhab.sh runs Lighthouse on it as "before".
# Usage: tests/make-reference.sh [commit]   (default b1fd55c, the hub suite's reference)
source "$(dirname "$0")/lib.sh"
REF="${1:-b1fd55c}"
SRC="$W/ref-src"
rm -rf "$SRC"
git -C "$ROOT" worktree add --detach "$(native "$SRC")" "$REF" >/dev/null
(cd "$SRC" && npm ci --silent && npm run build --silent) || { git -C "$ROOT" worktree remove --force "$(native "$SRC")"; exit 1; }
rm -rf "$W/before"
cp -r "$SRC/dist" "$W/before"
git -C "$ROOT" worktree remove --force "$(native "$SRC")"
echo "make-reference: $REF built into .work/before"
