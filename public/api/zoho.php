<?php
/*
 * Zoho CRM for website enquiries — included by api/contact.php (after the enquiry email has been sent
 * and the visitor has their answer) and by api/zoho-retry.php (the retry cron). Requested directly it
 * does nothing.
 *
 * Each enquiry becomes a Lead through the CRM's Web-to-Lead webform "Nexera Website Enquiry Form":
 * the server POSTs to the webform's action URL with its hidden fields and the webform's own field
 * names (the webform source code is in nexera-reference/zoho/; nothing of Zoho's is shown on the site).
 *
 * CONFIG — outside the web root: <the folder above public_html>/nexera-private/zoho-config.php
 * (config/zoho-config.example.php in the repo shows every key), or environment variables
 * ZOHO_ENABLED, ZOHO_TEST, ZOHO_ACTION_URL, ZOHO_CRON_SECRET (they win over the file). Nothing of it is
 * in the built site or the JavaScript. Off by default: with enabled = false nothing goes to Zoho.
 *   test = true: the Description starts "TEST – " (the webform's Lead Source picklist has no TEST value,
 *   so Lead Source stays "Website").
 *
 * SUCCESS is only a clear one: an HTTP 2xx with the webform's JSON answer "Splash Message" (or a
 * confirmed redirect / thank-you page). Anything else — Zoho down, a timeout, an error page, a rejection
 * — is a failure: the Lead is put in the retry queue. A duplicate (the CRM has Email and Mobile set as
 * unique) is not retried: it is logged, and the sales@ email already has the enquiry.
 *
 * RETRY QUEUE — <above public_html>/nexera-private/zoho-queue/, one JSON file per Lead holding only
 * the webform fields (never in the web root; if that folder can't be used, there is no queue and sales@
 * gets the alert at once). Retried after each later enquiry (entries untried for 10 minutes, at most 3)
 * and by the cron URL api/zoho-retry.php?key=<cron_secret> (every entry). An entry is deleted as soon
 * as Zoho accepts it, on a duplicate, and after 30 days at the latest. After the third failed try,
 * sales@ gets one alert email for it.
 *
 * LOG — nexera-private/zoho-log.txt: date, form, outcome and Zoho's message with any email address or
 * number masked. No personal data.
 */
if (!defined("NEXERA_API")) {
    http_response_code(404);
    exit;
}

// The webform's action URL, hidden fields and honeypot name come only from the config (never from this
// file, so none of it is in the built site).
const ZOHO_DEFAULTS = [
    "enabled" => false,
    "test" => false,
    "action_url" => "",
    "hidden" => [],
    "honeypot" => "",
    "lead_source" => "Website",
    "cron_secret" => "",
    "timeout" => 10,
];
const ZOHO_KEEP_DAYS = 30;
const ZOHO_ALERT_AFTER = 3;
const ZOHO_RETRY_GAP = 600; // after a form submit, retry entries untried for this long (s)
// The webform's field lengths (its maxlength attributes).
const ZOHO_MAX = ["Company" => 200, "First Name" => 40, "Last Name" => 80, "Email" => 100, "Mobile" => 30, "Address - City" => 255];

/** <the folder above the web root>/nexera-private, or null when the web root is unknown. */
function nexera_private_dir(): ?string {
    $root = rtrim($_SERVER["DOCUMENT_ROOT"] ?? "", "/\\");
    return $root === "" ? null : dirname($root) . DIRECTORY_SEPARATOR . "nexera-private";
}

/**
 * The config: defaults < the file outside the web root < environment variables. Also notes, for the
 * status check, where the file was looked for (`_file`), whether it was read (`_found`), which
 * environment variables were set (`_env`) and why a switched-on config is treated as off (`_problem`).
 * `$log`: note an incomplete config in the log (not from the status check).
 */
