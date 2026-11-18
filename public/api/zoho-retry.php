<?php
/*
 * Zoho CRM retry — GET /api/zoho-retry.php?key=<cron_secret> (the secret is in the config outside the
 * web root; see api/zoho.php). Retries every Lead in the queue and answers with counts only (no personal
 * data). Without a configured secret, or with a wrong key, it answers 404 and does nothing.
 *
 * On Hostinger: a cron job every 15 minutes, e.g.
 *   curl -s "https://nexerapower.com/api/zoho-retry.php?key=<cron_secret>" > /dev/null
 *
 * STATUS CHECK — ?key=<cron_secret>&status=1 (for a browser): retries nothing; answers what the site sees
 * (config file found, enabled / test, outbound HTTP to Zoho, the queue counted, the last 20 log lines with
 * Zoho's answers) and a plain-English reading of it. No personal data. A 404 means a wrong key, or no
 * config read at all (no file at the path, or a cron_secret shorter than 24 characters).
 */
define("NEXERA_ZOHO_CRON", true);
require __DIR__ . DIRECTORY_SEPARATOR . "contact.php"; // its constants only (the recipient, the sender)
define("NEXERA_API", true);
require __DIR__ . DIRECTORY_SEPARATOR . "zoho.php";

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");
header("X-Robots-Tag: noindex, nofollow");

$status = isset($_GET["status"]) && $_GET["status"] === "1";
$cfg = nexera_zoho_config(!$status);
$secret = (string) $cfg["cron_secret"];
$key = isset($_GET["key"]) && is_string($_GET["key"]) ? $_GET["key"] : "";
if (strlen($secret) < 24 || !hash_equals($secret, $key)) {
    http_response_code(404);
    echo json_encode(["ok" => false]);
    exit;
}
if ($status) {
    echo json_encode(nexera_zoho_status($cfg), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
if (!$cfg["enabled"]) {
    echo json_encode(["ok" => true, "enabled" => false]);
    exit;
}
@set_time_limit(120);
echo json_encode(["ok" => true, "enabled" => true] + nexera_zoho_retry($cfg, 25, false));
