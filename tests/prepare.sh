#!/usr/bin/env bash
# Copies the current build (dist/, after `npm run build`) into the servers' folders:
#   .work/web      for Apache (8810)
#   .work/php-web  for PHP (8800), with the enquiry addresses in api/contact.php set to test addresses
#                  (leads-test@ for sales@, routed-test@ for every routed address),
#                  so nothing a suite sends can reach a real inbox (the mails land in .work/mails.log)
# and empties the mail log and the enquiry rate-limit folder.
source "$(dirname "$0")/lib.sh"
[ -f "$ROOT/dist/index.html" ] || { echo "prepare: no dist/ — run npm run build first"; exit 1; }
rm -rf "$W/web" "$W/php-web" "$W/nexera-private"
cp -r "$ROOT/dist" "$W/web"
cp -r "$ROOT/dist" "$W/php-web"
sed -i 's/const NEXERA_LEADS_TO = "[^"]*";/const NEXERA_LEADS_TO = "leads-test@example.com";/' "$W/php-web/api/contact.php"
grep -q 'leads-test@example.com' "$W/php-web/api/contact.php" || { echo "prepare: could not set the test leads address"; exit 1; }
# Every routed address too (NEXERA_ROUTES, e.g. distributorship → Ankit): one test address for all of them.
sed -i 's/\["to" => "[^"]*"/["to" => "routed-test@example.com"/' "$W/php-web/api/contact.php"
if grep -n '@nexerapower\.com"' "$W/php-web/api/contact.php" | grep -v 'NEXERA_FROM'; then echo "prepare: a real recipient is left in api/contact.php"; exit 1; fi
: > "$W/mails.log"
echo "prepare: dist copied to .work/web and .work/php-web (test leads address); mail log emptied"