function nexera_zoho_config(bool $log = true): array {
    $cfg = ZOHO_DEFAULTS;
    $dir = nexera_private_dir();
    $file = $dir !== null ? $dir . DIRECTORY_SEPARATOR . "zoho-config.php" : null;
    $found = false;
    if ($file !== null && is_file($file)) {
        // Read it fresh every time (OPcache would otherwise keep an old copy for a while after an edit,
        // e.g. when test mode is switched on).
        if (function_exists("opcache_invalidate")) @opcache_invalidate($file, true);
        $c = include $file;
        if (is_array($c)) {
            $cfg = array_replace($cfg, $c);
            $found = true;
        }
    }
    $env = [];
    foreach (["ZOHO_ENABLED" => "enabled", "ZOHO_TEST" => "test"] as $name => $k) {
        $v = getenv($name);
        if ($v !== false && $v !== "") {
            $cfg[$k] = filter_var($v, FILTER_VALIDATE_BOOLEAN);
            $env[] = $name;
        }
    }
    foreach (["ZOHO_ACTION_URL" => "action_url", "ZOHO_CRON_SECRET" => "cron_secret"] as $name => $k) {
        $v = getenv($name);
        if ($v !== false && $v !== "") {
            $cfg[$k] = $v;
            $env[] = $name;
        }
    }
    $cfg["enabled"] = (bool) $cfg["enabled"];
    $cfg["test"] = (bool) $cfg["test"];
    if (!is_array($cfg["hidden"])) $cfg["hidden"] = [];
    $cfg["_file"] = $file;
    $cfg["_found"] = $found;
    $cfg["_env"] = $env;
    $cfg["_problem"] = null;
    // Switched on but incomplete (no action URL or no form ids): treated as off, and noted in the log.
    $ids = array_filter($cfg["hidden"], fn($v) => is_string($v) && strlen($v) >= 32);
    if ($cfg["enabled"] && (!preg_match('#^https?://#', (string) $cfg["action_url"]) || count($ids) < 2)) {
        $cfg["enabled"] = false;
        $cfg["_problem"] = "enabled, but the action URL or the form ids are missing";
        if ($log) nexera_zoho_log("-", "config_incomplete", $cfg["_problem"]);
    }
    return $cfg;
}

/** How this server reaches Zoho: "streams" (PHP's own client), "curl", or null (it can't). */
function nexera_zoho_transport(string $url): ?string {
    $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
    // PHP's own client needs allow_url_fopen and, for https, the https stream wrapper (OpenSSL).
    if (filter_var(ini_get("allow_url_fopen"), FILTER_VALIDATE_BOOLEAN) && in_array($scheme === "" ? "https" : $scheme, stream_get_wrappers(), true)) return "streams";
    if (function_exists("curl_init")) return "curl";
    return null;
}

/** Which form an enquiry came from, as Zoho sees it (first line of the Description). */
function nexera_zoho_form(array $e): string {
    if ($e["source"] === "quick") return "Website – Call-back";
    if ($e["source"] === "partner") return "Website – Partner form";
    if (($e["details"]["enquiry"] ?? "") === "Datasheet request") return "Website – Datasheet request";
    $path = (string) (parse_url("http://x" . ($e["page"] ?? ""), PHP_URL_PATH) ?? "/");
    return $path === "/" ? "Website – Home form" : "Website – Contact form";
}

/** A mobile as Zoho gets it: an Indian number as +91XXXXXXXXXX; an international one as entered. */
function nexera_zoho_mobile(string $m): string {
    if (preg_match('/^(?:\+91|91|0)?([6-9]\d{9})$/', $m, $x)) return "+91" . $x[1];
    return $m;
}

function nexera_zoho_cut(string $s, int $max): string {
    return function_exists("mb_substr") ? mb_substr($s, 0, $max, "UTF-8") : substr($s, 0, $max);
}

/**
 * The webform fields for one enquiry (its own field names; empty ones left out). See the mapping table
 * in the report / the colleague's note.
 */
