// What the server actually sends for every sitemap URL (and its trailing-slash spelling): status 200
// with no redirect, and an HTML head with exactly one non-empty <title>, one non-empty meta
// description and the URL's canonical. Catches a page answered as its folder (directory redirect,
// index or listing), a missing page file, or any response without the page's head.
// Usage: node servedhead.mjs <base> <dist/sitemap.xml>
import fs from "node:fs";

const [base, sitemap] = process.argv.slice(2);
const SITE = "https://nexerapower.com";
const urls = [...fs.readFileSync(sitemap, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const results = [];
const check = (name, cond, extra) => {
  results.push(!!cond);
  if (!cond) console.log(`FAIL ${name} — ${extra}`);
};
for (const url of urls) {
  const p = url.slice(SITE.length) || "/";
  for (const variant of p === "/" ? ["/"] : [p, `${p}/`]) {
    const res = await fetch(base + variant, { redirect: "manual" });
    const body = await res.text();
    const head = body.slice(0, Math.max(0, body.indexOf("</head>")));
    const titles = [...head.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => m[1].trim());
    const descs = [...head.matchAll(/<meta name="description" content="([^"]*)"/g)].map((m) => m[1].trim());
    const canon = (head.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
    const ok = res.status === 200 && titles.length === 1 && !!titles[0] && descs.length === 1 && !!descs[0] && canon === url;
    check(variant, ok, JSON.stringify({ status: res.status, location: res.headers.get("location"), titles, descriptions: descs.length, canonical: canon ?? null }));
  }
}
const passed = results.filter(Boolean).length;
console.log(`servedhead: ${passed}/${results.length} served pages have status 200, one non-empty <title> and description, and their canonical`);
process.exit(passed === results.length ? 0 : 1);
