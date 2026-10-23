#!/usr/bin/env bash
# Starts the local servers in the background (run prepare.sh first):
#   8810, 8811  Apache 2.4 (server/httpd.conf): .work/web and .work/before, with the site's .htaccess
#   8800        PHP's built-in server (server/router.php): .work/php-web, for the enquiry API
#   2525        SMTP sink (server/smtpsink.py): every mail PHP sends is appended to .work/mails.log
# Needs APACHE_ROOT (the Apache install folder, with mod_rewrite), php (or PHP=…) and python (or
# PYTHON=…). PHP's SMTP settings below are used on Windows; on macOS / Linux, point PHP's
# sendmail_path at a catcher instead. Stop everything with stop-servers.sh.
source "$(dirname "$0")/lib.sh"
: "${APACHE_ROOT:?set APACHE_ROOT to the Apache 2.4 install folder}"
PHP="${PHP:-php}"
PYTHON="${PYTHON:-python}"
export APACHE_ROOT="$(native "$APACHE_ROOT")" NEXERA_TESTS_WORK="$(native "$W" | tr '\\' '/')"
mkdir -p "$W/before"
HTTPD="$APACHE_ROOT/bin/httpd"
[ -x "$HTTPD" ] || HTTPD="$APACHE_ROOT/bin/httpd.exe"
(cd "$W" && nohup "$PYTHON" "$(native "$T/server/smtpsink.py")" 2525 > "$W/smtpsink.log" 2>&1 & echo $! > "$W/smtpsink.pid")
nohup "$HTTPD" -f "$(native "$T/server/httpd.conf")" > "$W/httpd.log" 2>&1 &
echo $! > "$W/httpd.launcher.pid"
nohup "$PHP" -d SMTP=127.0.0.1 -d smtp_port=2525 -d sendmail_from=noreply@example.com \
  -S 127.0.0.1:8800 -t "$(native "$W/php-web")" "$(native "$T/server/router.php")" > "$W/php.log" 2>&1 &
echo $! > "$W/php.pid"
sleep 2
for port in 8800 8810 8811; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/")"
  printf "  %s → %s\n" "$port" "${code:-down}"
done