function nexera_zoho_fields(array $cfg, array $e): array {
    $name = trim($e["name"]);
    $at = strrpos($name, " ");
    $first = $at === false ? "" : trim(substr($name, 0, $at));
    $last = $at === false ? $name : trim(substr($name, $at + 1));
    // One word, or a first part longer than the webform's First Name: the whole name in Last Name.
    if ($first !== "" && (function_exists("mb_strlen") ? mb_strlen($first, "UTF-8") : strlen($first)) > ZOHO_MAX["First Name"]) {
        $first = "";
        $last = $name;
    }
    $details = is_array($e["details"] ?? null) ? $e["details"] : [];
    $partner = $e["source"] === "partner";
    $form = nexera_zoho_form($e);

    // Description: which form, then everything the webform has no field for.
    $lines = [($cfg["test"] ? "TEST – " : "") . "Form: $form"];
    $lines[] = "Interested in: " . $e["interest"];
    if ($e["source"] !== "quick") $lines[] = ($partner ? "Expected requirement: " : "Project size: ") . ($e["requirement"] !== "" ? $e["requirement"] : "Not given");
    if ($partner && $e["city"] !== "") $lines[] = "Location: " . $e["city"];
    foreach ($details as $k => $v) $lines[] = ucfirst(str_replace("_", " ", (string) $k)) . ": " . $v;
    if ($e["message"] !== "") array_push($lines, "Message:", $e["message"]);
    $page = (string) ($e["page"] ?? "");
    if ($page !== "") {
        $lines[] = "Page: " . ($e["host"] !== "" ? "https://" . $e["host"] : "") . $page;
        parse_str((string) (parse_url("http://x" . $page, PHP_URL_QUERY) ?? ""), $q);
        $utm = [];
        foreach ($q as $k => $v) if (is_string($k) && str_starts_with(strtolower($k), "utm_") && is_string($v) && $v !== "") $utm[] = "$k=$v";
        if ($utm) $lines[] = "UTM: " . implode(", ", $utm);
    }
    $lines[] = "Received: " . $e["received"];

    // Brand Interest (webform picklist TCL / Hithium / Both / Not decided): only when the enquiry names a
    // product of one brand (a datasheet or product enquiry).
    $product = (string) ($details["product"] ?? "");
    $brand = preg_match('/^\s*TCL\b/i', $product) ? "TCL" : (preg_match('/^\s*Hithium\b/i', $product) ? "Hithium" : "");
    // Customer Type (webform picklist EPC Company / Solar Installer or Integrator / Channel Partner): the
    // partner form's company type only where it means the same ("EPC").
    $customer = $partner && ($details["company_type"] ?? "") === "EPC" ? "EPC Company" : "";

    $f = [
        "Company" => $e["company"] !== "" ? $e["company"] : "Not given",
        "Lead Source" => (string) $cfg["lead_source"],
        "First Name" => $first,
        "Last Name" => $last,
        "Email" => $e["email"],
        "Mobile" => $e["mobile"] !== "" ? nexera_zoho_mobile($e["mobile"]) : "",
        "Address - City" => $e["city"],
        "LEADCF19" => $e["state"],
        "LEADCF16" => $customer,
        "LEADCF11" => $brand,
        "Description" => implode("\n", $lines),
    ];
    foreach (ZOHO_MAX as $k => $max) $f[$k] = nexera_zoho_cut($f[$k], $max);
    return array_filter($f, fn($v) => $v !== "");
}

/** POSTs the webform (multipart, as the webform's own script does). [HTTP status (0 = no answer), body]. */
function nexera_zoho_post(array $cfg, array $fields): array {
    $all = $cfg["hidden"];
    if ((string) $cfg["honeypot"] !== "") $all[(string) $cfg["honeypot"]] = "";
    foreach ($fields as $k => $v) $all[$k] = $v;
    $timeout = max(2, (int) $cfg["timeout"]);
    $url = (string) $cfg["action_url"];

    // PHP's own HTTP client first (allow_url_fopen, and OpenSSL for https); curl where that can't be used.
    $via = nexera_zoho_transport($url);
    if ($via === "streams") {
        $b = "----nexera" . bin2hex(random_bytes(12));
        $body = "";
        foreach ($all as $k => $v) {
            $k = str_replace(['"', "\r", "\n"], "", (string) $k);
            $body .= "--$b\r\nContent-Disposition: form-data; name=\"$k\"\r\n\r\n" . $v . "\r\n";
        }
        $body .= "--$b--\r\n";
        $ctx = stream_context_create(["http" => [
            "method" => "POST",
            "header" => "Content-Type: multipart/form-data; boundary=$b\r\nAccept: application/json, text/html;q=0.8\r\nUser-Agent: NexeraWebsite/1.0\r\n",
            "content" => $body,
            "timeout" => $timeout,
            "ignore_errors" => true,
            "follow_location" => 0,
        ]]);
        $resp = @file_get_contents($url, false, $ctx);
        $hdrs = function_exists("http_get_last_response_headers") ? (http_get_last_response_headers() ?? []) : ($http_response_header ?? []);
        $status = 0;
        foreach ($hdrs as $h) if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) $status = (int) $m[1];
        return [$resp === false ? 0 : $status, $resp === false ? "" : (string) $resp];
    }
    if ($via === "curl") {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $all,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => min(5, $timeout),
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTPHEADER => ["Accept: application/json, text/html;q=0.8"],
            CURLOPT_USERAGENT => "NexeraWebsite/1.0",
        ]);
        $resp = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        return [$resp === false ? 0 : $status, $resp === false ? "" : (string) $resp];
    }
    return [0, ""];
}

