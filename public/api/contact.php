<?php
/*
 * NEXERA website enquiries — POST /api/contact.php (Hostinger runs PHP; Vite copies public/ to dist/).
 * Used by the homepage contact section, the homepage quick call-back strip and the /contact page
 * (src/lib/enquiry.js).
 *
 * Accepts POST with a JSON body only. Answers JSON: {"ok":true} or {"ok":false,"error":"..."} with a
 * matching status code. User input is never echoed back.
 *
 *  - Validation: name and mobile required; mobile is an Indian 10-digit number (optional +91); email
 *    valid if given; interest one of the allowed values; a length limit on every field.
 *  - Spam: the honeypot (`website`) must be empty; at least 3 s between opening the form and sending
 *    it (the client sends both times); at most 5 enquiries per IP per hour (file-based, stored outside
 *    the web root when the host allows it, otherwise in api/private/, which denies all web access).
 *  - One plain-text email with mail(), every header value stripped of CR/LF.
 *  - `source` (optional): "full" (the default, a full enquiry form) or "quick" (the homepage call-back
 *    strip: name, mobile and interest only), which gets its own subject and a source line.
 */

// ↓ The one place the recipient is set.
const NEXERA_LEADS_TO = "ankit@nexerapower.com";
const NEXERA_FROM = "no-reply@nexerapower.com";
const RATE_LIMIT = 5;        // enquiries …
const RATE_WINDOW = 3600;    // … per this many seconds, per IP
const MIN_FILL_MS = 3000;    // at least 3 s from opening the form to sending it
const INTERESTS = [
    "home" => "Home storage",
    "ci" => "Business / C&I",
    "utility" => "Utility-scale",
    "distributor" => "Becoming a distributor",
    "oem" => "Brand / OEM partnership",
];
const SOURCES = ["full", "quick"];
const LIMITS = ["name" => 100, "mobile" => 20, "email" => 160, "company" => 120, "city" => 80, "message" => 1000, "page" => 200];

header("Content-Type: application/json; charset=utf-8");
header("X-Content-Type-Options: nosniff");
header("Cache-Control: no-store");

function respond(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}
function len(string $s): int {
    return function_exists("mb_strlen") ? mb_strlen($s, "UTF-8") : strlen($s);
}
/** A header-safe value: no CR / LF / other control characters. */
function header_safe(string $s): string {
    return trim(preg_replace('/[\x00-\x1F\x7F]+/', " ", $s) ?? "");
}

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    header("Allow: POST");
    respond(405, ["ok" => false, "error" => "method_not_allowed"]);
}
if (stripos($_SERVER["CONTENT_TYPE"] ?? "", "application/json") === false) {
    respond(415, ["ok" => false, "error" => "json_required"]);
}
$raw = file_get_contents("php://input", false, null, 0, 32768);
$in = json_decode((string) $raw, true);
if (!is_array($in)) respond(400, ["ok" => false, "error" => "bad_request"]);

$text = function (string $k) use ($in): string {
    $v = isset($in[$k]) && is_scalar($in[$k]) ? (string) $in[$k] : "";
    // keep newlines in free text, drop other control characters
    return trim(preg_replace('/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/', "", $v) ?? "");
};
// Single-line fields never span lines (header_safe); only the message keeps its line breaks.
$name = header_safe($text("name"));
$mobile = preg_replace('/[\s()\-]/', "", $text("mobile")) ?? "";
$email = header_safe($text("email"));
$company = header_safe($text("company"));
$city = header_safe($text("city"));
$interest = $text("interest");
$message = $text("message");
$page = header_safe($text("page"));
$honeypot = $text("website");
$source = $text("source") !== "" ? $text("source") : "full";
$startedAt = isset($in["startedAt"]) && is_numeric($in["startedAt"]) ? (float) $in["startedAt"] : 0;
$sentAt = isset($in["sentAt"]) && is_numeric($in["sentAt"]) ? (float) $in["sentAt"] : 0;

// Spam: honeypot and minimum fill time.
if ($honeypot !== "") respond(400, ["ok" => false, "error" => "rejected"]);
$elapsed = $sentAt - $startedAt;
if ($startedAt <= 0 || $sentAt <= 0 || $elapsed < MIN_FILL_MS || $elapsed > 86400000) {
    respond(400, ["ok" => false, "error" => "too_fast"]);
}

