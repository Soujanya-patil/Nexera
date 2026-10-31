#!/usr/bin/env bash
# The shorter set for visual changes (colours, type, motion, layout): header / fallback, the hub, the
# call-back widget (card and drag), the enquiry forms, the blog article and scenes, the Guides card,
# the partner pages. Same servers and preparation as run-all.sh.
source "$(dirname "$0")/lib.sh"
S="$T/suites"
A=http://127.0.0.1:8810
P=http://127.0.0.1:8800
cd "$W"
r() { n=$1; shift; out=$(timeout 480 "$@" 2>&1); echo "== $n (exit $?)"; echo "$out" | grep -E "^FAIL|passed|Error" | tail -8 | cut -c1-400; }
r fallbackui node "$(native "$S/fallbackui.mjs")" $A
if [ -f "$W/before/resources.html" ]; then
  (cd "$ROOT" && r hub node "$(native "$S/hub.mjs")" $A "$(native "$W/before")" dist)
else
  echo "== hub (skipped: no reference build — run tests/make-reference.sh)"
fi
rm -rf "$W/nexera-private"; r cb node "$(native "$S/cb.mjs")" $P
r cbdrag node "$(native "$S/cbdrag.mjs")" $A
for f in article guidecard partners motion scaleheader productshero; do r $f node "$(native "$S/$f.mjs")" $A; done
rm -rf "$W/nexera-private"; RATE_DIR="$(native "$W/nexera-private")" r forms-e2e node "$(native "$S/forms-e2e.mjs")" $P
rm -rf "$W/nexera-private"
echo ALLDONE
