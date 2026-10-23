<?php
// php -S router for local end-to-end tests of the built site: real files as-is (incl. api/contact.php),
// otherwise a route's own page (/contact -> contact.html), like public/.htaccess on Hostinger.
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
// public/.htaccess redirects: /brands and /partners -> /products (301).
if (preg_match('#^/(brands|partners)/?$#', $path)) {
    header("Location: /products", true, 301);
    return true;
}
$root = $_SERVER["DOCUMENT_ROOT"];
if ($path !== "/" && is_file($root . $path)) return false;
if ($path === "/") return false;
$page = $root . rtrim($path, "/") . ".html";
if (is_file($page)) {
    header("Content-Type: text/html; charset=utf-8");
    readfile($page);
    return true;
}
http_response_code(404);
readfile($root . "/404.html");
