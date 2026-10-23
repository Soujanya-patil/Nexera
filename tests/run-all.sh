#!/usr/bin/env bash
# Every local suite, once, against the built site. Before: npm run build, tests/prepare.sh,
# tests/start-servers.sh (and once, tests/make-reference.sh for the hub suite). Each suite prints its
# exit code and its FAIL / summary lines. Not run in CI and not deployed.
source "$(dirname "$0")/lib.sh"
S="$T/suites"
A=http://127.0.0.1:8810 # Apache: the site with its .htaccess
P=http://127.0.0.1:8800 # PHP: the enquiry API
cd "$W"
r() { n=$1; shift; out=$(timeout 480 "$@" 2>&1); echo "== $n (exit $?)"; echo "$out" | grep -E "^FAIL|passed|Error" | tail -8 | cut -c1-400; }
fresh() { rm -rf "$W/nexera-private"; } # the enquiry rate limit (5 an hour) starts empty for each mail suite
r startfail node "$(native "$S/startfail.mjs")" $A
r fallbackui node "$(native "$S/fallbackui.mjs")" $A
r filterclick node "$(native "$S/filterclick.mjs")" $A
echo "== filterprobe PASS count (expect 16)"; timeout 300 node "$(native "$S/filterprobe.mjs")" $A 2>&1 | grep -c "^PASS"
out=$(timeout 400 node "$(native "$S/botprobe.mjs")" $A / /products /solutions /partners/tcl /resources /contact /blog /blog/what-is-bess 2>&1); echo "== botprobe (exit $?)"; echo "$out" | grep -E "^FAIL|^EMPTY|^botprobe:"
r bootcheck node "$(native "$S/bootcheck.mjs")" $A
out=$(node "$(native "$S/servedhead.mjs")" $A "$(native "$ROOT/dist/sitemap.xml")" 2>&1); echo "== servedhead (exit $?)"; echo "$out" | grep -E "^FAIL|^servedhead:"
if [ -f "$W/before/resources.html" ]; then
  (cd "$ROOT" && r hub node "$(native "$S/hub.mjs")" $A "$(native "$W/before")" dist)
else
  echo "== hub (skipped: no reference build — run tests/make-reference.sh)"
fi
fresh; r cb node "$(native "$S/cb.mjs")" $P
r cbdrag node "$(native "$S/cbdrag.mjs")" $A
fresh; r e2e node "$(native "$S/e2e.mjs")" $P
fresh; r docsend node "$(native "$S/docsend.mjs")" $P
for f in article guidecard landing partners motion; do r $f node "$(native "$S/$f.mjs")" $A; done
out=$(NEXERA_ROOT="$(native "$ROOT")" node --test "$(native "$S/rules.test.mjs")" 2>&1); echo "== rules (unit)"; echo "$out" | grep -E "^# (pass|fail)|^not ok"
fresh; r forms-server node "$(native "$S/forms-server.mjs")" $P
fresh; RATE_DIR="$(native "$W/nexera-private")" r forms-e2e node "$(native "$S/forms-e2e.mjs")" $P
fresh
echo "== seocheck: $(node "$(native "$S/seocheck.mjs")" "$(native "$ROOT/dist")" 2>&1 | grep -c '^OK') OK; non-OK lines:"
node "$(native "$S/seocheck.mjs")" "$(native "$ROOT/dist")" 2>&1 | grep -v "^OK"
echo ALLDONE
