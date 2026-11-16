/*
 * Post-build: while the legal pages are in "hidden review" (src/lib/legal.js LEGAL_REVIEW), fails the
 * build unless they are live but hidden:
 *   - both pages are built, each with <meta name="robots" content="noindex, nofollow"> and no canonical;
 *   - neither is in dist/sitemap.xml;
 *   - no other page links to them: no href to either in any other pre-rendered HTML file, and no link
 *     (`to:` / `href:`) to either in any script, except the Terms of Use page's own link to the Privacy
 *     Policy (its chunk, TermsOfUse-*.js, and its pre-rendered HTML).
 * After approval (LEGAL_REVIEW false) it only reports that the pages are out of review.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LEGAL_PATHS, LEGAL_REVIEW, PRIVACY_PATH, REVIEW_ROBOTS, TERMS_PATH } from "../src/lib/legal.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
if (!LEGAL_REVIEW) {
  console.log("check-legal-review: the legal pages are out of review (LEGAL_REVIEW is false): nothing to hide");
  process.exit(0);
}

const fail = [];
const rel = (f) => path.relative(dist, f).replaceAll("\\", "/");
const files = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(path.join(dir, d.name)) : [path.join(dir, d.name)]));
const all = files(dist);
const pageFile = (p) => path.join(dist, `${p.slice(1)}.html`);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
// A link to one of the paths: the path alone or the site URL + path, optionally with a trailing slash,
// #hash or ?query — as an HTML href, or a React Router `to` / `href` prop in a built script.
const target = (p) => `(?:https?://(?:www\\.)?nexerapower\\.com)?${esc(p)}/?(?=[#?"'\`])`;
const htmlLink = (p) => new RegExp(`href\\s*=\\s*["']${target(p)}`, "i");
const jsLink = (p) => new RegExp(`\\b(?:to|href)\\s*:\\s*["'\`]${target(p)}`, "i");

// 1. Both pages built, noindex, nofollow, no canonical.
for (const p of LEGAL_PATHS) {
  const f = pageFile(p);
  if (!fs.existsSync(f)) {
    fail.push(`${p}: dist/${p.slice(1)}.html is missing`);
    continue;
  }
  const h = fs.readFileSync(f, "utf8");
  const robots = [...h.matchAll(/<meta\s+name="robots"\s+content="([^"]*)"/gi)].map((m) => m[1]);
  if (robots.length !== 1 || robots[0] !== REVIEW_ROBOTS) fail.push(`${p}: robots should be one "${REVIEW_ROBOTS}", found ${JSON.stringify(robots)}`);
  if (/<link\s+rel="canonical"/i.test(h)) fail.push(`${p}: has a canonical (a page in review has none)`);
}

// 2. Not in the sitemap.
const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
for (const p of LEGAL_PATHS) if (new RegExp(`<loc>[^<]*${esc(p)}/?</loc>`).test(sitemap)) fail.push(`${p}: is in sitemap.xml`);

// 3. No links from anywhere else. Allowed: the Terms page → the Privacy Policy (its HTML and its chunk).
const allowed = (file, p) =>
  p === PRIVACY_PATH && (file === pageFile(TERMS_PATH) || /(^|\/)TermsOfUse-[\w-]+\.js$/.test(rel(file)));
let scanned = 0;
for (const file of all) {
  const ext = path.extname(file);
  if (ext !== ".html" && ext !== ".js") continue;
  scanned++;
  const text = fs.readFileSync(file, "utf8");
  for (const p of LEGAL_PATHS) {
    if (allowed(file, p)) continue;
    // A page's own breadcrumb ends on itself as plain text; its own file may name its path, not link it.
    const re = ext === ".html" ? htmlLink(p) : jsLink(p);
    const m = text.match(re);
    if (m) fail.push(`${rel(file)}: links to ${p} ("${text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 10).replace(/\s+/g, " ")}")`);
  }
}

if (fail.length) {
  console.error(`check-legal-review: the legal pages are in review (src/lib/legal.js) but not hidden:\n  ${fail.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-legal-review: ${LEGAL_PATHS.join(" and ")} in review — noindex, nofollow, not in the sitemap, linked only from the Terms page (${scanned} HTML/JS files scanned)`);
