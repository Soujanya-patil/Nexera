// What the server actually sends for every sitemap URL and its trailing-slash spelling. The URL itself:
// status 200 with no redirect, and an HTML head with exactly one non-empty <title>, one non-empty meta
// description and the URL's canonical. Its trailing-slash spelling resolves cleanly, either way:
//   - served directly (200) with that same head — its canonical names the no-slash URL (most pages), or
//   - exactly one 301 to the no-slash URL, which then answers 200 (articles: public/.htaccess, the
//     "@article-urls" rules scripts/seo-pages.mjs writes, also folding letter case and .html into it).
// Catches a page answered as its folder (directory redirect, index or listing), a missing page file, a
// redirect chain or a redirect anywhere else, or any response without the page's head.
// Usage: node servedhead.mjs <base> <dist/sitemap.xml>
import fs from "node:fs";

const [base, sitemap] = process.argv.slice(2);
const SITE = "https://nexerapower.com";
const urls = [...fs.readFileSync(sitemap, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const results = [];
let redirects = 0;
const check = (name, cond, extra) => {
  results.push(!!cond);
  if (!cond) console.log(`FAIL ${name} — ${extra}`);
};
async function head(path) {
  const res = await fetch(base + path, { redirect: "manual" });
  const body = await res.text();
  const h = body.slice(0, Math.max(0, body.indexOf("</head>")));
  return {
    status: res.status,
    location: res.headers.get("location"),
    titles: [...h.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => m[1].trim()),
    descs: [...h.matchAll(/<meta name="description" content="([^"]*)"/g)].map((m) => m[1].trim()),
    canon: (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1],
  };
}
const goodHead = (r, url) => r.status === 200 && r.titles.length === 1 && !!r.titles[0] && r.descs.length === 1 && !!r.descs[0] && r.canon === url;
const show = (r) => JSON.stringify({ status: r.status, location: r.location, titles: r.titles, descriptions: r.descs.length, canonical: r.canon ?? null });

for (const url of urls) {
  const p = url.slice(SITE.length) || "/";
  const r = await head(p);
  check(p, goodHead(r, url), show(r));
  if (p === "/") continue;
  const s = await head(`${p}/`);
  if (s.status === 301) {
    // One redirect, to the no-slash URL on this host, which answers 200 itself (no chain).
    redirects++;
    const to = s.location ? new URL(s.location, base) : null;
    const target = to && to.origin === new URL(base).origin && to.pathname === p && !to.search;
    const next = target ? await head(to.pathname) : null;
    check(`${p}/ (one 301 to ${p})`, target && next && goodHead(next, url), JSON.stringify({ status: s.status, location: s.location, then: next && show(next) }));
  } else {
    check(`${p}/ (served directly)`, goodHead(s, url), show(s));
  }
}
const passed = results.filter(Boolean).length;
console.log(
  `servedhead: ${passed}/${results.length} — every sitemap URL is served 200 with one <title>, description and its canonical; its trailing-slash spelling is served the same way or 301s once to it (${redirects} redirect${redirects === 1 ? "" : "s"})`
);
process.exit(passed === results.length ? 0 : 1);