/** An email address or a run of 5+ digits in Zoho's message, masked; at most 160 characters. */
function nexera_zoho_mask(string $s): string {
    $s = preg_replace('/[^\s@]+@[^\s@]+/', "[email]", $s) ?? "";
    $s = preg_replace('/\+?\d[\d\s-]{4,}\d/', "[number]", $s) ?? "";
    return nexera_zoho_cut(trim(preg_replace('/\s+/', " ", $s) ?? ""), 160);
}

/**
 * What Zoho's answer means: delivered | duplicate | failed, and a short note (masked). Only a clear
 * success counts as delivered.
 */
function nexera_zoho_classify(int $status, string $body): array {
    if ($status === 0) return ["failed", "no answer (Zoho unreachable or timed out)"];
    if ($status < 200 || $status >= 300) return ["failed", "HTTP $status"];
    $j = json_decode($body, true);
    if (!is_array($j)) return ["failed", "HTTP $status, not the webform's JSON answer"];
    $act = (string) ($j["actionsubmit"] ?? "");
    $msg = (string) ($j["message"] ?? ($j["actionvalue"] ?? ""));
    if (($j["invalidCaptcha"] ?? "") === "true" || $act === "captcha_error") return ["failed", "CAPTCHA required"];
    if ($act === "Splash Message" || $act === "thankyou_page" || $act === "add_hash") return ["delivered", $act];
    if (($act === "redirect_url" || $act === "parent_redirect") && !empty($j["success"])) return ["delivered", $act];
    if (preg_match('/duplicat|already exist|unique/i', $msg)) return ["duplicate", "$act: " . nexera_zoho_mask($msg)];
    return ["failed", ($act !== "" ? "$act: " : "unexpected answer: ") . nexera_zoho_mask($msg)];
}

/** One line in nexera-private/zoho-log.txt (no personal data). Kept under ~256 KB. */
function nexera_zoho_log(string $form, string $outcome, string $note): void {
    $dir = nexera_private_dir();
    if ($dir === null) return;
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    $file = $dir . DIRECTORY_SEPARATOR . "zoho-log.txt";
    if (is_file($file) && @filesize($file) > 262144) {
        $keep = substr((string) @file_get_contents($file), -131072);
        @file_put_contents($file, substr($keep, (int) strpos($keep, "\n") + 1), LOCK_EX);
    }
    $line = gmdate("Y-m-d\TH:i:s\Z") . "\t$form\t$outcome\t" . str_replace(["\t", "\r", "\n"], " ", $note) . "\n";
    @file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
}

/** The retry queue folder (outside the web root), created if needed; null if it can't be used. */
function nexera_zoho_queue_dir(): ?string {
    $dir = nexera_private_dir();
    if ($dir === null) return null;
    $q = $dir . DIRECTORY_SEPARATOR . "zoho-queue";
    if (!is_dir($q)) @mkdir($q, 0700, true);
    return is_dir($q) && is_writable($q) ? $q : null;
}

/**
 * The inbox the enquiry was emailed to (sales@, or Ankit for a distributorship enquiry) is told a Lead
 * didn't reach Zoho (after ZOHO_ALERT_AFTER tries, or at once without a queue).
 */
