<?php
/*
 * Zoho CRM retry — GET /api/zoho-retry.php?key=<cron_secret> (the secret is in the config outside the
 * web root; see api/zoho.php). Retries every Lead in the queue and answers with counts only (no personal
 * data). Without a configured secret, or with a wrong key, it answers 404 and does nothing.
 *
 * On Hostinger: a cron job every 15 minutes, e.g.
 *   curl -s "https://nexerapower.com/api/zoho-retry.php?key=<cron_secret>" > /dev/null
 */
define("NEXERA_ZOHO_CRON", true);
require __DIR__ . DIRECTORY_SEPARATOR . "contact.php"; // its constants only (the recipient, the sender)
define("NEXERA_API", true);
require __DIR__ . DIRECTORY_SEPARATOR . "zoho.php";

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");
header("X-Robots-Tag: noindex, nofollow");

$cfg = nexera_zoho_config();
$secret = (string) $cfg["cron_secret"];
$key = isset($_GET["key"]) && is_string($_GET["key"]) ? $_GET["key"] : "";
if (strlen($secret) < 24 || !hash_equals($secret, $key)) {
    http_response_code(404);
    echo json_encode(["ok" => false]);
    exit;
}
if (!$cfg["enabled"]) {
    echo json_encode(["ok" => true, "enabled" => false]);
    exit;
}
@set_time_limit(120);
echo json_encode(["ok" => true, "enabled" => true] + nexera_zoho_retry($cfg, 25, false));
