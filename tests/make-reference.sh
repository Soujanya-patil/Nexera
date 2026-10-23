#!/usr/bin/env bash
# Builds a reference copy of the site from an earlier commit: into .work/before (8811), which the hub
# suite compares /resources' head with, or into .work/head (8812), for an A/B check such as checks/lhab.sh.
# Usage: tests/make-reference.sh [commit] [folder]   (defaults: b1fd55c, the hub suite's reference, into
# .work/before on 8811; use folder "head" for an A/B copy on 8812, e.g. the live commit)
source "$(dirname "$0")/lib.sh"
REF="${1:-b1fd55c}"
DEST="${2:-before}"
SRC="$W/ref-src"
rm -rf "$SRC"
git -C "$ROOT" worktree add --detach "$(native "$SRC")" "$REF" >/dev/null
(cd "$SRC" && npm ci --silent && npm run build --silent) || { git -C "$ROOT" worktree remove --force "$(native "$SRC")"; exit 1; }
rm -rf "$W/$DEST"
cp -r "$SRC/dist" "$W/$DEST"
git -C "$ROOT" worktree remove --force "$(native "$SRC")"
echo "make-reference: $REF built into .work/$DEST"
