/*
 * Post-build: fails if a name that must not appear on the site is anywhere in dist/ — any file, any
 * case. Midea is not a NEXERA partner: its page was removed, and nothing may name it. CLOU is no
 * longer presented either: its partner and product pages were removed (whole word only: "cloud" is fine).
 * And the structured data's address is the head office (WeWork Galaxy): the old address, now the
 * branch office (shown on the pages, data/business), must never be in a JSON-LD PostalAddress.
 *
 * The one allowed form is each name's old URL paths, which only the redirects use (the 301s in
 * .htaccess and the in-app redirects to /products), so old links keep working. Every file is read
 * byte for byte (latin1), so text inside scripts, styles, JSON-LD, the sitemap and .htaccess is all
 * checked.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
// CLOU is no longer presented either (the whole word, so "cloud" is fine): its old partner and
// product paths stay only in the redirects (/partners/clou, /products/clou-aqua-e261, /products/clou-aqua-c25s).
const TERMS = [
  { name: "Midea", term: /midea/gi, allowed: /partners\/midea/gi, find: /(?<!partners\/)midea/i, paths: "/partners/midea" },
  { name: "CLOU", term: /\bclou\b/gi, allowed: /(?:partners|products)\/clou\b/gi, find: /(?<!(?:partners|products)\/)\bclou\b/i, paths: "/partners/clou and /products/clou-aqua-*" },
];

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else files.push(p);
  }
})(dist);

const hits = [];
const allowed = Object.fromEntries(TERMS.map((t) => [t.name, 0]));
for (const file of files) {
  const s = fs.readFileSync(file, "latin1");
  for (const { name, term, allowed: ok, find } of TERMS) {
    const all = s.match(term)?.length ?? 0;
    if (!all) continue;
    const fine = s.match(ok)?.length ?? 0;
    allowed[name] += fine;
    if (all > fine) {
      const i = s.search(find);
      hits.push(`${name} — ${path.relative(dist, file).replaceAll("\\", "/")}: ${all - fine}× — …${s.slice(Math.max(0, i - 50), i + 40).replace(/\s+/g, " ")}…`);
    }
  }
}

// JSON-LD: every PostalAddress (the Organization / LocalBusiness head office) on every page.
const OLD_ADDRESS = /vijayanagar|chowdappa|hampi\s*nagar|(?<!\d)560104(?!\d)/i;
let addresses = 0;
for (const file of files.filter((f) => f.endsWith(".html"))) {
  const html = fs.readFileSync(file, "utf8");
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    (function walk(node) {
      if (!node || typeof node !== "object") return;
      if (node["@type"] === "PostalAddress") {
        addresses++;
        const old = Object.values(node).find((v) => typeof v === "string" && OLD_ADDRESS.test(v));
        if (old) hits.push(`old address in JSON-LD PostalAddress — ${path.relative(dist, file).replaceAll("\\", "/")}: "${old}"`);
      }
      Object.values(node).forEach(walk);
    })(JSON.parse(json));
  }
}

if (hits.length) {
  console.error(`check-dist-terms: a removed name in dist/, or the old address in the structured data (${hits.length}):`);
  for (const h of hits) console.error("  " + h);
  process.exit(1);
}
console.log(
  `check-dist-terms: ${files.length} files in dist/, no removed names (only the old redirect paths: ${TERMS.map((t) => `${t.paths} ${allowed[t.name]}×`).join(", ")}); ${addresses} JSON-LD addresses, all the head office`
);