// Validation.
$errors = [];
if ($name === "") $errors[] = "name";
if (!preg_match('/^(?:\+91)?[6-9]\d{9}$/', $mobile)) $errors[] = "mobile";
if ($email !== "" && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "email";
if (!array_key_exists($interest, INTERESTS)) $errors[] = "interest";
if (!in_array($source, SOURCES, true)) $errors[] = "source";
foreach (LIMITS as $k => $max) {
    if (len((string) ${$k}) > $max && !in_array($k, $errors, true)) $errors[] = $k;
}
// Extra context from a form (product, site, proposal …): short string values only.
$details = [];
if (isset($in["details"]) && is_array($in["details"])) {
    foreach (array_slice($in["details"], 0, 12, true) as $k => $v) {
        if (!is_string($k) || !is_scalar($v)) continue;
        $key = substr(preg_replace('/[^a-z0-9_]/i', "", $k) ?? "", 0, 30);
        $val = trim(preg_replace('/[\x00-\x1F\x7F]+/', " ", (string) $v) ?? "");
        if ($key === "" || $val === "") continue;
        if (len($val) > 500) $errors[] = "details";
        $details[$key] = $val;
    }
}
if ($errors) respond(422, ["ok" => false, "error" => "validation", "fields" => array_values(array_unique($errors))]);

// Rate limit: 5 per IP per hour. Stored outside the web root when possible.
function rate_dir(): ?string {
    $root = rtrim($_SERVER["DOCUMENT_ROOT"] ?? "", "/\\");
    $candidates = [];
    if ($root !== "") $candidates[] = dirname($root) . DIRECTORY_SEPARATOR . "nexera-private" . DIRECTORY_SEPARATOR . "ratelimit";
    $candidates[] = __DIR__ . DIRECTORY_SEPARATOR . "private" . DIRECTORY_SEPARATOR . "ratelimit";
    foreach ($candidates as $dir) {
        if (!is_dir($dir)) @mkdir($dir, 0700, true);
        if (is_dir($dir) && is_writable($dir)) {
            // In-web-root fallback: make sure the folder can never be fetched.
            if (str_starts_with($dir, __DIR__)) {
                $ht = __DIR__ . DIRECTORY_SEPARATOR . "private" . DIRECTORY_SEPARATOR . ".htaccess";
                if (!is_file($ht)) @file_put_contents($ht, "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n");
            }
            return $dir;
        }
    }
    return null;
}
$dir = rate_dir();
if ($dir === null) respond(503, ["ok" => false, "error" => "unavailable"]);
$ip = $_SERVER["REMOTE_ADDR"] ?? "unknown";
$file = $dir . DIRECTORY_SEPARATOR . hash("sha256", "nexera|" . $ip) . ".json";
$now = time();
$fh = @fopen($file, "c+");
if (!$fh) respond(503, ["ok" => false, "error" => "unavailable"]);
flock($fh, LOCK_EX);
$hits = json_decode((string) stream_get_contents($fh), true);
$hits = is_array($hits) ? array_values(array_filter($hits, fn($t) => is_int($t) && $t > $now - RATE_WINDOW)) : [];
if (count($hits) >= RATE_LIMIT) {
    flock($fh, LOCK_UN);
    fclose($fh);
    header("Retry-After: " . RATE_WINDOW);
    respond(429, ["ok" => false, "error" => "rate_limited"]);
}
$hits[] = $now;
ftruncate($fh, 0);
rewind($fh);
fwrite($fh, json_encode($hits));
flock($fh, LOCK_UN);
fclose($fh);

// The email.
$when = (new DateTime("now", new DateTimeZone("Asia/Kolkata")))->format("d M Y, H:i") . " IST";
$label = INTERESTS[$interest];
$quick = $source === "quick";
$lines = [
    ...($quick ? ["Source: Homepage quick call-back strip", ""] : []),
    $quick ? "Call-back request" : "New website enquiry",
    "",
    "Name:        $name",
    "Mobile:      $mobile",
    "Email:       " . ($email !== "" ? $email : "—"),
    "Company:     " . ($company !== "" ? $company : "—"),
    "City:        " . ($city !== "" ? $city : "—"),
    "Interest:    $label",
];
foreach ($details as $k => $v) $lines[] = str_pad(ucfirst(str_replace("_", " ", $k)) . ":", 13) . $v;
array_push($lines, "", "Message:", $message !== "" ? $message : "—", "", "Page:        " . ($page !== "" ? $page : "—"), "Received:    $when");
$body = implode("\n", $lines) . "\n";

$subject = "=?UTF-8?B?" . base64_encode(header_safe(($quick ? "Call-back request" : "New website enquiry") . ": $label – $name")) . "?=";
$headers = [
    "From: NEXERA website <" . NEXERA_FROM . ">",
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
];
if ($email !== "") $headers[] = "Reply-To: " . header_safe($email);

$to = header_safe(NEXERA_LEADS_TO);
$sent = $to !== "CHANGE_ME@example.com" && @mail($to, $subject, $body, implode("\r\n", $headers), "-f" . NEXERA_FROM);
if (!$sent) respond(502, ["ok" => false, "error" => "send_failed"]);
respond(200, ["ok" => true]);
