#!/usr/bin/env bash
# Stops what start-servers.sh started.
source "$(dirname "$0")/lib.sh"
for f in php.pid smtpsink.pid httpd.pid httpd.launcher.pid; do
  [ -f "$W/$f" ] || continue
  pid="$(tr -d '\r\n ' < "$W/$f")"
  kill "$pid" 2>/dev/null || { command -v taskkill >/dev/null && taskkill //F //T //PID "$pid" >/dev/null 2>&1; }
  rm -f "$W/$f"
done
echo "stop-servers: done"
