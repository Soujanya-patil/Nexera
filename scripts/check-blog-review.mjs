/*
 * Post-build: the Step 11 blog posts' review mode (src/data/publish.js). Fails the build unless
 *   - every post in review (PUBLISH: null) is built at its review URL with exactly one
 *     <meta name="robots" content="noindex, nofollow">, no canonical and no structured data;
 *   - no post in review is in dist/sitemap.xml;
 *   - no other pre-rendered page links to a post in review (an href to it, as a site path or the full URL,
 *     with or without a trailing slash, #hash or ?query) — every page and its Related cards, /blog, the
 *     Resources strip and the other posts. (In the posts' own data a link to a post in review is kept, and
 *     shown as plain text until that post is published, so the scripts are not scanned: the rendered HTML is
 *     what a visitor and a crawler get.)
 *   - every published post (PUBLISH: a date) is in the sitemap and indexable.
 * The site has no RSS or Atom feed; if one is added, add it to FEEDS below.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLISH, reviewPath } from "../src/data/publish.js";
import { REVIEW_ROBOTS } from "../src/lib/legal.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const FEEDS = []; // e.g. "rss.xml"
const fail = [];
const rel = (f) => path.relative(dist, f).replaceAll("\\", "/");
const files = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(path.join(dir, d.name)) : [path.join(dir, d.name)]));
const pageFile = (p) => path.join(dist, `${p.slice(1)}.html`);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const href = (p) => new RegExp(`href\\s*=\\s*["'](?:https?://(?:www\\.)?nexerapower\\.com)?${esc(p)}/?(?=[#?"'])`, "i");

const review = Object.entries(PUBLISH).filter(([, d]) => d === null).map(([slug]) => reviewPath(slug));
const published = Object.entries(PUBLISH).filter(([, d]) => d !== null).map(([slug]) => `/blog/${slug}`);
const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const inSitemap = (p) => new RegExp(`<loc>[^<]*${esc(p)}/?</loc>`).test(sitemap);

for (const p of review) {
  const f = pageFile(p);
  if (!fs.existsSync(f)) {
    fail.push(`${p}: dist/${p.slice(1)}.html is missing (a post in review is still built at its URL)`);
    continue;
  }
  const h = fs.readFileSync(f, "utf8");
  const robots = [...h.matchAll(/<meta\s+name="robots"\s+content="([^"]*)"/gi)].map((m) => m[1]);
  if (robots.length !== 1 || robots[0] !== REVIEW_ROBOTS) fail.push(`${p}: robots should be one "${REVIEW_ROBOTS}", found ${JSON.stringify(robots)}`);
  if (/<link\s+rel="canonical"/i.test(h)) fail.push(`${p}: has a canonical (a post in review has none)`);
  if (/application\/ld\+json/i.test(h)) fail.push(`${p}: has structured data (a post in review has none)`);
  if (inSitemap(p)) fail.push(`${p}: is in sitemap.xml`);
  for (const feed of FEEDS) if (fs.readFileSync(path.join(dist, feed), "utf8").includes(p)) fail.push(`${p}: is in ${feed}`);
}

let scanned = 0;
for (const file of files(dist).filter((f) => f.endsWith(".html"))) {
  scanned++;
  const text = fs.readFileSync(file, "utf8");
  for (const p of review) {
    if (file === pageFile(p)) continue;
    const m = text.match(href(p));
    if (m) fail.push(`${rel(file)}: links to ${p} ("${text.slice(Math.max(0, m.index - 50), m.index + m[0].length + 10).replace(/\s+/g, " ")}")`);
  }
}

for (const p of published) {
  if (!inSitemap(p)) fail.push(`${p}: published (src/data/publish.js) but not in sitemap.xml`);
  const f = pageFile(p);
  if (fs.existsSync(f) && /<meta\s+name="robots"/i.test(fs.readFileSync(f, "utf8"))) fail.push(`${p}: published but has a robots tag`);
}

if (fail.length) {
  console.error(`check-blog-review: posts in review must be live but hidden (src/data/publish.js):\n  ${fail.join("\n  ")}`);
  process.exit(1);
}
console.log(
  `check-blog-review: ${review.length} post(s) in review — noindex, nofollow, not in the sitemap, not linked from any of ${scanned} pages; ${published.length} published`
);