function nexera_zoho_alert(array $entry, string $why): void {
    $to = (string) ($entry["to"] ?? "");
    if (!preg_match('/^[^\s@<>,;"]+@[^\s@<>,;"]+$/', $to)) $to = defined("NEXERA_LEADS_TO") ? NEXERA_LEADS_TO : "sales@nexerapower.com";
    $from = defined("NEXERA_FROM") ? NEXERA_FROM : "no-reply@nexerapower.com";
    $f = $entry["fields"] ?? [];
    $name = trim(($f["First Name"] ?? "") . " " . ($f["Last Name"] ?? ""));
    $body = implode("\n", [
        "A website enquiry could not be added to Zoho CRM.",
        "",
        "The enquiry email was sent to $to when the enquiry came in, so nothing is lost: please add the Lead in Zoho by hand.",
        "",
        "Form:          " . ($entry["form"] ?? ""),
        "Name:          " . $name,
        "Received:      " . ($entry["received"] ?? ""),
        "Tries:         " . ($entry["tries"] ?? 0),
        "Last answer:   " . $why,
        "",
        ($entry["queued"] ?? false) ? "The website keeps trying for up to " . ZOHO_KEEP_DAYS . " days." : "It could not be queued for another try.",
    ]) . "\n";
    $subject = "=?UTF-8?B?" . base64_encode("Zoho CRM: a website enquiry could not be added – " . preg_replace('/[\x00-\x1F\x7F]+/', " ", $name)) . "?=";
    $headers = ["From: NEXERA website <$from>", "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: 8bit"];
    @mail($to, $subject, $body, implode("\r\n", $headers), "-f" . $from);
}

/** Sends one entry; updates it. Returns the outcome (delivered | duplicate | failed). */
function nexera_zoho_try(array $cfg, array &$entry): string {
    [$status, $body] = nexera_zoho_post($cfg, $entry["fields"]);
    [$outcome, $note] = nexera_zoho_classify($status, $body);
    $entry["tries"] = (int) ($entry["tries"] ?? 0) + 1;
    $entry["last"] = time();
    $entry["note"] = $note;
    nexera_zoho_log($entry["form"], $outcome . ($entry["tries"] > 1 ? " (try " . $entry["tries"] . ")" : ""), $note);
    return $outcome;
}

/** After an enquiry (its email already sent, the visitor answered): send it, queue it on failure, retry. */
function nexera_zoho_after_enquiry(array $cfg, array $e): void {
    if (!$cfg["enabled"]) return;
    $entry = [
        "v" => 1,
        "form" => nexera_zoho_form($e),
        "received" => $e["received"],
        // Where the enquiry email went (for the alert); our own address, not the visitor's.
        "to" => (string) ($e["to"] ?? ""),
        "created" => time(),
        "tries" => 0,
        "alerted" => false,
        "fields" => nexera_zoho_fields($cfg, $e),
    ];
    $outcome = nexera_zoho_try($cfg, $entry);
    if ($outcome === "failed") {
        $q = nexera_zoho_queue_dir();
        if ($q === null) {
            $entry["queued"] = false;
            nexera_zoho_alert($entry, $entry["note"]);
            nexera_zoho_log($entry["form"], "not_queued", "no queue folder outside the web root; sales@ alerted");
        } else {
            $entry["queued"] = true;
            @file_put_contents($q . DIRECTORY_SEPARATOR . date("Ymd-His") . "-" . bin2hex(random_bytes(6)) . ".json", json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
        }
    }
    // A few earlier failures get another try now (those not tried in the last 10 minutes).
    nexera_zoho_retry($cfg, 3, true);
}

/**
 * Retries queued Leads: deletes each once Zoho accepts it (or calls it a duplicate) and after
 * ZOHO_KEEP_DAYS; alerts sales@ once after ZOHO_ALERT_AFTER failed tries. `$gap`: skip entries tried in
 * the last ZOHO_RETRY_GAP seconds (after a form submit; the cron tries every entry). Counts only.
 */
function nexera_zoho_retry(array $cfg, int $max, bool $gap): array {
    $done = ["delivered" => 0, "duplicate" => 0, "failed" => 0, "expired" => 0, "waiting" => 0];
    $q = nexera_zoho_queue_dir();
    if (!$cfg["enabled"] || $q === null) return $done;
    $lock = @fopen($q . DIRECTORY_SEPARATOR . ".lock", "c");
    if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) return $done; // another request is on it
    try {
        $files = glob($q . DIRECTORY_SEPARATOR . "*.json") ?: [];
        sort($files);
        $tried = 0;
        foreach ($files as $file) {
            $entry = json_decode((string) @file_get_contents($file), true);
            if (!is_array($entry) || !is_array($entry["fields"] ?? null)) {
                @unlink($file);
                continue;
            }
            if ((int) ($entry["created"] ?? 0) < time() - ZOHO_KEEP_DAYS * 86400) {
                @unlink($file);
                $done["expired"]++;
                nexera_zoho_log((string) ($entry["form"] ?? "-"), "expired", "not delivered within " . ZOHO_KEEP_DAYS . " days; removed from the queue");
                continue;
            }
            if ($tried >= $max || ($gap && (int) ($entry["last"] ?? 0) > time() - ZOHO_RETRY_GAP)) {
                $done["waiting"]++;
                continue;
            }
            $tried++;
            $outcome = nexera_zoho_try($cfg, $entry);
            if ($outcome === "failed") {
                if ($entry["tries"] >= ZOHO_ALERT_AFTER && empty($entry["alerted"])) {
                    nexera_zoho_alert($entry, $entry["note"]);
                    $entry["alerted"] = true;
                }
                @file_put_contents($file, json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
                $done["failed"]++;
            } else {
                @unlink($file);
                $done[$outcome]++;
            }
        }
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
    return $done;
}

/**
 * Whether this server can reach the webform's host: one GET of the action URL (no form data, so no
 * Lead), with a short timeout. Any HTTP answer means outbound HTTP works.
 */
function nexera_zoho_probe(string $url): array {
    $via = nexera_zoho_transport($url);
    if ($via === null) return ["reached" => false, "via" => null, "http" => 0, "ms" => 0, "error" => "no way to make outbound HTTP requests (allow_url_fopen off or no OpenSSL, and no curl)"];
    $t0 = microtime(true);
    $status = 0;
    $error = "";
    if ($via === "streams") {
        $ctx = stream_context_create(["http" => ["method" => "GET", "timeout" => 6, "ignore_errors" => true, "follow_location" => 0, "header" => "User-Agent: NexeraWebsite/1.0 (status check)\r\n"]]);
        $resp = @file_get_contents($url, false, $ctx, 0, 2048);
        $hdrs = function_exists("http_get_last_response_headers") ? (http_get_last_response_headers() ?? []) : ($http_response_header ?? []);
        foreach ($hdrs as $h) if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) $status = (int) $m[1];
        if ($resp === false && $status === 0) $error = nexera_zoho_mask((string) (error_get_last()["message"] ?? "no answer"));
    } else {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_NOBODY => false, CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 6, CURLOPT_FOLLOWLOCATION => false, CURLOPT_USERAGENT => "NexeraWebsite/1.0 (status check)"]);
        $resp = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        if ($resp === false) $error = nexera_zoho_mask(curl_error($ch));
    }
    return ["reached" => $status > 0, "via" => $via, "http" => $status, "ms" => (int) round((microtime(true) - $t0) * 1000), "error" => $error !== "" ? $error : null];
}

