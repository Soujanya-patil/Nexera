/*
 * Post-build: fails if a name that must not appear on the site is anywhere in dist/ — any file, any
 * case. Midea is not a NEXERA partner: its page was removed, and nothing may name it.
 *
 * The one allowed form is its old URL path, /partners/midea, which only the redirects use (the 301 in
 * .htaccess and the in-app redirect to /products), so old links keep working. Every file is read
 * byte for byte (latin1), so text inside scripts, styles, JSON-LD, the sitemap and .htaccess is all
 * checked.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const TERMS = [{ term: /midea/gi, allowed: /partners\/midea/gi }];

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else files.push(p);
  }
})(dist);

const hits = [];
let allowed = 0;
for (const file of files) {
  const s = fs.readFileSync(file, "latin1");
  for (const { term, allowed: ok } of TERMS) {
    const all = s.match(term)?.length ?? 0;
    if (!all) continue;
    const fine = s.match(ok)?.length ?? 0;
    allowed += fine;
    if (all > fine) {
      const i = s.search(new RegExp(`(?<!partners/)${term.source}`, "i"));
      hits.push(`${path.relative(dist, file).replaceAll("\\", "/")}: ${all - fine}× — …${s.slice(Math.max(0, i - 50), i + 40).replace(/\s+/g, " ")}…`);
    }
  }
}

if (hits.length) {
  console.error(`check-dist-terms: a removed name appears in dist/ (${hits.length} file(s)):`);
  for (const h of hits) console.error("  " + h);
  process.exit(1);
}
console.log(`check-dist-terms: ${files.length} files in dist/, no removed names (only the old /partners/midea path, ${allowed}× in the redirects)`);
