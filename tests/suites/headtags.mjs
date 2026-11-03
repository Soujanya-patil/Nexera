// Rendered-DOM head check (Bing "after JavaScript" view). For every route — the sitemap's, the noindex
// product page and an unknown URL — it counts <title>, meta description, canonical, robots, Open
// Graph / Twitter tags and JSON-LD blocks, in the served HTML (before JavaScript) and in the live DOM
// once the app has hydrated and <Seo> has taken over; then once more after client-side navigation to
// every route in one session. Fails on more than one title, description or canonical (or a missing
// title) — after hydration, after navigation, or at ANY moment in between (a watcher installed before
// the page loads records the most of each that ever existed at once) — on a title that doesn't follow
// the page, on any <img> without an alt attribute, and on an empty-alt image that isn't hidden from
// assistive tech or sits in a link or button (a crawler reports it as an image without alt).
// Usage: node headtags.mjs <base> [--report]
import { chromium } from "playwright-core";
const BASE = process.argv[2];
const REPORT = process.argv.includes("--report");
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
const results = [];
const check = (n, c, x = "") => {
  results.push(!!c);
  if (!c || REPORT) console.log(`${c ? "PASS" : "FAIL"} ${n}${x !== "" ? " — " + JSON.stringify(x) : ""}`);
};

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const ROUTES = [
  ...[...sitemap.matchAll(/<loc>https:\/\/nexerapower\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/"),
  "/products/hithium-power-5016", // noindex (kept off the catalogue)
  "/no-such-page", // not a route: 404.html
];

// Counts in served HTML (regex over <head>) and in a live document (the same selectors).
const SEL = {
  title: "title",
  description: 'meta[name="description"]',
  canonical: 'link[rel="canonical"]',
  robots: 'meta[name="robots"]',
  og: 'meta[property^="og:"]',
  twitter: 'meta[name^="twitter:"]',
  jsonld: 'script[type="application/ld+json"]',
};
function servedCounts(html) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
  const n = (re) => (head.match(re) || []).length;
  return {
    title: n(/<title[\s>]/g),
    description: n(/<meta name="description"/g),
    canonical: n(/<link rel="canonical"/g),
    robots: n(/<meta name="robots"/g),
    og: n(/<meta property="og:/g),
    twitter: n(/<meta name="twitter:/g),
    jsonld: n(/<script type="application\/ld\+json"/g),
    titleText: (head.match(/<title>([^<]*)<\/title>/) || [])[1]?.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"'),
  };
}
const liveCounts = (p) =>
  p.evaluate((SEL) => {
    const out = {};
    for (const [k, s] of Object.entries(SEL)) out[k] = document.querySelectorAll(s).length;
    out.titleText = document.title;
    out.titleOutsideHead = [...document.querySelectorAll("title")].filter((t) => t.parentElement !== document.head).length;
    const name = (i) => (i.currentSrc || i.src || i.outerHTML).split("/").pop().slice(0, 60);
    out.noAlt = [...document.querySelectorAll("img:not([alt])")].map(name);
    out.emptyAlt = [...document.querySelectorAll('img[alt=""]')]
      // Decorative means hidden from assistive tech — and not the only thing in a link or button (with no
      // text and no other described image there, the link's name rests on aria-label alone).
      .filter((i) => {
        const hidden = i.getAttribute("aria-hidden") === "true" || /^(presentation|none)$/.test(i.getAttribute("role") || "");
        const control = i.closest("a, button");
        const named = control && (control.textContent.trim() !== "" || [...control.querySelectorAll("img")].some((x) => x.alt.trim()));
        return !hidden || (control && !named);
      })
      .map(name);
    out.max = { ...window.__headMax };
    return out;
  }, SEL);
// Every route's own expectation: title always; description unless 404; canonical unless noindex/404.
const expect = (s) => ({ title: 1, description: s.description ? 1 : 0, canonical: s.canonical ? 1 : 0, robots: s.robots ? 1 : 0 });
// Installed before any page script: the most titles / descriptions / canonicals present at once, ever.
const WATCH = () => {
  const max = (window.__headMax = { title: 0, description: 0, canonical: 0 });
  const sel = { title: "title", description: 'meta[name="description"]', canonical: 'link[rel="canonical"]' };
  const look = () => {
    for (const k in sel) max[k] = Math.max(max[k], document.querySelectorAll(sel[k]).length);
  };
  new MutationObserver(look).observe(document, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", look);
};
const neverTwo = (m) => m.title <= 1 && m.description <= 1 && m.canonical <= 1;
const headOk = (c, e) => c.title === e.title && c.description === e.description && c.canonical === e.canonical && c.robots === e.robots;

// Waits until the app has hydrated and <Seo> owns the head (the route table chunk has loaded), then
// scrolls the page through so late-mounted sections render their images.
async function settle(p) {
  await p.waitForLoadState("networkidle");
  // <Seo> takes over once the route table chunk (assets/routes-*.js) has arrived.
  await p
    .waitForFunction(() => performance.getEntriesByType("resource").some((r) => /\/assets\/routes-[^/]*\.js$/.test(r.name)), null, { timeout: 15000 })
    .catch(() => {});
  await p.waitForTimeout(600);
}
async function scrollThrough(p) {
  const H = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 700) {
    await p.evaluate((v) => scrollTo(0, v), y);
    await p.waitForTimeout(60);
  }
  await p.waitForLoadState("networkidle");
  await p.waitForTimeout(300);
}

const served = {};
const table = [];
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
await ctx.addInitScript(WATCH);
for (const path of ROUTES) {
  const res = await fetch(BASE + path);
  const s = servedCounts(await res.text());
  served[path] = s;
  const p = await ctx.newPage();
  await p.goto(BASE + path, { waitUntil: "load" });
  await settle(p);
  await scrollThrough(p);
  const c = await liveCounts(p);
  const e = expect(s);
  table.push({ path, s, c });
  check(`${path} served: one title${e.description ? ", description" : ""}${e.canonical ? ", canonical" : ""}`, headOk(s, e), s);
  check(`${path} after hydration: exactly one of each, title as served`, headOk(c, e) && c.titleText === s.titleText && !c.titleOutsideHead, { ...c, noAlt: undefined, served: s.titleText });
  check(`${path} never two titles, descriptions or canonicals at once (load → hydration)`, neverTwo(c.max), c.max);
  check(`${path} after hydration: every <img> has an alt; empty alts are decorative`, !c.noAlt.length && !c.emptyAlt.length, { noAlt: c.noAlt, emptyAlt: c.emptyAlt });
  await p.close();
}

// Client-side navigation through every route in one session (React Router via popstate), from Home.
const nav = [];
{
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "load" });
  await settle(p);
  for (const path of [...ROUTES.slice(1), "/"]) {
    await p.evaluate((to) => {
      history.pushState({}, "", to);
      dispatchEvent(new PopStateEvent("popstate"));
    }, path);
    await p.waitForLoadState("networkidle");
    await p.waitForFunction((t) => document.title === t, served[path].titleText, { timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(250);
    await scrollThrough(p);
    const c = await liveCounts(p);
    const e = expect(served[path]);
    nav.push({ path, c });
    check(`navigate → ${path}: exactly one of each, title follows`, headOk(c, e) && c.titleText === served[path].titleText && !c.titleOutsideHead, { ...c, noAlt: undefined, want: served[path].titleText });
    check(`navigate → ${path}: never two of any so far`, neverTwo(c.max), c.max);
    check(`navigate → ${path}: every <img> has an alt; empty alts are decorative`, !c.noAlt.length && !c.emptyAlt.length, { noAlt: c.noAlt, emptyAlt: c.emptyAlt });
  }
  await p.close();
}

if (REPORT) {
  const row = (x) => `t${x.title} d${x.description} c${x.canonical} r${x.robots} og${x.og} tw${x.twitter} ld${x.jsonld}`;
  console.log("\npath | served | after hydration | most at once | images");
  for (const { path, s, c } of table) console.log(`${path} | ${row(s)} | ${row(c)} | most at once t${c.max.title} d${c.max.description} c${c.max.canonical} | no alt: ${c.noAlt.join(", ") || "-"} | empty alt (not decorative): ${c.emptyAlt.join(", ") || "-"}`);
  console.log("\nclient-side navigation: path | live head | most at once | images");
  for (const { path, c } of nav) console.log(`${path} | ${row(c)} | most at once t${c.max.title} d${c.max.description} c${c.max.canonical} | no alt: ${c.noAlt.join(", ") || "-"} | empty alt: ${c.emptyAlt.join(", ") || "-"}`);
}
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
await b.close();
process.exit(results.every(Boolean) ? 0 : 1);