/**
 * The status check (api/zoho-retry.php?key=…&status=1): the config, outbound HTTP, the private folder, the
 * queue and the last log lines, plus a plain-English reading of them. No personal data: the queue is
 * counted, never listed, and the log holds none.
 */
function nexera_zoho_status(array $cfg, int $lines = 20): array {
    $dir = nexera_private_dir();
    $url = (string) $cfg["action_url"];
    $ids = array_filter($cfg["hidden"], fn($v) => is_string($v) && strlen($v) >= 32);

    // Queue: counts only.
    $qdir = $dir !== null ? $dir . DIRECTORY_SEPARATOR . "zoho-queue" : null;
    $entries = $qdir !== null && is_dir($qdir) ? (glob($qdir . DIRECTORY_SEPARATOR . "*.json") ?: []) : [];
    $oldest = null;
    $maxTries = 0;
    $alerted = 0;
    $lastNote = null;
    $lastTried = 0;
    foreach ($entries as $f) {
        $e = json_decode((string) @file_get_contents($f), true);
        if (!is_array($e)) continue;
        $c = (int) ($e["created"] ?? 0);
        if ($c > 0 && ($oldest === null || $c < $oldest)) $oldest = $c;
        $maxTries = max($maxTries, (int) ($e["tries"] ?? 0));
        if (!empty($e["alerted"])) $alerted++;
        if ((int) ($e["last"] ?? 0) >= $lastTried) {
            $lastTried = (int) ($e["last"] ?? 0);
            $lastNote = (string) ($e["note"] ?? "");
        }
    }

    // The log's last lines (date, form, outcome, Zoho's masked answer).
    $logFile = $dir !== null ? $dir . DIRECTORY_SEPARATOR . "zoho-log.txt" : null;
    $log = [];
    if ($logFile !== null && is_file($logFile)) {
        $text = (string) @file_get_contents($logFile, false, null, max(0, (int) @filesize($logFile) - 65536));
        $log = array_slice(array_values(array_filter(explode("\n", $text), fn($l) => trim($l) !== "")), -$lines);
        if (count($log) === $lines && !preg_match('/^\d{4}-\d{2}-\d{2}T/', $log[0])) array_shift($log); // a cut first line
    }
    $last = $log ? explode("\t", (string) end($log)) : [];
    $lastOutcome = $last[2] ?? null;

    $probe = preg_match('#^https?://#', $url) ? nexera_zoho_probe($url) : null;
    $privateOk = $dir !== null && is_dir($dir) && is_writable($dir);

    // A plain-English reading, most important first.
    $say = [];
    if (!$cfg["_found"]) $say[] = "No config file was read at " . ($cfg["_file"] ?? "(unknown: the web root is not known)") . ". Upload zoho-config.php there (the folder above public_html), not into public_html.";
    if ($cfg["_problem"] !== null) $say[] = "Switched on, but the action URL or the two form ids (the webform's hidden fields) are missing, so it is treated as off.";
    elseif (!$cfg["enabled"]) $say[] = "Zoho is switched off (enabled = false): no enquiry is sent to Zoho. Set \"enabled\" => true in the config.";
    if ($probe !== null && !$probe["reached"]) $say[] = "This server could not reach " . (parse_url($url, PHP_URL_HOST) ?: "Zoho") . ": " . ($probe["error"] ?? "no answer") . ". Ask Hostinger whether outbound HTTPS is allowed.";
    if (!$privateOk) $say[] = "The private folder is not writable, so there is no log and no retry queue: failed Leads are alerted at once.";
    if (count($entries) > 0) $say[] = count($entries) . " Lead(s) waiting in the retry queue. Latest answer from Zoho: " . ($lastNote ?: "none") . ".";
    if ($cfg["enabled"] && !$log) $say[] = "Switched on, but the log is empty: no enquiry has been sent to Zoho yet. Send a test enquiry and reload. If a line still doesn't appear, the step after the visitor's answer didn't run.";
    if ($lastOutcome !== null && str_starts_with($lastOutcome, "failed")) $say[] = "The last try failed: " . ($last[3] ?? "") . ".";
    if ($lastOutcome !== null && str_starts_with($lastOutcome, "duplicate")) $say[] = "The last Lead was refused as a duplicate (an existing Email or Mobile): " . ($last[3] ?? "") . ".";
    if ($lastOutcome !== null && str_starts_with($lastOutcome, "delivered")) $say[] = "The last Lead was accepted by Zoho. If it isn't in Leads, look in Unapproved Leads, check who owns it (the territory rule) and search the Description for \"TEST –\".";
    if (!$say) $say[] = "Nothing wrong found.";

    return [
        "ok" => true,
        "checked" => gmdate("Y-m-d\TH:i:s\Z"),
        "reading" => $say,
        "config" => [
            "file" => $cfg["_file"],
            "found" => $cfg["_found"],
            "enabled" => $cfg["enabled"],
            "test" => $cfg["test"],
            "problem" => $cfg["_problem"],
            "action_url" => $url !== "" ? $url : null,
            "form_ids" => count($ids) . " of 2",
            "lead_source" => (string) $cfg["lead_source"],
            "timeout_s" => (int) $cfg["timeout"],
            "from_environment" => $cfg["_env"],
        ],
        "outbound" => [
            "allow_url_fopen" => filter_var(ini_get("allow_url_fopen"), FILTER_VALIDATE_BOOLEAN),
            "openssl" => extension_loaded("openssl"),
            "curl" => function_exists("curl_init"),
            "uses" => $url !== "" ? nexera_zoho_transport($url) : null,
            "probe" => $probe,
        ],
        "private_folder" => ["path" => $dir, "writable" => $privateOk],
        "queue" => [
            "waiting" => count($entries),
            "oldest" => $oldest !== null ? gmdate("Y-m-d\TH:i:s\Z", $oldest) : null,
            "most_tries" => $maxTries,
            "alerted" => $alerted,
            "latest_answer" => $lastNote,
        ],
        // date | form | outcome | Zoho's answer (masked)
        "log" => array_map(fn($l) => str_replace("\t", " | ", $l), $log),
        "php" => PHP_VERSION,
    ];
}
